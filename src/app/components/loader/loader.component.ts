import { Component, OnInit, Input } from '@angular/core';
import { ASSETS } from 'src/app/config/assets-url';

@Component({
  selector: 'loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit {
  @Input() normalLoader: boolean;
  @Input() fullScreen: boolean;
  public preloader: string;

  constructor() {
    this.preloader = ASSETS.preloader;
  }

  ngOnInit() {
  }

}
