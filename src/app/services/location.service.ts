import { Injectable } from '@angular/core';
import { Headers, Response, Http } from '@angular/http';
import { Province } from '../models/province';
import { Canton } from '../models/canton';
import { Parroquia } from '../models/parroquia';
import { Person } from '../models/person';
import { REST_SERV } from '../rest-url/rest-servers';

declare var readAllData: any;

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private isFetchedProvince: boolean;
  private isFetchedCanton: boolean;
  private isFetchedParroquia: boolean;

  constructor(
    private _http: Http,
  ) {
    this.isFetchedProvince = false;
    this.isFetchedCanton = false;
    this.isFetchedParroquia = false;
  }

  /**
   * METODO PARA OBTENER LAS PROVINCIAS SEA DE LA WEB O DE LA CACHÉ
   * */
  public getProvinceList() {
    return this.getProvinceWeb().then((webProvince: Province[]) => {
      if (!this.isFetchedProvince) {
        return this.getProvinceCache().then((cacheProvince: Province[]) => {
          return cacheProvince;
        });
      }
      else {
        this.isFetchedProvince = false;
      }

      return webProvince;
    }).catch((error: Response) => {
      if (error.json().code == 401) {
        localStorage.clear();
      }
      console.log(error.json());
    });
  }

  /**
   * METODO PARA CARGAR LAS PROVINCIAS DESDE LA WEB
   */
  private getProvinceWeb() {
    const qTheaders = new Headers({ 'Content-Type': 'application/json' });

    return this._http.get(REST_SERV.provinceUrl, { headers: qTheaders, withCredentials: true }).toPromise()
      .then((response: Response) => {
        const provinces = response.json().data;
        let transformedProvinces: Province[] = [];
        for (let prov of provinces) {
          transformedProvinces.push(new Province(prov.id_province, prov.description_province));
        }
        this.isFetchedProvince = true;
        console.log("[LUKASK USER SERVICE] - PROVINCIAS FROM WEB", transformedProvinces);
        return transformedProvinces;
      })
      .catch((error: Response) => {
        if (error.json().code == 401) {
          localStorage.clear();
        }
        console.log(error.json());
      });
  }

  /**
   * METODO PARA CARGAR LAS PROVINCIAS DESDE LA WEB
   */
  private getProvinceCache() {
    if ('indexedDB' in window) {
      return readAllData('province')
        .then((provinces) => {
          let transformedProvinces: Province[] = [];
          for (let prov of provinces) {
            transformedProvinces.push(new Province(prov.id_province, prov.description_province));
          }

          console.log("[LUKASK USER SERVICE] - PROVINCIAS FROM CACHE", transformedProvinces);
          return transformedProvinces;
        });
    }
    return new Promise((resolve, reject) => {
      reject(null);
    });
  }

  /**
   * METODO PARA OBTENER LOS CANTONES DE UNA PROVINCIA SEA DE LA WEB O DE LA CACHÉ
   * */
  public getCantonList(id_provincia: string) {
    return this.getCantonWeb(id_provincia).then((webCanton: Canton[]) => {
      if (!this.isFetchedCanton) {
        return this.getCantonCache(id_provincia).then((cacheCanton: Canton[]) => {
          return cacheCanton;
        });
      }
      else {
        this.isFetchedCanton = false;
      }

      return webCanton;
    }).catch((error: Response) => {
      if (error.json().code == 401) {
        localStorage.clear();
      }
      console.log(error.json());
    });
  }

  /**
   * METODO PARA CARGAR LOS CANTONES DE UNA PROVINCIA ESPECÍFICA DESDE LA WEB
   * @param id_provincia 
   */
  private getCantonWeb(id_provincia: string) {
    const qTheaders = new Headers({ 'Content-Type': 'application/json' });
    return this._http.get(REST_SERV.cantonUrl + "/?province_id=" + id_provincia, { headers: qTheaders, withCredentials: true }).toPromise()
      .then((response: Response) => {
        const cantones = response.json().data;
        let transformedCantones: Canton[] = [];
        for (let canton of cantones) {
          transformedCantones.push(new Canton(canton.id_canton, canton.description_canton));
        }
        this.isFetchedCanton = true;

        console.log("[LUKASK USER SERVICE] - CANTONES FROM WEB", transformedCantones);
        return transformedCantones;
      })
      .catch((error: Response) => {
        if (error.json().code == 401) {
          localStorage.clear();
        }
        console.log(error.json());
      });
  }

  /**
   * METODO PARA CARGAR LOS CANTONES DE UNA PROVINCIA ESPECÍFICA DESDE LA CACHÉ
   * @param id_provincia 
   */
  private getCantonCache(id_provincia: string) {
    if ('indexedDB' in window) {
      return readAllData('canton')
        .then((cantones) => {
          let transformedCantones: Canton[] = [];
          for (let canton of cantones) {
            if (canton.province == id_provincia) {
              transformedCantones.push(new Canton(canton.id_canton, canton.description_canton));
            }
          }
          console.log("[LUKASK USER SERVICE] - CANTONES FROM CACHE", transformedCantones);
          return transformedCantones;
        });
    }
    return new Promise((resolve, reject) => {
      reject(null);
    });
  }

  /**
   * METODO PARA OBTENER LAS PARROQUIAS SEA DE LA WEB O DE LA CACHÉ
   * */
  public getParroquiaList(canton_id: any) {
    return this.getParroquiaWeb(canton_id).then((webParroquia: Parroquia[]) => {
      if (!this.isFetchedParroquia) {
        return this.getParroquiaCache(canton_id).then((cacheParroquia: Canton[]) => {
          return cacheParroquia;
        });
      }
      else {
        this.isFetchedCanton = false;
      }

      return webParroquia;
    }).catch((error: Response) => {
      if (error.json().code == 401) {
        localStorage.clear();
      }
      console.log(error.json());
    });
  }

  /**
   * METODO PARA CARGAR LAS PARROQUIAS DE UN CANTÓN ESPECÍFICO DESDE LA WEB
   * @param canton_id 
   */
  private getParroquiaWeb(canton_id: string) {
    const qTheaders = new Headers({ 'Content-Type': 'application/json' });
    return this._http.get(REST_SERV.parroquiaUrl + "/?canton_id=" + canton_id, { headers: qTheaders, withCredentials: true }).toPromise()
      .then((response: Response) => {
        const parroquias = response.json().data;
        let transformedParroquias: Parroquia[] = [];
        for (let parroq of parroquias) {
          transformedParroquias.push(new Parroquia(parroq.id_parish, parroq.description_parish));
        }
        this.isFetchedParroquia = true;

        console.log("[LUKASK USER SERVICE] - PARROQUIAS FROM WEB", transformedParroquias);
        return transformedParroquias;
      })
      .catch((error: Response) => {
        if (error.json().code == 401) {
          localStorage.clear();
        }
        console.log(error.json());
      });
  }

  /**
   * METODO PARA CARGAR LAS PARROQUIAS DE UN CANTÓN ESPECÍFICO DESDE LA CACHÉ
   * @param canton_id 
   */
  private getParroquiaCache(canton_id: string) {
    if ('indexedDB' in window) {
      return readAllData('parroquia')
        .then((parroquias) => {
          let transformedParroquias: Parroquia[] = [];
          for (let parroq of parroquias) {
            if (parroq.canton == canton_id) {
              transformedParroquias.push(new Parroquia(parroq.id_parish, parroq.description_parish));
            }
          }
          console.log("[LUKASK USER SERVICE] - PARROQUIAS FROM CACHE", transformedParroquias);
          return transformedParroquias;
        });
    }
    return new Promise((resolve, reject) => {
      reject(null);
    });
  }

  /**
   * METODO PARA EXTRAER LOS DATOS DE USUARIO DE UN JSON STRING Y GUARDARLO EN UN OBJETO DE TIPO MODELO USER
   * @param locationJson ES EL JSON STRING QUE CONTIENE LOS DATOS DEL USUARIO
   */
  public extractLocationJson(locationJson: any, person: Person) {
    person.parroquia.id_parroquia = locationJson.parish.id;
    person.parroquia.name = locationJson.parish.description;

    person.parroquia.canton.id_canton = locationJson.canton.id;
    person.parroquia.canton.name = locationJson.canton.description;

    person.parroquia.canton.province.id_province = locationJson.province.id;
    person.parroquia.canton.province.name = locationJson.province.description;
  }
}
