import { Injectable } from '@angular/core';
import { Estado } from './model/estado';
import { AgregacaoLeitos } from './model/agregacaoLeitos';
import { Client } from 'elasticsearch-browser';
import { environment } from './../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LeitosService {

  private client: Client;

  private connectElasticLeitos() {
    this.client = new Client({
      host: "/elastic-leitos",
      auth: btoa(environment.autenticacaoLeitos),
      log: 'debug'
    });
    console.log("passou no construtor");
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
    
    let estadoComDadosCovid = estado;
    estadoComDadosCovid.agregacaoLeitos = new AgregacaoLeitos();
    return this.buscaInformacoesLeitoCovid(bodyPesquisa, httpOptions, estadoComDadosCovid);
  }


  constructor(private http: HttpClient) { 
    this.connectElasticLeitos();
  }

  private buscaInformacoesLeitoCovid(bodyPesquisa, httpOptions: { headers: HttpHeaders; }, estadoComDadosCovid: Estado) {
    return this.http.post<any>('/elastic-leitos/leito_ocupacao/_search', bodyPesquisa, httpOptions);
  }
}
