import { Component, OnInit, Input } from '@angular/core';
import { Queja } from '../../interfaces/queja.interface';
import { DomSanitizer } from '@angular/platform-browser';
import { Publication } from '../../models/publications';

@Component({
  selector: 'app-queja',
  templateUrl: './queja.component.html',
  styleUrls: ['./queja.component.css']
})
export class QuejaComponent implements OnInit {
  @Input() queja: Publication;

  constructor(
    public _domSanitizer: DomSanitizer
  ) { }

  ngOnInit() {
  }

}
