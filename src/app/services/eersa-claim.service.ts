import { Injectable } from '@angular/core';
import { Publication } from '../models/publications';
import { EersaClaim } from 'src/app/models/eersa-claim';
import { REST_SERV } from '../rest-url/rest-servers';
import { UserService } from './user.service';
import { QuejaService } from './queja.service';
import { ArrayManager } from '../tools/array-manager';
import { BackSyncService } from './back-sync.service';
import { UserPubsService } from './user-pubs.service';

@Injectable({
  providedIn: 'root'
})
export class EersaClaimService {
  private isPostedEersaPub: boolean;

  constructor(
    private _userService: UserService,
    private _quejaService: QuejaService,
    private _userPubsService: UserPubsService,
    private _backSyncService: BackSyncService,
  ) {
    this.isPostedEersaPub = false;
  }

  /**
   * MÉTODO PARA CREAR UN OBJETO JAVASCRIPT A PARTIR DE UNO DE TIPO PUBLICACION
   * @param queja 
   */
  private mergeJSONData(claimPub: Publication) {
    let pubJson = this._quejaService.mergeJSONData(claimPub);

    let json = {
      eersaClaim: {
        nCuenta: claimPub.eersaClaim.cliente.nCuenta,
        nMedidor: claimPub.eersaClaim.cliente.nMedidor,
        nPoste: claimPub.eersaClaim.nPoste,
        cliente: claimPub.eersaClaim.cliente.user.person.name + claimPub.eersaClaim.cliente.user.person.last_name,
        cedula: claimPub.eersaClaim.cliente.user.person.identification_card,
        telefono: claimPub.eersaClaim.cliente.user.person.telephone,
        celular: claimPub.eersaClaim.cliente.user.person.cell_phone,
        email: claimPub.eersaClaim.cliente.user.username,
        calle: claimPub.eersaClaim.ubicacion.calle,
        idTipo: claimPub.eersaClaim.idTipo,
        descTipo: claimPub.eersaClaim.descTipo,
        idBarrio: claimPub.eersaClaim.ubicacion.idBarrio,
        descBarrio: claimPub.eersaClaim.ubicacion.descBarrio,
        referencia: claimPub.eersaClaim.ubicacion.referencia,
        detalleReclamo: claimPub.eersaClaim.detalleReclamo
      }
    }

    let claimJson = ArrayManager.mergeJavascriptObj(pubJson, json);

    return claimJson;
  }

  /**
   * MÉTODO PARA CREAR UN OBJETO DE TIPO FORM DATA A PARTIR DE UNO DE TIPO EERSA CLAIM Y QUEJA LUKASK
   * @param queja 
   */
  private mergeFormData(claimPub: Publication) {
    let formData = this._quejaService.mergeFormData(claimPub);

    formData.append('nCuenta', claimPub.eersaClaim.cliente.nCuenta);
    formData.append('nMedidor', claimPub.eersaClaim.cliente.nMedidor);
    formData.append('nPoste', claimPub.eersaClaim.nPoste);
    formData.append('cliente', claimPub.eersaClaim.cliente.user.person.name + " " + claimPub.eersaClaim.cliente.user.person.last_name);
    formData.append('cedula', claimPub.eersaClaim.cliente.user.person.identification_card);
    formData.append('telefono', claimPub.eersaClaim.cliente.user.person.telephone);
    formData.append('celular', claimPub.eersaClaim.cliente.user.person.cell_phone);
    formData.append('email', claimPub.eersaClaim.cliente.user.username);
    formData.append('calle', claimPub.eersaClaim.ubicacion.calle);
    formData.append('idTipo', claimPub.eersaClaim.idTipo + "");
    formData.append('idBarrio', claimPub.eersaClaim.ubicacion.idBarrio + "");
    formData.append('referencia', claimPub.eersaClaim.ubicacion.referencia);
    formData.append('detalleReclamo', claimPub.eersaClaim.detalleReclamo);

    return formData;
  }

  /**
   * MÉTODO PARA POSTEAR UNA NUEVO RECLAMO EERSA HACIA EL BACKEND:
   * @param claimEersaData 
   */
  private postEersaClaim(claimEersaData: FormData) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 201) {
            resolve(JSON.parse(xhr.response).data);
          }
          else {
            if (xhr.status == 401) {
              localStorage.clear();
            }
            if (xhr.status == 0) {
              reject(xhr.response);
            }
            else {
              reject(JSON.parse(xhr.response));
            }
          }
        }
      };

      xhr.open("post", REST_SERV.eersaClaimUrl, true);
      xhr.setRequestHeader('X-Access-Token', this._userService.getUserKey());
      xhr.withCredentials = true;
      xhr.send(claimEersaData);
    });
  }

  /**
   * MÉTODO PARA ENVIAR UN FORM DATA HACIA EL MIDDLEWARE EN UN POST REQUEST:
   * @param queja 
   */
  private sendEersaPub(claimPub: Publication) {
    let claimEersaData: FormData = this.mergeFormData(claimPub);
    return this.postEersaClaim(claimEersaData)
      .then((response) => {
        this._userPubsService.loadUpdatedUserPub({ userPubJson: response, action: "CREATE" });
        this.isPostedEersaPub = true;
        return response;
      }).catch(err => {
        throw err;
      });
  }

  /**
   * MÉTODO PARA GUARDAR UN NUEVO COMENTARIO O RESPUESTA EN EL BACKEND O EN SU DEFECTO PARA BACK SYNC:
   */
  public saveEersaPub(claimPub: Publication) {
    return this.sendEersaPub(claimPub).then((response) => {
      return response;
    }).catch(err => {
      if (!this.isPostedEersaPub && !navigator.onLine) {
        claimPub.id_publication = new Date().toISOString();
        this._backSyncService.storeForBackSync('sync-user-eersa-claim', 'sync-new-eersa-claim', this.mergeJSONData(claimPub))
        if (navigator.serviceWorker.controller) {
          claimPub.isOffline = true;
          claimPub.user = this._userService.getUserProfile();
          this._userPubsService.loadOffUserPub(claimPub);
          return true;
        }
      }

      this.isPostedEersaPub = false;
      throw err;
    });
  }

}
