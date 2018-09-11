import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { Alert } from 'selenium-webdriver';
import { Province } from '../../models/province';
import { Select2 } from '../../interfaces/select2.interface';
import { Canton } from '../../models/canton';
import { Parroquia } from '../../models/parroquia';
import { Claim } from '../../models/claim';
import { UserService } from '../../services/user.service';
import { NotifierService } from '../../services/notifier.service';
import { User } from '../../models/user';
import { TypeClaim } from '../../interfaces/type-claim.interface';
import typeClaim from '../../data/type-claim';


@Component({
  selector: 'app-claim-eersa',
  templateUrl: './claim-eersa.component.html',
  styleUrls: ['./claim-eersa.component.css']
})
export class ClaimEersaComponent implements OnInit {
  @Input() actionType: number;
  @Input() userObj: User;
  @Output() closeModal: EventEmitter<boolean>;


  private province: string;
  private canton: string;
  private parroquia: string;
  private claim: string;
  private alertData: Alert;

  public provinceList: Province[];
  public provinceSelect: Select2[];
  public cantonList: Canton[];
  public cantonSelect: Select2[];
  public parroquiaList: Parroquia[];
  public parroquiaSelect: Select2[];
  public claimList: Claim[];
  public dataclaim: TypeClaim[];
  public claimSelect: Select2[];

  constructor(
    private _userService: UserService,
    private _notifierService: NotifierService
  ) { 
    this.closeModal = new EventEmitter<boolean>();
    this.dataclaim = typeClaim;
   
  }

  ngOnInit() { }

  ngAfterViewInit() {
    this.getClaim();
    this.getProvince();
    }
  /**
   * MÉTODO QUE TRAE LAS PROVINCIAS EXISTENTES EN EL SISTEMA
   */
  getProvince() {
    
    this.provinceSelect = [];
    this._userService.getProvinceList().then((qProvinces) => {
      this.provinceList = qProvinces;
      
      for (let type of this.provinceList) {
        
        if (!this.province) {
          this.province = type.id_province;
        }
        this.provinceSelect.push({ value: type.id_province, data: type.name, selectedItem: (this.province == type.id_province) ? this.province : "" });
       // this.userObj.person.parroquia.canton.province.id_province = this.province;
      }
      console.log(this.province);
      if (this.province) {
        this.getCanton(this.province);
      }
    });

  }

  /**
   * MÉTODO QUE TRAE LAS PROVINCIAS EXISTENTES EN EL SISTEMA
   */
  getClaim() {
    this.claimSelect = [];
    console.log(this.dataclaim);
    for (let type of this.dataclaim) {
        if (!this.claim) {
          this.claim = type.idTypeClaim;
        }
        this.claimSelect.push({ value: type.idTypeClaim, data: type.description, selectedItem: (this.claim == type.idTypeClaim) ? this.claim : "" });
      }
  }

  /**
   * METODO QUE CAPTURA LA PROVINCIA DESDE EL SELECT
   * @param event 
   */
  getProvinciaSelect(event: string) {
    this.province = event;
    //this.userObj.person.parroquia.canton.province.id_province = this.province;
    this.cantonSelect = [];
    this.parroquiaSelect = [];
    this.canton = "";
    this.parroquia = "";

    this.getCanton(this.province);
  }

  /**
   * MÉTODO QUE TRAE LAS PROVINCIAS EXISTENTES EN EL SISTEMA
   */
  getCanton(id_provincia: any) {
    this.cantonSelect = [];

    this._userService.getCantonList(id_provincia).then((qCantones) => {
      this.cantonList = qCantones;

      for (let type of this.cantonList) {
        if (!this.canton) {
          this.canton = type.id_canton;
        }

        this.cantonSelect.push({ value: type.id_canton, data: type.name, selectedItem: (this.canton == type.id_canton) ? this.canton : "" });
        //this.userObj.person.parroquia.canton.id_canton = this.canton;
      }

      if (this.canton) {
        console.log("this.parroqu...............");
        this.getParroquia(this.canton);
      }
    });
  }

  /**
 * METODO QUE CAPTURA LA PROVINCIA DESDE EL SELECT
 * @param event 
 */
  getCantonSelect(event: string) {
    this.canton = event;
    this.parroquiaSelect = [];
    this.parroquia = "";
    //this.userObj.person.parroquia.canton.id_canton = this.canton;
    this.getParroquia(this.canton);
  }

  /**
   * MÉTODO QUE TRAE LAS PROVINCIAS EXISTENTES EN EL SISTEMA
   */
  getParroquia(id_canton: any) {
    this.parroquiaSelect = [];
    this._userService.getParroquiaList(id_canton).then((qParroquia: Parroquia[]) => {
      this.parroquiaList = qParroquia;

      for (let parroq of this.parroquiaList) {
        if (!this.parroquia) {
          this.parroquia = parroq.id_parroquia;
        }

        this.parroquiaSelect.push({ value: parroq.id_parroquia, data: parroq.name, selectedItem: (this.parroquia === parroq.id_parroquia) ? this.parroquia : "" });
        //this.userObj.person.parroquia.id_parroquia = this.parroquia;
      }
    });
  }

  /**
   * METODO QUE CAPTURA LA PROVINCIA DESDE EL SELECT
   * @param event 
   */
  getParroquiaSelect(event: string) {
    this.parroquia = event;
    //this.userObj.person.parroquia.id_parroquia = this.parroquia;
  }


}
