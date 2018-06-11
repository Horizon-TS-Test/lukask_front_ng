import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { ContentService } from '../../services/content.service';
import { Publication } from '../../models/publications';
import { Select2 } from '../../interfaces/select2.interface';
import { QuejaService } from '../../services/queja.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { FileManager } from './../../tools/file-manager';
import { Subscription } from 'rxjs';
import { NotifierService } from '../../services/notifier.service';
import { CONTENT_TYPES } from '../../config/content-type';
import { CameraService } from '../../services/camera.service';
import { QuejaType } from '../../models/queja-type';
import { Gps } from '../../interfaces/gps.interface';
import { Media } from '../../models/media';
import { MediaFile } from '../../interfaces/media-file.interface';
import { DynaContent } from '../../interfaces/dyna-content.interface';
import { HorizonButton } from '../../interfaces/horizon-button.interface';

import { ViewChild } from '@angular/core';
import { } from '@types/googlemaps';
import { Alert } from '../../models/alert';
import { ALERT_TYPES } from '../../config/alert-types';

declare var google: any;
declare var $: any;

@Component({
  selector: 'edit-queja',
  templateUrl: './edit-queja.component.html',
  styleUrls: ['./edit-queja.component.css'],
})
export class EditQuejaComponent implements OnInit, OnDestroy {
  @Output() closeModal: EventEmitter<boolean>;
  //Declacion de variables del mapa
  @ViewChild('gmap') gmapElement: any;
  private map: any;

  private _SUBMIT = 0;
  private _CLOSE = 1;

  private self: any;
  private quejaType: string;
  private _gps: Gps;
  private newPub: Publication;
  private subscription: Subscription;
  private _locationAdress: string;
  private alertData: Alert;
  private pubFilterList: Publication[];
  private _locationCity: string;

  public _ref: any;
  public _dynaContent: DynaContent;
  public tipoQuejaSelect: Select2[];
  public quejaTypeList: QuejaType[];
  public formQuej: FormGroup;
  public filesToUpload: any[];
  public matButtons: HorizonButton[];

  constructor(
    private _contentService: ContentService,
    private _quejaService: QuejaService,
    private _notifierService: NotifierService,
    private _cameraService: CameraService,
    private formBuilder: FormBuilder
  ) {

    this.filesToUpload = [];
    this._gps = {
      latitude: 0,
      longitude: 0
    }

    this.getQuejaType();

    //LISTEN TO NEW SNAPSHOT SENT BY NEW MEDIA CONTENT:
    this.subscription = this._cameraService._snapShot.subscribe(
      (snapShot: MediaFile) => {
        console.log("new snapshot received!!");
        this.addQuejaSnapShot(snapShot);
      }
    );

    this.closeModal = new EventEmitter<boolean>();
    this.matButtons = [
      {
        parentContentType: 0,
        action: this._SUBMIT,
        icon: "check"
      },
      {
        parentContentType: 0,
        action: this._CLOSE,
        icon: "close"
      }
    ];
  }

  ngOnInit() {
    this.self = $("#personal-edit-q");
    this.formQuej = this.setFormGroup();
    this.initMapa();
    this.getGps();
  }

  initMapa() {
    //Inicalizacion del mapa
    var mapProp = {
      center: new google.maps.LatLng(-1.669685, -78.651953),
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
  }

  ngAfterViewInit() { }

  removeObject() {
    this._ref.destroy();
  }

  close(event) {
    this.removeObject();
  }

  getQuejaType() {
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

  addQuejaSnapShot(media: MediaFile) {
    let cardImg = $("#frmQ").find(".card-img-top");
    let defaultQuejaImg = $("#frmQ").find(".card-img-top > #defaultQuejaImg");
    defaultQuejaImg.css("display", "none");
    cardImg.append('<img class="mb-1" src="' + media.mediaFileUrl + '" width="100%">');
    this.filesToUpload.push(media.mediaFile);
  }

  /**
   * METODO PARA OBTENER LA FECHA
   */
  getFormattedDate() {
    var date = new Date();
    var str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    return str;
  }

  newMedia(event: any) {
    event.preventDefault();
    this._notifierService.notifyNewContent({ contentType: CONTENT_TYPES.new_media, contentData: null });
  }

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

  /**
   * METODO QUE VALIDA SI LA PUBLICACION CUMPLE ESTA DENTRO DEL AREA ESTABLECIDA
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
   * METODO ACTIVA EL MODAL DE AVISOS EN LA PANTALLA
   */
  setAlert() {
    this._notifierService.sendAlert(this.alertData);
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
   * METODO CALCULA SI LA POSICION DADA ESTA DENTRO DEL AREA ESTABLECIDA 
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
   * MÉTODO QUE OBTIENE LA POSICIÓN DESDE DONDE SE EMITE LA QUEJA
   */
  getGps() {
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
        this.callPubs();
      }
    });
  }


  publishQueja() {
    this.newPub = new Publication("", this._gps.latitude, this._gps.longitude, this.formQuej.value.fcnDetail, this.getFormattedDate(), null, null, new QuejaType(this.quejaType, null), null, this._locationCity);
    if (this.filesToUpload.length > 0) {
      for (let i = 0; i < this.filesToUpload.length; i++) {
        this.newPub.media.push(new Media("", "", "", null, this.filesToUpload[i], i + "-" + this.getFormattedDate() + ".png"));
      }
    }
    this._quejaService.sendQueja(this.newPub);
    this.formQuej.reset();
  }

  /**
   * MÉTODO PARA ESCUCHAR LA ACCIÓN DEL EVENTO DE CLICK DE UN BOTÓN DINÁMICO:
   */
  getButtonAction(actionEvent: number) {
    switch (actionEvent) {
      case this._SUBMIT:
        console.log("Submit! has been requested");
        this.publishQueja();
        break;
      case this._CLOSE:
        this.closeModal.emit(true);
        break;
    }
  }
  /**
  * TOMANDO LA LISTA DE PUBLICACIONES CON FILTRO DESDE EL BACKEND:
  */
  callPubs() {
    console.log(this._locationCity);
    this._quejaService.getPubListFilter(this._locationCity)
      .then((pubsFilter: Publication[]) => {
        this.pubFilterList = pubsFilter;
        console.log(this.pubFilterList);
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
