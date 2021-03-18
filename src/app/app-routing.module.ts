import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MapaVotosComponent } from './mapa-votos/mapa-votos.component';
import { MapaLeitosComponent } from './mapa-leitos/mapa-leitos.component';

const routes: Routes = [
  { path: 'mapaVotos', component: MapaVotosComponent },
  { path: 'mapaLeitos', component: MapaLeitosComponent },
  { path: '', pathMatch: 'full', redirectTo: '/' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
