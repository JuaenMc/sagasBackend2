/**
 * Gerador de Schema SQL Relacional (PostgreSQL / Cloud SQL / SQLite)
 * Pronto para exportar e rodar em qualquer banco relacional.
 */

export function generatePostgreSqlDdl(): string {
  return `-- =========================================================================
-- BANCO DE DADOS E-COMMERCE & ERP OMNISYNC (PostgreSQL / Cloud SQL)
-- Estrutura para Gestão de Produtos, Variações, Clientes, Pedidos, NF-e e Etiquetas
-- Compatível com: PostgreSQL 14+, Google Cloud SQL, Supabase, Neon
-- =========================================================================

-- Extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE CATEGORIAS
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL, -- 'Moda Feminina', 'Moda Infantil', etc.
    description TEXT,
    ncm_default VARCHAR(12) NOT NULL DEFAULT '6109.10.00',
    icon VARCHAR(50),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- 2. TABELA DE PRODUTOS (PAI)
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(36) PRIMARY KEY,
    sku VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id VARCHAR(36) NOT NULL REFERENCES categories(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    brand VARCHAR(100) NOT NULL DEFAULT 'SAGAS Brasil',
    cost_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    sale_price DECIMAL(12, 2) NOT NULL,
    promo_price DECIMAL(12, 2),
    stock_quantity INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 5,
    unit VARCHAR(6) NOT NULL DEFAULT 'UN',
    ncm VARCHAR(12) NOT NULL DEFAULT '6109.10.00',
    cest VARCHAR(10),
    cfop VARCHAR(6) NOT NULL DEFAULT '5102',
    barcode_gtin VARCHAR(14) NOT NULL,
    weight_kg DECIMAL(8, 3) NOT NULL DEFAULT 0.250,
    width_cm DECIMAL(8, 2) NOT NULL DEFAULT 20.00,
    height_cm DECIMAL(8, 2) NOT NULL DEFAULT 5.00,
    length_cm DECIMAL(8, 2) NOT NULL DEFAULT 25.00,
    image_url TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode_gtin);

-- 3. TABELA DE VARIAÇÕES DE PRODUTOS (GRADE: TAMANHO / COR)
CREATE TABLE IF NOT EXISTS product_variations (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL REFERENCES products(id) ON UPDATE CASCADE ON DELETE CASCADE,
    sku_variation VARCHAR(80) NOT NULL UNIQUE,
    size VARCHAR(20) NOT NULL, -- P, M, G, GG, 4, 6, 8...
    color VARCHAR(50) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    barcode_ean VARCHAR(14),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_variations_product ON product_variations(product_id);
CREATE INDEX IF NOT EXISTS idx_variations_sku ON product_variations(sku_variation);

-- 4. TABELA DE CLIENTES (CRM E-COMMERCE)
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(36) PRIMARY KEY,
    doc_type VARCHAR(6) NOT NULL CHECK (doc_type IN ('CPF', 'CNPJ')),
    doc_number VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    fantasy_name VARCHAR(200),
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    state_registration VARCHAR(30), -- Inscrição Estadual (isento para PF)
    address_street VARCHAR(200) NOT NULL,
    address_number VARCHAR(20) NOT NULL,
    address_complement VARCHAR(100),
    neighborhood VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL, -- UF
    zip_code VARCHAR(10) NOT NULL, -- CEP (00000-000)
    total_orders INT DEFAULT 0,
    total_spent DECIMAL(14, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_doc ON customers(doc_number);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- 5. TABELA DE PEDIDOS (OMNICHANNEL: SAGAS BRASIL, SHOPEE, ML)
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    channel VARCHAR(50) NOT NULL DEFAULT 'SAGAS Brasil',
    customer_id VARCHAR(36) NOT NULL REFERENCES customers(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    -- 'pending', 'approved', 'in_picking', 'invoiced', 'labeled', 'shipped', 'delivered', 'cancelled'
    payment_method VARCHAR(50) NOT NULL DEFAULT 'PIX',
    payment_status VARCHAR(30) NOT NULL DEFAULT 'Pendente',
    subtotal DECIMAL(12, 2) NOT NULL,
    discount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    shipping_cost DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total DECIMAL(12, 2) NOT NULL,
    shipping_carrier VARCHAR(100) NOT NULL DEFAULT 'Correios SEDEX',
    tracking_code VARCHAR(50),
    nfe_number VARCHAR(20),
    nfe_key VARCHAR(44),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);

-- 6. TABELA DE ITENS DO PEDIDO
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL REFERENCES orders(id) ON UPDATE CASCADE ON DELETE CASCADE,
    product_id VARCHAR(36) NOT NULL REFERENCES products(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    sku VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    variation VARCHAR(100),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    ncm VARCHAR(12) NOT NULL,
    cfop VARCHAR(6) NOT NULL DEFAULT '5102'
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- 7. TABELA FISCAL (NOTAS FISCAIS ELETRÔNICAS - NF-e MODELO 55)
CREATE TABLE IF NOT EXISTS fiscal_invoices (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL UNIQUE REFERENCES orders(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    nfe_number VARCHAR(20) NOT NULL UNIQUE,
    series VARCHAR(6) NOT NULL DEFAULT '1',
    access_key VARCHAR(44) NOT NULL UNIQUE,
    issue_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'AUTORIZADA',
    total_products DECIMAL(12, 2) NOT NULL,
    total_freight DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_invoice DECIMAL(12, 2) NOT NULL,
    tax_icms DECIMAL(12, 2) DEFAULT 0.00,
    tax_pis DECIMAL(12, 2) DEFAULT 0.00,
    tax_cofins DECIMAL(12, 2) DEFAULT 0.00,
    xml_payload TEXT NOT NULL,
    danfe_pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fiscal_nfe_key ON fiscal_invoices(access_key);
CREATE INDEX IF NOT EXISTS idx_fiscal_nfe_number ON fiscal_invoices(nfe_number);

-- 8. TABELA DE ETIQUETAS DE ENVIO & LOGÍSTICA (CORREIOS / JADLOG / MELHOR ENVIO)
CREATE TABLE IF NOT EXISTS shipping_labels (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL UNIQUE REFERENCES orders(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    tracking_code VARCHAR(50) NOT NULL UNIQUE,
    carrier VARCHAR(100) NOT NULL,
    service_type VARCHAR(50) NOT NULL, -- SEDEX, PAC, Jadlog .Package
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE', -- 'PENDENTE', 'IMPRESSA', 'DESPACHADA'
    recipient_name VARCHAR(200) NOT NULL,
    recipient_address TEXT NOT NULL,
    recipient_zip VARCHAR(10) NOT NULL,
    weight_kg DECIMAL(8, 3) NOT NULL,
    barcode_code128 VARCHAR(100) NOT NULL,
    dispatch_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shipping_tracking ON shipping_labels(tracking_code);

-- 9. VIEW: PEDIDOS PRONTOS PARA EXPEDIÇÃO (FATURADOS COM ETIQUETA)
CREATE OR REPLACE VIEW vw_ready_for_dispatch AS
SELECT 
    o.id AS order_id,
    o.order_number,
    o.channel,
    c.name AS customer_name,
    c.city,
    c.state,
    o.total,
    f.nfe_number,
    f.access_key,
    s.tracking_code,
    s.carrier,
    s.status AS shipping_status
FROM orders o
JOIN customers c ON o.customer_id = c.id
LEFT JOIN fiscal_invoices f ON o.id = f.order_id
LEFT JOIN shipping_labels s ON o.id = s.order_id
WHERE o.status IN ('invoiced', 'labeled');

-- 10. GATILHO AUTOMÁTICO DE BAIXA DE ESTOQUE APÓS APROVAÇÃO
-- (Em PostgreSQL real, executado via PROCEDURE / TRIGGER)
`;
}
