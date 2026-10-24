import React, { useState } from 'react';
import { ShippingLabel } from '../types/database';
import {
  Package,
  Printer,
  Copy,
  Check,
  Search,
  Truck,
  ExternalLink,
  Barcode,
  Layers,
} from 'lucide-react';

interface ShippingLabelsViewProps {
  labels: ShippingLabel[];
  onViewLabel: (label: ShippingLabel) => void;
}

export const ShippingLabelsView: React.FC<ShippingLabelsViewProps> = ({
  labels,
  onViewLabel,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handlePrintBatch = () => {
    window.print();
  };

  const filteredLabels = labels.filter(
    (l) =>
      l.tracking_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.order_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner: Logistics Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">
                  Módulo de Expedição & Etiquetas de Envio (Correios / Jadlog / Loggi)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Formato Térmico 100x150mm
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Geração automática com código de barras Code 128, chancela postal e CEP de triagem
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrintBatch}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Todas as Etiquetas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Labels List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/40">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por Rastreio, Cliente ou Pedido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="text-xs text-slate-400">
            {filteredLabels.length} etiqueta(s) gerada(s)
          </div>
        </div>

        {/* Labels Table */}
        <div className="overflow-x-auto">
          {filteredLabels.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Nenhuma etiqueta encontrada. Ao confirmar um pedido no ERP, a etiqueta é gerada automaticamente!
            </div>
          ) : (
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">Rastreamento / Transportadora</th>
                  <th className="p-3">Destinatário & CEP de Triagem</th>
                  <th className="p-3">Pedido / NF-e Vinculada</th>
                  <th className="p-3">Pacote & Peso</th>
                  <th className="p-3">Status Logístico</th>
                  <th className="p-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLabels.map((lbl) => (
                  <tr key={lbl.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono font-bold text-blue-400 text-sm">
                          {lbl.tracking_code}
                        </span>
                        <button
                          onClick={() => handleCopy(lbl.tracking_code)}
                          className="p-1 hover:text-white text-slate-400"
                          title="Copiar código de rastreio"
                        >
                          {copiedCode === lbl.tracking_code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-300 font-semibold mt-0.5">
                        {lbl.carrier} ({lbl.service_type})
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="font-semibold text-white">{lbl.recipient.name}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{lbl.recipient.address}</div>
                      <div className="text-[11px] font-bold font-mono text-emerald-400">
                        CEP: {lbl.recipient.zip}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="font-mono text-pink-400 font-bold">
                        {lbl.order_number}
                      </div>
                      {lbl.package.nfe_number && (
                        <div className="text-[11px] text-slate-400">
                          NF-e: {lbl.package.nfe_number}
                        </div>
                      )}
                    </td>

                    <td className="p-3">
                      <div className="text-slate-200 font-medium">
                        {lbl.package.weight_kg} kg
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {lbl.package.length_cm}x{lbl.package.width_cm}x{lbl.package.height_cm} cm
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                        {lbl.package.items_summary}
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        PRONTA PARA IMPRESSÃO
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <button
                        onClick={() => onViewLabel(lbl)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow text-xs ml-auto"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Ver Etiqueta 100x150</span>
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
