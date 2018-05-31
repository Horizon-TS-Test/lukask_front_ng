import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { ContentService } from '../../services/content.service';
import { NotifierService } from '../../services/notifier.service';
import { DynaContent } from '../../interfaces/dyna-content.interface';
import { CONTENT_TYPES } from '../../config/content-type';
import { QuejaDetailComponent } from '../queja-detail/queja-detail.component';
import { EditQuejaComponent } from '../edit-queja/edit-queja.component';
import { NewMediaComponent } from '../new-media/new-media.component';

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
  public _dynaContent: DynaContent;
  public contentTypes: any;

  constructor(
    private _contentService: ContentService,
    private _notifierService: NotifierService,
    private _cfr: ComponentFactoryResolver
  ) {
    this.contentTypes = CONTENT_TYPES;
  }

  ngOnInit() {
    this.self = $(".horizon-modal").last();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this._contentService.slideDownUp(this.self);
    }, 100);
  }

  close(closeEvent: Boolean) {
    if (closeEvent) {
      this._contentService.slideDownUp(this.self, false);

      setTimeout(() => {
        this.removeObject();
      }, 300);
    }
  }

  removeObject() {
    this._ref.destroy();
  }

}