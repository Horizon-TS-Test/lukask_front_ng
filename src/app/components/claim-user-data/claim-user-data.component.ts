import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { EersaClient } from 'src/app/models/eersa-client';

@Component({
  selector: 'claim-user-data',
  templateUrl: './claim-user-data.component.html',
  styleUrls: ['./claim-user-data.component.css']
})
export class ClaimUserDataComponent implements OnInit {

  public eersaCliente: EersaClient;

  constructor(
    private _userService: UserService
  ) { }

  ngOnInit() {
    this.eersaCliente = new EersaClient('127290', '7836', this._userService.getUserProfile());
  }

}
