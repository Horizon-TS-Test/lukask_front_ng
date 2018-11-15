import { Component, OnInit } from '@angular/core';
import { Select2 } from '../../interfaces/select2.interface';
import { Canton } from '../../models/canton';
import { Parroquia } from '../../models/parroquia';
import { Province } from '../../models/province';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { claimType } from '../../interfaces/claim-type.interface';
import { BarrioInterface } from '../../interfaces/barrio-data.interface';
import barrioData from '../../data/barrio-data';
import { LocationService } from 'src/app/services/location.service';
import { EersaLocation } from 'src/app/models/eersa-location';

@Component({
  selector: 'claim-location-frm',
  templateUrl: './claim-location-frm.component.html',
  styleUrls: ['./claim-location-frm.component.css']
})
export class ClaimLocationFrmComponent implements OnInit {
  private province: string;
  private canton: string;
  private parroquia: string;

  public userObj: User;
  public eersaLocation: EersaLocation;

  public provinceList: Province[];
  public provinceSelect: Select2[];
  public cantonList: Canton[];
  public cantonSelect: Select2[];
  public parroquiaList: Parroquia[];
  public parroquiaSelect: Select2[];
  public barrioList: BarrioInterface[];
  public barrioSelect: Select2[];

  constructor(
    private _userService: UserService,
    private _locationService: LocationService
  ) { }

  ngOnInit() {
    this.userObj = this._userService.getUserProfile();
    this.eersaLocation = new EersaLocation(null, 0, null);

    //PROVISIONAL:
    this.barrioList = barrioData;
    this.barrioSelect = [];
    for (let barrio of this.barrioList) {
      this.barrioSelect.push({ value: barrio.barrioId, data: barrio.description });
    }
    ////
  }

  ngAfterViewInit() {
    this.province = this.userObj.person.parroquia.canton.province.id_province;
    this.canton = this.userObj.person.parroquia.canton.id_canton;
    this.parroquia = this.userObj.person.parroquia.id_parroquia;
    this.getProvince();
  }

  /**
   * MÉTODO QUE TRAE LAS PROVINCIAS EXISTENTES EN EL SISTEMA
   */
  getProvince() {
    this.provinceSelect = [];

    this._locationService.getProvinceList().then((qProvinces) => {
      this.provinceList = qProvinces;
      for (let type of this.provinceList) {
        if (!this.province) {
          this.province = type.id_province;
        }

        this.provinceSelect.push({ value: type.id_province, data: type.name, selectedItem: (this.province == type.id_province) ? this.province : "" });
      }

      if (this.province) {
        this.getCanton(this.province);
      }
    });

  }

  /**
   * MÉTODO QUE CAPTURA LA PROVINCIA DESDE EL SELECT
   * @param event 
   */
  getProvinciaSelect(event: string) {
    this.province = event;
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

    this._locationService.getCantonList(id_provincia).then((qCantones) => {
      this.cantonList = qCantones;

      for (let type of this.cantonList) {
        if (!this.canton) {
          this.canton = type.id_canton;
        }

        this.cantonSelect.push({ value: type.id_canton, data: type.name, selectedItem: (this.canton == type.id_canton) ? this.canton : "" });
      }

      if (this.canton) {
        this.getParroquia(this.canton);
      }
    });
  }

  /**
 * MÉTODO QUE CAPTURA LA PROVINCIA DESDE EL SELECT
 * @param event 
 */
  getCantonSelect(event: string) {
    this.canton = event;
    this.parroquiaSelect = [];
    this.parroquia = "";
    this.getParroquia(this.canton);
  }

  /**
   * MÉTODO QUE TRAE LAS PROVINCIAS EXISTENTES EN EL SISTEMA
   */
  getParroquia(id_canton: any) {
    this.parroquiaSelect = [];
    this._locationService.getParroquiaList(id_canton).then((qParroquia: Parroquia[]) => {
      this.parroquiaList = qParroquia;

      for (let parroq of this.parroquiaList) {
        if (!this.parroquia) {
          this.parroquia = parroq.id_parroquia;
        }

        this.parroquiaSelect.push({ value: parroq.id_parroquia, data: parroq.name, selectedItem: (this.parroquia === parroq.id_parroquia) ? this.parroquia : "" });
      }
    });
  }

  /**
   * MÉTODO QUE CAPTURA LA PROVINCIA DESDE EL SELECT
   * @param event 
   */
  getParroquiaSelect(event: string) {
    this.parroquia = event;
  }

  /**
   * MÉTODO QUE CAPTURA EL BARRIO DESDE EL SELECT
   * @param event 
   */
  getbarrioSelect(event: number) {
    this.eersaLocation.idbarrio = event;
  }

}
