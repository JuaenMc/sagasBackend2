import React, { useState } from 'react';
import { Product, Customer, Order, Category, FiscalInvoice, ShippingLabel } from '../types/database';
import {
  Database,
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Edit,
  Tag,
  Users,
  Package,
  Layers,
  FileText,
  Truck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface DatabaseExplorerProps {
  products: Product[];
  customers: Customer[];
  orders: Order[];
  categories: Category[];
  invoices: FiscalInvoice[];
  labels: ShippingLabel[];
  onOpenProductModal: (prod?: Product) => void;
  onDeleteProduct: (id: string) => void;
  onOpenSqlModal: () => void;
  onViewDanfe: (invoice: FiscalInvoice) => void;
  onViewLabel: (label: ShippingLabel) => void;
}

export const DatabaseExplorer: React.FC<DatabaseExplorerProps> = ({
  products,
  customers,
  orders,
  categories,
  invoices,
  labels,
  onOpenProductModal,
  onDeleteProduct,
  onOpenSqlModal,
  onViewDanfe,
  onViewLabel,
}) => {
  const [selectedTable, setSelectedTable] = useState<'products' | 'customers' | 'orders' | 'categories' | 'invoices' | 'labels'>('products');
  const [searchTerm, setSearchTerm] = useState('');

  const exportCurrentTableAsJson = () => {
    let data: any = [];
    if (selectedTable === 'products') data = products;
    if (selectedTable === 'customers') data = customers;
    if (selectedTable === 'orders') data = orders;
    if (selectedTable === 'categories') data = categories;
    if (selectedTable === 'invoices') data = invoices;
    if (selectedTable === 'labels') data = labels;

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tabela_${selectedTable}_export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Table Selector Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-sm mr-2">
            <Database className="w-4 h-4" />
            <span>Tabelas Relacionais:</span>
          </div>

          <button
            onClick={() => { setSelectedTable('products'); setSearchTerm(''); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedTable === 'products'
                ? 'bg-pink-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>produtos ({products.length})</span>
          </button>

          <button
            onClick={() => { setSelectedTable('categories'); setSearchTerm(''); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedTable === 'categories'
                ? 'bg-purple-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>categorias ({categories.length})</span>
          </button>

          <button
            onClick={() => { setSelectedTable('customers'); setSearchTerm(''); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedTable === 'customers'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>clientes ({customers.length})</span>
          </button>

          <button
            onClick={() => { setSelectedTable('orders'); setSearchTerm(''); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedTable === 'orders'
                ? 'bg-amber-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>pedidos ({orders.length})</span>
          </button>

          <button
            onClick={() => { setSelectedTable('invoices'); setSearchTerm(''); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedTable === 'invoices'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>fiscal_invoices ({invoices.length})</span>
          </button>

          <button
            onClick={() => { setSelectedTable('labels'); setSearchTerm(''); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedTable === 'labels'
                ? 'bg-teal-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>shipping_labels ({labels.length})</span>
          </button>
        </div>

        {/* Global DDL and Export actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenSqlModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-sky-400 border border-slate-700 transition-colors"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Ver Schema SQL</span>
          </button>

          <button
            onClick={exportCurrentTableAsJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
            title="Exportar registros da tabela ativa como JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar JSON</span>
          </button>
        </div>
      </div>

      {/* Table Content & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/40">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={`Buscar em ${selectedTable}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {selectedTable === 'products' && (
              <button
                onClick={() => onOpenProductModal()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold shadow transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Produto</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Table Display */}
        <div className="overflow-x-auto">
          {/* TABELA: PRODUTOS */}
          {selectedTable === 'products' && (
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">Foto / SKU</th>
                  <th className="p-3">Título / Categoria</th>
                  <th className="p-3">Preço Custo / Venda</th>
                  <th className="p-3">Estoque Total</th>
                  <th className="p-3">Grade (Variações)</th>
                  <th className="p-3">Fiscal (NCM / CFOP)</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {products
                  .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-10 h-10 object-cover rounded-lg border border-slate-700 bg-slate-800"
                          />
                          <div>
                            <span className="font-mono font-bold text-sky-400 block">{p.sku}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{p.barcode_gtin}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-white">{p.name}</div>
                        <div className="text-[11px] text-pink-400 font-medium">
                          {p.category_name || 'Geral'} • {p.brand}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-emerald-400">
                          R$ {p.sale_price.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Custo: R$ {p.cost_price.toFixed(2)}
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                            p.stock_quantity <= p.min_stock
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {p.stock_quantity} {p.unit}
                        </span>
                        {p.stock_quantity <= p.min_stock && (
                          <span className="block text-[10px] text-rose-400 mt-0.5">Estoque Baixo!</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {p.variations?.map((v) => (
                            <span
                              key={v.id}
                              className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300"
                            >
                              {v.size}: <strong>{v.stock}</strong>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 font-mono text-[11px]">
                        <div>NCM: <span className="text-sky-300">{p.ncm}</span></div>
                        <div>CFOP: <span className="text-slate-400">{p.cfop}</span></div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => onOpenProductModal(p)}
                            className="p-1.5 text-slate-400 hover:text-sky-400 rounded-lg hover:bg-slate-800"
                            title="Editar produto"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                            title="Excluir produto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {/* TABELA: CLIENTES */}
          {selectedTable === 'customers' && (
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">Nome / Razão</th>
                  <th className="p-3">Documento (CPF/CNPJ)</th>
                  <th className="p-3">Contato (Email / WhatsApp)</th>
                  <th className="p-3">Endereço & CEP</th>
                  <th className="p-3">Histórico de Compras</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {customers
                  .filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.doc_number.includes(searchTerm))
                  .map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-white">{c.name}</div>
                        {c.fantasy_name && <div className="text-[10px] text-slate-400">{c.fantasy_name}</div>}
                      </td>
                      <td className="p-3 font-mono font-bold text-sky-400">
                        {c.doc_type}: {c.doc_number}
                      </td>
                      <td className="p-3">
                        <div>{c.email}</div>
                        <div className="text-[10px] text-slate-400">{c.phone}</div>
                      </td>
                      <td className="p-3">
                        <div>{c.address_street}, {c.address_number}</div>
                        <div className="text-[10px] text-slate-400">
                          {c.city} - {c.state} • <strong>CEP {c.zip_code}</strong>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-emerald-400">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.total_spent)}
                        </span>
                        <span className="text-[10px] text-slate-400 block">{c.total_orders} pedidos realizados</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {/* TABELA: PEDIDOS */}
          {selectedTable === 'orders' && (
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">Pedido / Canal</th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Total (R$)</th>
                  <th className="p-3">NF-e & Rastreio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders
                  .filter((o) => o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) || o.customer.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((o) => {
                    const inv = invoices.find((i) => i.order_id === o.id || i.order_number === o.order_number);
                    const lbl = labels.find((l) => l.order_id === o.id || l.order_number === o.order_number);

                    return (
                      <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3">
                          <span className="font-mono font-bold text-white block">{o.order_number}</span>
                          <span className="text-[10px] text-pink-400 font-semibold">{o.channel}</span>
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-slate-200">{o.customer.name}</div>
                          <div className="text-[10px] text-slate-400">{o.customer.city} - {o.customer.state}</div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-sky-400 border border-slate-700">
                            {o.status}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-white">
                          R$ {o.total.toFixed(2)}
                        </td>
                        <td className="p-3 space-y-1">
                          {inv ? (
                            <button
                              onClick={() => onViewDanfe(inv)}
                              className="text-emerald-400 hover:underline block text-[11px] font-mono"
                            >
                              NF-e: {inv.nfe_number}
                            </button>
                          ) : (
                            <span className="text-slate-500 text-[11px] block">Sem NF-e</span>
                          )}
                          {lbl ? (
                            <button
                              onClick={() => onViewLabel(lbl)}
                              className="text-blue-400 hover:underline block text-[11px] font-mono"
                            >
                              Rastreio: {lbl.tracking_code}
                            </button>
                          ) : (
                            <span className="text-slate-500 text-[11px] block">Sem Etiqueta</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}

          {/* TABELA: CATEGORIAS */}
          {selectedTable === 'categories' && (
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">Nome da Categoria</th>
                  <th className="p-3">Slug (URL)</th>
                  <th className="p-3">Departamento</th>
                  <th className="p-3">NCM Fiscal Padrão</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-white">{c.name}</td>
                    <td className="p-3 font-mono text-purple-300">/{c.slug}</td>
                    <td className="p-3 text-slate-300">{c.department}</td>
                    <td className="p-3 font-mono text-sky-300">{c.ncm_default}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Ativa
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* TABELA: FISCAL_INVOICES */}
          {selectedTable === 'invoices' && (
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">Nº NF-e / Série</th>
                  <th className="p-3">Chave de Acesso (44 dígitos)</th>
                  <th className="p-3">Destinatário</th>
                  <th className="p-3">Valor Total</th>
                  <th className="p-3">Status SEFAZ</th>
                  <th className="p-3 text-right">Visualizar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-white">
                      NF-e {inv.nfe_number} (Série {inv.series})
                    </td>
                    <td className="p-3 font-mono text-[10px] text-sky-300 max-w-xs truncate">
                      {inv.access_key}
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-slate-200">{inv.recipient.name}</div>
                      <div className="text-[10px] text-slate-400">{inv.recipient.cpf_cnpj}</div>
                    </td>
                    <td className="p-3 font-bold text-emerald-400">
                      R$ {inv.totals.vNF.toFixed(2)}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onViewDanfe(inv)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 font-medium transition-colors"
                      >
                        Abrir DANFE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* TABELA: SHIPPING_LABELS */}
          {selectedTable === 'labels' && (
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">Código de Rastreamento</th>
                  <th className="p-3">Transportadora</th>
                  <th className="p-3">Destinatário / CEP</th>
                  <th className="p-3">Peso / Dimensões</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Visualizar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {labels.map((lbl) => (
                  <tr key={lbl.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-blue-400">
                      {lbl.tracking_code}
                    </td>
                    <td className="p-3 text-slate-200">{lbl.carrier}</td>
                    <td className="p-3">
                      <div className="font-medium text-slate-200">{lbl.recipient.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">CEP: {lbl.recipient.zip}</div>
                    </td>
                    <td className="p-3 text-slate-400">
                      {lbl.package.weight_kg} kg • {lbl.package.length_cm}x{lbl.package.width_cm}x{lbl.package.height_cm} cm
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {lbl.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onViewLabel(lbl)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 font-medium transition-colors"
                      >
                        Ver Etiqueta 100x150
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
