import { Component, OnInit, Input } from '@angular/core';
import { User } from '../../models/user';

@Component({
  selector: 'profile-owner',
  templateUrl: './profile-owner.component.html',
  styleUrls: ['./profile-owner.component.css']
})
export class ProfileOwnerComponent implements OnInit {
  @Input() userProfile: User;
  @Input() isCommentProfile: boolean;

  constructor() { }

  ngOnInit() {
  }

}
