import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { VotosService } from '../votos.service';
import { Estado } from '../model/estado';
import { Partido } from '../model/partido';
import * as L from 'leaflet';
import { map, switchMap, distinctUntilChanged } from 'rxjs/operators';
import { empty } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { MapaService } from '../mapa.service';

@Component({
  selector: 'app-mapa-votos',
  templateUrl: './mapa-votos.component.html',
  styleUrls: ['./mapa-votos.component.css']
})
export class MapaVotosComponent implements OnInit, AfterViewInit {

  map: L.Map;
  malhaBrasil: any;

  formulario: FormGroup;

  partidos: Partido[];
  estados: Estado[];

  constructor(
    private formBuilder: FormBuilder,
    private votosService: VotosService,
    private spinnerService: NgxSpinnerService,
    private mapaService: MapaService) { }

  ngOnInit(): void {

    this.votosService.consultaPartidos().subscribe(result => {
      this.partidos = result.data;
      this.partidos = this.partidos.sort(
        (a, b) => {
          return a.sigla.localeCompare(b.sigla);
        });

    });

    this.spinnerService.show();
    this.votosService.consultaEstados().subscribe(result => {
      this.estados = [];

      result.data.forEach(e => {
        this.estados.push(e.estado);
      });

      this.estados.sort((a, b) => { return a.sigla.localeCompare(b.sigla) });
      

      this.spinnerService.hide();
      
    });

    this.formulario = this.formBuilder.group({

      partido: [null],
      estado: [null]

    });
    /**
     * Controla as ações da alteração da combo de partido
     */
    this.formulario.get('partido').valueChanges
      .pipe(

        map(partido => this.partidos.filter(p => p.sigla === partido)),
        map(partidos => partidos && partidos.length > 0 ? partidos[0].sigla : empty()),
        switchMap((sigla: string) => this.carregaDadosPartido(sigla))

      )
      .subscribe(result => {

        let votosPartido = result.data;
        let totalVotos = votosPartido.totalVotos;
        let votosPorEstado = votosPartido.votosPorEstado;
        //toda alteração da combo partido reflete em resetar o campo estado
        this.limparCampoEstado();
        //limpa o mapa adicionando somente a camada do Brasil
        this.mapaService.inicializarMalhaBrasil(this.malhaBrasil);
        //Adiciona as malhas e as informações dos votos para cada estado.
        for (let i in votosPorEstado) {

          let e = this.carregarEstadoDaCombo(votosPorEstado[i].estado);
          let porcentagem = this.calcularPercentual(votosPorEstado[i].votos[0].qtdVotos, totalVotos);
          this.mapaService.adicionarMalhaPartidoPorEstado(e.malhas, votosPorEstado[i].votos[0], totalVotos, e, porcentagem);
        }

        this.spinnerService.hide();
      });

    /**
     * Controla as alterações da combo estado.
     */
    this.formulario.get('estado').valueChanges
      .pipe(
        distinctUntilChanged(),
        map(estado => this.estados.filter(e => e.sigla === estado)),
        map(estados => estados && estados.length > 0 ? estados[0].sigla : empty()),
        switchMap((sigla: string) => this.carregarDadosDeVotosPorCidadeNoEstado(sigla))

      )
      .subscribe(result => {
        if(result) {
          let estado = result.data.estado;
          let agrupamentoCidade = result.data.agrupamentoCidade;
          this.spinnerService.hide();
          //carrega as informações de cada cidade e adiciona a malha no mapa com as informações.
          this.carregarAgrupamentoCidade(estado, agrupamentoCidade);
        }
      });

  }

  /**
   * Limpa o campo de estado no formulário
   */
  private limparCampoEstado() {
    this.formulario.get('estado').setValue(null, {emitEvent:false});

  }

  /**
   * Carrega as informações de voto em cada cidade no estado selecionado.
   * @param sigla 
   */
  private carregarDadosDeVotosPorCidadeNoEstado(sigla: string) {
    if(sigla && sigla !== '') {
      this.mapaService.inicializarMalhaBrasil(this.malhaBrasil);
      this.spinnerService.show();
      return this.votosService.consultaVotosDosMunicipiosPeloEstado(sigla);
    }
    return null;
  }

  /**
   * Carrega as informações agrupadas da cidade e adiciona malhas no mapa.
   * @param estado 
   * @param agrupamentoCidade 
   */
  private carregarAgrupamentoCidade(estado: any, agrupamentoCidade: any) {
    let partidoSelecionado = this.formulario.get('partido').value;
    let totalVotosDoPartidoNoEstado = 0;
    let votosNoPartido = [];

    const layerEstado = this.mapaService.malhaEstado(this.carregarEstadoDaCombo(estado).malhas, 1, 3, "#FFFFFF", "#000000");

    this.mapaService.adicionarLayerDoEstadoSelecionado(layerEstado);

    for (var i in agrupamentoCidade) {

      let votosPorCidade = agrupamentoCidade[i].votosPorCidade;
      for (var v in votosPorCidade) {
        let dadosDoVoto = votosPorCidade[v];

        if (dadosDoVoto && dadosDoVoto.partido === partidoSelecionado) {
          totalVotosDoPartidoNoEstado += dadosDoVoto.qtdvotos;
          dadosDoVoto.malhas = agrupamentoCidade[i].malhas;
          votosNoPartido.push(dadosDoVoto);
        }
      }
    }
    /**
     * Adiciona as malhas da cidade no mapa 
     */
    for (var v in votosNoPartido) {
      let porcentagem = this.calcularPercentual(votosNoPartido[v].qtdvotos, totalVotosDoPartidoNoEstado);
      this.mapaService.adicionarMalhaPartidoPorCidade(votosNoPartido[v].malhas, votosNoPartido[v], estado, porcentagem);
    }
  }

  /**
   * Carrega o estado percorrendo os estados carregados para combo.
   * @param e 
   */
  private carregarEstadoDaCombo(e: Estado) {
    return this.estados.find(es => { return es.sigla === e.sigla });

  }

  /**
   * Carrega as informações após seleção do partido
   * @param sigla 
   */
  private carregaDadosPartido(sigla: string) {
    this.spinnerService.show();
    this.mapaService.inicializarMalhaBrasil(this.malhaBrasil);
    return this.votosService.consultaVotosPorPartido(sigla);
  }

  /**
   * Função que é chamada após finalização do carregamento da página. 
   * Necessário para renderização do mapa.
   */
  ngAfterViewInit(): void {

    this.map = this.mapaService.initMap();
    this.mapaService.getBrasilGeoJson().subscribe(malhaBrasil => {
      this.malhaBrasil = malhaBrasil;
      this.mapaService.inicializarMalhaBrasil(this.malhaBrasil);
    });

  }

  /**
   * Verifica se o a combo de partido está preenchida.
   * Função necessário para controle da visualização do estado.
   */
  partidoPreenchido() {
    return this.formulario.get('partido').value !== '' && this.formulario.get('partido').value;
  }

  /**
   * Faz o calculo do percentual puro (sem multiplicar por 100)
   * @param qtdVotos 
   * @param qtdVotosTotais 
   */
  private calcularPercentual(qtdVotos: any, qtdVotosTotais: any) {
    
    return (qtdVotos / qtdVotosTotais) ;
  }

}
