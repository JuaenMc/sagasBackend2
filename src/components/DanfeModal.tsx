import React, { useState } from 'react';
import { FiscalInvoice } from '../types/database';
import { Printer, Download, Copy, Check, X, FileCode } from 'lucide-react';

interface DanfeModalProps {
  invoice: FiscalInvoice | null;
  onClose: () => void;
}

export const DanfeModal: React.FC<DanfeModalProps> = ({ invoice, onClose }) => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [showXml, setShowXml] = useState(false);

  if (!invoice) return null;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(invoice.access_key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleDownloadXml = () => {
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

  const handlePrint = () => {
    window.print();
  };

  // Formata chave em grupos de 4 dígitos
  const formattedKey = invoice.access_key.replace(/(\d{4})/g, '$1 ').trim();

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        {/* Modal Toolbar (Não sai na impressão) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <div>
              <h3 className="text-sm font-bold">
                DANFE Oficial - NF-e Nº {invoice.nfe_number} (Série {invoice.series})
              </h3>
              <p className="text-xs text-slate-400">
                Chave: {invoice.access_key.substring(0, 20)}... • SEFAZ Autorizada
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowXml(!showXml)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-400" />
              <span>{showXml ? 'Ver DANFE' : 'Ver XML'}</span>
            </button>

            <button
              onClick={handleCopyKey}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
              title="Copiar chave de acesso"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey ? 'Copiado!' : 'Copiar Chave'}</span>
            </button>

            <button
              onClick={handleDownloadXml}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
              title="Baixar arquivo XML SEFAZ"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Baixar XML</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir DANFE</span>
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
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100">
          {showXml ? (
            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto whitespace-pre border border-slate-800 leading-relaxed max-h-[70vh]">
              {invoice.xml_string}
            </div>
          ) : (
            /* DANFE Formato Oficial Padrão SEFAZ */
            <div className="print-danfe bg-white border border-slate-400 text-black text-[10px] font-sans shadow-md mx-auto p-4 max-w-[210mm]">
              {/* Canhoto de Recebimento */}
              <div className="border border-black p-1.5 mb-2">
                <div className="flex justify-between items-center text-[9px] border-b border-black pb-1 mb-1 font-semibold">
                  <span>RECEBEMOS DE {invoice.emitter.trade_name} OS PRODUTOS CONSTANTES DA NOTA FISCAL INDICADA AO LADO</span>
                  <span className="text-right">NF-e Nº {invoice.nfe_number} • SÉRIE {invoice.series}</span>
                </div>
                <div className="grid grid-cols-12 gap-2 text-[9px] pt-1">
                  <div className="col-span-3 border-r border-black pr-2">
                    <span className="block text-[8px] uppercase font-bold text-gray-600">DATA DE RECEBIMENTO</span>
                    <span className="block h-4 border-b border-dotted border-gray-400"></span>
                  </div>
                  <div className="col-span-9">
                    <span className="block text-[8px] uppercase font-bold text-gray-600">IDENTIFICAÇÃO E ASSINATURA DO RECEBEDOR</span>
                    <span className="block h-4 border-b border-dotted border-gray-400"></span>
                  </div>
                </div>
              </div>

              {/* Cabeçalho do Emitente e DANFE */}
              <div className="grid grid-cols-12 border border-black mb-2">
                {/* Dados da Empresa */}
                <div className="col-span-5 p-2 border-r border-black">
                  <div className="font-extrabold text-sm tracking-tight text-gray-900">{invoice.emitter.trade_name}</div>
                  <div className="text-[9px] font-semibold text-gray-700">{invoice.emitter.name}</div>
                  <div className="text-[9px] text-gray-600 mt-1">{invoice.emitter.address}</div>
                  <div className="text-[9px] text-gray-600">{invoice.emitter.city} - {invoice.emitter.state} • CEP: {invoice.emitter.zip}</div>
                  <div className="text-[9px] text-gray-600">Regime: {invoice.emitter.tax_regime}</div>
                </div>

                {/* Bloco DANFE central */}
                <div className="col-span-3 p-2 text-center border-r border-black flex flex-col justify-center items-center bg-gray-50">
                  <span className="font-black text-base tracking-wider">DANFE</span>
                  <span className="text-[8px] leading-tight font-semibold text-gray-700">Documento Auxiliar da Nota Fiscal Eletrônica</span>
                  <div className="mt-1 flex items-center justify-center gap-2 text-[9px]">
                    <span>0 - Entrada</span>
                    <span className="border border-black px-1.5 py-0.5 font-bold bg-white">1</span>
                    <span>1 - Saída</span>
                  </div>
                  <div className="mt-1 font-bold text-xs">
                    Nº {invoice.nfe_number}
                  </div>
                  <div className="text-[9px] text-gray-600">SÉRIE: {invoice.series}</div>
                  <div className="text-[8px] text-gray-500">Folha 1 / 1</div>
                </div>

                {/* Código de barras e Chave de Acesso */}
                <div className="col-span-4 p-2 flex flex-col justify-between">
                  <div>
                    {/* Código de barras simulado */}
                    <div className="h-9 w-full bg-slate-900 flex items-center justify-center text-white text-[8px] tracking-[6px] font-mono select-none overflow-hidden">
                      ||| | |||| || |||||| | |||| ||||| ||| ||||
                    </div>
                    <div className="mt-1">
                      <span className="text-[8px] font-bold block uppercase text-gray-600">CHAVE DE ACESSO</span>
                      <span className="text-[8px] font-mono font-bold block tracking-tight text-gray-800 break-all">
                        {formattedKey}
                      </span>
                    </div>
                  </div>
                  <div className="mt-1 text-[8px] border-t border-gray-300 pt-1 text-gray-600 leading-tight">
                    Consulta de autenticidade no portal nacional da NF-e www.nfe.fazenda.gov.br ou na SEFAZ Autorizadora.
                  </div>
                </div>
              </div>

              {/* Natureza da Operação e Protocolo */}
              <div className="grid grid-cols-12 border border-black mb-2 text-[9px]">
                <div className="col-span-7 p-1 border-r border-black">
                  <span className="block text-[8px] font-bold text-gray-600">NATUREZA DA OPERAÇÃO</span>
                  <span className="font-semibold">VENDA DE MERCADORIA NO E-COMMERCE</span>
                </div>
                <div className="col-span-5 p-1">
                  <span className="block text-[8px] font-bold text-gray-600">PROTOCOLO DE AUTORIZAÇÃO DE USO</span>
                  <span className="font-semibold">135260084920182 - {new Date(invoice.issue_date).toLocaleDateString('pt-BR')} 10:18:24</span>
                </div>
              </div>

              <div className="grid grid-cols-12 border border-black mb-2 text-[9px]">
                <div className="col-span-4 p-1 border-r border-black">
                  <span className="block text-[8px] font-bold text-gray-600">INSCRIÇÃO ESTADUAL</span>
                  <span className="font-semibold">{invoice.emitter.ie}</span>
                </div>
                <div className="col-span-4 p-1 border-r border-black">
                  <span className="block text-[8px] font-bold text-gray-600">INSC. ESTADUAL DO SUBST. TRIBUT.</span>
                  <span className="font-semibold">-</span>
                </div>
                <div className="col-span-4 p-1">
                  <span className="block text-[8px] font-bold text-gray-600">CNPJ</span>
                  <span className="font-semibold">{invoice.emitter.cnpj}</span>
                </div>
              </div>

              {/* Destinatário / Remetente */}
              <div className="mb-2">
                <div className="bg-gray-200 text-gray-800 font-bold px-1.5 py-0.5 text-[9px] border border-black border-b-0 uppercase">
                  DESTINATÁRIO / REMETENTE
                </div>
                <div className="border border-black text-[9px]">
                  <div className="grid grid-cols-12 border-b border-black">
                    <div className="col-span-7 p-1 border-r border-black">
                      <span className="block text-[8px] font-bold text-gray-600">NOME / RAZÃO SOCIAL</span>
                      <span className="font-bold">{invoice.recipient.name}</span>
                    </div>
                    <div className="col-span-3 p-1 border-r border-black">
                      <span className="block text-[8px] font-bold text-gray-600">CNPJ / CPF</span>
                      <span className="font-semibold">{invoice.recipient.cpf_cnpj}</span>
                    </div>
                    <div className="col-span-2 p-1">
                      <span className="block text-[8px] font-bold text-gray-600">DATA DA EMISSÃO</span>
                      <span className="font-semibold">{new Date(invoice.issue_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 border-b border-black">
                    <div className="col-span-6 p-1 border-r border-black">
                      <span className="block text-[8px] font-bold text-gray-600">ENDEREÇO</span>
                      <span>{invoice.recipient.address}</span>
                    </div>
                    <div className="col-span-3 p-1 border-r border-black">
                      <span className="block text-[8px] font-bold text-gray-600">BAIRRO / DISTRITO</span>
                      <span>Centro</span>
                    </div>
                    <div className="col-span-3 p-1">
                      <span className="block text-[8px] font-bold text-gray-600">CEP</span>
                      <span className="font-bold">{invoice.recipient.zip}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-12">
                    <div className="col-span-4 p-1 border-r border-black">
                      <span className="block text-[8px] font-bold text-gray-600">MUNICÍPIO</span>
                      <span>{invoice.recipient.city}</span>
                    </div>
                    <div className="col-span-2 p-1 border-r border-black">
                      <span className="block text-[8px] font-bold text-gray-600">UF</span>
                      <span className="font-bold">{invoice.recipient.state}</span>
                    </div>
                    <div className="col-span-3 p-1 border-r border-black">
                      <span className="block text-[8px] font-bold text-gray-600">FONE / FAX</span>
                      <span>{invoice.recipient.phone}</span>
                    </div>
                    <div className="col-span-3 p-1">
                      <span className="block text-[8px] font-bold text-gray-600">INSCRIÇÃO ESTADUAL</span>
                      <span>ISENTO</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cálculo do Imposto */}
              <div className="mb-2">
                <div className="bg-gray-200 text-gray-800 font-bold px-1.5 py-0.5 text-[9px] border border-black border-b-0 uppercase">
                  CÁLCULO DO IMPOSTO
                </div>
                <div className="border border-black text-[9px]">
                  <div className="grid grid-cols-6 border-b border-black text-right">
                    <div className="p-1 border-r border-black">
                      <span className="block text-[8px] font-bold text-gray-600 text-left">BASE DE CÁLC. DO ICMS</span>
                      <span>R$ 0,00</span>
                    </div>
                    <div className="p-1 border-r border-black">
                      <span className="block text-[8px] font-bold text-gray-600 text-left">VALOR DO ICMS</span>
                      <span>R$ {invoice.totals.vICMS.toFixed(2)}</span>
                    </div>
                    <div className="p-1 border-r border-black">
                      <span className="block text-[8px] font-bold text-gray-600 text-left">BASE CÁLC. ICMS ST</span>
                      <span>R$ 0,00</span>
                    </div>
                    <div className="p-1 border-r border-black">
                      <span className="block text-[8px] font-bold text-gray-600 text-left">VALOR DO ICMS ST</span>
                      <span>R$ 0,00</span>
                    </div>
                    <div className="p-1 border-r border-black">
                      <span className="block text-[8px] font-bold text-gray-600 text-left">V. TOTAL PRODUTOS</span>
                      <span className="font-bold">R$ {invoice.totals.vProd.toFixed(2)}</span>
                    </div>
                    <div className="p-1">
                      <span className="block text-[8px] font-bold text-gray-600 text-left">VALOR DO FRETE</span>
                      <span>R$ {invoice.totals.vFrete.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-6 text-right">
                    <div className="p-1 border-r border-black">
                      <span className="block text-[8px] font-bold text-gray-600 text-left">VALOR DO SEGURO</span>
                      <span>R$ 0,00</span>
                    </div>
                    <div className="p-1 border-r border-black">
                      <span className="block text-[8px] font-bold text-gray-600 text-left">DESCONTO</span>
                      <span>R$ {invoice.totals.vDesc.toFixed(2)}</span>
                    </div>
                    <div className="p-1 border-r border-black">
                      <span className="block text-[8px] font-bold text-gray-600 text-left">OUTRAS DESPESAS</span>
                      <span>R$ 0,00</span>
                    </div>
                    <div className="p-1 border-r border-black">
                      <span className="block text-[8px] font-bold text-gray-600 text-left">VALOR DO IPI</span>
                      <span>R$ 0,00</span>
                    </div>
                    <div className="col-span-2 p-1 bg-yellow-50">
                      <span className="block text-[8px] font-bold text-gray-700 text-left">VALOR TOTAL DA NOTA</span>
                      <span className="font-extrabold text-xs text-black">
                        R$ {invoice.totals.vNF.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dados dos Produtos e Serviços */}
              <div className="mb-2">
                <div className="bg-gray-200 text-gray-800 font-bold px-1.5 py-0.5 text-[9px] border border-black border-b-0 uppercase">
                  DADOS DOS PRODUTOS / SERVIÇOS
                </div>
                <div className="border border-black overflow-x-auto">
                  <table className="w-full text-[9px] border-collapse">
                    <thead>
                      <tr className="bg-gray-100 border-b border-black text-[8px] text-gray-700">
                        <th className="p-1 text-left border-r border-black">CÓDIGO</th>
                        <th className="p-1 text-left border-r border-black">DESCRIÇÃO DOS PRODUTOS</th>
                        <th className="p-1 text-center border-r border-black">NCM/SH</th>
                        <th className="p-1 text-center border-r border-black">CST</th>
                        <th className="p-1 text-center border-r border-black">CFOP</th>
                        <th className="p-1 text-center border-r border-black">UN</th>
                        <th className="p-1 text-right border-r border-black">QTD</th>
                        <th className="p-1 text-right border-r border-black">V. UNIT</th>
                        <th className="p-1 text-right">V. TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((it, idx) => (
                        <tr key={idx} className="border-b border-gray-300">
                          <td className="p-1 border-r border-black font-mono">{it.sku}</td>
                          <td className="p-1 border-r border-black font-medium">{it.description}</td>
                          <td className="p-1 border-r border-black text-center">{it.ncm}</td>
                          <td className="p-1 border-r border-black text-center">0102</td>
                          <td className="p-1 border-r border-black text-center">{it.cfop}</td>
                          <td className="p-1 border-r border-black text-center">{it.uCom}</td>
                          <td className="p-1 border-r border-black text-right">{it.qCom}</td>
                          <td className="p-1 border-r border-black text-right">R$ {it.vUnCom.toFixed(2)}</td>
                          <td className="p-1 text-right font-semibold">R$ {it.vProd.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Dados Adicionais */}
              <div>
                <div className="bg-gray-200 text-gray-800 font-bold px-1.5 py-0.5 text-[9px] border border-black border-b-0 uppercase">
                  DADOS ADICIONAIS / INFORMAÇÕES COMPLEMENTARES
                </div>
                <div className="border border-black p-2 text-[8px] text-gray-700 leading-normal">
                  DOCUMENTO EMITIDO POR ME OU EPP OPTANTE PELO SIMPLES NACIONAL. NÃO GERA DIREITO A CRÉDITO FISCAL DE IPI.
                  Pedido E-commerce: <strong>{invoice.order_number}</strong>. Canal de Origem: <strong>SAGAS Brasil</strong>.
                  Emitido via OmniSync ERP Hub automatizado.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
