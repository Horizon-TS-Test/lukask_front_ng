/**
 * Interfaz para causas del reclamo
 * Por : Dennys Moyón
 */
import {TermsAndConditions} from './terms&Conditions.interface';

export interface CauseClaimInterface{
    idCause:string;
    description:string;
    termsAndConditions:TermsAndConditions[];
}