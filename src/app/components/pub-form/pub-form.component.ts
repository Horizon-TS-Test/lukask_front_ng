import { Component, OnInit, SimpleChanges, OnChanges, Input, AfterViewInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { QuejaService } from '../../services/queja.service';
import { FormBuilder, FormGroup, Validators } from '../../../../node_modules/@angular/forms';
import { QuejaType } from '../../models/queja-type';
import { Select2 } from '../../interfaces/select2.interface';
import { Publication } from '../../models/publications';
import { DateManager } from '../../tools/date-manager';
import { ACTION_TYPES } from '../../config/action-types';
import { MEDIA_TYPES } from '../../config/media-types';
import { Gps } from '../../interfaces/gps.interface';
import { Media } from '../../models/media';
import { MediaFile } from '../../interfaces/media-file.interface';
import { OnSubmit } from '../../interfaces/on-submit.interface';
import { GpsService } from 'src/app/services/gps.service';
import { claimType } from 'src/app/interfaces/claim-type.interface';
import claimTypes from '../../data/claim-type';
import { EersaClaim } from 'src/app/models/eersa-claim';
import { EersaClient } from 'src/app/models/eersa-client';
import { EersaLocation } from 'src/app/models/eersa-location';
import { EersaClaimService } from 'src/app/services/eersa-claim.service';
import { WebrtcSocketService } from 'src/app/services/webrtc-socket.service';

declare var $: any;

@Component({
  selector: 'pub-form',
  templateUrl: './pub-form.component.html',
  styleUrls: ['./pub-form.component.css']
})
export class PubFormComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() mediaFiles: MediaFile[];
  @Input() submit: number;
  @Input() isStreamPub: boolean;

  @Input() eersaLocClient: { eersaClient: EersaClient, eersaLocation: EersaLocation };

  @Output() afterSubmit = new EventEmitter<OnSubmit>();
  @Output() validForm = new EventEmitter<boolean>();

  private quejaType: string;
  private newPub: Publication;
  private _gps: Gps;
  private eersaClaim: EersaClaim;
  private timeInterval: any;
  private isValidForm: boolean;

  public tipoQuejaSelect: Select2[];
  public quejaTypeList: QuejaType[];
  public claimTypeList: claimType[];
  public claimTypeSelect: Select2[];

  public formPub: FormGroup;
  public _localDate: string;
  public _locationCity: string;
  public _locationAddress: string;

  constructor(
    private formBuilder: FormBuilder,
    private _quejaService: QuejaService,
    private _eersaClaimService: EersaClaimService,
    private _gpsService: GpsService,
    private _webRtcService: WebrtcSocketService
  ) {
    this.isValidForm = false;

    this._gps = {
      latitude: 0,
      longitude: 0
    }
  }

  ngOnInit() {
    this.formPub = this.setFormGroup();
    this.getEersaClaimType();
    this.getLocalDate();
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
    this._quejaService.getQtypeList(!this.eersaLocClient).then((qTypes) => {
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
  public getSelect2Value(event: string) {
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
      this._locationAddress = deviceLocation.address;
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

    this.defineNewPub();
    this._quejaService.savePub(this.newPub).then((response: any) => {

      if (response == true) {
        this.afterSubmit.emit({ finished: true, dataAfterSubmit: null, hasError: false, message: 'Su publicación se enviará en la próxima conexión', backSync: true });
      }
      else {
      
        /****aqui va el codigo de guardar videos***/
        
        let mediaVideoData = this.mediaFiles.filter((element, index, arrayData)=>{
          return (element.type == MEDIA_TYPES.video);
        });

        if (mediaVideoData.length > 0){

          this._webRtcService.sendFilebKMS({pubId : response.id_publication, mediaVideo : mediaVideoData}).then((responsefile:any) =>{
            this.afterSubmit.emit({ finished: true, dataAfterSubmit: response.id_publication, hasError: false, message: 'La información ha sido publicada exitosamente' });
          }).catch((error)=>{

            console.log("Error al guardar el archivo..", error);
          });
        }else{

          this.afterSubmit.emit({ finished: true, dataAfterSubmit: response.id_publication, hasError: false, message: 'La información ha sido publicada exitosamente' });
        }
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
   * METODO PARA DEFINIR LA FECHA ACTUAL DE LA REALIZACIÓN DE LA QUEJA
   */
  private getLocalDate() {
    this._localDate = DateManager.getStringDate();
    this.timeInterval = setInterval(() => {
      this._localDate = DateManager.getStringDate();
    }, 1000);
  }

  /**
   * METODO GENERICO PARA DEFINIR LA NUEVA PUBLICACION
   */
  private defineNewPub() {
    this.newPub = new Publication("", this._gps.latitude, this._gps.longitude, this.formPub.value.fcnDetail, DateManager.getFormattedDate(), null, null, new QuejaType(this.quejaType, null), null, this._locationCity, null, null, this._locationAddress, this.isStreamPub);

    if (this.mediaFiles.length > 1) {
      for (let i = 0; i < this.mediaFiles.length; i++) {
        if (this.mediaFiles[i].removeable == true && this.mediaFiles[i].type == MEDIA_TYPES.image) {
          this.newPub.media.push(new Media("", "IG", this.mediaFiles[i].mediaFileUrl, true, this.mediaFiles[i].mediaFile, i + "-" + new Date().toISOString() + ".png"));
        }
      }
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
              /*if (this.eersaLocClient) {
                console.log("Para la eersa", this.eersaClaim);
                //this.sendEersaClaim();
              }
              else {*/
               console.log("el común insert");
               this.sendPub();
              //}
            }
            break;
          case 'mediaFiles':
            this.mediaFiles = changes[property].currentValue;
            break;
          case 'isStreamPub':
            this.isStreamPub = changes[property].currentValue;
            break;
          case 'eersaLocClient':
            if (changes[property].currentValue) {
              this.eersaLocClient = changes[property].currentValue;
              this.defineEersaClaim();
            }
            break;
        }
      }
    }
  }

  /*****************************************************************************************/
  /*****************************************************************************************/
  /**
   * METODOS PARA GESTIONAR RECLAMOS EERSA:
   */
  /*****************************************************************************************/
  /*****************************************************************************************/

  /**
   * METODO PARA DEFINI EL OBJETO EERSA CLAIM:
   */
  private defineEersaClaim() {
    this.eersaClaim = new EersaClaim(null, null, this.eersaLocClient.eersaClient, this.eersaLocClient.eersaLocation, null, null);
  }

  /**
   * METODO PARA OBTENER LOS DATOS DEL TIPO DE RECLAMO DEL SISTEMA DE EERSA:
   */
  private getEersaClaimType() {
    if (this.eersaLocClient) {
      this.claimTypeList = claimTypes;
      this.claimTypeSelect = [];
      for (let cType of this.claimTypeList) {
        this.claimTypeSelect.push({ value: cType.claimTypeId + "", data: cType.description });
      }

      this.getTypeSelect(this.claimTypeList[0].claimTypeId);
    }
  }

  /**
   * MÉTODO QUE CAPTURA LOS TIPOS DE RECLAMO EERSA DESDE EL SELECT
   * @param event 
   */
  public getTypeSelect(event: number) {
    this.eersaClaim.idTipo = event;
    if (this.eersaClaim.detalleReclamo) {
      if (!this.isValidForm) {
        this.isValidForm = true;
        this.validForm.emit(this.isValidForm);
      }
    }
  }

  /**
   * METODO PARA DETECTAR EL CAMBIO DE VALOR DEL INPUT DE DETALLE DEL RECLAMO:
   * @param $event 
   */
  public onDetailChange(event: any) {
    if (this.eersaLocClient) {
      this.eersaClaim.detalleReclamo = this.formPub.value.fcnDetail;
      if (this.eersaClaim.idTipo > 0 && this.eersaClaim.detalleReclamo) {
        if (!this.isValidForm) {
          this.isValidForm = true;
          this.validForm.emit(this.isValidForm);
        }
      }
      else {
        if (this.isValidForm) {
          this.isValidForm = false;
          this.validForm.emit(this.isValidForm);
        }
      }
    }
  }

  /**
   * MÉTODO PARA ENVIAR UNA QUEJA HACIA EL SERVIDOR PARA ALMACENARLO EN LA BASE DE DATOS:
   */
  public sendEersaClaim() {
    this.defineNewPub();
    this.eersaClaim.ubicacion.calle = this._locationAddress;
    this.newPub.eersaClaim = this.eersaClaim;

    this._eersaClaimService.saveEersaPub(this.newPub).then((response: any) => {
      if (response == true) {
        this.afterSubmit.emit({ finished: true, dataAfterSubmit: null, hasError: false, message: 'Su reclamo se enviará en la próxima conexión', backSync: true });
      }
      else {
        this.afterSubmit.emit({ finished: true, dataAfterSubmit: response.id_publication, hasError: false, message: 'Su reclamo ha sido publicada exitosamente' });
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

  ngOnDestroy() {
    clearTimeout(this.timeInterval);
  }
}
