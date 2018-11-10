import { Component, OnInit, SimpleChanges, OnChanges, Input, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { QuejaService } from '../../services/queja.service';
import { FormBuilder, FormGroup, Validators } from '../../../../node_modules/@angular/forms';
import { QuejaType } from '../../models/queja-type';
import { Select2 } from '../../interfaces/select2.interface';
import { Publication } from '../../models/publications';
import { DateManager } from '../../tools/date-manager';
import { ACTION_TYPES } from '../../config/action-types';
import { Gps } from '../../interfaces/gps.interface';
import { Media } from '../../models/media';
import { MediaFile } from '../../interfaces/media-file.interface';
import { OnSubmit } from '../../interfaces/on-submit.interface';
import { GpsService } from 'src/app/services/gps.service';

declare var $: any;

@Component({
  selector: 'pub-form',
  templateUrl: './pub-form.component.html',
  styleUrls: ['./pub-form.component.css']
})
export class PubFormComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() mediaFiles: MediaFile[];
  @Input() submit: number;
  @Input() isStreamPub: boolean;
  @Output() afterSubmit = new EventEmitter<OnSubmit>();

  private quejaType: string;
  private newPub: Publication;
  private _gps: Gps;

  public tipoQuejaSelect: Select2[];
  public quejaTypeList: QuejaType[];
  public formPub: FormGroup;
  public _locationCity: string;
  public _locationAdress: string;

  constructor(
    private formBuilder: FormBuilder,
    private _quejaService: QuejaService,
    private _gpsService: GpsService
  ) {
    this._gps = {
      latitude: 0,
      longitude: 0
    }
  }

  ngOnInit() {
    this.formPub = this.setFormGroup();
  }

  ngAfterViewInit() {
    this.getGps();

    setTimeout(() => {
      $("#hidden-btn").on(("click"), (event) => { }); //NO TOCAR!
      this.getQuejaType();
    }, 1000);
  }

  /**
   * MÉTODO PARA CARGAR LOS TIPOS DE QUEJA PARA UN NUEVO REGISTRO:
   */
  private getQuejaType() {
    this._quejaService.getQtypeList().then((qTypes) => {
      this.quejaTypeList = qTypes;
      this.tipoQuejaSelect = [];

      for (let type of this.quejaTypeList) {
        if (!this.quejaType) {
          this.quejaType = type.id;
        }
        this.tipoQuejaSelect.push({ value: type.id, data: type.description });
      }
    });
  }

  /**
   * MÉTODO PARA INICIALIZAR EL FORMULARIO DE UN NUEVA PUBLICACIÒN:
   */
  private setFormGroup(): FormGroup {
    const formGroup = this.formBuilder.group({
      fcnDetail: [null, Validators.required]
    });
    return formGroup;
  }

  /**
   * METODO QUE VALIDA LA POSICION Y EL NOMBRE DE LA ORGANIZACION AL RECIBIR EL CAMBIO DE VALOR DESDE EL SELECT
   * @param event 
   */
  getSelect2Value(event: string) {
    this.quejaType = event;
  }

  /**
   * MÉTODO QUE OBTIENE LA POSICIÓN DESDE DONDE SE EMITE LA QUEJA
   */
  private getGps() {
    this._gpsService.getDeviceGeolocation((geoLocation) => {
      this._gps.latitude = geoLocation.lat;
      this._gps.longitude = geoLocation.long;
      this.getLocation();
    });
  }

  /**
   * MÉTODO QUE TOMA LA CIUDAD Y DIRECCIÓN DE DONDE SE EMITE LA QUEJA
   */
  public getLocation() {
    this._gpsService.getDeviceLocation(this._gps.latitude, this._gps.longitude, (deviceLocation) => {
      this._locationAdress = deviceLocation.address;
      this._locationCity = deviceLocation.city;
      $("#hidden-btn").click();
    });
  }

  /**
   * MÉTODO PARA ENVIAR UNA QUEJA HACIA EL SERVIDOR PARA ALMACENARLO EN LA BASE DE DATOS:
   */
  public sendPub() {
    if (!this.formPub.value.fcnDetail || !this.quejaType) {
      this.afterSubmit.emit({ finished: true, dataAfterSubmit: null, hasError: true, message: "No se admiten campos vacíos" });

      return;
    }
    if (this.formPub.value.fcnDetail.replace(" ", "").length == 0) {
      this.afterSubmit.emit({ finished: true, dataAfterSubmit: null, hasError: true, message: "No se admiten campos vacíos" });

      return;
    }

    this.newPub = new Publication("", this._gps.latitude, this._gps.longitude, this.formPub.value.fcnDetail, DateManager.getFormattedDate(), null, null, new QuejaType(this.quejaType, null), null, this._locationCity, null, null, this._locationAdress, this.isStreamPub);

    if (this.mediaFiles.length > 1) {
      for (let i = 0; i < this.mediaFiles.length; i++) {
        if (this.mediaFiles[i].removeable == true) {
          this.newPub.media.push(new Media("", "", this.mediaFiles[i].mediaFileUrl, true, this.mediaFiles[i].mediaFile, i + "-" + new Date().toISOString() + ".png"));
        }
      }
    }
    this._quejaService.savePub(this.newPub).then((response: any) => {
      if (response == true) {
        this.afterSubmit.emit({ finished: true, dataAfterSubmit: null, hasError: false, message: 'Tu publicación se enviará en la próxima conexión', backSync: true });
      }
      else {
        this.afterSubmit.emit({ finished: true, dataAfterSubmit: response.id_publication, hasError: false, message: 'Su queja ha sido publicada exitosamente' });
      }
      this.formPub.reset();
    }).catch((error) => {
      if (error.code == 400) {
        this.afterSubmit.emit({ finished: true, dataAfterSubmit: null, hasError: true, message: 'Verifique que la información ingresada sea correcta' });
      }
      else {
        this.afterSubmit.emit({ finished: true, dataAfterSubmit: null, hasError: true, message: 'No se ha podido procesar la petición' });
      }
      this.formPub.reset();
    });
  }

  /**
   * MÉTODO CALCULA SI LA POSICION DADA ESTA DENTRO DEL AREA ESTABLECIDA 
   * @param circle = Área permitida 
   * @param latLngA = Posiciòn desde la cual se emite la queja
   */
  validatePosition(circle, latLngA) {
    var bounds = circle.getBounds();
    bounds = circle.getBounds();
    if (bounds.contains(latLngA)) {
      return bounds.contains(latLngA);
    } else {
      return bounds.contains(latLngA);
    }
  }

  /**
   * MÉTODO PARA DETECTAR LOS CAMBIOS DE UNA PROPIEDAD INYECTADA DESDE EL COMPONENTE PADRE DE ESTE COMPONENTE:
   * @param changes LOS CAMBIOS GENERADOS
   */
  ngOnChanges(changes: SimpleChanges) {

    for (const property in changes) {
      /*console.log('Previous:', changes[property].previousValue);
      console.log('Current:', changes[property].currentValue);
      console.log('firstChange:', changes[property].firstChange);*/
      if (changes[property].currentValue) {
        switch (property) {
          case 'submit':
            if (changes[property].currentValue == ACTION_TYPES.submitPub || changes[property].currentValue == ACTION_TYPES.pubStream) {
              this.sendPub();
            }
            break;
          case 'mediaFiles':
            this.mediaFiles = changes[property].currentValue;
            break;
          case 'isStreamPub':
            this.isStreamPub = changes[property].currentValue;
            break;
        }
      }
    }
  }

}
