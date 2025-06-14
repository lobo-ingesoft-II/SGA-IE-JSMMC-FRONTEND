export const rootPaths = {
  homeRoot: '',
  pagesRoot: 'pages',
  
  authRoot: 'autenticacion',
  errorRoot: 'error',
};

export default {
  home: `/${rootPaths.homeRoot}`,
  login: `/${rootPaths.authRoot}/login`,
  prematricula: `/${rootPaths.authRoot}/prematricula`,
  
  404: `/${rootPaths.errorRoot}/404`,
};