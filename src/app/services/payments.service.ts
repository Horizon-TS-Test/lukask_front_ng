import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '../../../node_modules/@angular/http';
import { REST_SERV } from '../rest-url/rest-servers';
import { Payment } from '../models/payments';
import { PaymentCard } from '../models/payment-card';
import { UserService } from './user.service';


@Injectable({
  providedIn: 'root'
})
export class PaymentsService {

  constructor(
    private _http: Http,
    private _userServices: UserService
  ) { }

  /* Envio de los datos para realizar el Post del Pago en Pay Pal */

  public postPagosClient(pagos: Payment) {
    const requestHeaders = new Headers({
      'Content-Type': 'application/json',
      'X-Access-Token': this._userServices.getUserKey()
    });
    const requestBody = JSON.stringify({
      factura: pagos.factura,
      empresa: pagos.empresa,
      nombre: pagos.nombre,
      ci: pagos.ci,
      medidor: pagos.medidor,
      direccion: pagos.direccion,
      fechaemision: pagos.fechaemision,
      fechapago: pagos.fechapago,
      subtotal: pagos.subtotal,
      total: pagos.total,
      icon: pagos.icon
    });

    return this._http.post(REST_SERV.paymentPay, requestBody, { headers: requestHeaders, withCredentials: true }).toPromise()
      .then((response: Response) => {
        const respJson = response.json();
        return respJson;
      });
  }


  /* Envio de los datos para realizar el Post del Pago en Pay Pal con tarjeta*/

  public postPagosCards(pagos: Payment, paymentCard: PaymentCard) {
    const requestHeaders = new Headers({
      'Content-Type': 'application/json',
      'X-Access-Token': this._userServices.getUserKey()
    });
    const requestBody = JSON.stringify({
      factura: pagos.factura,
      empresa: pagos.empresa,
      nombre: pagos.nombre,
      ci: pagos.ci,
      medidor: pagos.medidor,
      direccion: pagos.direccion,
      fechaemision: pagos.fechaemision,
      fechapago: pagos.fechapago,
      subtotal: pagos.subtotal,
      total: pagos.total,
      icon: pagos.icon,
      email: paymentCard.email,
      numero: paymentCard.numero,
      mes: paymentCard.mes,
      anio: paymentCard.anio,
      cvv: paymentCard.cvv
    });
    return this._http.post(REST_SERV.paymentCard, requestBody, { headers: requestHeaders, withCredentials: true }).toPromise()
      .then((response: Response) => {
        const respJson = response.json();
        console.log("lllego al servico con error", respJson);
        return respJson;
      });
  }

  public getExitoso() {
    const requestHeaders = new Headers({
      'Content-Type': 'application/json',
      'X-Access-Token': this._userServices.getUserKey()
    });

    this._http.get(REST_SERV.exitoso, { headers: requestHeaders, withCredentials: true }).toPromise()
      .then((response: Response) => {
        const userJson = response.json().data;
        console.log("FROM WEB", userJson);
      })
      .catch((error: Response) => {
        if (error.json().code == 401) {
          localStorage.clear();
        }
        console.log(error);
      });
  }
 

}
