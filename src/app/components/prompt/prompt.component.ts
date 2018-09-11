import { Component, OnInit, AfterViewInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-prompt',
  templateUrl: './prompt.component.html',
  styleUrls: ['./prompt.component.css']
})
export class PromptComponent implements OnInit, AfterViewInit {
  @Output() letsUpdate: EventEmitter<boolean>;

  public backgroundClass: string;
  public visibleClass: string;

  constructor() {
    this.letsUpdate = new EventEmitter<boolean>();
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.backgroundClass = "on";
      this.visibleClass = "is-visible"
    }, 3500);
  }

  /**
   * MÉTODO PARA PROPAGAR LA ACTUALIZACIÓN DEL SERVICE WORKER AL DAR CLICK EN EL BOTÓN OK
   */
  onUpdateClick(event: any) {
    event.preventDefault();
    this.letsUpdate.emit(true);
  }
}
