/**
 * Rotas para gerenciamento de impressoras.
 */
const express = require('express');
const router = express.Router();
const { getAllPrinters, getPrinterById } = require('../services/printerService');
const { checkPrinterAccessibility, checkAllPrintersAccessibility, clearAccessibilityCache } = require('../services/accessibilityService');

/**
 * GET /api/printers
 * Lista todas as impressoras com status de acessibilidade opcional
 */
router.get('/', async (req, res) => {
  try {
    const { checkAccessibility } = req.query;
    const printers = getAllPrinters();
    
    if (checkAccessibility === 'true') {
      const accessibilityResults = await checkAllPrintersAccessibility(false);
      const accessibilityMap = new Map(accessibilityResults.map(r => [r.printerId, r]));
      
      const printersWithStatus = printers.map(p => ({
        ...p,
        accessibility: accessibilityMap.get(p.id) || { accessible: null, checkedAt: null }
      }));
      
      return res.json({ printers: printersWithStatus });
    }
    
    res.json({ printers });
  } catch (error) {
    console.error('Erro ao listar impressoras:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/printers/:id
 * Retorna detalhes de uma impressora específica
 */
router.get('/:id', (req, res) => {
  try {
    const printer = getPrinterById(req.params.id);
    if (!printer) {
      return res.status(404).json({ error: 'Impressora não encontrada' });
    }
    // Não expor credenciais
    const { login, module, ...safePrinter } = printer;
    res.json({ printer: safePrinter });
  } catch (error) {
    console.error('Erro ao buscar impressora:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/printers/:id/accessibility
 * Verifica acessibilidade de uma impressora específica
 */
router.get('/:id/accessibility', async (req, res) => {
  try {
    const { force } = req.query;
    const result = await checkPrinterAccessibility(req.params.id, force === 'true');
    res.json(result);
  } catch (error) {
    console.error('Erro ao verificar acessibilidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * POST /api/printers/check-accessibility
 * Verifica acessibilidade de todas as impressoras
 */
router.post('/check-accessibility', async (req, res) => {
  try {
    const { force } = req.body;
    const results = await checkAllPrintersAccessibility(force === true);
    res.json({ results });
  } catch (error) {
    console.error('Erro ao verificar acessibilidade de todas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * POST /api/printers/clear-cache
 * Limpa cache de acessibilidade
 */
router.post('/clear-cache', (req, res) => {
  clearAccessibilityCache();
  res.json({ message: 'Cache limpo com sucesso' });
});

module.exports = router;