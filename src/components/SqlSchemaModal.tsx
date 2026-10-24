import React, { useState, useEffect } from 'react';
import { Database, Copy, Check, Download, X, Layers, Key, Table } from 'lucide-react';
import { generatePostgreSqlDdl } from '../server/sqlGenerator';

interface SqlSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SqlSchemaModal: React.FC<SqlSchemaModalProps> = ({ isOpen, onClose }) => {
  const [sqlContent, setSqlContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'sql' | 'diagram'>('sql');

  useEffect(() => {
    if (isOpen) {
      setSqlContent(generatePostgreSqlDdl());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([sqlContent], { type: 'text/sql;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'omnisync_ecommerce_erp_schema.sql';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Banco de Dados Relacional - Schema DDL & Modelagem ER
              </h3>
              <p className="text-xs text-slate-400">
                PostgreSQL • Google Cloud SQL • Supabase • Gestão Completa de E-commerce & ERP
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-slate-800 p-0.5 rounded-lg flex border border-slate-700 text-xs">
              <button
                onClick={() => setActiveTab('sql')}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeTab === 'sql' ? 'bg-sky-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Código SQL
              </button>
              <button
                onClick={() => setActiveTab('diagram')}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeTab === 'diagram' ? 'bg-sky-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Diagrama das Tabelas
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado!' : 'Copiar SQL'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white shadow transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Baixar .sql</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-950/40">
          {activeTab === 'sql' ? (
            <div>
              <div className="mb-4 bg-sky-950/30 border border-sky-800/40 rounded-xl p-3 text-xs text-sky-300 flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-sky-400 mt-1 shrink-0"></span>
                <div>
                  <strong>Como usar este script:</strong> Você pode copiar e executar este script diretamente no{' '}
                  <strong className="text-white">Google Cloud SQL (PostgreSQL)</strong>, no Supabase, Neon ou qualquer servidor PostgreSQL.
                  Ele cria todas as 8 tabelas relacionais com chaves estrangeiras, índices de alta performance e a view de expedição.
                </div>
              </div>
              <pre className="bg-slate-900 border border-slate-800 text-sky-200 p-4 rounded-xl text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre max-h-[60vh]">
                {sqlContent}
              </pre>
            </div>
          ) : (
            /* Diagrama ER Interativo */
            <div className="space-y-6">
              <div className="text-xs text-slate-400">
                Estrutura de entidades desenvolvida para alta concorrência e sincronização em tempo real entre a loja virtual SAGAS Brasil e o ERP OmniSync:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Categorias & Produtos */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-3 border-b border-slate-800 pb-2">
                    <Table className="w-4 h-4" />
                    <span>Catálogo de Produtos</span>
                  </div>
                  <ul className="text-xs space-y-2 text-slate-300">
                    <li className="flex items-center justify-between bg-slate-950/60 p-2 rounded-lg">
                      <span className="font-semibold text-rose-300">categories</span>
                      <span className="text-[10px] text-slate-500 font-mono">id, slug, ncm_default</span>
                    </li>
                    <li className="flex items-center justify-between bg-slate-950/60 p-2 rounded-lg">
                      <span className="font-semibold text-rose-300">products</span>
                      <span className="text-[10px] text-slate-500 font-mono">sku, prices, stock, ncm</span>
                    </li>
                    <li className="flex items-center justify-between bg-slate-950/60 p-2 rounded-lg">
                      <span className="font-semibold text-rose-300">product_variations</span>
                      <span className="text-[10px] text-slate-500 font-mono">size, color, stock, ean</span>
                    </li>
                  </ul>
                  <div className="mt-3 text-[11px] text-slate-500 leading-tight">
                    Grade completa de tamanhos (P/M/G/GG ou Tam 2 a 14) com baixa precisa de estoque.
                  </div>
                </div>

                {/* Clientes & Pedidos */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-3 border-b border-slate-800 pb-2">
                    <Table className="w-4 h-4" />
                    <span>CRM & Vendas Omnichannel</span>
                  </div>
                  <ul className="text-xs space-y-2 text-slate-300">
                    <li className="flex items-center justify-between bg-slate-950/60 p-2 rounded-lg">
                      <span className="font-semibold text-blue-300">customers</span>
                      <span className="text-[10px] text-slate-500 font-mono">cpf_cnpj, zip_code, address</span>
                    </li>
                    <li className="flex items-center justify-between bg-slate-950/60 p-2 rounded-lg">
                      <span className="font-semibold text-blue-300">orders</span>
                      <span className="text-[10px] text-slate-500 font-mono">channel, status, totals</span>
                    </li>
                    <li className="flex items-center justify-between bg-slate-950/60 p-2 rounded-lg">
                      <span className="font-semibold text-blue-300">order_items</span>
                      <span className="text-[10px] text-slate-500 font-mono">quantity, unit_price, ncm</span>
                    </li>
                  </ul>
                  <div className="mt-3 text-[11px] text-slate-500 leading-tight">
                    Centraliza compras do SAGAS Brasil, Shopee e Mercado Livre com status unificado.
                  </div>
                </div>

                {/* Fiscal & Logística */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-3 border-b border-slate-800 pb-2">
                    <Table className="w-4 h-4" />
                    <span>Automação Fiscal & Logística</span>
                  </div>
                  <ul className="text-xs space-y-2 text-slate-300">
                    <li className="flex items-center justify-between bg-slate-950/60 p-2 rounded-lg">
                      <span className="font-semibold text-emerald-300">fiscal_invoices</span>
                      <span className="text-[10px] text-slate-500 font-mono">access_key, xml, totals</span>
                    </li>
                    <li className="flex items-center justify-between bg-slate-950/60 p-2 rounded-lg">
                      <span className="font-semibold text-emerald-300">shipping_labels</span>
                      <span className="text-[10px] text-slate-500 font-mono">tracking, carrier, barcode</span>
                    </li>
                    <li className="flex items-center justify-between bg-slate-950/60 p-2 rounded-lg">
                      <span className="font-semibold text-emerald-300">vw_ready_dispatch</span>
                      <span className="text-[10px] text-slate-500 font-mono">view para expedição</span>
                    </li>
                  </ul>
                  <div className="mt-3 text-[11px] text-slate-500 leading-tight">
                    Geração automática de NF-e e etiquetas acionadas assim que a venda é confirmada!
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
