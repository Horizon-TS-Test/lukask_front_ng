import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'claim-user-data',
  templateUrl: './claim-user-data.component.html',
  styleUrls: ['./claim-user-data.component.css']
})
export class ClaimUserDataComponent implements OnInit {

  public userData: User;

  constructor(
    private _userService: UserService
  ) { }

  ngOnInit() {
    this.userData = this._userService.getUserProfile();
  }

}
