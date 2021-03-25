import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from './../environments/environment';
import { Estado } from './model/estado';
import { AgregacaoLeitos } from './model/agregacaoLeitos';
import { Municipio } from './model/municipio';

@Injectable({
  providedIn: 'root'
})
/**
 * Class responsável pelas ações que fazem alterações no mapa.
 */
export class MapaService {
  
  private readonly END_POINT_BUSCA_ESTADOS = environment.endPointEstados;
  private readonly END_POINT_MALHA_ESTADO = environment.endPointMalhaEstado;
  private readonly END_POINT_MALHA_CIDADE = environment.endPointMalhaCidade;
  private readonly END_POINT_BUSCA_MUNICIPIOS = environment.endPointMunicipiosPorEstado;
  //const ENDPOINT_VOTOS_DOS_MUNICIPIOS_NO_ESTADO = `/api/eleicao/2014/presidente/primeiro-turno/estados/${estado}/municipios`;
  /**
   * consulta os estados existentes na API
   * 
   */ 
  consultaEstados() {
    return this.http.get<Estado[]>(this.END_POINT_BUSCA_ESTADOS);
    
  }

  consultaMalhaEstado(estado: Estado) {
    let id = estado.id;
    return this.http.get(this.END_POINT_MALHA_ESTADO.replace("{id}", id));
  }

  consultarMunicipiosDoEstado(estado: Estado) {
    return this.http.get<Municipio[]>(this.END_POINT_BUSCA_MUNICIPIOS.replace("{uf}", estado.id))
  }
  

  consultaMalhaMunicipio(municipio: Municipio) {
    return this.http.get(this.END_POINT_MALHA_CIDADE.replace("{idMunicipio}", municipio.id.toString()));
  }

  map: L.Map;
  shipLayer = L.layerGroup();
  constructor(private http: HttpClient) { }

  /**
   * Inicializa o mapa. Importante ser chamado somente uma vez por componente.
   */
  initMap(): void {
   
    this.map = L.map('map', {
      zoom: 4
    });

    this.map.addLayer(this.shipLayer);
    return this.map;

  }

  /**
   * Constrói a malha do Brasil com configurações de cor específicas.
   * @param malhaBrasil 
   */
  inicializarMalhaBrasil(malhaBrasil: any) {

    this.shipLayer.clearLayers();
    const stateLayer = L.geoJSON(malhaBrasil, {
      style: (feature) => ({
        weight: 3,
        opacity: 0.5,
        color: '#000000',
        fillOpacity: 0.8,
        fillColor: '#FFFFFF'
      })
    });
    this.focarMapaNaLayer(stateLayer);
    this.map.addLayer(stateLayer);

  }

  /**
   * Faz o foco do mapa direcionar para a camada passada por parâmetro.
   * @param layerEstado 
   */
  focarMapaNaLayer(layerEstado: any) {

    this.map.fitBounds(layerEstado.getBounds());
  }

  /**
   * Adiciona a malha do partido e aciona a função que adiciona o Tooltip com as informações.
   * @param malha 
   * @param resumoVoto 
   * @param totalVotos 
   * @param estado 
   * @param porcentagem 
   */
  adicionarMalhaPartidoPorEstado(malha: any, resumoVoto: any, totalVotos: any, estado: any, porcentagem: any) {

    
    let partido = resumoVoto.partido;
    const opacidade = porcentagem * 7;
    const stateLayer = this.malhaEstado(malha, opacidade, 1, "#1A1A1A", "#000000");
    this.adicionaTooltipEstado(porcentagem, resumoVoto, partido, estado, stateLayer);
  }

  adicionarMalhaEstadoComInformacoesDeLeito(malha: any, agregacaoLeitos: AgregacaoLeitos, estado: Estado, porcentagem: number) {
    const opacidade = porcentagem * 0.5;
    
    const stateLayer = this.malhaEstado(malha, opacidade, 1, porcentagem > 0.9 ? "#FF1A1A" : "#1A1AFF", "#000000");
    this.adicionaTooltipEstadoComInfoLeitos(porcentagem, agregacaoLeitos, estado, stateLayer);
  }

  adicionarMalhaMunicipioComInformacoesDeLeito(malha: any, municipio: Municipio, porcentagem: number) {
    const opacidade = porcentagem * 0.5;
    
    const stateLayer = this.malhaEstado(malha, opacidade, 1, porcentagem > 0.9 ? "#FF1A1A" : "#1A1AFF", "#000000");
    this.adicionaTooltipMunicipioComInfoLeitos(porcentagem, municipio, stateLayer);
  }

  /**
   * Cria uma malha com configurações específicas para o estado.
   * @param malha 
   * @param opacidade 
   * @param peso 
   * @param color 
   * @param borderColor 
   */
  malhaEstado(malha: any, opacidade: number, peso: any, color: any, borderColor: any) {
    return L.geoJSON(malha, {
      style: (feature) => ({
        weight: peso,
        opacity: opacidade,
        color: borderColor,
        fillOpacity: opacidade,
        fillColor: color
        
      })
    });
  }

  /**
   * Cria uma malha com configurações específicas para o municipio.
   * @param malha 
   * @param opacidade 
   * @param peso 
   * @param color 
   * @param borderColor 
   */
  malhaMunicipio(malha: any, opacidade: number, peso: any, color: any, borderColor: any) {
    return L.geoJSON(malha, {
      style: (feature) => ({
        weight: peso,
        opacity: opacidade,
        color: borderColor,
        fillOpacity: opacidade,
        fillColor: color
        
      })
    });
  }

  /**
   * Adiciona a camada do Estado selecionado.
   * Usado para dar um foco maior no estado (caso das malhas da cidade). 
   * @param layerEstado 
   */
  adicionarLayer(layerEstado: any) {
    //this.shipLayer.clearLayers();
    //this.focarMapaNaLayer(layerEstado);
    this.shipLayer.addLayer(layerEstado);
  }

  /**
   * Adicionar Tooltipo com as informações de voto no Estado.
   * @param porcentagem 
   * @param resumoVoto 
   * @param partido 
   * @param estado 
   * @param stateLayer 
   */
  private adicionaTooltipEstado(porcentagem: number, resumoVoto: any, partido: any, estado: any, stateLayer: any) {
    let porcentagemFormatada: string = (porcentagem * 100).toFixed(2).replace(".", ",");
    const qtdVotosFormatado = resumoVoto.qtdVotos.toLocaleString('br');
    const conteudoToolTip = `Partido: ${partido} <br/>
       Estado: ${estado.nome} (${estado.sigla}) <br/>
       Votos: ${qtdVotosFormatado}<br/> 
       Porcentagem de votos do partido : ${porcentagemFormatada}%`;
    stateLayer.bindTooltip(conteudoToolTip);
    const label = new L.Label()
    label.setContent("static label")
    label.setLatLng(stateLayer.getBounds().getCenter())
    this.shipLayer.showLabel(label);
    this.shipLayer.addLayer(stateLayer);
  }

  private adicionaTooltipEstadoComInfoLeitos(porcentagem: number, agregacaoLeitos: AgregacaoLeitos, estado: any, stateLayer: any) {
    let porcentagemFormatada: string = (porcentagem * 100).toFixed(2).replace(".", ",");
    let data = agregacaoLeitos.dataNotificacao;
    let dataFormatada = ((data.getDate()).toString().padStart(2, "0")) + "/" + ((data.getMonth() + 1).toString().padStart(2, "0")) + "/" + data.getFullYear() + " " +data.getHours().toString().padStart(2, "0") + ":" + data.getMinutes().toString().padStart(2, "0") + ":" + data.getSeconds().toString().padStart(2, "0"); 
    const conteudoToolTip = `Estado: ${estado.nome} (${estado.sigla}) <br/>
       Leitos de COVID-19 ofertados: ${agregacaoLeitos.totalOfertaUtiCovid}<br/> 
       Leitos de COVID-19 ocupados: ${agregacaoLeitos.totalOcupacaoUtiCovid}<br/>
       Leitos de UTI ofertados: ${agregacaoLeitos.totalOfertaUti}<br/>  
       Leitos de UTI ocupados: ${agregacaoLeitos.totalOcupacaoUti}<br/>  
       Última notificação: ${dataFormatada}<br/>  
       Porcentagem de Leitos de COVID-19 utilizados: ${porcentagemFormatada}%`;
    stateLayer.bindTooltip(conteudoToolTip);
        
    this.shipLayer.addLayer(stateLayer);
  }

  private adicionaTooltipMunicipioComInfoLeitos(porcentagem: number, municipio: Municipio, stateLayer: any) {
    let porcentagemFormatada: string = (porcentagem * 100).toFixed(2).replace(".", ",");
    const agregacaoLeitos = municipio.agregacaoLeitos;
    let data = agregacaoLeitos.dataNotificacao;
    let dataFormatada = ((data.getDate()).toString().padStart(2, "0")) + "/" + ((data.getMonth() + 1).toString().padStart(2, "0")) + "/" + data.getFullYear() + " " +data.getHours().toString().padStart(2, "0") + ":" + data.getMinutes().toString().padStart(2, "0") + ":" + data.getSeconds().toString().padStart(2, "0"); 
    const conteudoToolTip = `Município: ${municipio.nome}<br/>
       Leitos de COVID-19 ofertados: ${agregacaoLeitos.totalOfertaUtiCovid}<br/> 
       Leitos de COVID-19 ocupados: ${agregacaoLeitos.totalOcupacaoUtiCovid}<br/>
       Leitos de UTI ofertados: ${agregacaoLeitos.totalOfertaUti}<br/>  
       Leitos de UTI ocupados: ${agregacaoLeitos.totalOcupacaoUti}<br/>  
       Última notificação: ${dataFormatada}<br/>  
       Porcentagem de Leitos de COVID-19 utilizados: ${porcentagemFormatada}%`;
    stateLayer.bindTooltip(conteudoToolTip);
        
    this.shipLayer.addLayer(stateLayer);
  }

  /**
   * Adiciona a malha da cidade e também aciona função que adiciona tooltip com as informações dos votos.
   * @param malha 
   * @param resumoVoto 
   * @param estado 
   * @param porcentagem 
   */
  adicionarMalhaPartidoPorCidade(malha: any, resumoVoto: any, estado: any, porcentagem: any) {
    
    let partido = resumoVoto.partido;
    const opacidade = porcentagem * 10;
    const stateLayer = L.geoJSON(malha, {
      style: (feature) => ({
        weight: 1,
        opacity: opacidade,
        color: '#1A1A1A',
        fillOpacity: opacidade,
        fillColor: '#3A3A3A',

      })
    });
    this.adicionaTooltipCidade(porcentagem, resumoVoto, partido, estado, stateLayer);
  }
  
  /**
   * Adiciona tooltip da cidade com as informações dos votos.
   * @param porcentagem 
   * @param resumoVoto 
   * @param partido 
   * @param estado 
   * @param stateLayer 
   */
  private adicionaTooltipCidade(porcentagem: number, resumoVoto: any, partido: any, estado: any, stateLayer: any) {
    let porcentagemFormatada: string = (porcentagem * 100).toFixed(2).replace(".", ",");
    const qtdVotosFormatado = resumoVoto.qtdvotos.toLocaleString('br');
    const conteudoToolTip = `
       Estado: ${resumoVoto.estado} <br/>
       Partido: ${partido} <br/>
       Cidade: ${resumoVoto.cidade} <br/>
       Votos: ${qtdVotosFormatado}<br/> 
       Porcentagem de votos do partido : ${porcentagemFormatada}%`;
    stateLayer.bindTooltip(conteudoToolTip);
    this.shipLayer.addLayer(stateLayer);
  }

  /**
   * Recupera as malhas do Brasil completo
   */
  getBrasilGeoJson(): Observable<any> {
    return this.http.get('https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR/?formato=application/vnd.geo+json');
  }

  
}
