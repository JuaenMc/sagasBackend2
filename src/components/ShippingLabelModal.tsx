import React, { useState } from 'react';
import { ShippingLabel } from '../types/database';
import { Printer, X, Copy, Check, Truck, Package, ShieldCheck } from 'lucide-react';

interface ShippingLabelModalProps {
  label: ShippingLabel | null;
  onClose: () => void;
}

export const ShippingLabelModal: React.FC<ShippingLabelModalProps> = ({ label, onClose }) => {
  const [copiedCode, setCopiedCode] = useState(false);

  if (!label) return null;

  const handleCopyTracking = () => {
    navigator.clipboard.writeText(label.tracking_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        {/* Modal Toolbar (Não sai na impressão) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-400" />
                <span>Etiqueta de Envio - {label.carrier}</span>
              </h3>
              <p className="text-xs text-slate-400">
                Rastreio: {label.tracking_code} • Pedido: {label.order_number}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyTracking}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copiado' : 'Copiar Rastreio'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Etiqueta (100x150mm)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
          {/* ETIQUETA PADRÃO TÉRMICA 100x150mm */}
          <div className="print-label bg-white border-2 border-black text-black w-full max-w-[100mm] min-h-[145mm] p-3 text-[10px] font-sans flex flex-col justify-between shadow-lg">
            {/* Topo: Transportadora e Chancela */}
            <div className="border-b-2 border-black pb-2 mb-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-black text-base tracking-tight uppercase">
                    {label.carrier.includes('SEDEX') ? 'CORREIOS - SEDEX' : label.carrier.includes('PAC') ? 'CORREIOS - PAC' : label.carrier}
                  </div>
                  <div className="text-[8px] font-semibold text-gray-700 uppercase">
                    Contrato: 9912489201 • Chave ERP: OmniSync
                  </div>
                </div>
                {/* Chancela Postal */}
                <div className="border border-black px-2 py-1 text-center bg-gray-50 rounded">
                  <div className="text-[7px] font-bold">CHANCELA</div>
                  <div className="text-[9px] font-black uppercase">
                    {label.carrier.includes('SEDEX') ? 'SEDEX' : 'ENCOMENDA'}
                  </div>
                </div>
              </div>

              {/* Código de Rastreamento & Barcode */}
              <div className="mt-2 text-center">
                {/* Código de barras Code128 simulado */}
                <div className="h-12 w-full bg-black flex items-center justify-center text-white font-mono text-[9px] tracking-[6px] select-none my-1">
                  |||| | || ||||| || ||| |||| || |||||| | ||
                </div>
                <div className="font-mono font-black text-xs tracking-wider">
                  {label.tracking_code}
                </div>
              </div>
            </div>

            {/* DESTINATÁRIO */}
            <div className="border-2 border-black p-2 mb-2 bg-gray-50/50">
              <div className="flex justify-between items-center border-b border-black pb-1 mb-1">
                <span className="font-black text-[9px] uppercase tracking-wide">DESTINATÁRIO</span>
                <span className="text-[8px] font-mono font-bold">Nº Pedido: {label.order_number}</span>
              </div>
              <div className="font-extrabold text-xs text-gray-900 mb-0.5">
                {label.recipient.name}
              </div>
              <div className="text-[10px] text-gray-800 leading-snug">
                {label.recipient.address}
              </div>
              <div className="text-[10px] text-gray-800 font-medium">
                {label.recipient.city} - {label.recipient.state}
              </div>
              <div className="text-[9px] text-gray-600">
                Tel: {label.recipient.phone}
              </div>

              {/* CEP GIGANTE DE TRIAGEM */}
              <div className="mt-2 pt-1 border-t border-dashed border-gray-400 flex items-center justify-between">
                <div>
                  <span className="text-[8px] font-bold text-gray-600 block uppercase">CEP DE ENTREGA</span>
                  <span className="font-black text-lg tracking-widest text-black font-mono">
                    {label.recipient.zip}
                  </span>
                </div>
                {/* Mini código de barras do CEP */}
                <div className="h-6 w-24 bg-black flex items-center justify-center text-white text-[7px] font-mono tracking-widest">
                  |||||||||||
                </div>
              </div>
            </div>

            {/* REMETENTE */}
            <div className="border border-black p-2 mb-2 text-[9px]">
              <span className="font-bold text-[8px] block uppercase text-gray-600">REMETENTE:</span>
              <div className="font-bold">{label.sender.name} ({label.sender.company})</div>
              <div>{label.sender.address}</div>
              <div>{label.sender.city} - {label.sender.state} • CEP: {label.sender.zip}</div>
            </div>

            {/* DADOS FISCAIS & CONTEÚDO */}
            <div className="border-t-2 border-black pt-1.5 text-[8px] text-gray-700">
              <div className="flex justify-between items-center mb-1">
                <span>
                  <strong>NF-e Nº:</strong> {label.package.nfe_number || '000014'} (Série 1)
                </span>
                <span>
                  <strong>Peso:</strong> {label.package.weight_kg} kg
                </span>
                <span>
                  <strong>Dimensões:</strong> {label.package.length_cm}x{label.package.width_cm}x{label.package.height_cm} cm
                </span>
              </div>
              <div className="text-[8px] truncate text-gray-600">
                <strong>Conteúdo:</strong> {label.package.items_summary}
              </div>
              {label.package.nfe_key && (
                <div className="text-[7px] font-mono text-gray-500 truncate mt-0.5">
                  Chave: {label.package.nfe_key}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
