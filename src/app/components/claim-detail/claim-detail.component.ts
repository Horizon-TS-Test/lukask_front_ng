import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { EersaClient } from 'src/app/models/eersa-client';
import { EersaLocation } from 'src/app/models/eersa-location';

@Component({
  selector: 'claim-detail',
  templateUrl: './claim-detail.component.html',
  styleUrls: ['./claim-detail.component.css']
})
export class ClaimDetailComponent implements OnInit {
  public eersaClient: EersaClient;
  public eersaLocation: EersaLocation;

  @Output() onEersaLocClient: EventEmitter<{ eersaClient: EersaClient; eersaLocation: EersaLocation; }>;

  constructor() {
    this.onEersaLocClient = new EventEmitter<{ eersaClient: EersaClient; eersaLocation: EersaLocation; }>();

    this.eersaClient = new EersaClient(null, null, null);
    this.eersaLocation = new EersaLocation(null, null, null);
  }

  ngOnInit() {
  }

  /**
   * METODO PARA OBTENER LOS DATOS DEL CLIENTE EESA QUE VIENE MEDIANTE EL EVENT EMITTER:
   */
  public getClientData(event: EersaClient) {
    this.eersaClient = event;
    this.onEersaLocClient.emit({ eersaClient: this.eersaClient, eersaLocation: this.eersaLocation });
  }

  /**
   * METODO PARA OBTENER LOS DATOS DE LA UBICACION DEL CLIENTE EERSA QUE VIENE MEDIANTE EL EVENT EMITTER:
   */
  public getLocationData(event: EersaLocation) {
    this.eersaLocation = event;
    this.onEersaLocClient.emit({ eersaClient: this.eersaClient, eersaLocation: this.eersaLocation });
  }

}
