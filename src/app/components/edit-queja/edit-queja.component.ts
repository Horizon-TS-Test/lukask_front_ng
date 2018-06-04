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

declare var $: any;

@Component({
  selector: 'edit-queja',
  templateUrl: './edit-queja.component.html',
  styleUrls: ['./edit-queja.component.css'],
})
export class EditQuejaComponent implements OnInit, OnDestroy {
  @Output() closeModal: EventEmitter<boolean>;

  private _SUBMIT = 0;
  private _CLOSE = 1;

  private self: any;
  private quejaType: string;
  private _gps: Gps;
  private newPub: Publication;
  private subscription: Subscription;

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
    /////

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
    this.getGps();
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
        if(!this.quejaType) {
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

  getSelect2Value(event: string) {
    this.quejaType = event;
  }

  getGps() {
    if (!('geolocation' in navigator)) {
      return;
    }

    //ACCESS TO THE GPS:
    navigator.geolocation.getCurrentPosition((position) => {
      this._gps.latitude = position.coords.latitude;
      this._gps.longitude = position.coords.longitude;
      console.log(this._gps);
    }, function (err) {
      console.log(err);
      //EXCEDED THE TIMEOUT
      return;
    }, { timeout: 7000 });
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

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
