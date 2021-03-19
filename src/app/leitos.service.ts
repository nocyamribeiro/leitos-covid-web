import { Injectable } from '@angular/core';
import { Estado } from './model/estado';

@Injectable({
  providedIn: 'root'
})
export class LeitosService {
  consultaDadosDeLeitosNoEstado(estado: Estado) {
    return estado;
  }

  constructor() { }
}
