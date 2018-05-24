import { Component, OnInit } from '@angular/core';
import { ContentService } from '../../services/content.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {
  private contentTypes: any;

  constructor(
    private _contentService: ContentService,

  ) { }

  ngOnInit() {
    this._contentService.fadeInComponent();
  }
}
