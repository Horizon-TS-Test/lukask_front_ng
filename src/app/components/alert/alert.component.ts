import { Component, OnInit, OnDestroy } from '@angular/core';
import { Alert } from './../../models/alert';
import { ALERT_TYPES } from './../../config/alert-types';

declare var $: any;

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit {
  public _ref: any;
  public id: number;
  public alertData: Alert;
  private self: any;
  public alertTypes: any;

  constructor() {
    this.alertTypes = ALERT_TYPES;
  }

  ngOnInit() {
    this.self = $(".personal-alert").last();
    this.self.attr("id", this.id);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.showHideAlert();
    }, 250);

    setTimeout(() => {
      this.addIconAnimation();
    }, 500);

    setTimeout(() => {
      this.showHideAlert(false);
    }, 4500);

    setTimeout(() => {
      this.removeObject();
    }, 5000);
  }

  removeObject() {
    this._ref.destroy();
  }

  showHideAlert(show: boolean = true) {
    if (show) {
      this.self.parent().addClass("active");
      this.self.addClass("on");
    }
    else {
      this.self.removeClass("on");
      this.self.parent().removeClass("active");
    }
  }

  addIconAnimation() {
    this.self.find(".alert-icon fa").addClass("animate");
  }

}