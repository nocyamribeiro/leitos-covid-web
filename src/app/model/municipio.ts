import { AgregacaoLeitos } from './agregacaoLeitos';

export interface Municipio {
    id: number;
    nome: string;
    malhas: any;
    agregacaoLeitos: AgregacaoLeitos;
    

}