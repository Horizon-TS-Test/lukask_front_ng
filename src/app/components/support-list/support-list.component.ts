import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectionStrategy, OnDestroy, Input } from '@angular/core';
import { User } from '../../models/user';
import { SupportersService } from 'src/app/services/supporters.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'support-list',
  templateUrl: './support-list.component.html',
  styleUrls: ['./support-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupportListComponent implements OnInit, OnDestroy {
  @ViewChild("supporters") supporters: ElementRef;
  private suppCotainer: any;

  @Input() pubOwner: string;
  @Input() commentOwner: string;
  @Output() askForMore = new EventEmitter<boolean>();

  private subscriptor: Subscription;
  private LOADER_HIDE: string = "hide";
  private LOADER_ON: string = "on";

  public firstPattern: string;
  public pagePattern: string;

  public supportList: User[];
  public activeClass: string;

  constructor(
    public _supportersService: SupportersService
  ) { }

  ngOnInit() {
    this.suppCotainer = this.supporters.nativeElement;
    this.listenToSuppList();
  }

  /**
   * MÉTODO PARA ESCUCHAR LA LLEGADA DE LA LISTA ACTUALIZADA DE USUARIOS QUE HAN APOYADO LA PUBLICACIÓN O COMENTARIO:
   */
  private listenToSuppList() {
    this.subscriptor = this._supportersService.supportList$.subscribe((suppData) => {
      if (suppData) {
        let loader = this.suppCotainer.querySelector('.bottom-loader');
        let classList = (loader) ? loader.classList : null;

        if (!this.firstPattern) {
          this.firstPattern = suppData.pagePattern
        }
        this.pagePattern = suppData.pagePattern

        if (classList) {
          setTimeout(() => {
            this.activeClass = "";
            classList.remove(this.LOADER_ON);

            setTimeout(() => {
              this.activeClass = this.LOADER_HIDE;
              classList.add(this.LOADER_HIDE);
            }, 800);

          }, 1000)
        }
      }
    });
  }

  /**
   * MÉTODO PARA CARGAR MAS USUARIOS QUEN HAN APOYADO LA PUBLICACIÓN
   * @param event EVENTO DE CLICK DEL ELEMENTO <a href="#">
   */
  public requestForMore(event: any) {
    event.preventDefault();
    if (this.activeClass != this.LOADER_ON) {
      this.activeClass = this.LOADER_ON;
      let loader = this.suppCotainer.querySelector('.bottom-loader');
      let classList = (loader) ? loader.classList : null;

      if (classList) {
        classList.remove(this.LOADER_HIDE);
        classList.add(this.LOADER_ON);
      }

      if (this.pagePattern) {
        this.askForMore.emit(true);
      }
      else {
        this.askForMore.emit(false);
      }
    }
  }

  ngOnDestroy() {
    this.subscriptor.unsubscribe();
  }
}
