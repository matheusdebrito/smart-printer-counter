/**
 * Serviço para executar a coleta de contadores via Playwright.
 * Wrapper que executa os módulos existentes de cada impressora.
 */
const { chromium } = require('playwright');
const { printers } = require('../config/printers');
const path = require('path');
const fs = require('fs');

// Caminho raiz do projeto
const PROJECT_ROOT = path.join(__dirname, '..', '..');

// Carrega nomeContador do projeto
const nomeContador = require(path.join(PROJECT_ROOT, 'impressoras', 'nomeContador'));

// Caminho do Chromium do sistema (instalado via apt no Docker)
const CHROMIUM_EXECUTABLE_PATH = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || '/usr/bin/chromium';

/**
 * Executa a coleta de contador para uma impressora específica.
 * @param {string} printerId - ID da impressora (ex: 'rh')
 * @returns {Promise<Object>} Resultado da coleta
 */
async function collectPrinterCounter(printerId) {
  const printer = printers.find(p => p.id === printerId);
  if (!printer) {
    return {
      printerId,
      printerName: printerId,
      success: false,
      error: `Impressora não encontrada: ${printerId}`,
      filePath: null,
      fileType: null,
      collectedAt: new Date().toISOString()
    };
  }

  let browser;
  try {
    // Usa Chromium do sistema (instalado via apt) em vez do bundled do Playwright
    browser = await chromium.launch({ 
      headless: true,
      executablePath: CHROMIUM_EXECUTABLE_PATH
    });
    
    // Carrega o módulo da impressora dinamicamente (caminho relativo à raiz do projeto)
    const printerModule = require(path.join(PROJECT_ROOT, printer.module));
    
    // Executa a função da impressora
    await printerModule(browser);
    
    // Determina o arquivo gerado baseado no tipo
    let filePath;
    if (printer.type === 'pdf') {
      filePath = nomeContador.nomeContadorPDF(printer.id.replace(/_/g, '_'));
    } else {
      filePath = nomeContador.nomeContadorPNG(printer.id.replace(/_/g, '_'));
    }
    
    // Verifica se o arquivo foi criado (procura o mais recente)
    const dir = path.dirname(filePath);
    const baseName = path.basename(filePath).split('_').slice(0, -1).join('_');
    
    let actualFilePath = filePath;
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir)
        .filter(f => f.startsWith(`Contador-${printer.name}`) || f.startsWith(`Contador-${printer.id}`))
        .sort()
        .reverse();
      if (files.length > 0) {
        actualFilePath = path.join(dir, files[0]);
      }
    }
    
    const stats = fs.existsSync(actualFilePath) ? fs.statSync(actualFilePath) : null;
    
    return {
      printerId,
      printerName: printer.name,
      success: true,
      error: null,
      filePath: actualFilePath,
      fileType: printer.type,
      fileSize: stats ? stats.size : 0,
      collectedAt: new Date().toISOString()
    };
    
  } catch (error) {
    return {
      printerId,
      printerName: printer.name,
      success: false,
      error: error.message,
      filePath: null,
      fileType: printer.type,
      fileSize: 0,
      collectedAt: new Date().toISOString()
    };
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

/**
 * Executa coleta para múltiplas impressoras em paralelo.
 * @param {string[]} printerIds - Array de IDs das impressoras
 * @param {number} concurrency - Limite de concorrência (padrão: 3)
 * @returns {Promise<Object[]>} Array de resultados
 */
async function collectMultipleCounters(printerIds, concurrency = 3) {
  const results = [];
  
  // Processa em lotes para limitar concorrência
  for (let i = 0; i < printerIds.length; i += concurrency) {
    const batch = printerIds.slice(i, i + concurrency);
    const batchPromises = batch.map(id => collectPrinterCounter(id));
    const batchResults = await Promise.allSettled(batchPromises);
    
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push({
          printerId: batch[index],
          printerName: batch[index],
          success: false,
          error: result.reason?.message || 'Erro desconhecido',
          filePath: null,
          fileType: null,
          fileSize: 0,
          collectedAt: new Date().toISOString()
        });
      }
    });
  }
  
  return results;
}

/**
 * Retorna a lista de todas as impressoras configuradas.
 * @returns {Array} Lista de impressoras
 */
function getAllPrinters() {
  return printers.map(p => ({
    id: p.id,
    name: p.name,
    ip: p.ip,
    type: p.type,
    checkUrl: p.checkUrl
  }));
}

/**
 * Busca uma impressora pelo ID.
 * @param {string} printerId 
 * @returns {Object|null}
 */
function getPrinterById(printerId) {
  return printers.find(p => p.id === printerId) || null;
}

module.exports = {
  collectPrinterCounter,
  collectMultipleCounters,
  getAllPrinters,
  getPrinterById
};