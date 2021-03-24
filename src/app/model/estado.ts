import { Regiao } from './regiao';
import { AgregacaoLeitos } from './agregacaoLeitos';

export interface Estado {
    id: string;
    sigla: string;
    nome: string;
    malhas: any;
    regiao: Regiao;
    agregacaoLeitos: AgregacaoLeitos;

}