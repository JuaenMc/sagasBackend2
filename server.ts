import express from 'express';
import path from 'path';
import { db } from './src/server/db';
import { generatePostgreSqlDdl } from './src/server/sqlGenerator';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Log de requisições da API
  app.use('/api', (req, res, next) => {
    // Permite CORS para facilitar integração entre apps do Google AI Studio
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // --- ROTAS DA API ---

  // Health & Status
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'OmniSync ERP & SAGAS Brasil DB API', version: '2.5.0' });
  });

  // Estatísticas do ERP
  app.get('/api/stats', (req, res) => {
    res.json(db.getStats());
  });

  // Categorias
  app.get('/api/categories', (req, res) => {
    res.json(db.getCategories());
  });

  app.post('/api/categories', (req, res) => {
    const cat = db.createCategory(req.body);
    res.status(201).json(cat);
  });

  app.put('/api/categories/:id', (req, res) => {
    const updated = db.updateCategory(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Categoria não encontrada' });
    res.json(updated);
  });

  app.delete('/api/categories/:id', (req, res) => {
    const ok = db.deleteCategory(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Categoria não encontrada' });
    res.json({ success: true });
  });

  // Produtos
  app.get('/api/products', (req, res) => {
    res.json(db.getProducts());
  });

  app.get('/api/products/:id', (req, res) => {
    const prod = db.getProductById(req.params.id);
    if (!prod) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(prod);
  });

  app.post('/api/products', (req, res) => {
    const prod = db.createProduct(req.body);
    res.status(201).json(prod);
  });

  app.put('/api/products/:id', (req, res) => {
    const updated = db.updateProduct(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(updated);
  });

  app.delete('/api/products/:id', (req, res) => {
    const ok = db.deleteProduct(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json({ success: true });
  });

  // Clientes
  app.get('/api/customers', (req, res) => {
    res.json(db.getCustomers());
  });

  app.post('/api/customers', (req, res) => {
    const cust = db.createCustomer(req.body);
    res.status(201).json(cust);
  });

  // Pedidos
  app.get('/api/orders', (req, res) => {
    res.json(db.getOrders());
  });

  app.get('/api/orders/:id', (req, res) => {
    const order = db.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.json(order);
  });

  app.post('/api/orders', (req, res) => {
    const order = db.createOrder(req.body);
    res.status(201).json(order);
  });

  // GATILHO AUTOMÁTICO: Confirmar Venda -> Baixa Estoque + Emite NF-e + Gera Etiqueta
  app.post('/api/orders/:id/process-sale', (req, res) => {
    try {
      const result = db.confirmAndProcessOrder(req.params.id);
      res.json({
        success: true,
        message: 'Venda confirmada, estoque atualizado, NF-e autorizada e Etiqueta de Envio emitida com sucesso!',
        data: result,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Erro ao processar pedido' });
    }
  });

  // Notas Fiscais (NF-e)
  app.get('/api/nfe', (req, res) => {
    res.json(db.getInvoices());
  });

  app.get('/api/nfe/:id', (req, res) => {
    const inv = db.getInvoiceById(req.params.id);
    if (!inv) return res.status(404).json({ error: 'NF-e não encontrada' });
    res.json(inv);
  });

  // Etiquetas de Envio
  app.get('/api/labels', (req, res) => {
    res.json(db.getLabels());
  });

  app.get('/api/labels/:id', (req, res) => {
    const lbl = db.getLabelById(req.params.id);
    if (!lbl) return res.status(404).json({ error: 'Etiqueta não encontrada' });
    res.json(lbl);
  });

  // Logs de Sincronização & Eventos
  app.get('/api/logs', (req, res) => {
    res.json(db.getLogs());
  });

  // Schema DDL do Banco Relacional
  app.get('/api/database/schema-sql', (req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(generatePostgreSqlDdl());
  });

  // Reset para dados de fábrica
  app.post('/api/database/reset', (req, res) => {
    const state = db.resetToDefault();
    res.json({ success: true, message: 'Banco de dados restaurado para estado inicial de demonstração', state });
  });

  // Webhook para a loja SAGAS Brasil
  app.post('/api/webhooks/sagas-checkout', (req, res) => {
    const orderData = req.body;
    const autoProcess = req.query.auto_process === 'true' || true;

    const order = db.createOrder({
      ...orderData,
      channel: 'SAGAS Brasil',
    });

    if (autoProcess) {
      const processed = db.confirmAndProcessOrder(order.id);
      return res.status(201).json({
        status: 'received_and_processed',
        order: processed.order,
        nfe_number: processed.invoice.nfe_number,
        tracking_code: processed.label.tracking_code,
      });
    }

    res.status(201).json({ status: 'received_pending', order });
  });

  // --- INTEGRAÇÃO COM VITE ---
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor OmniSync ERP & E-Commerce DB rodando em http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Falha ao iniciar servidor:', err);
  process.exit(1);
});
