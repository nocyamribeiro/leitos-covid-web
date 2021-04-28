export const environment = {
  production: true,
  endPointEstados: "https://servicodados.ibge.gov.br/api/v1/localidades/estados",
  endPointMalhaEstado: "https://servicodados.ibge.gov.br/api/v2/malhas/{id}/?formato=application/vnd.geo+json",
  autenticacaoLeitos: "user-api-leitos:aQbLL3ZStaTr38tj",
  userAutenticacaoLeitos: "user-api-leitos",
  passwordAutenticacaoLeitos: "aQbLL3ZStaTr38tj",
  endPointMalhaCidade: "https://servicodados.ibge.gov.br/api/v3/malhas/municipios/{idMunicipio}/?formato=application/vnd.geo+json",
  endPointMunicipiosPorEstado: "https://servicodados.ibge.gov.br/api/v1/localidades/estados/{uf}/municipios",
  endPointLeitos: "/elastic-leitos"
};
