import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { DynaContent } from '../../interfaces/dyna-content.interface';
import { Publication } from '../../models/publications';
import { QuejaService } from '../../services/queja.service';
import { QuejaType } from '../../models/queja-type';
import { User } from '../../models/user';
import { DomSanitizer } from '@angular/platform-browser';
import { HorizonButton } from '../../interfaces/horizon-button.interface';

@Component({
  selector: 'queja-detail',
  templateUrl: './queja-detail.component.html',
  styleUrls: ['./queja-detail.component.css']
})
export class QuejaDetailComponent implements OnInit {
  @Input() idQueja: string;
  @Output() closeModal: EventEmitter<boolean>;

  private self: any;
  public _ref: any;
  private _CLOSE = 1;

  public quejaDetail: Publication;
  public matButtons: HorizonButton[];

  constructor(
    private _quejaService: QuejaService,
    public _domSanitizer: DomSanitizer
  ) {
    this.quejaDetail = new Publication(null, null, null, null, null, null, null, new QuejaType(null, null), new User(null, null));
    this.closeModal = new EventEmitter<boolean>();
    this.matButtons = [
      {
        parentContentType: 1,
        action: this._CLOSE,
        icon: "close"
      }
    ];
  }

  ngOnInit() {
    this._quejaService.getPubById(this.idQueja)
      .then((pub: Publication) => {
        this.quejaDetail = pub;
      }).catch(error => console.log(error));
  }

  ngAfterViewInit() { }

  removeObject() {
    this._ref.destroy();
  }

  /**
   * MÉTODO PARA ESCUCHAR LA ACCIÓN DEL EVENTO DE CLICK DE UN BOTÓN DINÁMICO:
   */
  getButtonAction(actionEvent: number) {
    switch (actionEvent) {
      case this._CLOSE:
        this.closeModal.emit(true);
        break;
    }
  }

}
