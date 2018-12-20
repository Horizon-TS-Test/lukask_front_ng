import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { HorizonButton } from '../../interfaces/horizon-button.interface';

@Component({
  selector: 'material-btn-list',
  templateUrl: './material-btn-list.component.html',
  styleUrls: ['./material-btn-list.component.css']
})
export class MaterialBtnListComponent implements OnInit, OnChanges {
  @Input() materialBtns: HorizonButton[];
  @Input() isModal: boolean;
  @Input() animateNext: any;
  @Input() showClass: string;
  @Output() someBtnAction: EventEmitter<number>;

  constructor() {
    this.someBtnAction = new EventEmitter<number>();
  }

  ngOnInit() {
  }

  /**
   * METODO PARA ESCUCHAR LOS EVENTOS DE CLICK DE UN BOTÓN HIJO:
   * @param actionEvent VALOR QUE VIENE DESDE UN EVENT EMITTER
   */
  childRequestAction(actionEvent: number) {
    this.someBtnAction.emit(actionEvent);
  }

  /**
   * METODO PARA ACTIVAR ANIMACIÓN PARA CAMBIO DE BOTONES EN LA LISTA:
   * @param next 
   */
  private aplyBtnAnimation(next: boolean) {
    let animatePromise: any;
    for (let i = 0; i < this.materialBtns.length; i++) {
      if (this.materialBtns[i].class && this.materialBtns[i].class.indexOf("animated-btn") !== -1 && this.materialBtns[i].class.indexOf("animate-in") !== -1) {
        if (next == false) {
          if (this.materialBtns[i - 1] && this.materialBtns[i - 1].class && this.materialBtns[i - 1].class.indexOf("animated-btn") !== -1 && this.materialBtns[i - 1].class.indexOf("animate-in") === -1) {
            this.materialBtns[i].class = this.materialBtns[i].class.replace("animate-in", "");
            animatePromise = new Promise((resolve, reject) => {
              setTimeout(() => {
                this.materialBtns[i - 1].class += " animate-in";
                resolve(true);
              }, 300);
            });

            animatePromise.then((isAnimated) => {
              if (isAnimated) {
                i = this.materialBtns.length;
              }
            });
          }
        }
        else if (next == true) {
          if (this.materialBtns[i + 1] && this.materialBtns[i + 1].class && this.materialBtns[i + 1].class.indexOf("animated-btn") !== -1 && this.materialBtns[i + 1].class.indexOf("animate-in") === -1) {
            this.materialBtns[i].class = this.materialBtns[i].class.replace("animate-in", "");
            animatePromise = new Promise((resolve, reject) => {
              setTimeout(() => {
                this.materialBtns[i + 1].class += " animate-in";
                resolve(true);
              }, 300);
            });

            animatePromise.then((isAnimated) => {
              if (isAnimated) {
                i = this.materialBtns.length;
              }
            });
          }
        }
      }
    }
  }

  /**
   * METODO PARA ESCUCHAR LOS CAMBIOS QUE SE DEN EN EL ATRIBUTO QUE VIENE DESDE EL COMPONENTE PADRE:
   * @param changes 
   */
  ngOnChanges(changes: SimpleChanges) {
    for (const property in changes) {
      /*console.log('Previous:', changes[property].previousValue);
      console.log('Current:', changes[property].currentValue);
      console.log('firstChange:', changes[property].firstChange);*/
      switch (property) {
        case 'animateNext':
          if (changes[property].currentValue !== undefined) {
            this.aplyBtnAnimation(changes[property].currentValue);
          }
          break;
        case 'showClass':
          if (changes[property].currentValue) {
            this.showClass = changes[property].currentValue;
          }
          break;
      }
    }
  }
}
