import { Component, OnInit } from '@angular/core';

import { Nav } from '../../interfaces/nav.interface';

declare var $: any;

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.css']
})
export class MainNavComponent implements OnInit {
  public mainNav: Nav[];
  public newEntries: boolean;
  public entriesNumber: number;

  constructor() {
    this.newEntries = true;
    this.entriesNumber = 0;
  }

  ngOnInit() {
  }

  public openPanel(event: any) {
    event.preventDefault();
    if (!$(".top-panel").hasClass("slide-in")) {
      this.newEntries = false;
      $(".top-panel").addClass("slide-in");
      $(".bot-panel").addClass("slide-in");
    }
    else {
      this.newEntries = true;
      $(".top-panel").removeClass("slide-in");
      $(".bot-panel").removeClass("slide-in");
    }
  }

}
