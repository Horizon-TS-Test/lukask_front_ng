import { Component, OnInit, OnDestroy } from '@angular/core';
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

import { ViewChild } from '@angular/core';
import { } from '@types/googlemaps';

declare var google: any;
declare var $: any;

@Component({
  selector: 'app-edit-queja',
  templateUrl: './edit-queja.component.html',
  styleUrls: ['./edit-queja.component.css'],
})
export class EditQuejaComponent implements OnInit, OnDestroy {
  private self: any;
  public _ref: any;
  public _dynaContent: DynaContent;

  public tipoQuejaSelect: Select2[];
  public quejaTypeList: QuejaType[];

  public formQuej: FormGroup;
  public filesToUpload: any[];
  private quejaType: string;
  private _gps: Gps;
  private _direccion: string;
  private newPub: Publication;

  private subscription: Subscription;
  //Declacion de variables del mapa
  @ViewChild('gmap') gmapElement: any;
  //map: google.maps.Map;
  map: any;

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
    /////
  }

  ngOnInit() {
    this.self = $("#personal-edit-q");

    this.formQuej = this.setFormGroup();
    this.getGps();
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
 * Funcion que validara la posicion y el nombre de la organizacion
 * @param event 
 */
  getSelect2Value(event: string) {
    this.quejaType = event;
    console.log("valor seleccionado");
    console.log(this.quejaType);
    console.log(this._gps.latitude);
    console.log(this._gps.longitude);
    var list =[
      {lat:-1.664856,lng:-78.655525},
      {lat:-1.668264,lng:-78.647987},
      {lat:-1.671611,lng:-78.646030},
      {lat:-1.674530,lng:-78.643477},
      {lat:-1.680598,lng:-78.643049}
      ];
    for (let i in list) {
      console.log(list[i]);
      this.circunferencia(list[i]);
    }

  }


  circunferencia(posicion){
		console.log(posicion);
		var cityCircle = new google.maps.Circle({
			strokeColor: '#FF0000',
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: '#FF0000',
			fillOpacity: 0.35,

			center: posicion,
			radius: 10
		});

		this.map.setCenter(posicion);
		this.map.setZoom(19);
		console.log("Datos.....!!!!");
		console.log(this._gps.latitude);
		console.log(this._gps.longitude);
		var posi = new google.maps.LatLng(this._gps.latitude, this._gps.longitude);
		if (this.determinarPosicion2(cityCircle, posi)) {
			alert("si esta");
		}		else{
			console.log("No esta");
    }	
	}
  
	determinarPosicion2(circle,latLngA){
		var bounds = circle.getBounds();
		bounds = circle.getBounds();
		if(bounds.contains(latLngA)){
			alert("ESta dentro ? :"+bounds.contains(latLngA));
			return bounds.contains(latLngA);
		}else{
			console.log("ESta dentro ? :"+bounds.contains(latLngA));
			//crear_marker(latLngA);
			return bounds.contains(latLngA);
		} 
	}

  getGps() {
    if (!('geolocation' in navigator)) {
      return;
    }

    //ACCESS TO THE GPS:
    navigator.geolocation.getCurrentPosition((position) => {
      this._gps.latitude = position.coords.latitude;
      this._gps.longitude = position.coords.longitude;
      this.getAddress(this._gps.latitude, this._gps.longitude);
    }, function (err) {
      console.log(err);
      //EXCEDED THE TIMEOUT
      return;
    }, { timeout: 7000 });
  }

  getAddress(plat,plng){
    console.log("llamando");
    var geocoder = new google.maps.Geocoder;
    geocoder.geocode({ 'latLng': { lat: -1.663585, lng: -78.658242 } }, (results, status)=> {
      if (status === google.maps.GeocoderStatus.OK) {
        this._direccion = results[0].address_components[1].long_name;
      }
    });
  }
  publishQueja() {
    this.newPub = new Publication("", this._gps.latitude, this._gps.longitude, this.formQuej.value.fcnDetail, this.getFormattedDate(), null, null, new QuejaType(this.quejaType, null));
    if (this.filesToUpload.length > 0) {
      for (let i = 0; i < this.filesToUpload.length; i++) {
        this.newPub.media.push(new Media("", "", "", null, this.filesToUpload[i], i + "-" + this.getFormattedDate() + ".png"));
      }
    }

    this._quejaService.sendQueja(this.newPub);
    this.formQuej.reset();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
