import React, { useState } from 'react';
import { Product, Category } from '../types/database';
import { X, Save, Plus, Trash2, Tag, DollarSign, Layers } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Partial<Product>) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  categories,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: product?.name || '',
    sku: product?.sku || '',
    category_id: product?.category_id || categories[0]?.id || '',
    brand: product?.brand || 'SAGAS Brasil',
    description: product?.description || '',
    cost_price: product?.cost_price || 30.0,
    sale_price: product?.sale_price || 79.9,
    promo_price: product?.promo_price || undefined,
    stock_quantity: product?.stock_quantity || 20,
    min_stock: product?.min_stock || 5,
    unit: product?.unit || 'UN',
    ncm: product?.ncm || '6109.10.00',
    cfop: product?.cfop || '5102',
    barcode_gtin: product?.barcode_gtin || '7891234567890',
    weight_kg: product?.weight_kg || 0.25,
    image_url: product?.image_url || 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80',
    variations: product?.variations || [
      { id: 'v1', sku: 'SKU-P', size: 'P', color: 'Padrão', stock: 5, barcode_ean: '78910001' },
      { id: 'v2', sku: 'SKU-M', size: 'M', color: 'Padrão', stock: 10, barcode_ean: '78910002' },
      { id: 'v3', sku: 'SKU-G', size: 'G', color: 'Padrão', stock: 5, barcode_ean: '78910003' },
    ],
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const addVariation = () => {
    const newVar = {
      id: `var_${Date.now()}`,
      sku: `${formData.sku || 'SAG'}-VAR-${formData.variations?.length || 0 + 1}`,
      size: 'GG',
      color: 'Padrão',
      stock: 5,
      barcode_ean: `789${Math.floor(10000000 + Math.random() * 90000000)}`,
    };
    setFormData({
      ...formData,
      variations: [...(formData.variations || []), newVar],
    });
  };

  const removeVariation = (index: number) => {
    const vars = [...(formData.variations || [])];
    vars.splice(index, 1);
    setFormData({ ...formData, variations: vars });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-pink-500/10 text-pink-400 rounded-xl border border-pink-500/20">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {product ? 'Editar Produto no Banco de Dados' : 'Cadastrar Novo Produto (SAGAS Brasil)'}
              </h3>
              <p className="text-xs text-slate-400">
                Informações cadastrais, fiscais (NCM/CFOP) e controle de grade/estoque
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {/* Linha 1: Nome e SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-medium mb-1">Título do Produto *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-pink-500"
                placeholder="Ex: Vestido Midi Floral Lastex Manga Princesa"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">SKU Principal *</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-pink-500"
                placeholder="Ex: SAG-VF-008"
              />
            </div>
          </div>

          {/* Linha 2: Categoria, Marca e Imagem */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Categoria *</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-pink-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.department} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Marca</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-pink-500"
                placeholder="SAGAS Brasil"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">URL da Foto</label>
              <input
                type="text"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-pink-500"
                placeholder="https://images.unsplash.com/..."
              />
            </div>
          </div>

          {/* Linha 3: Preços e Estoque */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Preço de Custo (R$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Preço de Venda (R$) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.sale_price}
                onChange={(e) => setFormData({ ...formData, sale_price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold text-emerald-400 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Estoque Total</label>
              <input
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Estoque Mínimo (Alerta)</label>
              <input
                type="number"
                value={formData.min_stock}
                onChange={(e) => setFormData({ ...formData, min_stock: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          {/* Linha 4: Dados Fiscais para NF-e Automática */}
          <div className="bg-blue-950/20 p-3.5 rounded-xl border border-blue-900/40">
            <div className="font-semibold text-blue-300 mb-2 flex items-center gap-1.5">
              <span>Campos Fiscais (Essenciais para a emissão correta da NF-e)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">NCM (Mercosul) *</label>
                <input
                  type="text"
                  required
                  value={formData.ncm}
                  onChange={(e) => setFormData({ ...formData, ncm: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-sky-300 font-mono"
                  placeholder="6109.10.00"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">CFOP Padrão</label>
                <input
                  type="text"
                  value={formData.cfop}
                  onChange={(e) => setFormData({ ...formData, cfop: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-sky-300 font-mono"
                  placeholder="5102"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Código de Barras GTIN/EAN</label>
                <input
                  type="text"
                  value={formData.barcode_gtin}
                  onChange={(e) => setFormData({ ...formData, barcode_gtin: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono"
                  placeholder="7891234567890"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Peso (kg) / Frete</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.weight_kg}
                  onChange={(e) => setFormData({ ...formData, weight_kg: parseFloat(e.target.value) || 0.25 })}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-200"
                  placeholder="0.25"
                />
              </div>
            </div>
          </div>

          {/* Linha 5: Grade de Tamanhos / Variações */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-slate-200">Grade de Variações (Tamanhos e Cores)</label>
              <button
                type="button"
                onClick={addVariation}
                className="flex items-center gap-1 text-[11px] text-pink-400 hover:text-pink-300 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Tamanho/Cor</span>
              </button>
            </div>

            <div className="space-y-2">
              {formData.variations?.map((v, idx) => (
                <div key={v.id || idx} className="grid grid-cols-12 gap-2 items-center bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={v.sku}
                      onChange={(e) => {
                        const copy = [...(formData.variations || [])];
                        copy[idx].sku = e.target.value;
                        setFormData({ ...formData, variations: copy });
                      }}
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-slate-300"
                      placeholder="SKU Var."
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={v.size}
                      onChange={(e) => {
                        const copy = [...(formData.variations || [])];
                        copy[idx].size = e.target.value;
                        setFormData({ ...formData, variations: copy });
                      }}
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300"
                      placeholder="Tamanho (ex: M, 4)"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={v.color}
                      onChange={(e) => {
                        const copy = [...(formData.variations || [])];
                        copy[idx].color = e.target.value;
                        setFormData({ ...formData, variations: copy });
                      }}
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300"
                      placeholder="Cor"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={v.stock}
                      onChange={(e) => {
                        const copy = [...(formData.variations || [])];
                        copy[idx].stock = parseInt(e.target.value, 10) || 0;
                        setFormData({ ...formData, variations: copy });
                      }}
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-emerald-400 font-bold"
                      placeholder="Estoque"
                    />
                  </div>
                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => removeVariation(idx)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-semibold shadow transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Produto</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
