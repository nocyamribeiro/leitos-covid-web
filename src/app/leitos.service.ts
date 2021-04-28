import { Injectable, Inject } from '@angular/core';
import { Estado } from './model/estado';
import { AgregacaoLeitos } from './model/agregacaoLeitos';
import { Client } from 'elasticsearch-browser';
import { environment } from './../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Municipio } from './model/municipio';

@Injectable({
  providedIn: 'root'
})
export class LeitosService {
  

  private client: Client;

  private connectElasticLeitos() {
    if (!this.client) {
      this.connect();
    }
    
  }

  private connect() {
    this.client = new Client({
      host: "https://elastic-leitos.saude.gov.br",
      auth: {
        username: environment.userAutenticacaoLeitos,
        password: environment.passwordAutenticacaoLeitos
      }
      
    });
  }

  consultaDadosDeLeitosNoEstado(estado: Estado) {
    
    const httpOptions = {
      headers: new HttpHeaders({
        
        Authorization: "Basic " + btoa(environment.autenticacaoLeitos)
        
      })
    };
    let bodyPesquisa = {
      "size": 0,
      "query": {
        "bool": {
          "must": [
            {
              "match": {
                "estadoSigla": estado.sigla
              }
            }
          ]
        }
      },
      "aggs": {
        "totalOfertaUtiCovid": {
          "sum": {
            "field": "ofertaSRAGUti"
          }
        },
        "totalOcupacaoUtiCovid": {
          "sum": {
            "field": "ocupSRAGUti"
          }
        },
        "totalOfertaUti": {
          "sum": {
            "field": "ofertaHospUti"
          }
        },
        "totalOcupacaoUti": {
          "sum": {
            "field": "ocupHospUti"
          }
        },
        "dataNotificacao": {
            "max": {
                "field": "dataNotificacaoOcupacao"
            }
        }
      }
    };
        
    return this.buscaInformacoesLeitoCovid(bodyPesquisa, httpOptions);
  }

  consultaDadosDeLeitosNoMunicipioDoEstado(estado: any, municipio: Municipio) {
    const httpOptions = {
      headers: new HttpHeaders({
        
        Authorization: "Basic " + btoa(environment.autenticacaoLeitos)
        
      })
    };
    let bodyPesquisa = {
      "size": 0,
      "query": {
        "bool": {
          "must": [
            {
              "match": {
                "estadoSigla": estado.sigla
              }
            },
            {
              "match": {
                "municipio": municipio.nome
              }
            }
          ]
        }
      },
      "aggs": {
        "totalOfertaUtiCovid": {
          "sum": {
            "field": "ofertaSRAGUti"
          }
        },
        "totalOcupacaoUtiCovid": {
          "sum": {
            "field": "ocupSRAGUti"
          }
        },
        "totalOfertaUti": {
          "sum": {
            "field": "ofertaHospUti"
          }
        },
        "totalOcupacaoUti": {
          "sum": {
            "field": "ocupHospUti"
          }
        },
        "dataNotificacao": {
            "max": {
                "field": "dataNotificacaoOcupacao"
            }
        }
      }
    };
    // return this.client.search({
      
    //   index: 'leitos_ocupacao',
    //   body: bodyPesquisa
    // });    
    return this.buscaInformacoesLeitoCovid(bodyPesquisa, httpOptions);
  }


  constructor(private http: HttpClient, @Inject('elasticsearch') private readonly elasticClient) { 
    // this.connectElasticLeitos();
  }

  private buscaInformacoesLeitoCovid(bodyPesquisa, httpOptions: { headers: HttpHeaders; }) {
    
    // const result = this.testeClient(bodyPesquisa);
    // console.log(result);

    return this.http.post<any>(environment.endPointLeitos+'/leito_ocupacao/_search', bodyPesquisa, httpOptions);

    // return this.client.search({
      
    //   index: 'leitos_ocupacao',
    //   body: bodyPesquisa
    // });

  }

  private async testeClient(bodyPesquisa) {
    return await this.elasticClient.search({
      index: 'leito_ocupacao',
      body: bodyPesquisa
    });
  }
}
