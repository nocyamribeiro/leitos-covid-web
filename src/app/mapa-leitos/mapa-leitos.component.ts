import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { VotosService } from '../votos.service';
import { Estado } from '../model/estado';
import { Partido } from '../model/partido';
import * as L from 'leaflet';
import { map, switchMap, distinctUntilChanged } from 'rxjs/operators';
import { empty, Observable, of } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { MapaService } from '../mapa.service';
import { LeitosService } from '../leitos.service';
import { promise } from 'protractor';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AgregacaoLeitos } from '../model/agregacaoLeitos';
import { Municipio } from '../model/municipio';

@Component({
  selector: 'app-mapa-leitos',
  templateUrl: './mapa-leitos.component.html',
  styleUrls: ['./mapa-leitos.component.css']
})
export class MapaLeitosComponent implements OnInit, AfterViewInit {

  map: L.Map;
  malhaBrasil: any;

  formulario: FormGroup;

  partidos: Partido[];
  estados: Estado[];

  constructor(
    private formBuilder: FormBuilder,
    private votosService: VotosService,
    private leitosService: LeitosService,
    private spinnerService: NgxSpinnerService,
    private mapaService: MapaService,
    private http: HttpClient) { }

  ngOnInit(): void {

    this.spinnerService.show();
    this.mapaService.consultaEstados().subscribe(result => {
      this.estados = result;
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
    // this.formulario.get('partido').valueChanges
    //   .pipe(

    //     map(partido => this.partidos.filter(p => p.sigla === partido)),
    //     map(partidos => partidos && partidos.length > 0 ? partidos[0].sigla : empty()),
    //     switchMap((sigla: string) => this.carregaDadosPartido(sigla))

    //   )
    //   .subscribe(result => {

    //     let votosPartido = result.data;
    //     let totalVotos = votosPartido.totalVotos;
    //     let votosPorEstado = votosPartido.votosPorEstado;
    //     //toda alteração da combo partido reflete em resetar o campo estado
    //     this.limparCampoEstado();
    //     //limpa o mapa adicionando somente a camada do Brasil
    //     this.mapaService.inicializarMalhaBrasil(this.malhaBrasil);
    //     //Adiciona as malhas e as informações dos votos para cada estado.
    //     for (let i in votosPorEstado) {

    //       let e = this.carregarEstadoDaCombo(votosPorEstado[i].estado);
    //       let porcentagem = this.calcularPercentual(votosPorEstado[i].votos[0].qtdVotos, totalVotos);
    //       this.mapaService.adicionarMalhaPartidoPorEstado(e.malhas, votosPorEstado[i].votos[0], totalVotos, e, porcentagem);
    //     }

    //     this.spinnerService.hide();
    //   });

    /**
     * Controla as alterações da combo estado.
     */
    this.formulario.get('estado').valueChanges
      .pipe(
        distinctUntilChanged(),
        map(estado => this.estados.filter(e => e.sigla === estado)),
        map(estados => estados && estados.length > 0 ? estados[0] : null)

      )
      .subscribe(result => {
        this.spinnerService.show();
        if(result) {
          
          this.mapaService.inicializarMalhaBrasil(this.malhaBrasil);
          this.carregarDadosDeLeitosNosMunicipiosDoEstado(result);
          
          
          
        }
      });

  }
  carregarDadosDeLeitosNosMunicipiosDoEstado(estado: Estado) {
    if(estado) {
      
      
      this.mapaService.consultarMunicipiosDoEstado(estado).subscribe(municipios => {
        this.mapaService.consultaMalhaEstado(estado).subscribe(malhas => {
          const stateLayer = this.mapaService.malhaEstado(malhas, 0, 1, "#FFFFFF", "#000000");
          this.mapaService.focarMapaNaLayer(stateLayer);
        })
       
        console.log(municipios);
        municipios.forEach(municipio => {
          this.leitosService.consultaDadosDeLeitosNoMunicipioDoEstado(estado, municipio).subscribe(result => {
            let agg = new AgregacaoLeitos();
            agg.totalOfertaUtiCovid = result.aggregations.totalOfertaUtiCovid.value;
            agg.totalOcupacaoUtiCovid = result.aggregations.totalOcupacaoUtiCovid.value;
            agg.totalOfertaUti = result.aggregations.totalOfertaUti.value;
            agg.totalOcupacaoUti = result.aggregations.totalOcupacaoUti.value;
            agg.dataNotificacao = new Date(result.aggregations.dataNotificacao.value);
            municipio.agregacaoLeitos = agg;
            this.carregarDadosDoMunicipioNoMapa(municipio);
          });
        });
        this.spinnerService.hide();
      });
    }
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
  private carregarDadosDeLeitosNoEstado(estado: Estado) {
    if(estado) {
     
      this.leitosService.consultaDadosDeLeitosNoEstado(estado).subscribe(result => {
        let agg = new AgregacaoLeitos();
        agg.totalOfertaUtiCovid = result.aggregations.totalOfertaUtiCovid.value;
        agg.totalOcupacaoUtiCovid = result.aggregations.totalOcupacaoUtiCovid.value;
        agg.totalOfertaUti = result.aggregations.totalOfertaUti.value;
        agg.totalOcupacaoUti = result.aggregations.totalOcupacaoUti.value;
        agg.dataNotificacao = new Date(result.aggregations.dataNotificacao.value);
        estado.agregacaoLeitos = agg;
        this.carregarDadosDoEstadoNoMapa(estado);
      });
    }
    
  }

  /**
   * Carrega as informações agrupadas da cidade e adiciona malhas no mapa.
   * @param estado 
   * @param agrupamentoCidade 
   */
  private carregarDadosDoEstadoNoMapa(estado: Estado) {
    
    let result = this.mapaService.consultaMalhaEstado(estado);
    result.subscribe(malhas => {
      
      const layerEstado = this.mapaService.malhaEstado(malhas, 1, 3, "#FFFFFF", "#000000");
      let porcentagem = this.calcularPercentual(estado.agregacaoLeitos.totalOcupacaoUtiCovid, estado.agregacaoLeitos.totalOfertaUtiCovid);
      this.mapaService.adicionarLayer(layerEstado);
      this.mapaService.adicionarMalhaEstadoComInformacoesDeLeito(malhas, estado.agregacaoLeitos, estado, porcentagem);
    });
    
  }

  /**
   * Carrega as informações agrupadas da cidade e adiciona malhas no mapa.
   * @param estado 
   * @param agrupamentoCidade 
   */
  private carregarDadosDoMunicipioNoMapa(municipio: Municipio) {
    
    let result = this.mapaService.consultaMalhaMunicipio(municipio);
    result.subscribe(malhas => {
      
      const layerEstado = this.mapaService.malhaMunicipio(malhas, 1, 3, "#FFFFFF", "#000000");
      let porcentagem = this.calcularPercentual(municipio.agregacaoLeitos.totalOcupacaoUtiCovid, municipio.agregacaoLeitos.totalOfertaUtiCovid);
      this.mapaService.adicionarLayer(layerEstado);
      this.mapaService.adicionarMalhaMunicipioComInformacoesDeLeito(malhas, municipio, porcentagem);
    });
    
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
      this.estados.forEach((e => {
        this.carregarDadosDeLeitosNoEstado(e);
      }));
      this.spinnerService.hide();
    });

    
  }

  /**
   * Faz o calculo do percentual puro (sem multiplicar por 100)
   * @param qtdLeitos 
   * @param qtdVotosTotais 
   */
  private calcularPercentual(qtdLeitos: any, qtdVotosTotais: any) {
    if(qtdLeitos && qtdVotosTotais) {
    
      return (qtdLeitos / qtdVotosTotais) 
    
    } else {
      return 0;
    };
  }

}
