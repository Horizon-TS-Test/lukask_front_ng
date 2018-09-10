
/**
 * Interfaz para contenido de terminos y condiciones.
 * Por: Dennys Moyón
 */
import {ListContent} from './listContent.interface';

export interface ContentTermCond {
    section?:string;
    type?:string;
    list?:ListContent[];
}