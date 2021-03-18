import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapaVotosComponent } from './mapa-votos/mapa-votos.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgxSpinnerModule } from "ngx-spinner";  
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MapaLeitosComponent } from './mapa-leitos/mapa-leitos.component';


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
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
