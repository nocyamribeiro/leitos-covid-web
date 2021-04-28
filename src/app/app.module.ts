import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import * as es from 'elasticsearch-browser/elasticsearch'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapaVotosComponent } from './mapa-votos/mapa-votos.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgxSpinnerModule } from "ngx-spinner";  
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MapaLeitosComponent } from './mapa-leitos/mapa-leitos.component';
import { environment } from './../environments/environment';


@NgModule({
  declarations: [
    AppComponent,
    MapaVotosComponent,
    MapaLeitosComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule, 
    FormsModule,
    HttpClientModule, 
    ReactiveFormsModule,
    NgxSpinnerModule,
    BrowserAnimationsModule
    
  ],
  providers: [{
    provide: 'elasticsearch',
    useFactory: () => {
      return new es.Client({
        host: environment.endPointLeitos,
        auth: {
          username: environment.userAutenticacaoLeitos,
          password: environment.passwordAutenticacaoLeitos
        }
      });
    },
    deps: [],
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
