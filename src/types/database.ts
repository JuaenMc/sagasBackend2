/**
 * Definições de Tipos para o Banco de Dados do E-Commerce & ERP OmniSync
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  department: string;
  description: string;
  ncm_default: string;
  icon?: string;
  active: boolean;
  created_at: string;
}

export interface ProductVariation {
  id: string;
  sku: string;
  size: string; // P, M, G, GG, 2, 4, 6, 8, etc.
  color: string;
  stock: number;
  barcode_ean: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category_id: string;
  category_name?: string;
  brand: string;
  cost_price: number;
  sale_price: number;
  promo_price?: number;
  stock_quantity: number;
  min_stock: number;
  unit: string; // UN, PC, CJ
  ncm: string; // Nomenclatura Comum do Mercosul (ex: 6109.10.00)
  cest?: string;
  cfop: string; // 5102 (dentro do estado) / 6102 (fora)
  barcode_gtin: string;
  weight_kg: number;
  width_cm: number;
  height_cm: number;
  length_cm: number;
  image_url: string;
  variations: ProductVariation[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  doc_type: 'CPF' | 'CNPJ';
  doc_number: string;
  name: string;
  fantasy_name?: string;
  email: string;
  phone: string;
  state_registration?: string; // Inscrição Estadual
  address_street: string;
  address_number: string;
  address_complement?: string;
  neighborhood: string;
  city: string;
  state: string; // UF: SP, RJ, etc.
  zip_code: string; // CEP: 00000-000
  total_orders: number;
  total_spent: number;
  created_at: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  sku: string;
  name: string;
  variation?: string; // ex: "Tamanho M / Azul Floral"
  quantity: number;
  unit_price: number;
  total_price: number;
  ncm: string;
  cfop: string;
}

export type OrderStatus =
  | 'pending' // Aguardando confirmação / pagamento
  | 'approved' // Venda Confirmada (pronto para faturamento)
  | 'in_picking' // Em separação
  | 'invoiced' // NF-e Emitida
  | 'labeled' // Etiqueta Gerada
  | 'shipped' // Enviado ao cliente
  | 'delivered' // Entregue
  | 'cancelled'; // Cancelado

export type SalesChannel = 'SAGAS Brasil' | 'Shopee' | 'Mercado Livre' | 'Loja Física';

export interface Order {
  id: string;
  order_number: string; // ex: SAG-2026-1042
  channel: SalesChannel;
  customer_id: string;
  customer: {
    name: string;
    doc_number: string;
    email: string;
    phone: string;
    zip_code: string;
    address: string;
    city: string;
    state: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping_cost: number;
  total: number;
  payment_method: 'PIX' | 'Cartão de Crédito' | 'Boleto';
  payment_status: 'Pendente' | 'Aprovado' | 'Recusado';
  status: OrderStatus;
  shipping_carrier: string; // ex: Correios SEDEX, Jadlog, Loggi
  tracking_code?: string;
  nfe_key?: string;
  nfe_number?: string;
  nfe_id?: string;
  label_id?: string;
  created_at: string;
  updated_at: string;
}

export interface FiscalInvoice {
  id: string;
  order_id: string;
  order_number: string;
  nfe_number: string; // ex: 000.014.289
  series: string; // 1
  access_key: string; // 44 dígitos
  issue_date: string;
  status: 'AUTORIZADA' | 'CANCELADA' | 'REJEITADA';
  emitter: {
    name: string;
    trade_name: string;
    cnpj: string;
    ie: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    tax_regime: string; // Simples Nacional
  };
  recipient: {
    name: string;
    cpf_cnpj: string;
    ie?: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  totals: {
    vProd: number;
    vFrete: number;
    vDesc: number;
    vNF: number;
    vICMS: number;
    vPIS: number;
    vCOFINS: number;
  };
  items: Array<{
    item: number;
    sku: string;
    description: string;
    ncm: string;
    cfop: string;
    uCom: string;
    qCom: number;
    vUnCom: number;
    vProd: number;
  }>;
  xml_string: string;
}

export interface ShippingLabel {
  id: string;
  order_id: string;
  order_number: string;
  tracking_code: string;
  carrier: string; // 'Correios SEDEX' | 'Correios PAC' | 'Jadlog'
  service_type: string;
  status: 'PENDENTE' | 'IMPRESSA' | 'DESPACHADA';
  sender: {
    name: string;
    company: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  recipient: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
  };
  package: {
    weight_kg: number;
    format: string; // Pacote / Caixa
    length_cm: number;
    width_cm: number;
    height_cm: number;
    items_summary: string;
    declared_value: number;
    nfe_number?: string;
    nfe_key?: string;
  };
  barcode_128: string;
  dispatch_date: string;
}
