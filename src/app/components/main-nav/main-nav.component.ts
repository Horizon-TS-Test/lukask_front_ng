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

  constructor() {
  }

  ngOnInit() {
    $("#menu-nav").on("click", function () {
      if (!$(".top-panel").hasClass("slide-in")) {
        $(".top-panel").addClass("slide-in");
        $(".bot-panel").addClass("slide-in");
      }
      else {
        $(".top-panel").removeClass("slide-in");
        $(".bot-panel").removeClass("slide-in");
      }
    });
  }

}
