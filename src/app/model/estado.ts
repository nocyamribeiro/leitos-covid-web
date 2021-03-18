import { Regiao } from './regiao';

export interface Estado {
    id: string;
    sigla: string;
    nome: string;
    malhas: any;
    regiao: Regiao;
}