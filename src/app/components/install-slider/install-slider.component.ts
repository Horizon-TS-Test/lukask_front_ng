import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Install } from '../../interfaces/install.interface';
import installSlider from '../../data/install-slider';
import { interval } from 'rxjs';

@Component({
  selector: 'install-slider',
  templateUrl: './install-slider.component.html',
  styleUrls: ['./install-slider.component.css']
})
export class InstallSliderComponent implements OnInit, OnDestroy {

  private activeClass: string;
  private position: number;
  private timeInterval: any;
  private relClass: string;

  public installSliderData: Install[];

  constructor(
    private _ngZone: NgZone
  ) {
    this.installSliderData = installSlider;
    this.relClass = "sl-relative";
    this.position = 0;
    this.activeClass = this.installSliderData[this.position].class;
  }

  ngOnInit() {
    //REF: https://github.com/angular/angular/issues/20970
    this._ngZone.runOutsideAngular(() => {
      interval(4000).subscribe(() => {
        this._ngZone.run(() => {
          if (this.position + 1 == this.installSliderData.length) {
            this.position = 0;
          }
          else {
            this.position++;
          }
          this.goForward();
        })
      })
    });
  }

  /**
   * METODO PARA SEGUIR CON LA SIGUIENTE PRESENTACIÓN DEL SLIDER:
   */
  goForward() {
    if (this.position > 0) {
      this.installSliderData[this.position - 1].class = this.relClass;
    }
    else {
      this.installSliderData[this.installSliderData.length - 1].class = this.relClass;
    }
    setTimeout(() => {
      if (this.position > 0) {
        this.installSliderData[this.position - 1].class = '';
      }
      else {
        this.installSliderData[this.installSliderData.length - 1].class = ''
      }
      this.installSliderData[this.position].class = this.activeClass;
    }, 100);
  }

  ngOnDestroy() {
    clearInterval(this.timeInterval);
  }
}
