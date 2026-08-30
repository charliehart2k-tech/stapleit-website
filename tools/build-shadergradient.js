const { build } = require('esbuild');

build({
  entryPoints: ['site/assets/js/remote-support-gradient.jsx'],
  bundle: true,
  minify: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2020'],
  outfile: 'site/assets/js/remote-support-gradient.bundle.js',
  define: { 'process.env.NODE_ENV': '"production"' },
  legalComments: 'linked'
}).catch(() => process.exit(1));
