import React, { useState } from 'react';
import { Product, ProductVariation } from '../types/database';
import confetti from 'canvas-confetti';
import {
  ShoppingBag,
  Zap,
  CheckCircle2,
  Truck,
  CreditCard,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  ExternalLink,
  Tag,
} from 'lucide-react';

interface SagasStoreSimulatorProps {
  products: Product[];
  onOrderCreated: (orderData: any, autoProcess: boolean) => Promise<any>;
  onSwitchToDashboard: () => void;
}

export const SagasStoreSimulator: React.FC<SagasStoreSimulatorProps> = ({
  products,
  onOrderCreated,
  onSwitchToDashboard,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product>(products[0] || null);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(
    products[0]?.variations[0] || null
  );
  const [quantity, setQuantity] = useState(1);
  const [shippingMethod, setShippingMethod] = useState<'Correios SEDEX' | 'Correios PAC' | 'Jadlog .Package'>('Correios SEDEX');
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'Cartão de Crédito' | 'Boleto'>('PIX');
  const [autoProcess, setAutoProcess] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<any>(null);

  // Customer form state
  const [customer, setCustomer] = useState({
    name: 'Camila Fernandes Silveira',
    doc_number: '284.912.408-11',
    email: 'camila.fernandes@gmail.com',
    phone: '(11) 98455-1234',
    zip_code: '04040-001',
    address: 'Rua das Flores, 342 Apto 42 - Vila Mariana',
    city: 'São Paulo',
    state: 'SP',
  });

  const handleSelectProduct = (prod: Product) => {
    setSelectedProduct(prod);
    setSelectedVariation(prod.variations?.[0] || null);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setIsSubmitting(true);
    try {
      const unitPrice = selectedProduct.promo_price || selectedProduct.sale_price;
      const subtotal = unitPrice * quantity;
      const shippingCost = shippingMethod === 'Correios SEDEX' ? 18.9 : 12.5;
      const total = subtotal + shippingCost;

      const orderPayload = {
        channel: 'SAGAS Brasil',
        customer_id: 'cust_01',
        customer,
        items: [
          {
            id: `item_${Date.now()}`,
            product_id: selectedProduct.id,
            sku: selectedVariation ? selectedVariation.sku : selectedProduct.sku,
            name: selectedProduct.name,
            variation: selectedVariation ? `Tamanho ${selectedVariation.size} / ${selectedVariation.color}` : undefined,
            quantity,
            unit_price: unitPrice,
            total_price: subtotal,
            ncm: selectedProduct.ncm,
            cfop: customer.state === 'SP' ? '5102' : '6102',
          },
        ],
        subtotal,
        discount: 0,
        shipping_cost: shippingCost,
        total,
        payment_method: paymentMethod,
        payment_status: 'Aprovado',
        status: autoProcess ? 'approved' : 'pending',
        shipping_carrier: shippingMethod,
      };

      const result = await onOrderCreated(orderPayload, autoProcess);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      setCheckoutResult(result);
    } catch (err: any) {
      alert(`Erro na sincronização: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Store Header Banner */}
      <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-700 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-bold text-[10px] uppercase tracking-wider backdrop-blur-sm">
                Ambiente de Simulação Integrado
              </span>
              <span className="text-pink-200 text-xs">Conectado via Webhook ao OmniSync ERP</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">
              SAGAS Brasil - Moda Feminina & Infantil
            </h2>
            <p className="text-pink-100 text-xs mt-1 max-w-xl">
              Compre vestidos, macaquinhos, blusas ribana e conjuntos infantis. Todas as compras feitas aqui refletem em tempo real no banco de dados e geram NF-e e etiquetas no ERP!
            </p>
          </div>

          <div className="bg-white/15 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-xs text-right">
            <div className="text-pink-200 text-[10px] uppercase">Catálogo Sincronizado</div>
            <div className="font-bold text-white text-sm">{products.length} Produtos Ativos</div>
            <div className="text-[10px] text-pink-200">Estoque baixado via API</div>
          </div>
        </div>
      </div>

      {/* Post-Purchase Success Feedback */}
      {checkoutResult && (
        <div className="bg-emerald-950/80 border-2 border-emerald-500 p-6 rounded-3xl shadow-2xl space-y-4 animate-fadeIn">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                🎉 Pedido Finalizado e Sincronizado com o OmniSync ERP!
              </h3>
              <p className="text-xs text-slate-300">
                O webhook disparou o fluxo completo de faturamento e logística.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Número do Pedido:</span>
              <strong className="text-white font-mono text-sm">
                {checkoutResult.order?.order_number || checkoutResult.data?.order?.order_number}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Nota Fiscal (NF-e):</span>
              <strong className="text-emerald-400 font-mono text-sm">
                Nº {checkoutResult.nfe_number || checkoutResult.data?.invoice?.nfe_number || '000015'} (SEFAZ Autorizada)
              </strong>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Rastreio Correios / Etiqueta:</span>
              <strong className="text-blue-400 font-mono text-sm">
                {checkoutResult.tracking_code || checkoutResult.data?.label?.tracking_code || 'SL849201948BR'}
              </strong>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={() => {
                setCheckoutResult(null);
                onSwitchToDashboard();
              }}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg transition-all flex items-center gap-2"
            >
              <span>Ver Pedido, DANFE e Etiqueta no Painel ERP</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCheckoutResult(null)}
              className="text-slate-400 hover:text-white text-xs underline"
            >
              Fazer outra compra simulada
            </button>
          </div>
        </div>
      )}

      {/* Simulator Layout: Left Vitrine / Right Checkout Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Product Showcase & Selector */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
              <span>Vitrine da Loja SAGAS Brasil (Escolha uma Peça)</span>
              <span className="text-xs text-pink-400 font-semibold">Ofertas Relâmpago ⚡</span>
            </h3>

            {/* Products Horizontal Slider / Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {products.map((prod) => {
                const isSelected = selectedProduct?.id === prod.id;
                return (
                  <div
                    key={prod.id}
                    onClick={() => handleSelectProduct(prod)}
                    className={`cursor-pointer rounded-2xl border p-2.5 transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-pink-500 bg-pink-950/30 shadow-lg ring-1 ring-pink-500'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="relative rounded-xl overflow-hidden mb-2 aspect-square bg-slate-800">
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                        {prod.promo_price && (
                          <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[9px] font-black bg-pink-600 text-white uppercase shadow">
                            Promo
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-white text-xs line-clamp-2">
                        {prod.name}
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-500 line-through">
                          {prod.promo_price && `R$ ${prod.sale_price.toFixed(2)}`}
                        </div>
                        <div className="font-extrabold text-pink-400 text-xs">
                          R$ {(prod.promo_price || prod.sale_price).toFixed(2)}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {prod.stock_quantity} un
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Product Details & Variation Selector */}
          {selectedProduct && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col sm:flex-row gap-5">
              <div className="w-full sm:w-44 h-44 rounded-2xl overflow-hidden bg-slate-800 shrink-0">
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                      {selectedProduct.category_name}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      SKU: {selectedProduct.sku}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white mt-1">
                    {selectedProduct.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {selectedProduct.description}
                  </p>
                </div>

                {/* Grade de Tamanhos */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Selecione o Tamanho & Cor:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.variations?.map((v) => {
                      const isVarSelected = selectedVariation?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariation(v)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            isVarSelected
                              ? 'bg-pink-600 text-white border-pink-500 shadow'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          {v.size} ({v.color}) • {v.stock} em estoque
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quantidade e Preço */}
                <div className="flex items-center space-x-4 pt-2">
                  <div className="flex items-center border border-slate-700 rounded-xl bg-slate-800 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1 text-slate-400 hover:text-white font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-white">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1 text-slate-400 hover:text-white font-bold"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-lg font-black text-emerald-400">
                    Total: R$ {((selectedProduct.promo_price || selectedProduct.sale_price) * quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Checkout & Automations Form */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleCheckout}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <CreditCard className="w-4 h-4 text-pink-400" />
                <span>Checkout da Loja Virtual SAGAS Brasil</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                100% Seguro
              </span>
            </div>

            {/* Dados do Cliente */}
            <div className="space-y-2 text-xs">
              <div className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
                Dados da Compradora (Cliente)
              </div>
              <div>
                <label className="block text-slate-400 text-[10px] mb-0.5">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 text-[10px] mb-0.5">CPF (NF-e)</label>
                  <input
                    type="text"
                    required
                    value={customer.doc_number}
                    onChange={(e) => setCustomer({ ...customer, doc_number: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] mb-0.5">CEP de Entrega</label>
                  <input
                    type="text"
                    required
                    value={customer.zip_code}
                    onChange={(e) => setCustomer({ ...customer, zip_code: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] mb-0.5">Endereço Completo</label>
                <input
                  type="text"
                  required
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 text-[10px] mb-0.5">Cidade</label>
                  <input
                    type="text"
                    required
                    value={customer.city}
                    onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] mb-0.5">Estado (UF)</label>
                  <input
                    type="text"
                    required
                    value={customer.state}
                    onChange={(e) => setCustomer({ ...customer, state: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>
            </div>

            {/* Opções de Envio e Pagamento */}
            <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
              <div>
                <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                  Método de Envio (Correios / Transportadora):
                </label>
                <select
                  value={shippingMethod}
                  onChange={(e: any) => setShippingMethod(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-pink-500"
                >
                  <option value="Correios SEDEX">Correios SEDEX (R$ 18,90 - 2 a 3 dias úteis)</option>
                  <option value="Correios PAC">Correios PAC (R$ 12,50 - 5 a 8 dias úteis)</option>
                  <option value="Jadlog .Package">Jadlog Express (R$ 15,90 - 3 a 4 dias úteis)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                  Forma de Pagamento:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['PIX', 'Cartão de Crédito', 'Boleto'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                        paymentMethod === m
                          ? 'bg-pink-600 text-white border-pink-500 shadow'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chave de Automação do ERP */}
            <div className="bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-slate-950/60 p-3.5 rounded-2xl border border-amber-800/40 text-xs">
              <label className="flex items-start space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoProcess}
                  onChange={(e) => setAutoProcess(e.target.checked)}
                  className="mt-0.5 rounded text-pink-600 focus:ring-pink-500"
                />
                <div>
                  <span className="font-bold text-amber-300 block">
                    ⚡ Automação Imediata de Venda Confirmada
                  </span>
                  <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">
                    Ao finalizar, baixa imediatamente o estoque, emite a NF-e SEFAZ e gera a Etiqueta de Envio com código de rastreamento no OmniSync ERP.
                  </span>
                </div>
              </label>
            </div>

            {/* Total e Botão de Finalizar */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Subtotal ({quantity}x itens):</span>
                <span>R$ {((selectedProduct?.promo_price || selectedProduct?.sale_price || 0) * quantity).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Frete ({shippingMethod}):</span>
                <span>{shippingMethod === 'Correios SEDEX' ? 'R$ 18,90' : 'R$ 12,50'}</span>
              </div>
              <div className="flex items-center justify-between font-bold text-white text-base pt-1 border-t border-slate-800">
                <span>Total a Pagar:</span>
                <span className="text-emerald-400">
                  R$ {(((selectedProduct?.promo_price || selectedProduct?.sale_price || 0) * quantity) + (shippingMethod === 'Correios SEDEX' ? 18.9 : 12.5)).toFixed(2)}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !selectedProduct}
                className="w-full py-3 px-4 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-2xl font-bold text-sm shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2"
              >
                <Zap className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
                <span>{isSubmitting ? 'Processando no ERP...' : 'Concluir Compra na Loja SAGAS'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
