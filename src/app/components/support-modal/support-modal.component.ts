import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { User } from 'src/app/models/user';
import { SupportersService } from 'src/app/services/supporters.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'support-modal',
  templateUrl: './support-modal.component.html',
  styleUrls: ['./support-modal.component.css']
})
export class SupportModalComponent implements OnInit, OnDestroy {
  @Input() pubId: string;
  @Input() commentId: string;
  @Input() pubOwner: string;
  @Input() commentOwner: string;

  private firstPattern: string;
  private pagePattern: string;
  private supportList: User[];

  constructor(
    private _userService: UserService,
    private _supportersService: SupportersService
  ) { }

  ngOnInit() {
    this.getSuppList();
  }

  /**
   * METODO PARA OBTENER LA LISTA DE USUARIOS QUE HAN APOYADO UNA PUBLICACIÓN 
   */
  private getSuppList() {
    this._userService.getUserSupporters(this.pubId ? this.pubId : this.commentId, this.pubId ? false : true)
      .then((supData: any) => {
        this.firstPattern = supData.pagePattern;
        this.pagePattern = supData.pagePattern;
        this.supportList = supData.supporters;

        this._supportersService.loadSuppList({ supporters: this.supportList, pagePattern: this.pagePattern });
      });
  }

  /**
   * METODO PARA OBTENER MAS USUARIOS QUE HAN APOYADO LA PUBLICACIÓN O COMENTARIO:
   */
  private getMoreSupporters() {
    this._userService.getUserSupporters(this.pubId ? this.pubId : this.commentId, this.pubId ? false : true, this.pagePattern, true)
      .then((supData: any) => {
        this.pagePattern = supData.pagePattern;
        this.supportList = this.supportList.concat(supData.supporters);

        this._supportersService.loadSuppList({ supporters: this.supportList, pagePattern: this.pagePattern });
      });
  }

  /**
   * METODO PARA ESCUCHAR LA PETICIÓN DE OBTENER MAS USUARIOS QUEN HAN APOYADO LA PUBLICACIÓN:
   */
  public askForMore(event: boolean) {
    if (event) {
      this.getMoreSupporters();
    }
    else {
      this.pagePattern = this.firstPattern;
      this.supportList.splice(this._userService.pageLimit, this.supportList.length - this._userService.pageLimit);

      this._supportersService.loadSuppList({ supporters: this.supportList, pagePattern: this.pagePattern });
    }
  }

  ngOnDestroy() {
    this._supportersService.loadSuppList(null);
  }

}
