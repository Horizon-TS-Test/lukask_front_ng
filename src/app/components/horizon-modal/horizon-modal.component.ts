import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { ContentService } from '../../services/content.service';
import { NotifierService } from '../../services/notifier.service';
import { DynaContent } from '../../interfaces/dyna-content.interface';
import { CONTENT_TYPES } from '../../config/content-type';
import { QuejaDetailComponent } from '../queja-detail/queja-detail.component';

declare var $: any;

@Component({
  selector: 'app-horizon-modal',
  templateUrl: './horizon-modal.component.html',
  styleUrls: ['./horizon-modal.component.css']
})
export class HorizonModalComponent implements OnInit {
  @ViewChild("modalContainer", { read: ViewContainerRef }) modalContainer: ViewContainerRef;

  private self: any;
  public _ref: any;
  private _childInstance: any;
  public _dynaContent: DynaContent;

  constructor(
    private _contentService: ContentService,
    private _notifierService: NotifierService,
    private _cfr: ComponentFactoryResolver
  ) {
  }

  ngOnInit() {
    this.self = $("#horizon-modal");
    this.addDynamicContent();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this._contentService.slideDownUp(this.self);
    }, 100);
  }

  addDynamicContent() {
    switch (this._dynaContent.contentType) {
      case CONTENT_TYPES.view_queja:
        this._childInstance = this._contentService.addComponent(QuejaDetailComponent, this._cfr, this.modalContainer, this._dynaContent);
        break;
    }
  }

  close(event) {
    this._contentService.slideDownUp(this.self, false);

    setTimeout(() => {
      this.removeObject();
    }, 300);
  }

  removeObject() {
    this._childInstance.removeObject();
    this._ref.destroy();
  }

}