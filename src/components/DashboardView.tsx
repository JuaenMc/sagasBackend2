import React, { useState } from 'react';
import { Order, FiscalInvoice, ShippingLabel } from '../types/database';
import { SyncLog } from '../server/db';
import confetti from 'canvas-confetti';
import {
  TrendingUp,
  Package,
  FileCheck2,
  AlertTriangle,
  Zap,
  Printer,
  FileText,
  Truck,
  CheckCircle2,
  Clock,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface DashboardViewProps {
  orders: Order[];
  invoices: FiscalInvoice[];
  labels: ShippingLabel[];
  logs: SyncLog[];
  stats: any;
  onProcessOrder: (orderId: string) => Promise<any>;
  onViewDanfe: (invoice: FiscalInvoice) => void;
  onViewLabel: (label: ShippingLabel) => void;
  onNavigateToSimulator: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  invoices,
  labels,
  logs,
  stats,
  onProcessOrder,
  onViewDanfe,
  onViewLabel,
  onNavigateToSimulator,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [lastProcessed, setLastProcessed] = useState<{
    orderNumber: string;
    nfeNumber: string;
    trackingCode: string;
    invoice: FiscalInvoice;
    label: ShippingLabel;
  } | null>(null);

  const handleQuickProcess = async (orderId: string) => {
    try {
      setProcessingOrderId(orderId);
      const res = await onProcessOrder(orderId);

      // Efeito festivo de sucesso
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      if (res && res.data) {
        setLastProcessed({
          orderNumber: res.data.order.order_number,
          nfeNumber: res.data.invoice.nfe_number,
          trackingCode: res.data.label.tracking_code,
          invoice: res.data.invoice,
          label: res.data.label,
        });
      }
    } catch (e: any) {
      alert(`Erro ao processar: ${e.message}`);
    } finally {
      setProcessingOrderId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'need_action') return o.status === 'approved' || o.status === 'pending';
    if (filterStatus === 'invoiced') return o.status === 'invoiced' || o.status === 'labeled';
    if (filterStatus === 'shipped') return o.status === 'shipped';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Banner de Sucesso pós-processamento com ações rápidas */}
      {lastProcessed && (
        <div className="bg-gradient-to-r from-emerald-950/80 via-teal-950/80 to-slate-900 border border-emerald-500/50 p-4 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-white font-bold text-sm flex items-center gap-2">
                <span>Venda Confirmada & Automatizada com Sucesso!</span>
                <span className="text-xs font-mono text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded">
                  {lastProcessed.orderNumber}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Estoque atualizado • NF-e Nº <strong>{lastProcessed.nfeNumber}</strong> autorizada • Rastreio Correios: <strong>{lastProcessed.trackingCode}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onViewDanfe(lastProcessed.invoice)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Ver DANFE</span>
            </button>
            <button
              onClick={() => onViewLabel(lastProcessed.label)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Etiqueta</span>
            </button>
            <button
              onClick={() => setLastProcessed(null)}
              className="text-slate-400 hover:text-white text-xs px-2 py-1"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Faturamento */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Faturamento Acumulado</span>
            <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalRevenue || 0)}
          </div>
          <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
            <span>{orders.length} pedidos registrados</span>
          </div>
        </div>

        {/* Vendas Aguardando Automação */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Aguardando NF-e & Etiqueta</span>
            <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400">
            {stats.approvedOrders || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Vendas confirmadas prontas para faturamento
          </div>
        </div>

        {/* Notas Fiscais Emitidas */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>NF-e Emitidas (SEFAZ)</span>
            <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-400">
            {stats.totalInvoices || invoices.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            100% integradas com chave de 44 dígitos
          </div>
        </div>

        {/* Estoque e Alertas */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Alertas de Estoque</span>
            <div className={`p-1.5 rounded-lg ${stats.lowStockProducts > 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-black ${stats.lowStockProducts > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
            {stats.lowStockProducts || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            {stats.lowStockProducts > 0 ? 'SKUs abaixo do estoque mínimo' : 'Estoque regular em todos os SKUs'}
          </div>
        </div>
      </div>

      {/* Main Content: Orders Pipeline Kanban & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Pedidos e Disparo Automático */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Package className="w-5 h-5 text-sky-400" />
                  <span>Pipeline de Pedidos Omnichannel</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Gerencie vendas da SAGAS Brasil e marketplaces com disparo automático
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    filterStatus === 'all' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Todos ({orders.length})
                </button>
                <button
                  onClick={() => setFilterStatus('need_action')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    filterStatus === 'need_action' ? 'bg-amber-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ⚡ Pendentes NF-e ({orders.filter((o) => o.status === 'approved' || o.status === 'pending').length})
                </button>
                <button
                  onClick={() => setFilterStatus('invoiced')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    filterStatus === 'invoiced' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Faturados ({orders.filter((o) => o.status === 'labeled' || o.status === 'invoiced').length})
                </button>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-3">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Nenhum pedido encontrado para o filtro selecionado.
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const isReadyForAutomation = order.status === 'approved' || order.status === 'pending';
                  const associatedInvoice = invoices.find((i) => i.order_id === order.id || i.order_number === order.order_number);
                  const associatedLabel = labels.find((l) => l.order_id === order.id || l.order_number === order.order_number);

                  return (
                    <div
                      key={order.id}
                      className="bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 rounded-xl p-4 transition-all"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
                        <div className="flex items-center space-x-3">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                              order.channel === 'SAGAS Brasil'
                                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                                : order.channel === 'Shopee'
                                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                                : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                            }`}
                          >
                            {order.channel}
                          </span>
                          <span className="font-mono font-bold text-white text-sm">
                            {order.order_number}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(order.created_at).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2.5 py-0.5 text-xs font-semibold rounded-full flex items-center gap-1 ${
                              order.status === 'labeled'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : order.status === 'approved'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : order.status === 'invoiced'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            {order.status === 'labeled' && 'Etiqueta Pronta'}
                            {order.status === 'approved' && 'Aprovado (Aguardando NF-e)'}
                            {order.status === 'pending' && 'Pagamento Pendente'}
                            {order.status === 'invoiced' && 'NF-e Emitida'}
                          </span>

                          <span className="font-bold text-sm text-white">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}
                          </span>
                        </div>
                      </div>

                      {/* Items & Customer summary */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-3">
                        <div>
                          <div className="text-slate-400 text-[11px] uppercase font-semibold">Cliente & Entrega</div>
                          <div className="text-slate-200 font-medium">{order.customer.name}</div>
                          <div className="text-slate-400 text-[11px]">
                            {order.customer.city} - {order.customer.state} • CEP {order.customer.zip_code}
                          </div>
                          <div className="text-slate-400 text-[11px]">
                            Via <strong>{order.shipping_carrier}</strong> • {order.payment_method}
                          </div>
                        </div>

                        <div>
                          <div className="text-slate-400 text-[11px] uppercase font-semibold">Itens do Pedido</div>
                          <ul className="space-y-1 text-slate-300">
                            {order.items.map((it, idx) => (
                              <li key={idx} className="flex justify-between items-center text-[11px]">
                                <span className="truncate pr-2">
                                  {it.quantity}x {it.name} {it.variation ? `(${it.variation})` : ''}
                                </span>
                                <span className="font-mono text-slate-400">
                                  R$ {it.total_price.toFixed(2)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Botão de Disparo da Automação ou Visualização */}
                      <div className="border-t border-slate-800/80 pt-3 flex flex-wrap items-center justify-between gap-2">
                        {isReadyForAutomation ? (
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => handleQuickProcess(order.id)}
                              disabled={processingOrderId === order.id}
                              className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-95 text-xs"
                            >
                              <Zap className={`w-4 h-4 ${processingOrderId === order.id ? 'animate-spin' : ''}`} />
                              <span>
                                {processingOrderId === order.id
                                  ? 'Baixando Estoque & Emitindo...'
                                  : 'Confirmar Venda: Emitir NF-e + Etiqueta'}
                              </span>
                            </button>
                            <span className="text-[11px] text-slate-400 hidden sm:inline">
                              (Baixa estoque + SEFAZ + Rastreio em 1 clique)
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-xs">
                            {associatedInvoice && (
                              <button
                                onClick={() => onViewDanfe(associatedInvoice)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-medium transition-colors"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>DANFE (NF-e {associatedInvoice.nfe_number})</span>
                              </button>
                            )}

                            {associatedLabel && (
                              <button
                                onClick={() => onViewLabel(associatedLabel)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 font-medium transition-colors"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>Etiqueta ({associatedLabel.tracking_code})</span>
                              </button>
                            )}
                          </div>
                        )}

                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Atualizado {new Date(order.updated_at).toLocaleTimeString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Conexão Loja SAGAS & Live Event Log */}
        <div className="space-y-4">
          {/* Card: SAGAS Brasil Store Integration Callout */}
          <div className="bg-gradient-to-br from-pink-950/40 via-purple-950/20 to-slate-900 border border-pink-800/40 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
                Loja Virtual Ativa
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Webhook Online
              </span>
            </div>

            <h4 className="font-bold text-white text-sm mb-1">
              SAGAS Brasil - Moda Feminina & Infantil
            </h4>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              O catálogo de produtos, variações e preços já está sincronizado com esta base. Você pode simular a compra de uma cliente pela vitrine para ver o pedido cair ao vivo!
            </p>

            <button
              onClick={onNavigateToSimulator}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Abrir Vitrine & Simular Compra</span>
            </button>
          </div>

          {/* Event Logs do ERP */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h4 className="font-bold text-white text-sm mb-3 flex items-center justify-between">
              <span>Log de Atividades & Automação</span>
              <span className="text-[10px] text-slate-500 font-mono">tempo real</span>
            </h4>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-sky-400">{log.channel}</span>
                    <span className="text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                  <div className="text-slate-200 text-[11px] font-medium">{log.details}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-mono">
                    Evento: {log.event}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
