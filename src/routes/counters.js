/**
 * Rotas para coleta de contadores.
 */
const express = require('express');
const router = express.Router();
const { collectPrinterCounter, collectMultipleCounters, getAllPrinters } = require('../services/printerService');
const { saveMultipleHistoryRecords } = require('../services/historyService');

/**
 * POST /api/counters/collect
 * Coleta contadores de uma ou múltiplas impressoras.
 * Body: { printerIds?: string[] } - Se omitido, coleta de todas
 */
router.post('/collect', async (req, res) => {
  try {
    const { printerIds } = req.body;
    
    let targetPrinterIds = printerIds;
    
    // Se não especificado, coleta de todas
    if (!targetPrinterIds || !Array.isArray(targetPrinterIds) || targetPrinterIds.length === 0) {
      targetPrinterIds = getAllPrinters().map(p => p.id);
    }
    
    // Valida se as impressoras existem
    const allPrinters = getAllPrinters();
    const validIds = allPrinters.map(p => p.id);
    const invalidIds = targetPrinterIds.filter(id => !validIds.includes(id));
    
    if (invalidIds.length > 0) {
      return res.status(400).json({ 
        error: 'Impressoras inválidas', 
        invalidIds 
      });
    }
    
    console.log(`Iniciando coleta para: ${targetPrinterIds.join(', ')}`);
    const startTime = Date.now();
    
    // Executa coleta
    const results = await collectMultipleCounters(targetPrinterIds);
    
    // Salva no histórico
    saveMultipleHistoryRecords(results);
    
    const duration = Date.now() - startTime;
    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;
    
    console.log(`Coleta finalizada em ${duration}ms: ${successCount} sucesso, ${errorCount} erro`);
    
    res.json({
      results,
      summary: {
        total: results.length,
        success: successCount,
        error: errorCount,
        durationMs: duration
      }
    });
  } catch (error) {
    console.error('Erro na coleta de contadores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * POST /api/counters/collect/:id
 * Coleta contador de uma impressora específica
 */
router.post('/collect/:id', async (req, res) => {
  try {
    const printerId = req.params.id;
    const result = await collectPrinterCounter(printerId);
    
    // Salva no histórico
    const { saveHistoryRecord } = require('../services/historyService');
    saveHistoryRecord(result);
    
    res.json({ result });
  } catch (error) {
    console.error('Erro na coleta individual:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;