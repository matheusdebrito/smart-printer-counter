/**
 * Utilitários para manipulação de arquivos.
 */
const fs = require('fs');
const path = require('path');

/**
 * Garante que um diretório existe, criando se necessário.
 * @param {string} dirPath 
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Lista arquivos de contador em um diretório.
 * @param {string} dirPath 
 * @returns {Array} Lista de arquivos com metadados
 */
function listCounterFiles(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  
  return fs.readdirSync(dirPath)
    .filter(file => file.match(/^Contador-.+\.(pdf|png)$/i))
    .map(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        path: filePath,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        extension: path.extname(file).toLowerCase()
      };
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Formata tamanho de arquivo em formato legível.
 * @param {number} bytes 
 * @returns {string}
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Deleta arquivos antigos baseado em dias de retenção.
 * @param {string} baseDir - Diretório base dos contadores
 * @param {number} daysToKeep - Dias para manter
 * @returns {number} Quantidade de arquivos deletados
 */
function cleanupOldCounterFiles(baseDir, daysToKeep = 365) {
  let deletedCount = 0;
  const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
  
  function processDir(dir) {
    if (!fs.existsSync(dir)) return;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        processDir(fullPath);
        // Remove diretório vazio
        try {
          if (fs.readdirSync(fullPath).length === 0) {
            fs.rmdirSync(fullPath);
          }
        } catch (e) {
          // Ignora erros
        }
      } else if (entry.isFile() && entry.name.match(/^Contador-.+\.(pdf|png)$/i)) {
        const stats = fs.statSync(fullPath);
        if (stats.mtimeMs < cutoffTime) {
          fs.unlinkSync(fullPath);
          deletedCount++;
        }
      }
    }
  }
  
  processDir(baseDir);
  return deletedCount;
}

module.exports = {
  ensureDir,
  listCounterFiles,
  formatFileSize,
  cleanupOldCounterFiles
};