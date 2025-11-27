import postcss from 'postcss';
import tailwindcssPostcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';
import fs from 'fs';

const css = `
@import "tailwindcss";

/* Force dark background for all inputs - CRITICAL FIX */
input[type="email"],
input[type="password"],
input[type="text"],
input[type="tel"],
input[type="url"],
input[type="search"],
textarea {
  background-color: rgb(17, 24, 39) !important; /* bg-gray-900 */
  color: white !important;
  -webkit-text-fill-color: white !important;
}

/* Force dark background on autofill - CRITICAL FIX */
input[type="email"]:-webkit-autofill,
input[type="password"]:-webkit-autofill,
input[type="text"]:-webkit-autofill,
input[type="tel"]:-webkit-autofill,
input[type="url"]:-webkit-autofill,
input[type="search"]:-webkit-autofill,
textarea:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 1000px rgb(17, 24, 39) inset !important;
  -webkit-text-fill-color: white !important;
  box-shadow: 0 0 0 1000px rgb(17, 24, 39) inset !important;
  background-color: rgb(17, 24, 39) !important;
  color: white !important;
}

/* Force dark background on focus */
input[type="email"]:focus,
input[type="password"]:focus,
input[type="text"]:focus,
input[type="tel"]:focus,
input[type="url"]:focus,
input[type="search"]:focus,
textarea:focus {
  background-color: rgb(17, 24, 39) !important;
  color: white !important;
  -webkit-text-fill-color: white !important;
}

/* Force dark background on hover */
input[type="email"]:hover,
input[type="password"]:hover,
input[type="text"]:hover,
input[type="tel"]:hover,
input[type="url"]:hover,
input[type="search"]:hover,
textarea:hover {
  background-color: rgb(17, 24, 39) !important;
  color: white !important;
}
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
