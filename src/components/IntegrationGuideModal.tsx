import React, { useState } from 'react';
import { Code2, Copy, Check, X, ArrowRight, Zap, CheckCircle2, Terminal } from 'lucide-react';

interface IntegrationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateWebhook: () => void;
}

export const IntegrationGuideModal: React.FC<IntegrationGuideModalProps> = ({
  isOpen,
  onClose,
  onSimulateWebhook,
}) => {
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://seu-erp-url.run.app';

  const checkoutSnippet = `// SAGAS Brasil - Moda Feminina & Infantil
// src/services/erpIntegration.ts

const ERP_API_URL = '${currentOrigin}';

/**
 * Envia o pedido da loja virtual diretamente para o OmniSync ERP
 * Dispara automaticamente a baixa de estoque, emissão de NF-e e etiqueta
 */
export async function syncOrderWithOmniSync(orderData: {
  customer: {
    name: string;
    doc_number: string; // CPF
    email: string;
    phone: string;
    zip_code: string;
    address: string;
    city: string;
    state: string;
  };
  items: Array<{
    product_id: string;
    sku: string;
    name: string;
    variation?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    ncm: string;
    cfop: string;
  }>;
  subtotal: number;
  discount: number;
  shipping_cost: number;
  total: number;
  payment_method: 'PIX' | 'Cartão de Crédito' | 'Boleto';
  shipping_carrier: string;
}) {
  const response = await fetch(\`\${ERP_API_URL}/api/webhooks/sagas-checkout?auto_process=true\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Origin-App': 'SAGAS-Brasil-Store',
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    throw new Error('Falha ao sincronizar com OmniSync ERP');
  }

  const result = await response.json();
  console.log('✅ Pedido processado no ERP!', {
    pedido: result.order.order_number,
    nfe: result.nfe_number,
    rastreio: result.tracking_code,
  });

  return result;
}`;

  const fetchCatalogSnippet = `// Buscar catálogo com estoque em tempo real do OmniSync no SAGAS Brasil:
export async function fetchLiveCatalog() {
  const res = await fetch('${currentOrigin}/api/products');
  const products = await res.json();
  return products; // Produtos atualizados com saldo em tempo real
}`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Guia de Integração: SAGAS Brasil ↔ OmniSync ERP no Google AI Studio
              </h3>
              <p className="text-xs text-slate-400">
                Como conectar as duas aplicações para automatizar estoque, NF-e e etiquetas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-300">
          {/* Architecture Overview */}
          <div className="bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-blue-950/40 p-4 rounded-xl border border-purple-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-600/30 border border-pink-500/40 flex items-center justify-center font-bold text-pink-400">
                S
              </div>
              <div>
                <div className="font-bold text-white text-sm">SAGAS Brasil</div>
                <div className="text-[11px] text-pink-300">Loja Virtual (Front-end & Vitrine)</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px] bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <span>POST /api/webhooks/sagas-checkout</span>
              <ArrowRight className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center font-bold text-blue-400">
                Ω
              </div>
              <div>
                <div className="font-bold text-white text-sm">OmniSync ERP</div>
                <div className="text-[11px] text-blue-300">Banco de Dados + NF-e + Etiquetas</div>
              </div>
            </div>
          </div>

          {/* Passo a Passo */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Passo a Passo de Integração
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div className="text-emerald-400 font-bold mb-1">1. URL do Endpoint</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  A API do OmniSync já aceita requisições CORS de qualquer app. A URL base é a URL desta aplicação:
                </p>
                <div className="mt-2 p-1.5 bg-slate-900 rounded font-mono text-[10px] text-sky-300 truncate">
                  {currentOrigin}
                </div>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div className="text-purple-400 font-bold mb-1">2. Catálogo Unificado</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Consulte <code className="text-purple-300">GET /api/products</code> para que a loja SAGAS Brasil sempre exiba estoque real atualizado.
                </p>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div className="text-pink-400 font-bold mb-1">3. Disparo Automático</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Ao concluir a compra com <code className="text-pink-300">auto_process=true</code>, o ERP emite a NF-e e gera a etiqueta na mesma hora!
                </p>
              </div>
            </div>
          </div>

          {/* Código para o SAGAS Brasil */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-sky-400" />
                Código para Colar no App SAGAS Brasil (Checkout):
              </h4>
              <button
                onClick={() => copyToClipboard(checkoutSnippet, 'checkout')}
                className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-medium"
              >
                {copiedSnippet === 'checkout' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSnippet === 'checkout' ? 'Copiado!' : 'Copiar Código'}</span>
              </button>
            </div>
            <pre className="bg-slate-950 border border-slate-800 text-sky-200 p-4 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre max-h-[40vh]">
              {checkoutSnippet}
            </pre>
          </div>

          {/* Teste Imediato */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-white text-xs">Quer testar a integração sem mexer no código agora?</div>
              <div className="text-[11px] text-slate-400">
                Use a aba <strong>"Vitrine SAGAS Brasil"</strong> deste app ou clique no botão ao lado para simular uma compra ao vivo!
              </div>
            </div>
            <button
              onClick={() => {
                onSimulateWebhook();
                onClose();
              }}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Simular Disparo de Venda Webhook</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
