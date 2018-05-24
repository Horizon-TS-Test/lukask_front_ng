import { Injectable, ComponentFactoryResolver, ViewContainerRef, ViewChild } from '@angular/core';

declare var $: any;

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  ALERT_COMPONENT: number = 0;
  MODAL_COMPONENT: number = 1;

  private counter: number;

  constructor() { }

  hidePortada() {
    let portada = $("#personal-portada");
    let dark = $(".portada-fixed");

    if (!portada.hasClass("go-up")) {
      portada.addClass("go-up").one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', () => {
        if (!dark.hasClass("fade")) {
          dark.addClass("fade").one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', () => {
            dark.addClass("hide");
          });
        }
      });
    }
  }

  fadeInComponent() {
    let component = $(".personal-fadeout");

    setTimeout(() => {
      if (!component.hasClass("personal-fadein")) {
        component.addClass("personal-fadein");
      }
    }, /*2000*/0);
  }

  slideDownUp(contentLayer, slideUp: boolean = true) {
    if (slideUp) {
      if (!contentLayer.hasClass("show-dyna-cont")) {
        contentLayer.parent().find(".fixed-background").addClass("on");
        contentLayer.addClass("show-dyna-cont");
      }
    }
    else {
      if (contentLayer.hasClass("show-dyna-cont")) {
        contentLayer.parent().find(".fixed-background").removeClass("on");
        contentLayer.removeClass("show-dyna-cont");
      }
    }
  }

  //TO ADD A COMPONENT DINAMICALLY AND PROGRAMMATICALLY:
  addComponent(ChildComponent: any, cfr: ComponentFactoryResolver, compContainer: ViewContainerRef, componentOp: number = null, componentData: any = null) {
    // check and resolve the component
    let component = cfr.resolveComponentFactory(ChildComponent);
    // Create component inside container
    let expComp: any = compContainer.createComponent(component);
    expComp.instance._ref = expComp;

    switch (componentOp) {
      case this.ALERT_COMPONENT:
        expComp.instance.id = this.counter;
        expComp.instance.alertData = componentData;
        this.counter++;
        break;
      case this.MODAL_COMPONENT:
        expComp.instance.servicio = componentData;
        break;
      default:
        break;
    }
  }
  ////

  centerElement(element: any) {
    let elHalfWidth = Math.trunc(element.width() / 2);
    let windowMid = Math.trunc($(window).width() / 2);

    element.offset({ left: (windowMid - elHalfWidth) });
  }

}