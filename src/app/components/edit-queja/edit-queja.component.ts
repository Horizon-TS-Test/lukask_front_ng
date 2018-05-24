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

declare var $: any;

@Component({
  selector: 'app-edit-queja',
  templateUrl: './edit-queja.component.html',
  styleUrls: ['./edit-queja.component.css'],
  providers: [QuejaService]
})
export class EditQuejaComponent implements OnInit, OnDestroy {
  private self: any;
  public _ref: any;

  public tipoQuejaSelect: Select2[];
  public quejaTypeList: QuejaType[];

  public formQuej: FormGroup;
  public filesToUpload: any[];
  private quejaType: string;
  private _gps: Gps;
  private newPub: Publication;

  private subscription: Subscription;

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
      (snapShot: any) => {
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
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this._contentService.slideDownUp(this.self);
    }, 100);
  }

  removeObject() {
    this._ref.destroy();
  }

  close(event) {
    event.preventDefault();
    this._contentService.slideDownUp(this.self, false);

    setTimeout(() => {
      this.removeObject();
    }, 300);
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

  addQuejaSnapShot(src: any) {
    let cardImg = $("#frmQ").find(".card-img-top");
    let defaultQuejaImg = $("#frmQ").find(".card-img-top > #defaultQuejaImg");

    defaultQuejaImg.css("display", "none");
    cardImg.append('<img class="mb-1" src="' + src + '" width="100%">');
    this.filesToUpload.push(FileManager.dataURItoBlob(src));
  }

  getFormattedDate() {
    var date = new Date();
    var str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

    return str;
  }

  newMedia(event: any) {
    event.preventDefault();
    this._notifierService.notifyNewContent(CONTENT_TYPES.new_media);
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
    this.newPub = new Publication("", this._gps.latitude, this._gps.longitude, this.formQuej.value.fcnDetail, this.getFormattedDate(), null, null, this.quejaType);
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
