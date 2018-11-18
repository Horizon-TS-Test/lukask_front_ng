import { Component, OnInit } from '@angular/core';
import { ASSETS } from 'src/app/config/assets-url';

@Component({
  selector: 'loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit {
  public preloader: string;

  constructor() {
    this.preloader = ASSETS.preloader;
  }

  ngOnInit() {
  }

}
