import postcss from 'postcss';
import tailwindcssPostcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';
import fs from 'fs';

const css = `
@tailwind base;
@tailwind components;
@tailwind utilities;
`;

postcss([tailwindcssPostcss, autoprefixer])
  .process(css, { from: undefined })
  .then(result => {
    fs.mkdirSync('public/static', { recursive: true });
    fs.writeFileSync('public/static/styles.css', result.css);
    console.log('✅ CSS built successfully to public/static/styles.css');
  })
  .catch(error => {
    console.error('❌ CSS build failed:', error);
    process.exit(1);
  });
