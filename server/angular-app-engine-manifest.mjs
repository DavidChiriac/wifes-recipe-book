
export default {
  basePath: 'https://davidchiriac.github.io/wifes-recipe-book',
  supportedLocales: {
  "en-US": ""
},
  entryPoints: {
    '': () => import('./main.server.mjs')
  },
};
