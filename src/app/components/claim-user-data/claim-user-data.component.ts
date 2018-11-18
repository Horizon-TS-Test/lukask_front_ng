import { Component, OnInit, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { UserService } from '../../services/user.service';
import { EersaClient } from 'src/app/models/eersa-client';

@Component({
  selector: 'claim-user-data',
  templateUrl: './claim-user-data.component.html',
  styleUrls: ['./claim-user-data.component.css']
})
export class ClaimUserDataComponent implements OnInit, AfterViewInit {
  @Output() onReceiveClient: EventEmitter<EersaClient>;

  public eersaCliente: EersaClient;

  constructor(
    private _userService: UserService
  ) {
    this.onReceiveClient = new EventEmitter<EersaClient>();
  }

  ngOnInit() {
    this.eersaCliente = new EersaClient('127290', '7836', this._userService.getUserProfile());
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.onReceiveClient.emit(this.eersaCliente);
    }, 1000);
  }

}
