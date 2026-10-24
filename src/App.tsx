import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { DatabaseExplorer } from './components/DatabaseExplorer';
import { NfeView } from './components/NfeView';
import { ShippingLabelsView } from './components/ShippingLabelsView';
import { SagasStoreSimulator } from './components/SagasStoreSimulator';
import { DanfeModal } from './components/DanfeModal';
import { ShippingLabelModal } from './components/ShippingLabelModal';
import { SqlSchemaModal } from './components/SqlSchemaModal';
import { IntegrationGuideModal } from './components/IntegrationGuideModal';
import { ProductModal } from './components/ProductModal';
import {
  Category,
  Customer,
  FiscalInvoice,
  Order,
  Product,
  ShippingLabel,
} from './types/database';
import { SyncLog } from './server/db';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Database Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [invoices, setInvoices] = useState<FiscalInvoice[]>([]);
  const [labels, setLabels] = useState<ShippingLabel[]>([]);
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    approvedOrders: 0,
    invoicedOrders: 0,
    lowStockProducts: 0,
    totalInvoices: 0,
    totalLabels: 0,
  });

  // Modal States
  const [selectedDanfe, setSelectedDanfe] = useState<FiscalInvoice | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<ShippingLabel | null>(null);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Carrega todos os dados da API
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        statsRes,
        prodsRes,
        custsRes,
        ordersRes,
        catsRes,
        invoicesRes,
        labelsRes,
        logsRes,
      ] = await Promise.all([
        fetch('/api/stats').then((r) => r.json()),
        fetch('/api/products').then((r) => r.json()),
        fetch('/api/customers').then((r) => r.json()),
        fetch('/api/orders').then((r) => r.json()),
        fetch('/api/categories').then((r) => r.json()),
        fetch('/api/nfe').then((r) => r.json()),
        fetch('/api/labels').then((r) => r.json()),
        fetch('/api/logs').then((r) => r.json()),
      ]);

      setStats(statsRes);
      setProducts(prodsRes);
      setCustomers(custsRes);
      setOrders(ordersRes);
      setCategories(catsRes);
      setInvoices(invoicesRes);
      setLabels(labelsRes);
      setLogs(logsRes);
    } catch (err) {
      console.error('Falha ao carregar dados da API:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Processar Venda (Baixa Estoque + NF-e + Etiqueta)
  const handleProcessOrder = async (orderId: string) => {
    const res = await fetch(`/api/orders/${orderId}/process-sale`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Falha ao processar pedido');
    }

    const data = await res.json();
    await refreshData();
    return data;
  };

  // Salvar Produto (Novo ou Editado)
  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      if (editingProduct && editingProduct.id) {
        await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
      }
      await refreshData();
      setEditingProduct(null);
    } catch (err) {
      console.error('Erro ao salvar produto:', err);
    }
  };

  // Deletar Produto
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto do banco de dados?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      await refreshData();
    } catch (err) {
      console.error('Erro ao deletar produto:', err);
    }
  };

  // Reset de Fábrica
  const handleResetData = async () => {
    if (!window.confirm('Deseja restaurar o banco de dados para os dados padrão de fábrica?')) return;
    try {
      await fetch('/api/database/reset', { method: 'POST' });
      await refreshData();
    } catch (err) {
      console.error('Erro ao resetar dados:', err);
    }
  };

  // Criar Pedido via Simulador (Webhook)
  const handleOrderCreatedFromSimulator = async (orderPayload: any, autoProcess: boolean) => {
    const res = await fetch(`/api/webhooks/sagas-checkout?auto_process=${autoProcess}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });

    if (!res.ok) {
      throw new Error('Erro ao processar pedido no webhook');
    }

    const result = await res.json();
    await refreshData();
    return result;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-pink-500 selection:text-white">
      {/* Header com Navegação e KPIs */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenSqlModal={() => setIsSqlModalOpen(true)}
        onOpenIntegrationModal={() => setIsIntegrationModalOpen(true)}
        onResetData={handleResetData}
        stats={stats}
        isLoading={isLoading}
        onRefresh={refreshData}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {currentTab === 'dashboard' && (
          <DashboardView
            orders={orders}
            invoices={invoices}
            labels={labels}
            logs={logs}
            stats={stats}
            onProcessOrder={handleProcessOrder}
            onViewDanfe={(inv) => setSelectedDanfe(inv)}
            onViewLabel={(lbl) => setSelectedLabel(lbl)}
            onNavigateToSimulator={() => setCurrentTab('simulator')}
          />
        )}

        {currentTab === 'database' && (
          <DatabaseExplorer
            products={products}
            customers={customers}
            orders={orders}
            categories={categories}
            invoices={invoices}
            labels={labels}
            onOpenProductModal={(p) => {
              setEditingProduct(p || null);
              setIsProductModalOpen(true);
            }}
            onDeleteProduct={handleDeleteProduct}
            onOpenSqlModal={() => setIsSqlModalOpen(true)}
            onViewDanfe={(inv) => setSelectedDanfe(inv)}
            onViewLabel={(lbl) => setSelectedLabel(lbl)}
          />
        )}

        {currentTab === 'nfe' && (
          <NfeView
            invoices={invoices}
            onViewDanfe={(inv) => setSelectedDanfe(inv)}
          />
        )}

        {currentTab === 'shipping' && (
          <ShippingLabelsView
            labels={labels}
            onViewLabel={(lbl) => setSelectedLabel(lbl)}
          />
        )}

        {currentTab === 'simulator' && (
          <SagasStoreSimulator
            products={products}
            onOrderCreated={handleOrderCreatedFromSimulator}
            onSwitchToDashboard={() => setCurrentTab('dashboard')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            OmniSync ERP & Database Hub • Desenvolvido para{' '}
            <strong className="text-pink-400">SAGAS Brasil - Moda Feminina & Infantil</strong>
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span>NF-e Modelo 55 (SEFAZ)</span>
            <span>•</span>
            <span>Etiquetas Térmicas 100x150mm</span>
            <span>•</span>
            <span>PostgreSQL & SQLite Ready</span>
          </div>
        </div>
      </footer>

      {/* Modais do Sistema */}
      <DanfeModal
        invoice={selectedDanfe}
        onClose={() => setSelectedDanfe(null)}
      />

      <ShippingLabelModal
        label={selectedLabel}
        onClose={() => setSelectedLabel(null)}
      />

      <SqlSchemaModal
        isOpen={isSqlModalOpen}
        onClose={() => setIsSqlModalOpen(false)}
      />

      <IntegrationGuideModal
        isOpen={isIntegrationModalOpen}
        onClose={() => setIsIntegrationModalOpen(false)}
        onSimulateWebhook={() => setCurrentTab('simulator')}
      />

      <ProductModal
        isOpen={isProductModalOpen}
        product={editingProduct}
        categories={categories}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
      />
    </div>
  );
}
