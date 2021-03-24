const proxy = [
    {
      context: '/api',
      target: 'https://elastic-leitos.saude.gov.br',
      secure: false,
      logLevel: 'debug',
      pathRewrite: {
        '^/api': ''
      }
    }
  ];
  module.exports = proxy;