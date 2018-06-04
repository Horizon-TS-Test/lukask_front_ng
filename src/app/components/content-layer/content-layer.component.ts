import { Component, OnInit, ViewChild, ViewContainerRef, OnDestroy, ComponentFactoryResolver } from '@angular/core';
import { CONTENT_TYPES } from '../../config/content-type';
import { EditQuejaComponent } from '../edit-queja/edit-queja.component';
import { Subscription } from 'rxjs';
import { ContentService } from '../../services/content.service';
import { NotifierService } from '../../services/notifier.service';
import { NewMediaComponent } from '../new-media/new-media.component';
import { HorizonModalComponent } from '../horizon-modal/horizon-modal.component';
import { DynaContent } from '../../interfaces/dyna-content.interface';

@Component({
  selector: 'app-content-layer',
  templateUrl: './content-layer.component.html',
  styleUrls: ['./content-layer.component.css']
})
export class ContentLayerComponent implements OnDestroy {
  @ViewChild("secodaryLayer", { read: ViewContainerRef }) secondaryLayer: ViewContainerRef;

  private subscription: Subscription;

  constructor(
    private _contentService: ContentService,
    private _notifierService: NotifierService,
    private _cfr: ComponentFactoryResolver,
  ) {
    //SUBSCRIPTION TO ADD NEW CONTENT LAYER DINAMICALLY:
    this.subscription = this._notifierService.listenLayer().subscribe(
      (dynaContent: DynaContent) => {
        this._contentService.addComponent(HorizonModalComponent, this._cfr, this.secondaryLayer, dynaContent);
      }
    );
    ////
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}