import postcss from 'postcss';
import tailwindcssPostcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';
import fs from 'fs';

const css = `
@import "tailwindcss";
`;

postcss([tailwindcssPostcss, autoprefixer])
  .process(css, { from: './src/styles.css' })
  .then(result => {
    fs.mkdirSync('public/static', { recursive: true });
    fs.writeFileSync('public/static/styles.css', result.css);
    console.log('✅ CSS built successfully to public/static/styles.css');
    console.log(`📦 CSS size: ${(result.css.length / 1024).toFixed(2)} KB`);
  })
  .catch(error => {
    console.error('❌ CSS build failed:', error);
    process.exit(1);
  });
