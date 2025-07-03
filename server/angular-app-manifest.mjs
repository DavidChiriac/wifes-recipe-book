
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: 'https://davidchiriac.github.io/wifes-recipe-book/',
  locale: undefined,
  routes: undefined,
  entryPointToBrowserMapping: {
  "node_modules/quill/quill.js": [
    {
      "path": "chunk-3NTGAT6O.js",
      "dynamicImport": false
    }
  ],
  "node_modules/@angular/animations/fesm2022/browser.mjs": [
    {
      "path": "chunk-DNRGMO2R.js",
      "dynamicImport": false
    }
  ]
},
  assets: {
    'index.csr.html': {size: 1051, hash: '080995fbdc3f375280cfa375ccd2c784678f6c6dd6adabbedb894aa6865d39c1', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1271, hash: '9c659ae556b3885f9b4ce0b7bae29d42be47a269f57f10ee308c446a0cde0a1e', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-WSRPBVYB.css': {size: 362632, hash: 'g2RVHCmEjf0', text: () => import('./assets-chunks/styles-WSRPBVYB_css.mjs').then(m => m.default)}
  },
};
