import fs from 'fs';
import path from 'path';
import {
  Category,
  Customer,
  FiscalInvoice,
  Order,
  Product,
  ShippingLabel,
} from '../types/database';
import { createFiscalInvoiceForOrder } from './nfeService';
import { createShippingLabelForOrder } from './shippingService';

export interface SyncLog {
  id: string;
  timestamp: string;
  channel: string;
  event: string;
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
  details: string;
}

export interface DatabaseState {
  categories: Category[];
  products: Product[];
  customers: Customer[];
  orders: Order[];
  invoices: FiscalInvoice[];
  labels: ShippingLabel[];
  logs: SyncLog[];
  nextNfeNumber: number;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Dados Iniciais Ricos de Moda Feminina & Infantil da SAGAS Brasil
const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat_fem_vestidos',
    name: 'Vestidos & Macaquinhos',
    slug: 'vestidos-macaquinhos',
    department: 'Moda Feminina',
    description: 'Vestidos florais, viscolinho, midi, canelados e macaquinhos de verão',
    ncm_default: '6204.42.00',
    icon: 'Sparkles',
    active: true,
    created_at: '2026-10-15T10:00:00Z',
  },
  {
    id: 'cat_fem_blusas',
    name: 'Blusas, Croppeds & T-Shirts',
    slug: 'blusas-croppeds-tshirts',
    department: 'Moda Feminina',
    description: 'Blusas caneladas, t-shirts 100% algodão e croppeds da moda',
    ncm_default: '6109.10.00',
    icon: 'Shirt',
    active: true,
    created_at: '2026-10-15T10:05:00Z',
  },
  {
    id: 'cat_inf_conjuntos',
    name: 'Conjuntos Infantis',
    slug: 'conjuntos-infantis',
    department: 'Moda Infantil',
    description: 'Conjuntos masculinos e femininos do tamanho 2 ao 14 com estampas lúdicas',
    ncm_default: '6103.42.00',
    icon: 'Smile',
    active: true,
    created_at: '2026-10-15T10:10:00Z',
  },
  {
    id: 'cat_inf_bebe',
    name: 'Bebê & Primeiros Passos',
    slug: 'bebe-primeiros-passos',
    department: 'Moda Infantil',
    description: 'Bodies, mijões, macacões antialérgicos e kits maternidade',
    ncm_default: '6111.20.00',
    icon: 'Heart',
    active: true,
    created_at: '2026-10-15T10:15:00Z',
  },
  {
    id: 'cat_combos',
    name: 'Combos & Promoções 3 por R$ 100',
    slug: 'combos-promocionais',
    department: 'Promoções Especiais',
    description: 'Ofertas relâmpago e combos promocionais de alta conversão',
    ncm_default: '6109.10.00',
    icon: 'Zap',
    active: true,
    created_at: '2026-10-15T10:20:00Z',
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_vestido_floral',
    sku: 'SAG-VF-001',
    name: 'Vestido Midi Floral Tropical com Lastex',
    description: 'Confeccionado em viscose leve e fresca, busto em lastex que se ajusta perfeitamente ao corpo e manga princesa.',
    category_id: 'cat_fem_vestidos',
    category_name: 'Vestidos & Macaquinhos',
    brand: 'SAGAS Brasil',
    cost_price: 38.5,
    sale_price: 89.9,
    promo_price: 79.9,
    stock_quantity: 48,
    min_stock: 10,
    unit: 'UN',
    ncm: '6204.42.00',
    cfop: '5102',
    barcode_gtin: '7891234560012',
    weight_kg: 0.28,
    width_cm: 22,
    height_cm: 4,
    length_cm: 28,
    image_url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80',
    active: true,
    variations: [
      { id: 'var_vf_p', sku: 'SAG-VF-001-P-AZ', size: 'P', color: 'Azul Floral', stock: 12, barcode_ean: '7891234560013' },
      { id: 'var_vf_m', sku: 'SAG-VF-001-M-AZ', size: 'M', color: 'Azul Floral', stock: 18, barcode_ean: '7891234560014' },
      { id: 'var_vf_g', sku: 'SAG-VF-001-G-AZ', size: 'G', color: 'Azul Floral', stock: 11, barcode_ean: '7891234560015' },
      { id: 'var_vf_gg', sku: 'SAG-VF-001-GG-AZ', size: 'GG', color: 'Azul Floral', stock: 7, barcode_ean: '7891234560016' },
    ],
    created_at: '2026-10-16T11:00:00Z',
    updated_at: '2026-10-23T12:00:00Z',
  },
  {
    id: 'prod_conjunto_infantil_safari',
    sku: 'SAG-CI-002',
    name: 'Conjunto Infantil Safari Menino (Camiseta + Bermuda Moletom)',
    description: 'Camiseta manga curta 100% algodão penteado estampa safari e bermuda em moletom sem felpa super confortável.',
    category_id: 'cat_inf_conjuntos',
    category_name: 'Conjuntos Infantis',
    brand: 'SAGAS Kids',
    cost_price: 22.0,
    sale_price: 54.9,
    promo_price: 49.9,
    stock_quantity: 65,
    min_stock: 15,
    unit: 'CJ',
    ncm: '6103.42.00',
    cfop: '5102',
    barcode_gtin: '7891234560029',
    weight_kg: 0.22,
    width_cm: 20,
    height_cm: 5,
    length_cm: 25,
    image_url: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=600&q=80',
    active: true,
    variations: [
      { id: 'var_ci_2', sku: 'SAG-CI-002-T2', size: 'Tam 2', color: 'Verde Militar', stock: 15, barcode_ean: '7891234560020' },
      { id: 'var_ci_4', sku: 'SAG-CI-002-T4', size: 'Tam 4', color: 'Verde Militar', stock: 20, barcode_ean: '7891234560021' },
      { id: 'var_ci_6', sku: 'SAG-CI-002-T6', size: 'Tam 6', color: 'Verde Militar', stock: 18, barcode_ean: '7891234560022' },
      { id: 'var_ci_8', sku: 'SAG-CI-002-T8', size: 'Tam 8', color: 'Verde Militar', stock: 12, barcode_ean: '7891234560023' },
    ],
    created_at: '2026-10-16T11:20:00Z',
    updated_at: '2026-10-23T12:00:00Z',
  },
  {
    id: 'prod_blusa_ribana_combo',
    sku: 'SAG-BC-003',
    name: 'Blusa Feminina Canelada Ribana Premium (Oferta Combo)',
    description: 'Malha ribana canelada encorpada com toque macio e elastano. Peça curinga para o dia a dia e trabalho.',
    category_id: 'cat_combos',
    category_name: 'Combos & Promoções 3 por R$ 100',
    brand: 'SAGAS Brasil',
    cost_price: 14.5,
    sale_price: 39.9,
    promo_price: 33.33,
    stock_quantity: 110,
    min_stock: 20,
    unit: 'UN',
    ncm: '6109.10.00',
    cfop: '5102',
    barcode_gtin: '7891234560036',
    weight_kg: 0.16,
    width_cm: 18,
    height_cm: 3,
    length_cm: 22,
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    active: true,
    variations: [
      { id: 'var_bc_p_pt', sku: 'SAG-BC-003-P-PT', size: 'P', color: 'Preto', stock: 30, barcode_ean: '7891234560031' },
      { id: 'var_bc_m_bc', sku: 'SAG-BC-003-M-BC', size: 'M', color: 'Branco Off', stock: 45, barcode_ean: '7891234560032' },
      { id: 'var_bc_g_tr', sku: 'SAG-BC-003-G-TR', size: 'G', color: 'Terracota', stock: 35, barcode_ean: '7891234560033' },
    ],
    created_at: '2026-10-16T11:40:00Z',
    updated_at: '2026-10-23T12:00:00Z',
  },
  {
    id: 'prod_kit_body_bebe',
    sku: 'SAG-KB-004',
    name: 'Kit 3 Bodies Bebê Manga Curta Suedine 100% Algodão',
    description: 'Tecido suedine egípcio ultra macio, gola envelope para vestir fácil e botões de pressão metálicos sem níquel.',
    category_id: 'cat_inf_bebe',
    category_name: 'Bebê & Primeiros Passos',
    brand: 'SAGAS Baby',
    cost_price: 26.0,
    sale_price: 69.9,
    promo_price: 59.9,
    stock_quantity: 34,
    min_stock: 8,
    unit: 'CJ',
    ncm: '6111.20.00',
    cfop: '5102',
    barcode_gtin: '7891234560043',
    weight_kg: 0.25,
    width_cm: 20,
    height_cm: 4,
    length_cm: 24,
    image_url: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=600&q=80',
    active: true,
    variations: [
      { id: 'var_kb_rn', sku: 'SAG-KB-004-RN', size: 'RN', color: 'Neutro Candy', stock: 8, barcode_ean: '7891234560041' },
      { id: 'var_kb_p', sku: 'SAG-KB-004-P', size: 'P', color: 'Neutro Candy', stock: 12, barcode_ean: '7891234560042' },
      { id: 'var_kb_m', sku: 'SAG-KB-004-M', size: 'M', color: 'Neutro Candy', stock: 14, barcode_ean: '7891234560043' },
    ],
    created_at: '2026-10-16T12:00:00Z',
    updated_at: '2026-10-23T12:00:00Z',
  },
  {
    id: 'prod_macaquinho_viscolinho',
    sku: 'SAG-MQ-005',
    name: 'Macaquinho Viscolinho Botões e Faixa de Amarração',
    description: 'Macaquinho feminino elegante e versátil, com botões frontais decorativos e bolsos laterais funcionais.',
    category_id: 'cat_fem_vestidos',
    category_name: 'Vestidos & Macaquinhos',
    brand: 'SAGAS Brasil',
    cost_price: 34.0,
    sale_price: 89.9,
    stock_quantity: 26,
    min_stock: 6,
    unit: 'UN',
    ncm: '6204.42.00',
    cfop: '5102',
    barcode_gtin: '7891234560050',
    weight_kg: 0.3,
    width_cm: 24,
    height_cm: 4,
    length_cm: 30,
    image_url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=600&q=80',
    active: true,
    variations: [
      { id: 'var_mq_p', sku: 'SAG-MQ-005-P-BE', size: 'P', color: 'Bege Areia', stock: 6, barcode_ean: '7891234560051' },
      { id: 'var_mq_m', sku: 'SAG-MQ-005-M-BE', size: 'M', color: 'Bege Areia', stock: 11, barcode_ean: '7891234560052' },
      { id: 'var_mq_g', sku: 'SAG-MQ-005-G-BE', size: 'G', color: 'Bege Areia', stock: 9, barcode_ean: '7891234560053' },
    ],
    created_at: '2026-10-16T12:30:00Z',
    updated_at: '2026-10-23T12:00:00Z',
  },
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust_01',
    doc_type: 'CPF',
    doc_number: '284.912.408-11',
    name: 'Camila Fernandes Silveira',
    email: 'camila.fernandes@gmail.com',
    phone: '(11) 98455-1234',
    address_street: 'Rua das Flores',
    address_number: '342',
    address_complement: 'Apto 42',
    neighborhood: 'Vila Mariana',
    city: 'São Paulo',
    state: 'SP',
    zip_code: '04040-001',
    total_orders: 4,
    total_spent: 428.5,
    created_at: '2026-09-12T14:20:00Z',
  },
  {
    id: 'cust_02',
    doc_type: 'CPF',
    doc_number: '391.048.291-04',
    name: 'Juliana Costa Albuquerque',
    email: 'ju.costa.albuquerque@hotmail.com',
    phone: '(21) 97120-8844',
    address_street: 'Avenida Atlântica',
    address_number: '1850',
    address_complement: 'Bloco B, 702',
    neighborhood: 'Copacabana',
    city: 'Rio de Janeiro',
    state: 'RJ',
    zip_code: '22021-001',
    total_orders: 2,
    total_spent: 198.8,
    created_at: '2026-10-01T09:15:00Z',
  },
  {
    id: 'cust_03',
    doc_type: 'CPF',
    doc_number: '145.892.339-72',
    name: 'Mariana Duarte Souza',
    email: 'mariana.duarte@outlook.com',
    phone: '(31) 99872-4411',
    address_street: 'Rua Rio Grande do Sul',
    address_number: '710',
    neighborhood: 'Santo Agostinho',
    city: 'Belo Horizonte',
    state: 'MG',
    zip_code: '30170-111',
    total_orders: 1,
    total_spent: 89.9,
    created_at: '2026-10-18T16:40:00Z',
  },
  {
    id: 'cust_04',
    doc_type: 'CNPJ',
    doc_number: '41.289.441/0001-90',
    name: 'Boutique Kids & Teen Moda Ltda',
    fantasy_name: 'Boutique Pequenos Passos',
    email: 'compras@boutiquekids.com.br',
    phone: '(41) 3344-9988',
    state_registration: '908.411.223.001',
    address_street: 'Rua XV de Novembro',
    address_number: '1240',
    neighborhood: 'Centro',
    city: 'Curitiba',
    state: 'PR',
    zip_code: '80020-310',
    total_orders: 3,
    total_spent: 2450.0,
    created_at: '2026-08-20T11:00:00Z',
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord_1041',
    order_number: 'SAG-2026-1041',
    channel: 'SAGAS Brasil',
    customer_id: 'cust_01',
    customer: {
      name: 'Camila Fernandes Silveira',
      doc_number: '284.912.408-11',
      email: 'camila.fernandes@gmail.com',
      phone: '(11) 98455-1234',
      zip_code: '04040-001',
      address: 'Rua das Flores, 342 Apto 42 - Vila Mariana',
      city: 'São Paulo',
      state: 'SP',
    },
    items: [
      {
        id: 'item_1041_1',
        product_id: 'prod_vestido_floral',
        sku: 'SAG-VF-001-M-AZ',
        name: 'Vestido Midi Floral Tropical com Lastex',
        variation: 'Tamanho M / Azul Floral',
        quantity: 1,
        unit_price: 79.9,
        total_price: 79.9,
        ncm: '6204.42.00',
        cfop: '5102',
      },
      {
        id: 'item_1041_2',
        product_id: 'prod_conjunto_infantil_safari',
        sku: 'SAG-CI-002-T4',
        name: 'Conjunto Infantil Safari Menino',
        variation: 'Tam 4 / Verde Militar',
        quantity: 1,
        unit_price: 49.9,
        total_price: 49.9,
        ncm: '6103.42.00',
        cfop: '5102',
      },
    ],
    subtotal: 129.8,
    discount: 10.0,
    shipping_cost: 14.5,
    total: 134.3,
    payment_method: 'PIX',
    payment_status: 'Aprovado',
    status: 'labeled', // Já faturado e com etiqueta
    shipping_carrier: 'Correios SEDEX',
    tracking_code: 'SL849102847BR',
    nfe_number: '000014',
    nfe_key: '35261034892109000145550010000141018374928172',
    nfe_id: 'nfe_1041',
    label_id: 'lbl_1041',
    created_at: '2026-10-23T10:14:00Z',
    updated_at: '2026-10-23T10:20:00Z',
  },
  {
    id: 'ord_1042',
    order_number: 'SAG-2026-1042',
    channel: 'SAGAS Brasil',
    customer_id: 'cust_02',
    customer: {
      name: 'Juliana Costa Albuquerque',
      doc_number: '391.048.291-04',
      email: 'ju.costa.albuquerque@hotmail.com',
      phone: '(21) 97120-8844',
      zip_code: '22021-001',
      address: 'Avenida Atlântica, 1850 Bloco B 702 - Copacabana',
      city: 'Rio de Janeiro',
      state: 'RJ',
    },
    items: [
      {
        id: 'item_1042_1',
        product_id: 'prod_macaquinho_viscolinho',
        sku: 'SAG-MQ-005-M-BE',
        name: 'Macaquinho Viscolinho Botões e Faixa',
        variation: 'Tamanho M / Bege Areia',
        quantity: 1,
        unit_price: 89.9,
        total_price: 89.9,
        ncm: '6204.42.00',
        cfop: '6102',
      },
    ],
    subtotal: 89.9,
    discount: 0.0,
    shipping_cost: 19.9,
    total: 109.8,
    payment_method: 'Cartão de Crédito',
    payment_status: 'Aprovado',
    status: 'approved', // Pronto para o gatilho automático de NF-e e Etiqueta!
    shipping_carrier: 'Jadlog .Package',
    created_at: '2026-10-23T14:30:00Z',
    updated_at: '2026-10-23T14:30:00Z',
  },
  {
    id: 'ord_1043',
    order_number: 'MKP-SHOPEE-8821',
    channel: 'Shopee',
    customer_id: 'cust_03',
    customer: {
      name: 'Mariana Duarte Souza',
      doc_number: '145.892.339-72',
      email: 'mariana.duarte@outlook.com',
      phone: '(31) 99872-4411',
      zip_code: '30170-111',
      address: 'Rua Rio Grande do Sul, 710 - Santo Agostinho',
      city: 'Belo Horizonte',
      state: 'MG',
    },
    items: [
      {
        id: 'item_1043_1',
        product_id: 'prod_kit_body_bebe',
        sku: 'SAG-KB-004-M',
        name: 'Kit 3 Bodies Bebê Manga Curta Suedine',
        variation: 'Tamanho M / Neutro Candy',
        quantity: 1,
        unit_price: 59.9,
        total_price: 59.9,
        ncm: '6111.20.00',
        cfop: '6102',
      },
    ],
    subtotal: 59.9,
    discount: 0.0,
    shipping_cost: 16.0,
    total: 75.9,
    payment_method: 'PIX',
    payment_status: 'Pendente',
    status: 'pending',
    shipping_carrier: 'Correios PAC',
    created_at: '2026-10-23T15:45:00Z',
    updated_at: '2026-10-23T15:45:00Z',
  },
];

class DatabaseStore {
  private state: DatabaseState;

  constructor() {
    this.state = this.loadOrInit();
  }

  private loadOrInit(): DatabaseState {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Erro ao carregar banco de dados do disco, inicializando com seed padrão:', e);
    }

    // Inicializa seed
    const seed: DatabaseState = {
      categories: INITIAL_CATEGORIES,
      products: INITIAL_PRODUCTS,
      customers: INITIAL_CUSTOMERS,
      orders: INITIAL_ORDERS,
      invoices: [],
      labels: [],
      logs: [
        {
          id: 'log_01',
          timestamp: '2026-10-23T10:15:00Z',
          channel: 'SAGAS Brasil',
          event: 'PEDIDO_RECEBIDO',
          status: 'SUCCESS',
          details: 'Pedido SAG-2026-1041 recebido via webhook da Loja Virtual SAGAS Brasil',
        },
        {
          id: 'log_02',
          timestamp: '2026-10-23T10:16:30Z',
          channel: 'OmniSync ERP',
          event: 'NFE_EMITIDA_AUTO',
          status: 'SUCCESS',
          details: 'NF-e 000014 gerada e autorizada automaticamente pela SEFAZ SP',
        },
        {
          id: 'log_03',
          timestamp: '2026-10-23T10:17:00Z',
          channel: 'OmniSync Logística',
          event: 'ETIQUETA_CORREIOS',
          status: 'SUCCESS',
          details: 'Etiqueta Correios SEDEX gerada com rastreio SL849102847BR',
        },
      ],
      nextNfeNumber: 15,
    };

    // Gera NF-e e Etiqueta para o primeiro pedido do seed
    const ord1 = seed.orders[0];
    const nfe1 = createFiscalInvoiceForOrder(ord1, 14);
    nfe1.id = 'nfe_1041';
    seed.invoices.push(nfe1);

    const lbl1 = createShippingLabelForOrder(ord1, nfe1.nfe_number, nfe1.access_key);
    lbl1.id = 'lbl_1041';
    lbl1.tracking_code = 'SL849102847BR';
    seed.labels.push(lbl1);

    this.saveState(seed);
    return seed;
  }

  private saveState(state = this.state) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (e) {
      console.error('Falha ao salvar estado do banco:', e);
    }
  }

  // Estatísticas do ERP
  public getStats() {
    const totalOrders = this.state.orders.length;
    const totalRevenue = this.state.orders.reduce((acc, o) => acc + o.total, 0);
    const approvedOrders = this.state.orders.filter((o) => o.status === 'approved').length;
    const invoicedOrders = this.state.orders.filter((o) => ['invoiced', 'labeled', 'shipped'].includes(o.status)).length;
    const lowStockProducts = this.state.products.filter((p) => p.stock_quantity <= p.min_stock).length;

    return {
      totalProducts: this.state.products.length,
      totalCustomers: this.state.customers.length,
      totalOrders,
      totalRevenue,
      approvedOrders,
      invoicedOrders,
      lowStockProducts,
      totalInvoices: this.state.invoices.length,
      totalLabels: this.state.labels.length,
    };
  }

  // --- CATEGORIAS ---
  public getCategories() {
    return this.state.categories;
  }

  public createCategory(data: Partial<Category>): Category {
    const newCat: Category = {
      id: `cat_${Date.now()}`,
      name: data.name || 'Nova Categoria',
      slug: (data.name || 'nova-categoria').toLowerCase().replace(/\s+/g, '-'),
      department: data.department || 'Geral',
      description: data.description || '',
      ncm_default: data.ncm_default || '6109.10.00',
      icon: data.icon || 'Tag',
      active: true,
      created_at: new Date().toISOString(),
    };
    this.state.categories.push(newCat);
    this.saveState();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    const index = this.state.categories.findIndex((c) => c.id === id);
    if (index === -1) return null;
    this.state.categories[index] = { ...this.state.categories[index], ...updates };
    this.saveState();
    return this.state.categories[index];
  }

  public deleteCategory(id: string): boolean {
    const prevLen = this.state.categories.length;
    this.state.categories = this.state.categories.filter((c) => c.id !== id);
    if (this.state.categories.length !== prevLen) {
      this.saveState();
      return true;
    }
    return false;
  }

  // --- PRODUTOS ---
  public getProducts() {
    return this.state.products;
  }

  public getProductById(id: string) {
    return this.state.products.find((p) => p.id === id) || null;
  }

  public createProduct(data: Partial<Product>): Product {
    const newProd: Product = {
      id: `prod_${Date.now()}`,
      sku: data.sku || `SAG-SKU-${Math.floor(100 + Math.random() * 900)}`,
      name: data.name || 'Novo Produto',
      description: data.description || '',
      category_id: data.category_id || (this.state.categories[0]?.id ?? 'cat_geral'),
      category_name: this.state.categories.find((c) => c.id === data.category_id)?.name || 'Geral',
      brand: data.brand || 'SAGAS Brasil',
      cost_price: Number(data.cost_price || 0),
      sale_price: Number(data.sale_price || 0),
      promo_price: data.promo_price ? Number(data.promo_price) : undefined,
      stock_quantity: Number(data.stock_quantity || 0),
      min_stock: Number(data.min_stock || 5),
      unit: data.unit || 'UN',
      ncm: data.ncm || '6109.10.00',
      cfop: data.cfop || '5102',
      barcode_gtin: data.barcode_gtin || `789${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      weight_kg: Number(data.weight_kg || 0.25),
      width_cm: Number(data.width_cm || 20),
      height_cm: Number(data.height_cm || 5),
      length_cm: Number(data.length_cm || 25),
      image_url: data.image_url || 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80',
      active: data.active ?? true,
      variations: data.variations || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.products.push(newProd);
    this.saveState();
    return newProd;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.state.products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    const categoryName = updates.category_id
      ? this.state.categories.find((c) => c.id === updates.category_id)?.name || this.state.products[index].category_name
      : this.state.products[index].category_name;

    this.state.products[index] = {
      ...this.state.products[index],
      ...updates,
      category_name: categoryName,
      updated_at: new Date().toISOString(),
    };
    this.saveState();
    return this.state.products[index];
  }

  public deleteProduct(id: string): boolean {
    const prev = this.state.products.length;
    this.state.products = this.state.products.filter((p) => p.id !== id);
    if (this.state.products.length !== prev) {
      this.saveState();
      return true;
    }
    return false;
  }

  // --- CLIENTES ---
  public getCustomers() {
    return this.state.customers;
  }

  public createCustomer(data: Partial<Customer>): Customer {
    const newCust: Customer = {
      id: `cust_${Date.now()}`,
      doc_type: data.doc_type || 'CPF',
      doc_number: data.doc_number || '000.000.000-00',
      name: data.name || 'Novo Cliente',
      fantasy_name: data.fantasy_name,
      email: data.email || 'cliente@exemplo.com.br',
      phone: data.phone || '(11) 90000-0000',
      state_registration: data.state_registration,
      address_street: data.address_street || 'Rua Principal',
      address_number: data.address_number || '100',
      address_complement: data.address_complement,
      neighborhood: data.neighborhood || 'Centro',
      city: data.city || 'São Paulo',
      state: data.state || 'SP',
      zip_code: data.zip_code || '01000-000',
      total_orders: 0,
      total_spent: 0,
      created_at: new Date().toISOString(),
    };
    this.state.customers.push(newCust);
    this.saveState();
    return newCust;
  }

  // --- PEDIDOS & AUTOMAÇÃO ERP ---
  public getOrders() {
    return this.state.orders;
  }

  public getOrderById(id: string) {
    return this.state.orders.find((o) => o.id === id) || null;
  }

  public createOrder(data: Partial<Order>): Order {
    const orderNumber = `SAG-2026-${Math.floor(1040 + this.state.orders.length + 1)}`;
    const newOrder: Order = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      order_number: data.order_number || orderNumber,
      channel: data.channel || 'SAGAS Brasil',
      customer_id: data.customer_id || 'cust_guest',
      customer: data.customer || {
        name: 'Cliente Loja Virtual',
        doc_number: '123.456.789-00',
        email: 'cliente@sagasbrasil.com.br',
        phone: '(11) 99999-8888',
        zip_code: '01120-000',
        address: 'Rua José Paulino, 100',
        city: 'São Paulo',
        state: 'SP',
      },
      items: data.items || [],
      subtotal: Number(data.subtotal || 0),
      discount: Number(data.discount || 0),
      shipping_cost: Number(data.shipping_cost || 0),
      total: Number(data.total || 0),
      payment_method: data.payment_method || 'PIX',
      payment_status: data.payment_status || 'Aprovado',
      status: data.status || 'approved',
      shipping_carrier: data.shipping_carrier || 'Correios SEDEX',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.state.orders.unshift(newOrder);

    // Registra log de entrada
    this.addLog(
      newOrder.channel,
      'PEDIDO_CRIADO',
      'SUCCESS',
      `Novo pedido ${newOrder.order_number} recebido no valor de R$ ${newOrder.total.toFixed(2)}`
    );

    // Atualiza cliente
    const cust = this.state.customers.find((c) => c.id === newOrder.customer_id);
    if (cust) {
      cust.total_orders += 1;
      cust.total_spent += newOrder.total;
    }

    this.saveState();
    return newOrder;
  }

  /**
   * FLUXO CRÍTICO: CONFIRMAR VENDA & DISPARAR AUTOMAÇÃO COMPLETA:
   * 1. Baixa de estoque do produto/variação
   * 2. Emissão instantânea de NF-e (DANFE + XML)
   * 3. Geração da Etiqueta de Envio com Rastreio
   */
  public confirmAndProcessOrder(orderId: string): {
    order: Order;
    invoice: FiscalInvoice;
    label: ShippingLabel;
  } {
    const orderIndex = this.state.orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) {
      throw new Error(`Pedido não encontrado: ${orderId}`);
    }

    const order = this.state.orders[orderIndex];

    // 1. Baixa de Estoque
    for (const item of order.items) {
      const product = this.state.products.find((p) => p.id === item.product_id);
      if (product) {
        product.stock_quantity = Math.max(0, product.stock_quantity - item.quantity);
        // Atualiza variação se existir
        if (product.variations && item.sku) {
          const varItem = product.variations.find((v) => v.sku === item.sku);
          if (varItem) {
            varItem.stock = Math.max(0, varItem.stock - item.quantity);
          }
        }
      }
    }

    // 2. Emissão de NF-e
    const nfeSeq = this.state.nextNfeNumber++;
    const invoice = createFiscalInvoiceForOrder(order, nfeSeq);
    this.state.invoices.unshift(invoice);

    // 3. Geração de Etiqueta de Envio
    const label = createShippingLabelForOrder(order, invoice.nfe_number, invoice.access_key);
    this.state.labels.unshift(label);

    // 4. Atualização do Pedido
    order.status = 'labeled';
    order.payment_status = 'Aprovado';
    order.nfe_number = invoice.nfe_number;
    order.nfe_key = invoice.access_key;
    order.nfe_id = invoice.id;
    order.tracking_code = label.tracking_code;
    order.label_id = label.id;
    order.updated_at = new Date().toISOString();

    // 5. Registros de Logs
    this.addLog(
      'OmniSync ERP',
      'ESTOQUE_BAIXADO',
      'SUCCESS',
      `Estoque baixado com sucesso para os itens do pedido ${order.order_number}`
    );
    this.addLog(
      'OmniSync Fiscal',
      'NFE_AUTORIZADA',
      'SUCCESS',
      `NF-e nº ${invoice.nfe_number} autorizada pela SEFAZ (Chave: ${invoice.access_key.substring(0, 15)}...)`
    );
    this.addLog(
      'OmniSync Logística',
      'ETIQUETA_GERADA',
      'SUCCESS',
      `Etiqueta ${order.shipping_carrier} gerada com código de rastreio ${label.tracking_code}`
    );

    this.saveState();
    return { order, invoice, label };
  }

  // --- NOTAS FISCAIS & ETIQUETAS ---
  public getInvoices() {
    return this.state.invoices;
  }

  public getInvoiceById(id: string) {
    return this.state.invoices.find((i) => i.id === id) || null;
  }

  public getLabels() {
    return this.state.labels;
  }

  public getLabelById(id: string) {
    return this.state.labels.find((l) => l.id === id) || null;
  }

  public getLogs() {
    return this.state.logs;
  }

  public addLog(channel: string, event: string, status: 'SUCCESS' | 'WARNING' | 'ERROR', details: string) {
    this.state.logs.unshift({
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      channel,
      event,
      status,
      details,
    });
    // Manter últimos 50 logs
    if (this.state.logs.length > 50) {
      this.state.logs = this.state.logs.slice(0, 50);
    }
  }

  public resetToDefault() {
    if (fs.existsSync(DB_FILE)) {
      try {
        fs.unlinkSync(DB_FILE);
      } catch (e) {
        console.error(e);
      }
    }
    this.state = this.loadOrInit();
    return this.state;
  }
}

export const db = new DatabaseStore();
