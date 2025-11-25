/**
 * GalleryPia - Export Utilities
 * 
 * Client-side JavaScript for exporting data in various formats
 * Supports CSV, JSON, and PDF exports
 * 
 * Features:
 * - CSV export with custom delimiters
 * - JSON export with pretty printing
 * - PDF export with jsPDF (lightweight)
 * - Excel-compatible CSV (UTF-8 BOM)
 * - Custom column selection
 * - Filename customization
 * 
 * @version 1.0.0
 * @date 2025-11-23
 */

class DataExporter {
  constructor(options = {}) {
    this.data = options.data || [];
    this.filename = options.filename || 'export';
    this.columns = options.columns || null; // null = all columns
    this.dateFormat = options.dateFormat || 'YYYY-MM-DD HH:mm:ss';
  }
  
  // Export to CSV
  exportCSV(options = {}) {
    const delimiter = options.delimiter || ',';
    const includeHeaders = options.includeHeaders !== false;
    const excelCompatible = options.excelCompatible !== false;
    
    if (this.data.length === 0) {
      console.warn('No data to export');
      return;
    }
    
    // Get columns
    const columns = this.columns || Object.keys(this.data[0]);
    
    let csv = '';
    
    // Add BOM for Excel compatibility
    if (excelCompatible) {
      csv = '\uFEFF';
    }
    
    // Add headers
    if (includeHeaders) {
      csv += columns.map(col => this.escapeCSV(col, delimiter)).join(delimiter) + '\n';
    }
    
    // Add rows
    this.data.forEach(row => {
      const values = columns.map(col => {
        const value = row[col];
        return this.escapeCSV(this.formatValue(value), delimiter);
      });
      csv += values.join(delimiter) + '\n';
    });
    
    this.downloadFile(csv, `${this.filename}.csv`, 'text/csv;charset=utf-8;');
  }
  
  // Export to JSON
  exportJSON(options = {}) {
    const pretty = options.pretty !== false;
    const indent = options.indent || 2;
    
    if (this.data.length === 0) {
      console.warn('No data to export');
      return;
    }
    
    // Filter columns if specified
    let exportData = this.data;
    if (this.columns) {
      exportData = this.data.map(row => {
        const filtered = {};
        this.columns.forEach(col => {
          if (col in row) {
            filtered[col] = row[col];
          }
        });
        return filtered;
      });
    }
    
    const json = pretty 
      ? JSON.stringify(exportData, null, indent)
      : JSON.stringify(exportData);
    
    this.downloadFile(json, `${this.filename}.json`, 'application/json;charset=utf-8;');
  }
  
  // Export to PDF (basic table format)
  exportPDF(options = {}) {
    const title = options.title || this.filename;
    const orientation = options.orientation || 'portrait'; // portrait or landscape
    
    if (this.data.length === 0) {
      console.warn('No data to export');
      return;
    }
    
    // Create simple HTML table for PDF
    const columns = this.columns || Object.keys(this.data[0]);
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; border-bottom: 2px solid #8b5cf6; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #8b5cf6; color: white; padding: 12px; text-align: left; }
          td { border: 1px solid #ddd; padding: 10px; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>생성일: ${new Date().toLocaleString('ko-KR')}</p>
        <table>
          <thead>
            <tr>
              ${columns.map(col => `<th>${col}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${this.data.map(row => `
              <tr>
                ${columns.map(col => `<td>${this.formatValue(row[col])}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          <p>총 ${this.data.length}개 항목 | GalleryPia NFT Platform</p>
        </div>
      </body>
      </html>
    `;
    
    // Create blob and download
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Open in new window for printing
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = function() {
        setTimeout(() => {
          printWindow.print();
        }, 250);
      };
    }
  }
  
  // Helper: Escape CSV values
  escapeCSV(value, delimiter) {
    if (value === null || value === undefined) {
      return '';
    }
    
    const str = String(value);
    
    // If contains delimiter, quotes, or newlines, wrap in quotes
    if (str.includes(delimiter) || str.includes('"') || str.includes('\n')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    
    return str;
  }
  
  // Helper: Format value for export
  formatValue(value) {
    if (value === null || value === undefined) {
      return '';
    }
    
    if (value instanceof Date) {
      return value.toISOString();
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    return String(value);
  }
  
  // Helper: Download file
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  }
}

// Gallery-specific exporter
class GalleryExporter extends DataExporter {
  constructor(artworks, options = {}) {
    const formattedData = artworks.map(artwork => ({
      'ID': artwork.id,
      '제목': artwork.title,
      '작가': artwork.artist_name,
      '카테고리': artwork.category,
      '가격(KRW)': artwork.price_krw,
      '가격(ETH)': artwork.price_eth,
      'NFT 민팅': artwork.nft_minted ? '예' : '아니오',
      '조회수': artwork.views_count || 0,
      '좋아요': artwork.likes_count || 0,
      '등록일': artwork.created_at ? new Date(artwork.created_at).toLocaleDateString('ko-KR') : ''
    }));
    
    super({
      data: formattedData,
      filename: options.filename || `gallery_export_${Date.now()}`,
      ...options
    });
  }
}

// Transaction exporter
class TransactionExporter extends DataExporter {
  constructor(transactions, options = {}) {
    const formattedData = transactions.map(tx => ({
      'Transaction ID': tx.id,
      '작품명': tx.artwork_title,
      '판매자': tx.seller_name,
      '구매자': tx.buyer_name,
      '가격': tx.price_eth + ' ETH',
      '수수료': tx.platform_fee_eth + ' ETH',
      '로열티': tx.creator_royalty_eth + ' ETH',
      '상태': tx.status,
      '거래일': tx.created_at ? new Date(tx.created_at).toLocaleString('ko-KR') : ''
    }));
    
    super({
      data: formattedData,
      filename: options.filename || `transactions_${Date.now()}`,
      ...options
    });
  }
}

// Export modal UI
function showExportModal(data, type = 'gallery') {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[100] export-modal';
  modal.innerHTML = `
    <div class="bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-2xl font-bold text-white">
          <i class="fas fa-download mr-2 text-purple-500"></i>
          데이터 내보내기
        </h3>
        <button onclick="closeExportModal()" class="text-gray-400 hover:text-white text-2xl">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="space-y-4">
        <div>
          <label class="block text-gray-300 mb-2 font-semibold">파일 형식</label>
          <div class="grid grid-cols-3 gap-3">
            <button 
              onclick="executeExport('${type}', 'csv')"
              class="export-format-btn p-4 bg-gray-700 hover:bg-purple-600 rounded-lg transition-colors text-center"
            >
              <i class="fas fa-file-csv text-3xl mb-2 text-green-400"></i>
              <p class="text-white font-semibold">CSV</p>
              <p class="text-xs text-gray-400">엑셀 호환</p>
            </button>
            
            <button 
              onclick="executeExport('${type}', 'json')"
              class="export-format-btn p-4 bg-gray-700 hover:bg-purple-600 rounded-lg transition-colors text-center"
            >
              <i class="fas fa-file-code text-3xl mb-2 text-blue-400"></i>
              <p class="text-white font-semibold">JSON</p>
              <p class="text-xs text-gray-400">개발자용</p>
            </button>
            
            <button 
              onclick="executeExport('${type}', 'pdf')"
              class="export-format-btn p-4 bg-gray-700 hover:bg-purple-600 rounded-lg transition-colors text-center"
            >
              <i class="fas fa-file-pdf text-3xl mb-2 text-red-400"></i>
              <p class="text-white font-semibold">PDF</p>
              <p class="text-xs text-gray-400">인쇄용</p>
            </button>
          </div>
        </div>
        
        <div class="pt-4 border-t border-gray-700">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-400">총 항목 수:</span>
            <span class="text-white font-bold">${data.length}개</span>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Store data globally for export
  window.__exportData = data;
  window.__exportType = type;
}

function closeExportModal() {
  const modal = document.querySelector('.export-modal');
  if (modal) {
    modal.remove();
  }
}

function executeExport(type, format) {
  const data = window.__exportData;
  if (!data || data.length === 0) {
    alert('내보낼 데이터가 없습니다.');
    return;
  }
  
  let exporter;
  
  if (type === 'gallery') {
    exporter = new GalleryExporter(data);
  } else if (type === 'transactions') {
    exporter = new TransactionExporter(data);
  } else {
    exporter = new DataExporter({ data });
  }
  
  // Execute export
  if (format === 'csv') {
    exporter.exportCSV();
  } else if (format === 'json') {
    exporter.exportJSON();
  } else if (format === 'pdf') {
    exporter.exportPDF();
  }
  
  // Show success message
  showExportNotification(`${format.toUpperCase()} 파일이 다운로드되었습니다.`);
  
  // Close modal
  closeExportModal();
}

function showExportNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'fixed top-6 right-6 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg z-[101] flex items-center gap-3';
  notification.innerHTML = `
    <i class="fas fa-check-circle text-xl"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-10px)';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Global functions
window.showExportModal = showExportModal;
window.closeExportModal = closeExportModal;
window.executeExport = executeExport;

window.exportToCSV = function(data, filename) {
  const exporter = new DataExporter({ data, filename });
  exporter.exportCSV();
};

window.exportToJSON = function(data, filename) {
  const exporter = new DataExporter({ data, filename });
  exporter.exportJSON();
};

window.exportToPDF = function(data, filename) {
  const exporter = new DataExporter({ data, filename });
  exporter.exportPDF();
};

window.exportGallery = function(artworks) {
  showExportModal(artworks, 'gallery');
};

window.exportTransactions = function(transactions) {
  showExportModal(transactions, 'transactions');
};

// Export classes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DataExporter,
    GalleryExporter,
    TransactionExporter
  };
}
