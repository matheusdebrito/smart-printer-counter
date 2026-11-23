/**
 * Servidor principal - Smart Printer Counter Web Interface
 * API REST + Servidor de arquivos estáticos (frontend)
 */
const express = require('express');
const cors = require('cors');
const path = require('path');

const printersRoutes = require('./src/routes/printers');
const countersRoutes = require('./src/routes/counters');
const historyRoutes = require('./src/routes/history');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging de requisições
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Rotas da API
app.use('/api/printers', printersRoutes);
app.use('/api/counters', countersRoutes);
app.use('/api/history', historyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Servir arquivos estáticos do frontend
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// SPA fallback - serve index.html para rotas não-API
app.get('/{*any}', (req, res, next) => {
  // Se for rota da API, passa para próximo (404)
  if (req.path.startsWith('/api/')) {
    return next();
  }
  // Senão serve o index.html
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 para rotas API não encontradas
app.use('/api/{*any}', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Inicia servidor
const server = app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  Smart Printer Counter - Web Interface                       ║
║  Servidor rodando em http://localhost:${PORT}                    ║
║                                                              ║
║  API Endpoints:                                              ║
║    GET  /api/printers                    - Lista impressoras ║
║    GET  /api/printers/:id/accessibility  - Verifica acesso   ║
║    POST /api/printers/check-accessibility - Verifica todas   ║
║    POST /api/counters/collect            - Coleta contadores ║
║    GET  /api/history                     - Histórico         ║
║    GET  /api/history/stats               - Estatísticas      ║
║    GET  /api/history/:id/file            - Download arquivo  ║
║    GET  /api/health                      - Health check      ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido, encerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT recebido, encerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado');
    process.exit(0);
  });
});

module.exports = app;