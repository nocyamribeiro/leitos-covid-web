import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from '../../node_modules/rxjs/operators';
import { DataDefault } from './model/data-default';
import { Estado } from './model/estado';
import { Observable } from 'rxjs';
import { DataDefaultArray } from './model/data-default-array';

@Injectable({
  providedIn: 'root'
})
/**
 * Serviço responsável por recuperar informações da API
 */
export class VotosService {
  
  constructor(private http: HttpClient) { }

  private readonly ENDPOINT_PARTIDOS = '/api/eleicao/2014/presidente/primeiro-turno/partidos';
  private readonly END_POINT_BUSCA_ESTADOS = '/api/eleicao/2014/presidente/primeiro-turno/estados/';

  //consulta os partidos existentes na API
  consultaPartidos() {
    return this.http.get<DataDefault>(this.ENDPOINT_PARTIDOS);
  }
  /**
   * Recupera as informações dos votos dos municipios de forma separada 
   * a partir da escolha de um estado.
   * 
   */
  consultaVotosDosMunicipiosPeloEstado(estado: string) {
    const ENDPOINT_VOTOS_DOS_MUNICIPIOS_NO_ESTADO = `/api/eleicao/2014/presidente/primeiro-turno/estados/${estado}/municipios`;
    return this.http.get<DataDefault>(ENDPOINT_VOTOS_DOS_MUNICIPIOS_NO_ESTADO);
  }

  /**
   * Consulta os votos do partido agrupados em cada estado.
   * @param partido 
   */
  consultaVotosPorPartido(partido: string) {
    const ENDPOINT_VOTOS_POR_PARTIDO = `/api/eleicao/2014/presidente/primeiro-turno/estados/partido/${partido}`;
    return this.http.get<DataDefault>(ENDPOINT_VOTOS_POR_PARTIDO);
  }
  
  /**
   * consulta os estados existentes na API
   * 
   */ 
  consultaEstados() {
    return this.http.get<DataDefaultArray>(this.END_POINT_BUSCA_ESTADOS);
    
  }

}
