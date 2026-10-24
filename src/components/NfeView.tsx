import React, { useState } from 'react';
import { FiscalInvoice, Order } from '../types/database';
import {
  FileText,
  Printer,
  Download,
  Copy,
  Check,
  Search,
  ShieldCheck,
  Layers,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface NfeViewProps {
  invoices: FiscalInvoice[];
  onViewDanfe: (invoice: FiscalInvoice) => void;
}

export const NfeView: React.FC<NfeViewProps> = ({ invoices, onViewDanfe }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadXml = (invoice: FiscalInvoice) => {
    const blob = new Blob([invoice.xml_string], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NFe-${invoice.access_key}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.nfe_number.includes(searchTerm) ||
      inv.recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.access_key.includes(searchTerm)
  );

  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.totals.vNF, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner: Fiscal Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">
                  Módulo Fiscal NF-e (Modelo 55 - SEFAZ Brasil)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  SEFAZ Online
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Emissão automática acionada na confirmação de pedidos da SAGAS Brasil e marketplaces
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-800 text-xs">
            <div>
              <div className="text-slate-500 text-[10px] uppercase">Total Emitido</div>
              <div className="font-bold text-emerald-400 text-sm">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalInvoiced)}
              </div>
            </div>
            <div className="h-6 w-px bg-slate-800"></div>
            <div>
              <div className="text-slate-500 text-[10px] uppercase">Emitente</div>
              <div className="font-medium text-slate-200">SAGAS Brasil Ltda</div>
            </div>
            <div className="h-6 w-px bg-slate-800"></div>
            <div>
              <div className="text-slate-500 text-[10px] uppercase">Regime Tributário</div>
              <div className="font-medium text-sky-400">Simples Nacional</div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/40">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por Nº NF-e, Cliente ou Chave de Acesso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="text-xs text-slate-400">
            {filteredInvoices.length} nota(s) fiscal(is) emitida(s)
          </div>
        </div>

        {/* Invoices Table */}
        <div className="overflow-x-auto">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Nenhuma nota fiscal encontrada. Confirme um pedido no Painel ERP para emitir automaticamente!
            </div>
          ) : (
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">Nº NF-e / Pedido</th>
                  <th className="p-3">Destinatário (Cliente)</th>
                  <th className="p-3">Chave de Acesso (44 dígitos)</th>
                  <th className="p-3">Produtos & Impostos</th>
                  <th className="p-3">Valor Total</th>
                  <th className="p-3 text-right">Ações Oficiais</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-white text-sm">
                        NF-e Nº {inv.nfe_number}
                      </div>
                      <div className="text-[11px] text-pink-400 font-mono">
                        Pedido: {inv.order_number}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(inv.issue_date).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(inv.issue_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="font-semibold text-slate-200">{inv.recipient.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{inv.recipient.cpf_cnpj}</div>
                      <div className="text-[10px] text-slate-500">
                        {inv.recipient.city} - {inv.recipient.state}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-[11px] text-sky-300 bg-slate-950 px-2 py-1 rounded border border-slate-800 max-w-[200px] truncate">
                          {inv.access_key}
                        </span>
                        <button
                          onClick={() => handleCopyKey(inv.access_key)}
                          className="p-1 hover:text-white text-slate-400"
                          title="Copiar chave"
                        >
                          {copiedKey === inv.access_key ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <span className="text-[9px] text-slate-500 block mt-0.5">
                        Modelo 55 • Série {inv.series}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="text-slate-300 font-medium">
                        {inv.items.length} item(ns)
                      </div>
                      <div className="text-[10px] text-slate-500">
                        ICMS Simples: R$ {inv.totals.vICMS.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Frete: R$ {inv.totals.vFrete.toFixed(2)}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="font-extrabold text-white text-sm">
                        R$ {inv.totals.vNF.toFixed(2)}
                      </div>
                      <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        AUTORIZADA SEFAZ
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onViewDanfe(inv)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors shadow text-xs"
                          title="Visualizar e Imprimir DANFE A4"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>DANFE</span>
                        </button>

                        <button
                          onClick={() => handleDownloadXml(inv)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 font-medium border border-slate-700 transition-colors text-xs"
                          title="Baixar XML oficial"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>XML</span>
                        </button>
                      </div>
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
