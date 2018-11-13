import { Component, ViewChild, ViewContainerRef, OnDestroy, ComponentFactoryResolver, OnInit } from '@angular/core';
import { CONTENT_TYPES } from '../../config/content-type';
import { Subscription } from 'rxjs';
import { HorizonModalComponent } from '../horizon-modal/horizon-modal.component';
import { DynaContent } from '../../interfaces/dyna-content.interface';
import { HorizonNotificationComponent } from '../horizon-notification/horizon-notification.component';
import { HorizonPopOverComponent } from '../horizon-pop-over/horizon-pop-over.component';
import { AlertComponent } from '../alert/alert.component';
import { DynaContentService } from 'src/app/services/dyna-content.service';

@Component({
  selector: 'content-layer',
  templateUrl: './content-layer.component.html',
  styleUrls: ['./content-layer.component.css']
})
export class ContentLayerComponent implements OnInit, OnDestroy {
  @ViewChild("secodaryLayer", { read: ViewContainerRef }) secondaryLayer: ViewContainerRef;

  private subscription: Subscription;

  constructor(
    private _DynaContentService: DynaContentService,
    private _cfr: ComponentFactoryResolver
  ) { }

  ngOnInit() {
    //SUBSCRIPTION TO ADD NEW CONTENT LAYER DINAMICALLY:
    this.subscription = this._DynaContentService.modalData$.subscribe(
      (dynaContent: DynaContent) => {
        if (!dynaContent) {
          return;
        }
        switch (dynaContent.contentType) {
          case CONTENT_TYPES.alert:
            this.addComponent(AlertComponent, this._cfr, this.secondaryLayer, dynaContent);
            //{ contentType: CONTENT_TYPES.alert, contentData: alertData }
            break;
          case CONTENT_TYPES.new_notification:
            this.addComponent(HorizonNotificationComponent, this._cfr, this.secondaryLayer, dynaContent);
            break;
          case CONTENT_TYPES.find_accounts:
            this.addComponent(HorizonPopOverComponent, this._cfr, this.secondaryLayer, dynaContent);
            break;
          case CONTENT_TYPES.payment_card:
            this.addComponent(HorizonPopOverComponent, this._cfr, this.secondaryLayer, dynaContent);
            break;
          default:
            this.addComponent(HorizonModalComponent, this._cfr, this.secondaryLayer, dynaContent);
            break;
        }
      }
    );
    ////
  }

  /**
   * MÉTODO PARA AÑADIR DINÁMICAMENTE UN COMPONENTE E INCRUSTARLO EN EL DOM A TRAVÉS DE CÓDIGO TYPESCRIPT:
   */
  private addComponent(ChildComponent: any, cfr: ComponentFactoryResolver, compContainer: ViewContainerRef, dynaContent: DynaContent = null) {
    // check and resolve the component
    let component = cfr.resolveComponentFactory(ChildComponent);
    // Create component inside container
    let expComp: any = compContainer.createComponent(component);
    let compInstance: any = expComp.instance;
    compInstance._ref = expComp;

    switch (dynaContent.contentType) {
      case CONTENT_TYPES.alert:
        compInstance.alertData = dynaContent.contentData;
        break;
      default:
        compInstance._dynaContent = dynaContent;
        break;
    }
  }
  ////

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
