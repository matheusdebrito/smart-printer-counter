/**
 * Rotas para histórico de contadores.
 */
const express = require('express');
const router = express.Router();
const { getHistory, getHistoryById, getHistoryStats } = require('../services/historyService');
const path = require('path');
const fs = require('fs');

/**
 * GET /api/history
 * Lista histórico com paginação e filtros
 * Query params: printerId, startDate, endDate, status, page, pageSize, sortBy, sortOrder
 */
router.get('/', (req, res) => {
  try {
    const {
      printerId,
      startDate,
      endDate,
      status,
      page = 1,
      pageSize = 20,
      sortBy = 'collected_at',
      sortOrder = 'DESC'
    } = req.query;
    
    const options = {
      printerId,
      startDate,
      endDate,
      status,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      sortBy,
      sortOrder
    };
    
    const result = getHistory(options);
    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/history/stats
 * Retorna estatísticas do histórico
 */
router.get('/stats', (req, res) => {
  try {
    const stats = getHistoryStats();
    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/history/:id
 * Retorna um registro específico do histórico
 */
router.get('/:id', (req, res) => {
  try {
    const record = getHistoryById(req.params.id);
    if (!record) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }
    res.json({ record });
  } catch (error) {
    console.error('Erro ao buscar registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/history/:id/file
 * Serve o arquivo (PDF/PNG) do contador para visualização/download
 */
router.get('/:id/file', (req, res) => {
  try {
    const record = getHistoryById(req.params.id);
    if (!record) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }
    
    if (!record.file_path || !fs.existsSync(record.file_path)) {
      return res.status(404).json({ error: 'Arquivo não encontrado no disco' });
    }
    
    const filePath = record.file_path;
    const fileName = path.basename(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    // Define Content-Type baseado na extensão
    let contentType = 'application/octet-stream';
    if (ext === '.pdf') contentType = 'application/pdf';
    else if (ext === '.png') contentType = 'image/png';
    
    // Permite visualização inline (para PDF no browser)
    const disposition = req.query.download ? 'attachment' : 'inline';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `${disposition}; filename="${fileName}"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    fileStream.on('error', (err) => {
      console.error('Erro ao ler arquivo:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Erro ao ler arquivo' });
      }
    });
  } catch (error) {
    console.error('Erro ao servir arquivo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;