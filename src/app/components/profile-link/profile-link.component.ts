import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from '../../../../node_modules/@angular/platform-browser';
import { User } from '../../models/user';

@Component({
  selector: 'profile-link',
  templateUrl: './profile-link.component.html',
  styleUrls: ['./profile-link.component.css']
})
export class ProfileLinkComponent implements OnInit {
  @Input() userProfile: User;
  @Input() isCommentProfile: boolean;
  @Input() profileClass: string;

  public secProfileImg: any;

  constructor(
    private _domSanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.secProfileImg = this._domSanitizer.bypassSecurityTrustStyle('url(' + this.userProfile.profileImg + ')');
  }

  /**
   * MÉTODO PARA VER LA INFORMACIÓN DE UN PERFIL DE USUARIO:
   * @param event 
   */
  public viewProfile(event: any) {
    event.preventDefault();

    ///PROCESO PARA VER EL PERFIL DE USUARIO
  }
}
