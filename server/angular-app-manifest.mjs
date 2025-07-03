
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: 'https://davidchiriac.github.io/wifes-recipe-book/',
  locale: undefined,
  routes: [
  {
    "renderMode": 1,
    "route": "/wifes-recipe-book"
  },
  {
    "renderMode": 1,
    "route": "/wifes-recipe-book/recipe/*"
  },
  {
    "renderMode": 1,
    "route": "/wifes-recipe-book/recipe/*/edit"
  },
  {
    "renderMode": 1,
    "route": "/wifes-recipe-book/new-recipe"
  },
  {
    "renderMode": 1,
    "route": "/wifes-recipe-book/recipe-collection"
  },
  {
    "renderMode": 1,
    "route": "/wifes-recipe-book/my-recipes"
  },
  {
    "renderMode": 1,
    "route": "/wifes-recipe-book/auth/google/callback"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 1051, hash: '1439fb05dbcf6c4599595f81630e3e609d183b896fa53f0ede842f9bbf40e2cc', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1271, hash: '35db90cb6fe6296cbb7760ea8c35ebb7ec4105cd7d929bd10285d0703fc6a2db', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-WSRPBVYB.css': {size: 362632, hash: 'g2RVHCmEjf0', text: () => import('./assets-chunks/styles-WSRPBVYB_css.mjs').then(m => m.default)}
  },
};
