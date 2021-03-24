// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  endPointEstados: "https://servicodados.ibge.gov.br/api/v1/localidades/estados",
  endPointMalhaEstado: "https://servicodados.ibge.gov.br/api/v2/malhas/{id}/?formato=application/vnd.geo+json",
  endPointLeitos: "/elastic-leitos",
  autenticacaoLeitos: "user-api-leitos:aQbLL3ZStaTr38tj",
  endPointMalhaCidade: "https://servicodados.ibge.gov.br/api/v3/malhas/municipios/{idMunicipio}/?formato=application/vnd.geo+json",
  endPointMunicipiosPorEstado: "https://servicodados.ibge.gov.br/api/v1/localidades/estados/{uf}/municipios"
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
