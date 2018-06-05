import { Injectable, ComponentFactoryResolver, ViewContainerRef, ViewChild } from '@angular/core';
import { DynaContent } from '../interfaces/dyna-content.interface';
import { CONTENT_TYPES } from '../config/content-type';

declare var $: any;

@Injectable({
  providedIn: 'root'
})
export class ContentService {
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
  addComponent(ChildComponent: any, cfr: ComponentFactoryResolver, compContainer: ViewContainerRef, dynaContent: DynaContent = null) {
    // check and resolve the component
    let component = cfr.resolveComponentFactory(ChildComponent);
    // Create component inside container
    let expComp: any = compContainer.createComponent(component);
    let compInstance: any = expComp.instance;
    compInstance._ref = expComp;

    switch (dynaContent.contentType) {
      case CONTENT_TYPES.alert:
        compInstance._id = this.counter;
        compInstance.alertData = dynaContent.contentData;
        this.counter++;
        break;
      default:
        compInstance._dynaContent = dynaContent;
        break;
    }

    return compInstance;
  }
  ////

  centerElement(element: any) {
    let elHalfWidth = Math.trunc(element.width() / 2);
    let windowMid = Math.trunc($(window).width() / 2);

    element.offset({ left: (windowMid - elHalfWidth) });
  }

  isBottomScroll(domElement: any) {
    let elementScroll = domElement.scrollTop();
    let elementHeight = domElement.height();
    let docHeight = domElement.children().first().height();
    if (elementScroll + elementHeight >= docHeight - 10) {
      return true;
    }

    return false;
  }

}