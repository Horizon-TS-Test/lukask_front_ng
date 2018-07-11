import { Injectable, ComponentFactoryResolver, ViewContainerRef, ViewChild } from '@angular/core';
import { DynaContent } from '../interfaces/dyna-content.interface';
import { CONTENT_TYPES } from '../config/content-type';

declare var $: any;

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private counter: number;
  private VERTICAL_SCROLL: number = 0;
  private HORIZONTAL_SCROLL: number = 1;

  constructor() { }

  /**
   * MÉTODO PARA OCULTAR LA PORTADA LUEGO DE UN TIEMPO DEFINIDO:
   */
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

  /**
   * MÉTODO PARA DAR UN EFECTO FADE-IN A UN COMPONENTE AL ABRIRSE POR PRIMERA VEZ:
   */
  fadeInComponent(component: any) {
    setTimeout(() => {
      if (!component.hasClass("personal-fadein")) {
        component.addClass("personal-fadein");
      }
    }, 0);
  }

  /**
   * MÉTODO PARA DAR UN EFECTO SLIDE DOWN-UP A UN ELEMENTO DEL DOM, 
   * GENERALMENTE USADO EN LA APERTURA DE UN HORIZON MODAL
   * @param contentLayer EL ELEMENTO A APLICAR EL EFECTO TRANSITORIO
   * @param slideUp TRUE PARA MOSTRAR EL ELEMENTO, CON EFECTO TRANSITORIO / FALSE PARA OCULTAR EL ELEMENTO, CON EFECTO TRANSITORIO
   */
  slideDownUp(contentLayer, slideUp: boolean = true) {
    if (slideUp) {
      if (!contentLayer.hasClass("show-dyna-cont")) {
        contentLayer.parent().find(".fixed-background").addClass("on");
        contentLayer.addClass("show-dyna-cont");
        contentLayer.find(".personal-dyna-down").addClass("show");
        contentLayer.find(".personal-material-btn").addClass("show");
      }
    }
    else {
      if (contentLayer.hasClass("show-dyna-cont")) {
        contentLayer.parent().find(".fixed-background").removeClass("on");
        contentLayer.removeClass("show-dyna-cont");
        contentLayer.find(".personal-dyna-down").removeClass("show");
        contentLayer.find(".personal-material-btn").removeClass("show");
      }
    }
  }

  /**
   * MÉTODO PARA AÑADIR DINÁMICAMENTE UN COMPONENTE E INCRUSTARLO EN EL DOM A TRAVÉS DE CÓDIGO TYPESCRIPT:
   */
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

  /**
   * MÉTODO PARA CENTRAR HORIZONTALMENTE CUALQUIER ELEMENTO DEL DOM
   * @param element ELEMENTO A SER CENTRADO
   */
  centerElement(element: any) {
    let elHalfWidth = Math.trunc(element.width() / 2);
    let windowMid = Math.trunc($(window).width() / 2);

    element.offset({ left: (windowMid - elHalfWidth) });
  }

  /**
   * MÉTODO PARA VERIFICAR SI EL SCROLL ESTÁ AL FINAL DE UN ELEMENTO DEL DOM:
   * @param domElement ELEMENTO A VERIFICAR SI EL SCROLL ESTÁ AL FINAL DEL MISMO
   */
  isBottomScroll(domElement: any) {
    let elementScroll = domElement.scrollTop();
    let elementHeight = domElement.height();
    let docHeight = 0;

    domElement.children().first().children().each((index, element) => {
      docHeight = docHeight + $(element).height();
    });

    if (elementScroll + elementHeight >= docHeight - 10) {
      return true;
    }

    return false;
  }

  /**
   * MÉTODO PARA DESPLAZAR EL SCROLL HACIA UN COMPONENTE ESPECÍFICO DEL DOM:
   * @param hrefValue ID DEL COMPONENTE DE REFERENCIA
   */
  goToLocalContent(hrefValue: any) {
    event.preventDefault();
    $.smoothScroll({
      scrollTarget: hrefValue,
      speed: 1200,
    });
  }
  ////

  /**
   * MÉTODO PARA DAR SCROLL DENTRO DE UN COMPONENTE DEL DOM:
   * @param element ELEMENTO A DAR SCROLL DENTRO
   * @param offset DISTANCIA A DAR SCROL DENTO DEL ELEMENTO
   * @param option SI ES UN SCROLL VERTICAL U HORIZONTAL
   * @param speedSec TIEMPO DE LA ANIMACIÓN EN MILI SEGUNDOS
   * @param animate TRUE CON EFECTO DE ANIMACIÓN / FALSE SIN EFECTO DE ANIMACIÓN
   */
  elementScrollInside(element: any, offset: number, option: number = this.VERTICAL_SCROLL, speedSec: number = 1000, animate: boolean = true) {
    //REF: https://stackoverflow.com/questions/23305033/smooth-scrolling-within-element-only-first-link-anchor-works
    switch (option) {
      default:
        if (animate == true) {
          $(element).animate({
            scrollTop: offset
          }, speedSec);
        }
        else {
          $(element).scrollTop(offset);
        }
        break;
      case this.HORIZONTAL_SCROLL:
        if (animate == true) {
          $(element).animate({
            scrollLeft: offset
          }, speedSec);
        }
        else {
          $(element).scrollLeft(offset);
        }
        break;
    }
  }

  /**
   * MÉTODO PARA DAR FOCUS A UNA OPCIÓN DE UN MENÚ
   * @param navContainer ELEMENTO DEL DOM QUE CONTIENE LAS OPCIONES DE NAVEGACIÓN
   * @param idContent ID HTML DE LA OPCIÓN SELECCIONADA
   */
  focusMenuOption(navContainer: any, idContent: string) {
    let optionLeft = 0;
    let menuFocus = navContainer.find(".menu-focus");

    navContainer.find("a").each((index, element) => {
      if ($(element).attr("id") === idContent) {
        $(element).addClass("focused");
        $(element).siblings().removeClass("focused");
        menuFocus.css({
          left: optionLeft,
          width: $(element).width()
        });

        return false;
      }
      else {
        optionLeft += $(element).width();
      }
    });
  }

  /**
   * MÉTODO PARA OCULTAR O MOSTRAR EL SCROLL DEL BODY PRINCIPAL AL ABRIR O CERRAR UN HORIZON-MODAL
   * @param hide 
   */
  public manageBodyOverflow(hide: boolean = false) {
    if (!hide) {
      if (!$("body").hasClass("p-body-overflow")) {
        $("body").addClass("p-body-overflow");
      }
    }
    else {
      if ($("body").hasClass("p-body-overflow")) {
        $("body").removeClass("p-body-overflow");
      }
    }
  }

}