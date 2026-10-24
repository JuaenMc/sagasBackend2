import React from 'react';
import {
  Database,
  FileText,
  Package,
  Layers,
  ShoppingBag,
  Code2,
  RefreshCw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenSqlModal: () => void;
  onOpenIntegrationModal: () => void;
  onResetData: () => void;
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    approvedOrders: number;
    invoicedOrders: number;
    lowStockProducts: number;
  };
  isLoading: boolean;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenSqlModal,
  onOpenIntegrationModal,
  onResetData,
  stats,
  isLoading,
  onRefresh,
}) => {
  return (
    <header className="no-print bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      {/* Top Banner / System Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ERP & DB Hub Conectado
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">
            Loja Integrada: <strong className="text-pink-400">SAGAS Brasil - Moda Feminina & Infantil</strong>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">
            Hub Central: <strong className="text-blue-400">OmniSync ERP</strong>
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={onOpenSqlModal}
            className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors font-medium"
            title="Ver e copiar código SQL DDL para PostgreSQL ou Cloud SQL"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Schema SQL DDL</span>
          </button>
          <button
            onClick={onOpenIntegrationModal}
            className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors font-medium"
            title="Como conectar os dois apps do Google AI Studio"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Integrar 2 Apps AI Studio</span>
          </button>
          <button
            onClick={onResetData}
            className="text-slate-500 hover:text-rose-400 transition-colors text-xs"
            title="Restaurar dados de demonstração do zero"
          >
            Resetar Dados
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-600 to-amber-500 flex items-center justify-center text-white shadow-md font-bold text-lg">
            Ω
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                OmniSync ERP & Database Hub
              </h1>
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                SAGAS Moda
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Banco de Dados Relacional • Emissão Automática de NF-e • Etiquetas Correios/Jadlog
            </p>
          </div>
        </div>

        {/* Quick KPI stats in header */}
        <div className="hidden lg:flex items-center space-x-4 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/60 text-xs">
          <div>
            <div className="text-slate-400 text-[10px] uppercase">Pedidos Prontos</div>
            <div className="font-semibold text-emerald-400 text-sm">
              {stats.approvedOrders} aguardando NF-e
            </div>
          </div>
          <div className="h-6 w-px bg-slate-700"></div>
          <div>
            <div className="text-slate-400 text-[10px] uppercase">Faturamento Total</div>
            <div className="font-semibold text-slate-100 text-sm">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalRevenue)}
            </div>
          </div>
          <div className="h-6 w-px bg-slate-700"></div>
          <div>
            <div className="text-slate-400 text-[10px] uppercase">Estoque Baixo</div>
            <div className={`font-semibold text-sm ${stats.lowStockProducts > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
              {stats.lowStockProducts} SKUs
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentTab('simulator')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-semibold shadow transition-all transform active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Simular Loja SAGAS</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Atualizar dados do servidor"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80">
        <nav className="flex space-x-1 overflow-x-auto py-1 scrollbar-none text-xs font-medium">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              currentTab === 'dashboard'
                ? 'bg-blue-600 text-white font-semibold shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Painel ERP & Pedidos</span>
          </button>

          <button
            onClick={() => setCurrentTab('database')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              currentTab === 'database'
                ? 'bg-blue-600 text-white font-semibold shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Banco de Dados (Tabelas & CRUD)</span>
          </button>

          <button
            onClick={() => setCurrentTab('nfe')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              currentTab === 'nfe'
                ? 'bg-blue-600 text-white font-semibold shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Emissor Fiscal (NF-e & DANFE)</span>
          </button>

          <button
            onClick={() => setCurrentTab('shipping')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              currentTab === 'shipping'
                ? 'bg-blue-600 text-white font-semibold shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Expedição & Etiquetas de Envio</span>
          </button>

          <button
            onClick={() => setCurrentTab('simulator')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              currentTab === 'simulator'
                ? 'bg-pink-600 text-white font-semibold shadow'
                : 'text-pink-400 hover:text-pink-200 hover:bg-pink-950/40'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Vitrine SAGAS Brasil (Loja Virtual)</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
