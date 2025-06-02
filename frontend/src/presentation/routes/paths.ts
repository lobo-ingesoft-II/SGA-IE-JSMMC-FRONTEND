export const rootPaths = {
  homeRoot: '',
  pagesRoot: 'pages',
  
  applicationsRoot: 'applications',
  ecommerceRoot: 'ecommerce',
  authRoot: 'autenticacion',
  notificationsRoot: 'notifications',
  calendarRoot: 'calendar',
  messageRoot: 'messages',
  errorRoot: 'error',
};

export default {
  home: `/${rootPaths.homeRoot}`,
  login: `/${rootPaths.authRoot}/login`,
  prematricula: `/${rootPaths.authRoot}/prematricula`,
  
  404: `/${rootPaths.errorRoot}/404`,
};