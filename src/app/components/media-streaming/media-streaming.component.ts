import { Component, OnInit, Output, EventEmitter, OnChanges, SimpleChanges, Input, OnDestroy } from '@angular/core';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { CAMERA_ACTIONS } from '../../config/camera-actions';
import { MediaFile } from '../../interfaces/media-file.interface';
import { ACTION_TYPES } from '../../config/action-types';
import { CONTENT_TYPES } from '../../config/content-type';
import { Subscription } from '../../../../node_modules/rxjs';
import { UserService } from '../../services/user.service';
import { SocketService } from '../../services/socket.service';
import { Router } from '@angular/router';
import { DynaContentService } from 'src/app/services/dyna-content.service';
import { CommentModalService } from 'src/app/services/comment-modal.service';
import { CameraActionService } from 'src/app/services/camera-action.service';

@Component({
  selector: 'media-streaming',
  templateUrl: './media-streaming.component.html',
  styleUrls: ['./media-streaming.component.css']
})
export class MediaStreamingComponent implements OnInit, OnChanges, OnDestroy {
  @Input() initTrans: boolean;
  @Input() streamOwnerId: string;
  @Input() pubId: string;
  @Input() showClass: string;
  @Output() closeModal = new EventEmitter<any>();

  private subscriber: Subscription;
  private commentSubs: Subscription;
  private ANIMATE_BTN_H: string = "animated-btn-h";
  private ANIMATE_IN: string = "animate-in";
  private ANIMATE_BTN_V: string = "animated-btn-v";
  private ANIMATE_OUT: string = "animate-out";
  private animatedClass: string;

  public cameraActions: any;
  public _ref: any;
  public matButtons: HorizonButton[];
  public defaultView: MediaFile;
  public carouselOptions: any;
  public upcomingAction: number;

  constructor(
    private _dynaContentService: DynaContentService,
    private _userService: UserService,
    private _commentModalService: CommentModalService,
    private _cameraActionService: CameraActionService,
    private _socketService: SocketService,
    private _router: Router
  ) {
    this.cameraActions = CAMERA_ACTIONS;
    this.animatedClass = this.ANIMATE_BTN_H + " " + this.ANIMATE_IN;
    this.upcomingAction = 0;
  }

  ngOnInit() {
    this.initCarousel();
    this.initButtons();
    this.listenToNewComment()
    this.subscribeCommentsModal();
  }

  ngAfterViewInit() { }

  /**
   * MÉTODO PARA INICIALIZAR LOS BOTONES A MOSTRAR EN LA INTERFAZ
   */
  private initButtons() {
    this.matButtons = [
      {
        action: ACTION_TYPES.viewComments,
        icon: 'v',
        customIcon: true,
        class: "custom-btn-normal " + this.animatedClass,
        btnNews: this.upcomingAction
      },
      {
        action: ACTION_TYPES.goHome,
        icon: 'close'
      }
    ];
  }


  /**
   * MÉTODO PARA DETECTAR LA LLEGADA DE UN NUEVO COMENTARIO 
   */
  listenToNewComment() {
    this.commentSubs = this._socketService._commentUpdate.subscribe((socketComment) => {
      if (socketComment.payload.data.publication == this.pubId && socketComment.payload.data.active == true) {
        this.upcomingAction++;
        this.initButtons();
      }
    });
  }

  /**
   * MÉTODO PARA DEFINIR LAS PROPIEDADES DEL CAROUSEL DE SECCIONES:
   */
  private initCarousel() {
    this.carouselOptions = {
      items: 1, dots: false, loop: false, margin: 5,
      nav: false, stagePadding: 0, autoWidth: false
    };
  }

  /**
   * MÉTODO PARA ESCUCHAR CUANDO SE ABRE EL MODAL DE COMENTARIOS DENTRO DEL STREAMING:
   */
  private subscribeCommentsModal() {
    this.subscriber = this._commentModalService.openModal$
      .subscribe((showBtn: boolean) => {
        if (showBtn == false) {
          this.animatedClass = this.ANIMATE_BTN_H + " " + this.ANIMATE_IN;
          this.initButtons();
        }
        else if (showBtn == true) {
          this.animatedClass = this.ANIMATE_BTN_V + " " + this.ANIMATE_OUT;
          this.initButtons();
        }
      });
  }

  /**
   * MÉTODO PARA ENVIAR LAS DISTINTAS ACCIONES A EJECUTAR EN EL STREAMING:
   * @param event 
   * @param action EL TIPO DE ACCIÓN A REALIZAR. VER EL ARCHIVO ../../config/camera-actions.ts
   */
  public sendCameraAction(event: any, action: number) {
    if (event) {
      event.preventDefault();
    }
    if (action === this.cameraActions.stop_transmision) {
      this._userService.onStreaming = false;
      this.closeModal.emit(ACTION_TYPES.close);
    }
    else {
      this._cameraActionService.sendCameraAction(action);
    }
  }

  /**
   * MÉTODO PARA DETECTAR LOS CAMBIOS DE UNA PROPIEDAD INYECTADA DESDE EL COMPONENTE PADRE DE ESTE COMPONENTE:
   * @param changes LOS CAMBIOS GENERADOS
   */
  ngOnChanges(changes: SimpleChanges) {
    for (let property in changes) {
      /*console.log('Previous:', changes[property].previousValue);
      console.log('Current:', changes[property].currentValue);
      console.log('firstChange:', changes[property].firstChange);*/

      switch (property) {
        case 'initTrans':
          if (changes[property].currentValue && changes[property].currentValue == ACTION_TYPES.pubStream) {
            this.sendCameraAction(null, this.cameraActions.init_transmision);
          }
          break;
        case 'pubId':
          if (changes[property].currentValue) {
            this.pubId = changes[property].currentValue;
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

  /**
   * MÉTODO PARA ESCUCHAR LA ACCIÓN DEL EVENTO DE CLICK DE UN BOTÓN DINÁMICO:
   */
  public getButtonAction(actionEvent: number) {
    switch (actionEvent) {
      case ACTION_TYPES.viewComments:
        this._dynaContentService.loadDynaContent({ contentType: CONTENT_TYPES.view_comments, contentData: { pubId: this.pubId, halfModal: true, transparent: true, hideBtn: true } });
        this.upcomingAction = 0;
        this.initButtons();
        break;
      case ACTION_TYPES.goHome:
        this._userService.onStreaming = false;
        this._router.navigate(['/']);
        break;
    }
  }

  ngOnDestroy() {
    this.subscriber.unsubscribe();
    /*this.commentSubs.unsubscribe();*/
  }
}
