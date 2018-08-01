import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { HorizonButton } from '../../interfaces/horizon-button.interface';
import { ACTION_TYPES } from '../../config/action-types';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'support-list',
  templateUrl: './support-list.component.html',
  styleUrls: ['./support-list.component.css']
})
export class SupportListComponent implements OnInit, AfterViewInit {
  @Input() pubId: string;
  @Input() commentId: string;
  @Input() pubOwner: string;
  @Input() commentOwner: string;
  @Output() closeModal = new EventEmitter<boolean>();

  private LOADER_HIDE: string = "hide";
  private LOADER_ON: string = "on";

  public firstPattern: string;
  public pagePattern: string;

  public supportList: User[];
  public activeClass: string;
  public matButtons: HorizonButton[];

  constructor(
    private _userService: UserService
  ) { }

  ngAfterViewInit() {
    this._userService.getUserSupporters(this.pubId ? this.pubId : this.commentId, this.pubId ? false : true)
      .then((supData: any) => {
        this.supportList = supData.supporters;
        this.firstPattern = supData.pagePattern;
        this.pagePattern = supData.pagePattern;
      });
  }

  /**
   * MÉTODO PARA CARGAR MAS USUARIOS QUEN HAN APOYADO LA PUBLICACIÓN
   * @param event EVENTO DE CLICK DEL ELEMENTO <a href="#">
   */
  askForMore(event: any) {
    event.preventDefault();
    if (this.activeClass != this.LOADER_ON) {
      this.activeClass = this.LOADER_ON;
      if (this.pagePattern) {
        this._userService.getUserSupporters(this.pubId ? this.pubId : this.commentId, this.pubId ? false : true, this.pagePattern, true)
          .then((supData: any) => {
            setTimeout(() => {
              this.activeClass = "";

              setTimeout(() => {
                this.activeClass = this.LOADER_HIDE;
                this.supportList = this.supportList.concat(supData.supporters);
                this.pagePattern = supData.pagePattern;
              }, 800);

            }, 1000)
          })
          .catch(err => {
            console.log(err);

            setTimeout(() => {
              this.activeClass = "";

              setTimeout(() => {
                this.activeClass = this.LOADER_HIDE;
              }, 800);
            }, 1000)
          });
      }
      else {
        setTimeout(() => {
          this.activeClass = "";

          setTimeout(() => {
            this.pagePattern = this.firstPattern;
            this.activeClass = this.LOADER_HIDE;
            this.supportList.splice(this._userService.pageLimit, this.supportList.length - this._userService.pageLimit);
          }, 800);
        }, 1000)
      }
    }
  }

  ngOnInit() {
  }

}
