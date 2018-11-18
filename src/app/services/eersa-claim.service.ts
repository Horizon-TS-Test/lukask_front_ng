import { Injectable } from '@angular/core';
import { Publication } from '../models/publications';
import { EersaClaim } from 'src/app/models/eersa-claim';
import { REST_SERV } from '../rest-url/rest-servers';
import { UserService } from './user.service';
import { QuejaService } from './queja.service';
import { ArrayManager } from '../tools/array-manager';
import { BackSyncService } from './back-sync.service';

@Injectable({
  providedIn: 'root'
})
export class EersaClaimService {
  private isPostedEersaPub: boolean;

  constructor(
    private _userService: UserService,
    private _quejaService: QuejaService,
    private _backSyncService: BackSyncService,
  ) {
    this.isPostedEersaPub = false;
  }

  /**
   * MÉTODO PARA CREAR UN OBJETO JAVASCRIPT A PARTIR DE UNO DE TIPO PUBLICACION
   * @param queja 
   */
  private mergeJSONData(claimData: { eersaPub: EersaClaim; pub: Publication; }) {
    let pubJson = this._quejaService.mergeJSONData(claimData.pub);

    let json = {
      nCuenta: claimData.eersaPub.cliente.nCuenta,
      nMedidor: claimData.eersaPub.cliente.nMedidor,
      nPoste: claimData.eersaPub.nPoste,
      cliente: claimData.eersaPub.cliente.user.person.name + claimData.eersaPub.cliente.user.person.last_name,
      cedula: claimData.eersaPub.cliente.user.person.identification_card,
      telefono: claimData.eersaPub.cliente.user.person.telephone,
      celular: claimData.eersaPub.cliente.user.person.cell_phone,
      email: claimData.eersaPub.cliente.user.username,
      calle: claimData.eersaPub.ubicacion.calle,
      idTipo: claimData.eersaPub.idTipo,
      idBarrio: claimData.eersaPub.ubicacion.idBarrio,
      referencia: claimData.eersaPub.ubicacion.referencia,
      detalleReclamo: claimData.eersaPub.detalleReclamo
    }

    let claimJson = ArrayManager.mergeJavascriptObj(pubJson, json);
    console.log(claimJson);

    return claimJson;
  }

  /**
   * MÉTODO PARA CREAR UN OBJETO DE TIPO FORM DATA A PARTIR DE UNO DE TIPO EERSA CLAIM Y QUEJA LUKASK
   * @param queja 
   */
  private mergeFormData(claimData: { eersaPub: EersaClaim; pub: Publication; }) {
    let formData = this._quejaService.mergeFormData(claimData.pub);

    formData.append('nCuenta', claimData.eersaPub.cliente.nCuenta);
    formData.append('nMedidor', claimData.eersaPub.cliente.nMedidor);
    formData.append('nPoste', claimData.eersaPub.nPoste);
    formData.append('cliente', claimData.eersaPub.cliente.user.person.name + " " + claimData.eersaPub.cliente.user.person.last_name);
    formData.append('cedula', claimData.eersaPub.cliente.user.person.identification_card);
    formData.append('telefono', claimData.eersaPub.cliente.user.person.telephone);
    formData.append('celular', claimData.eersaPub.cliente.user.person.cell_phone);
    formData.append('email', claimData.eersaPub.cliente.user.username);
    formData.append('calle', claimData.eersaPub.ubicacion.calle);
    formData.append('idTipo', claimData.eersaPub.idTipo + "");
    formData.append('idBarrio', claimData.eersaPub.ubicacion.idBarrio + "");
    formData.append('referencia', claimData.eersaPub.cliente.user.username);
    formData.append('detalleReclamo', claimData.eersaPub.detalleReclamo);

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
  private sendEersaPub(claimData: { eersaPub: EersaClaim; pub: Publication; }) {
    let claimEersaData: FormData = this.mergeFormData(claimData);
    return this.postEersaClaim(claimEersaData)
      .then((response) => {
        this._quejaService.updatePubList(response, "CREATE", false);
        this.isPostedEersaPub = true;
        return response;
      }).catch(err => {
        throw err;
      });
  }

  /**
   * MÉTODO PARA GUARDAR UN NUEVO COMENTARIO O RESPUESTA EN EL BACKEND O EN SU DEFECTO PARA BACK SYNC:
   */
  public saveEersaPub(claimData: { eersaPub: EersaClaim; pub: Publication; }) {
    return this.sendEersaPub(claimData).then((response) => {
      return response;
    }).catch(err => {
      if (!this.isPostedEersaPub && !navigator.onLine) {
        claimData.pub.id_publication = new Date().toISOString();
        this._backSyncService.storeForBackSync('sync-pub', 'sync-new-pub', this.mergeJSONData(claimData))
        if (navigator.serviceWorker.controller) {
          claimData.pub.isOffline = true;
          claimData.pub.user = this._userService.getUserProfile();
          this._quejaService.pubList.splice(0, 0, claimData.pub);
          this._quejaService.loadPubs(this._quejaService.pubList);
          return true;
        }
      }

      this.isPostedEersaPub = false;
      throw err;
    });
  }

}
