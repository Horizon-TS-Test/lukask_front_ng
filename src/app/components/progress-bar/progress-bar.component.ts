import { Component, OnInit, Input, Output, OnDestroy, EventEmitter } from '@angular/core';
import { DynaContentService } from 'src/app/services/dyna-content.service';
import { CONTENT_TYPES } from '../../config/content-type';
import { Subscription } from 'rxjs';
import { DynaContent } from '../../interfaces/dyna-content.interface';

@Component({
  selector: 'progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.css']
})

export class ProgressBarComponent implements OnInit, OnDestroy {

  @Input() typeProgess: any;
  @Output() closePop = new EventEmitter<boolean>();

  public progress:number;
  private subscriberAction: Subscription;
  private interval:any;

  constructor(
    private _dynaContentService: DynaContentService
  ) { 
    this.progress = 0;
  }

  ngOnInit() {
    this.subscribeAction();
    this.advancedProgressBar(0);
  }

  /**
   * Metodo que se subscribe y escucha acciones desde el componente que lo invoco
   */
  private subscribeAction() {
    
    this.subscriberAction = this._dynaContentService.actionInContent$.subscribe((dynaContent: DynaContent) => {
      
      console.log("dynaContent............... progress bar component", dynaContent);
      if (dynaContent && (dynaContent.contentType == CONTENT_TYPES.progress_bar)) {
        
        switch (dynaContent.contentData.method) {
          case 'close':
            
            this.advancedProgressBar(100);
            break;
          case 'advanceProgress':
            
            this.advancedProgressBar(dynaContent.contentData.value);
            break;
        }
      }
    })
  }

  /**
   * Recalcula el avance del progress-bar 
   * @param percentage {procentage de avance del progress-bar}
   */
  private  advancedProgressBar(percentage: number) {
    console.log("advancedProgressBar..", percentage);

    this.progress = percentage;
    if(this.progress == 0){
      
      this.interval = setInterval(()=>{
        
        this.progress  ++;
        if(this.progress === 90){
          clearInterval(this.interval);
        }
      }, 500)
    }else{
      
      clearInterval(this.interval);
      this.progress = percentage;
      this.closePop.emit(true);
    }
  }

  ngOnDestroy(){
    clearInterval(this.interval);
    this._dynaContentService.removeDynaContent(false);
    this._dynaContentService.executeAccion(null);
    this.subscriberAction.unsubscribe();
  }
}
