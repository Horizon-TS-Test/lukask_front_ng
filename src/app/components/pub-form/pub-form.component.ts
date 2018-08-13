import { Component, OnInit, SimpleChanges, OnChanges, ViewChild, Input, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { QuejaService } from '../../services/queja.service';
import { FormBuilder, FormGroup, Validators } from '../../../../node_modules/@angular/forms';
import { QuejaType } from '../../models/queja-type';
import { Select2 } from '../../interfaces/select2.interface';
import { Publication } from '../../models/publications';
import { DateManager } from '../../tools/date-manager';
import { ACTION_TYPES } from '../../config/action-types';
import { Gps } from '../../interfaces/gps.interface';
import { Media } from '../../models/media';
import { Alert } from '../../models/alert';
import { NotifierService } from '../../services/notifier.service';
import { ALERT_TYPES } from '../../config/alert-types';
import { MediaFile } from '../../interfaces/media-file.interface';
import { OnSubmit } from '../../interfaces/on-submit.interface';

declare var google: any;
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
  @ViewChild('gmap') gmapElement: any;

  private quejaType: string;
  private newPub: Publication;
  private _gps: Gps;
  private map: any;
  private pubFilterList: Publication[];
  private alertData: Alert;

  public tipoQuejaSelect: Select2[];
  public quejaTypeList: QuejaType[];
  public formPub: FormGroup;
  public _locationCity: string;
  public _locationAdress: string;

  constructor(
    private _notifierService: NotifierService,
    private _quejaService: QuejaService,
    private formBuilder: FormBuilder
  ) {
    this._gps = {
      latitude: 0,
      longitude: 0
    }
  }

  ngOnInit() {
    this.formPub = this.setFormGroup();
    this.initMapa();
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
    this.validateQuejaRepeat();
  }

  initMapa() {
    //Inicalizacion del mapa
    var mapProp = {
      center: new google.maps.LatLng(this._gps.latitude, this._gps.longitude),
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
  }

  /**
   * MÉTODO QUE OBTIENE LA POSICIÓN DESDE DONDE SE EMITE LA QUEJA
   */
  private getGps() {
    if (!('geolocation' in navigator)) {
      return;
    }

    //ACCESS TO THE GPS:
    navigator.geolocation.getCurrentPosition((position) => {
      this._gps.latitude = position.coords.latitude;
      this._gps.longitude = position.coords.longitude;
      this.getLocation();
    }, function (err) {
      console.log(err);
      //EXCEDED THE TIMEOUT
      return;
    }, { timeout: 7000 });
  }

  /**
  * TOMANDO LA LISTA DE PUBLICACIONES CON FILTRO DESDE EL BACKEND:
  */
  callPubs() {
    this._quejaService.getPubListFilter(this._locationCity)
      .then((pubsFilter: Publication[]) => {
        this.pubFilterList = pubsFilter;
      });
  }

  /**
   * MÉTODO QUE TOMA LA CIUDAD Y DIRECCIÓN DE DONDE SE EMITE LA QUEJA
   */
  getLocation() {
    var geocoder = new google.maps.Geocoder;
    geocoder.geocode({ 'latLng': { lat: this._gps.latitude, lng: this._gps.longitude } }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK) {
        var str = results[0].formatted_address;
        var dir = str.split(",");
        this._locationAdress = dir[0];
        this._locationCity = dir[1];
        $("#hidden-btn").click();
        this.callPubs();
      }
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
    if (this.mediaFiles.length > 0) {
      for (let i = 0; i < this.mediaFiles.length; i++) {
        this.newPub.media.push(new Media("", "", "", null, this.mediaFiles[i].mediaFile, i + "-" + new Date().toISOString() + ".png"));
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
      if(error.code == 400) {
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
   * METODO QUE DIBUJA EL PERIMETRO ESTABLECIDO 
   * @param pos = Posición desde la cual se esta emitiendo la queja
   * @param pubType = Tipo de queja
   */
  drawCircle(pos: any, pubType: string) {
    var cityCircle = new google.maps.Circle({
      center: pos,
      radius: 10
    });

    this.map.setCenter(pos);
    this.map.setZoom(19);
    var posi = new google.maps.LatLng(this._gps.latitude, this._gps.longitude);
    if (this.validatePosition(cityCircle, posi) && this.quejaType == pubType) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * METODO ACTIVA EL MODAL DE AVISOS EN LA PANTALLA
   */
  setAlert() {
    this._notifierService.sendAlert(this.alertData);
  }

  /**
   * MÈTODO QUE VALIDA SI LA PUBLICACION CUMPLE ESTA DENTRO DEL AREA ESTABLECIDA
   */
  validateQuejaRepeat() {
    let band = false;
    for (let pub of this.pubFilterList) {
      if (this.drawCircle({ lat: pub.latitude, lng: pub.longitude }, pub.type.id)) {
        band = true;
      }
    }
    if (band == true) {
      this.alertData = new Alert({ title: 'Proceso Fallido', message: 'No es posible ejecutar la petición', type: ALERT_TYPES.danger });
      this.setAlert();
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
