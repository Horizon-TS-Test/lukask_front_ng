import { Component, OnInit, OnDestroy, AfterViewInit, NgZone } from '@angular/core';
import { interval } from 'rxjs';
import { ContentService } from '../../services/content.service';

declare var $: any;

@Component({
  selector: 'app-init',
  templateUrl: './init.component.html',
  styleUrls: ['./init.component.css']
})
export class InitComponent implements OnInit, OnDestroy, AfterViewInit {

  private counter: number;
  private timeInterval: any;

  public dots: string;

  constructor(
    private _contentService: ContentService,
    private _ngZone: NgZone
  ) {
    this.initDots();
  }

  /**
   * METODO PARA INICIALIZAR LA ANIMACIÓN DE PUNTOS:
   */
  initDots() {
    this.dots = '.';
    this.counter = 0;
  }

  ngAfterViewInit() {
  }

  ngOnInit() {
    this._contentService.fadeInComponent($("#initInstall"));
    //REF: https://github.com/angular/angular/issues/20970
    this._ngZone.runOutsideAngular(() => {
      interval(500).subscribe(() => {
        this._ngZone.run(() => {
          if (this.counter < 3) {
            this.dots += '.';
            this.counter++;
          }
          else {
            this.initDots();
          }
        });
      });
    });
  }

  ngOnDestroy() {
    clearInterval(this.timeInterval);
  }
}
