import { Component, OnInit } from '@angular/core';
import { DynaContent } from '../../interfaces/dyna-content.interface';
import { Publication } from '../../models/publications';
import { QuejaService } from '../../services/queja.service';
import { QuejaType } from '../../models/queja-type';
import { User } from '../../models/user';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-queja-detail',
  templateUrl: './queja-detail.component.html',
  styleUrls: ['./queja-detail.component.css']
})
export class QuejaDetailComponent implements OnInit {
  private self: any;
  public _ref: any;
  public _dynaContent: DynaContent;
  public quejaDetail: Publication;

  constructor(
    private _quejaService: QuejaService,
    private _domSanitizer: DomSanitizer
  ) {
    this.quejaDetail = new Publication(null, null, null, null, null, null, null, new QuejaType(null, null), new User(null, null));
  }

  ngOnInit() {
    this._quejaService.getPubById(this._dynaContent.contentData)
      .then((pub: Publication) => {
        this.quejaDetail = pub;
      }).catch(error => console.log(error));
  }

  ngAfterViewInit() { }

  removeObject() {
    this._ref.destroy();
  }

}
