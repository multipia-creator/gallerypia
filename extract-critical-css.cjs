const fs = require('fs');

// Read full CSS
const fullCSS = fs.readFileSync('public/static/styles.css', 'utf-8');

console.log('Full CSS size:', (fullCSS.length / 1024).toFixed(2), 'KB');

// Extract first 20KB as critical CSS
const criticalCSS = fullCSS.substring(0, 20480);

// Save critical CSS
fs.writeFileSync('public/static/critical.css', criticalCSS);

console.log('Critical CSS size:', (criticalCSS.length / 1024).toFixed(2), 'KB');
console.log('Saved to: public/static/critical.css');
console.log('Reduction:', ((1 - criticalCSS.length / fullCSS.length) * 100).toFixed(1), '%');
