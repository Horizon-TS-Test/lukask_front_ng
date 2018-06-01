import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { throwError } from 'rxjs';

import { REST_SERV } from '../rest-url/rest-servers';
import { QuejaType } from '../models/queja-type';
import { Publication } from '../models/publications';
import { Media } from '../models/media';
import { User } from '../models/user';
import { LoginService } from './login.service';
import { Person } from '../models/person';

declare var readAllData: any;
declare var writeData: any;

import * as lodash from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class QuejaService {
  public pubList: Publication[];
  public pubFilterList: Publication[];
  private quejTypeList: QuejaType[];

  private isFetchedQtype: boolean;
  private isFetchedPubs: boolean;
  private isFetchedPub: boolean;

  constructor(
    private _http: Http,
    private _loginService: LoginService
  ) {

    this.isFetchedQtype = false;
    this.isFetchedPubs = false;
    this.isFetchedPub = false;
  }

  getQuejTypeWeb() {
    const qTheaders = new Headers({ 'Content-Type': 'application/json', 'X-Access-Token': this._loginService.getUserId() });

    return this._http.get(REST_SERV.qTypeUrl, { headers: qTheaders, withCredentials: true }).toPromise()
      .then((response: Response) => {
        const qtypes = response.json().data;
        let transformedQtypes: QuejaType[] = [];
        for (let type of qtypes) {
          transformedQtypes.push(new QuejaType(type.id_type_publication, type.description));
        }

        this.isFetchedQtype = true;
        console.log("[LUKASK QUEJA SERVICE] - QUEJA TYPES FROM WEB", transformedQtypes);
        return transformedQtypes;
      })
      .catch((error: Response) => {
        if (error.json().code == 401) {
          localStorage.clear();
        }
        return throwError(error.json());
      });
  }

  getQuejTypeCache() {
    if ('indexedDB' in window) {
      return readAllData('qtype')
        .then((qtypes) => {
          let transformedQtypes: QuejaType[] = [];
          for (let type of qtypes) {
            transformedQtypes.push(new QuejaType(type.id_type_publication, type.description));
          }

          console.log("[LUKASK QUEJA SERVICE] - QUEJA TYPES FROM CACHE", transformedQtypes);
          return transformedQtypes;
        });
    }
  }

  getQtypeList() {
    /**
     * IMPLEMENTING NETWORK FIRST STRATEGY
    */
    return this.getQuejTypeWeb().then((transformedQtype: QuejaType[]) => {
      this.quejTypeList = transformedQtype;

      if (!this.isFetchedQtype) {
        return this.getQuejTypeCache().then((transformedQtype: QuejaType[]) => {
          this.quejTypeList = transformedQtype;
          return this.quejTypeList;
        });
      }

      return this.quejTypeList;
    });
  }

  getPubsWeb() {
    const pubHeaders = new Headers({ 'Content-Type': 'application/json', 'X-Access-Token': this._loginService.getUserId() });

    return this._http.get(REST_SERV.publicationsUrl, { headers: pubHeaders, withCredentials: true }).toPromise()
      .then((response: Response) => {
        const pubs = response.json().data;
        let transformedPubs: Publication[] = [];
        for (let i = 0; i < pubs.length; i++) {
          //THIS IS FOR SORTING:
          pubs[i].position = i;
          ////
          transformedPubs.push(this.extractPubJson(pubs[i]));
        }

        this.isFetchedPubs = true;
        console.log("[LUKASK QUEJA SERVICE] - PUBLICATIONS FROM WEB", transformedPubs);
        return transformedPubs;
      }).catch((error: Response) => {
        if (error.json().code == 401) {
          localStorage.clear();
        }
        return throwError(error.json());
      });
  }

  getPubsCache() {
    let transformedPubs: Publication[] = [];
    if ('indexedDB' in window) {
      readAllData('publication')
        .then((pubs) => {
          //REF: https://www.npmjs.com/package/lodash
          //REF: https://stackoverflow.com/questions/43371092/use-lodash-to-sort-array-of-object-by-value
          let sortedPubs = lodash.orderBy(pubs, ['position'], ['asc']);
          ////
          for (let pub of sortedPubs) {
            transformedPubs.push(this.extractPubJson(pub));
          }

          console.log("[LUKASK QUEJA SERVICE] - PUBLICATIONS FROM CACHE", transformedPubs);
        });
    }

    return transformedPubs
  }

  getPubList() {
    /**
     * IMPLEMENTING NETWORK FIRST STRATEGY
    */
    let returnedPubs: Publication[];
    return this.getPubsWeb().then((webPubs: Publication[]) => {
      returnedPubs = webPubs;
      if (!this.isFetchedPubs) {
        returnedPubs = this.getPubsCache();
      }
      this.pubList = returnedPubs;
      return returnedPubs;
    }).catch((error: Response) => {
      if (error.json().code == 401) {
        localStorage.clear();
      }
      return throwError(error.json());
    });
  }


  getPubListObj() {
    return this.pubList;
  }

  public setPubList(pubs: Publication[]) {
    this.pubList = pubs;
  }

  public addPubToPubList(pub: Publication) {
    this.pubList.push(pub);
  }

  mergeJSONData(queja: Publication) {
    var json = {
      user_id: this._loginService.getUserId(),
      id: new Date().toISOString(),
      latitude: queja.latitude,
      longitude: queja.longitude,
      detail: queja.detail,
      type_publication: queja.type.id,
      date_publication: queja.date_pub,
      media_files: []
    }

    for (let med of queja.media) {
      json.media_files.push({ file: med.file, fileName: med.fileName });
    }
    /////

    return json;
  }

  public sendQueja(queja: Publication) {
    /*if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready
        .then((serviceW) => {
          var pub = this.mergeJSONData(queja);

          writeData('sync-pub', pub)
            .then(function () {
              serviceW.sync.register('sync-new-pub');
            })
            .then(function () {
              console.log("A new pub has been saved for syncing!!");
            })
            .catch(function (err) {
              console.log(err);
            });
        });
    }
    //IF THE WEB BROWSER DOESN'T SUPPORT OFFLINE SYNCRONIZATION:
    else {*/
    let quejaFormData: FormData = this.mergeFormData(queja);
    this.postQuejaClient(quejaFormData)
      .then(
        (response) => {
          writeData('publication', response);
          this.addPubToPubList(this.extractPubJson(response));
          console.log(response);
        },
        (err) => {
          console.log(err);
        }
      );
    //}
  }

  extractPubJson(pubJson, isSocket: boolean = false) {
    let pub: Publication;
    let usr: User;
    let person: Person;
    let type: QuejaType;
    let medios: Media;

    usr = new User(pubJson.user_email, '', ((isSocket) ? REST_SERV.mediaBack : "") + pubJson.media_profile);
    usr.person = new Person(null, null, null, pubJson.user_name, pubJson.user_lastname, null, null, null);
    type = new QuejaType(pubJson.type_publication, pubJson.type_publication_detail);

    pub = new Publication(pubJson.id_publication, pubJson.latitude, pubJson.length, pubJson.detail, pubJson.date_publication, pubJson.priority_publication, pubJson.active, type, usr, pubJson.position);
    for (let med of pubJson.medios) {
      pub.media.push(new Media(med.id_multimedia, med.format_multimedia, med.media_file));
    }

    return pub;
  }

  mergeFormData(queja: Publication) {
    let formData = new FormData();

    formData.append('latitude', queja.latitude + "");
    formData.append('longitude', queja.longitude + "");
    formData.append('detail', queja.detail);
    formData.append('type_publication', queja.type.id);
    formData.append('date_publication', queja.date_pub);

    for (let med of queja.media) {
      formData.append('media_files[]', med.file, med.fileName);
    }

    return formData;
  }

  postQuejaClient(quejaFormData: FormData) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 201) {
            console.log(JSON.parse(xhr.response));
            resolve(JSON.parse(xhr.response).pub);
          }
          else {
            if (xhr.status == 401) {
              localStorage.clear();
            }
            reject(xhr.response);
          }
        }
      };

      xhr.open("post", REST_SERV.publicationsUrl, true);
      xhr.setRequestHeader('X-Access-Token', this._loginService.getUserId());
      xhr.withCredentials = true;
      xhr.send(quejaFormData);
    });
  }

  getPubWebById(id: string) {
    const _headers = new Headers({ 'Content-Type': 'application/json', 'X-Access-Token': this._loginService.getUserId() });

    return this._http.get(REST_SERV.publicationsUrl + "/" + id, { headers: _headers, withCredentials: true }).toPromise()
      .then((response: Response) => {
        const pubJson = response.json().pub;
        let pub: Publication;
        pub = this.extractPubJson(pubJson);

        this.isFetchedPub = true;
        console.log("[LUKASK QUEJA SERVICE] - GETTING PUBLICATION FROM WEB BY ID", pub);
        return pub;
      })
      .catch((error: Response) => {
        if (error.json().code == 401) {
          localStorage.clear();
        }
        return throwError(error.json());
      });
  }

  getPubCache(id: string) {
    return null;
  }

  getPubById(id: string) {
    /**
     * IMPLEMENTING NETWORK FIRST STRATEGY
    */
    let returnedPub: Publication;
    return this.getPubWebById(id).then((webPub: Publication) => {
      returnedPub = webPub;

      if (!this.isFetchedPub) {
        returnedPub = this.getPubCache(id);
      }

      return returnedPub;
    }).catch((error: Response) => {
      if (error.json().code == 401) {
        localStorage.clear();
      }
      return throwError(error.json());
    });
  }

  getPubsFilterWeb(city: string) {
    const pubHeaders = new Headers({ 'Content-Type': 'application/json', 'X-Access-Token': this._loginService.getUserId() });

    return this._http.get(REST_SERV.pubFilterUrl + "/" + city, { headers: pubHeaders, withCredentials: true }).toPromise()
      .then((response: Response) => {
        const pubs = response.json().data;
        let transformedPubs: Publication[] = [];
        for (let i = 0; i < pubs.length; i++) {
          transformedPubs.push(this.extractPubJson(pubs[i]));
        }

        this.isFetchedPubs = true;
        console.log("[LUKASK QUEJA SERVICE] - PUBLICATIONS FROM WEB WITH FILTER", transformedPubs);
        return transformedPubs;
      }).catch((error: Response) => {
        if (error.json().code == 401) {
          localStorage.clear();
        }
        return throwError(error.json());
      });
  }

  getPubListFilter(city: string) {
    /**
     * IMPLEMENTING NETWORK FIRST STRATEGY
    */
    let returnedPubs: Publication[];
    return this.getPubsFilterWeb(city).then((webPubs: Publication[]) => {
      returnedPubs = webPubs;
      /*if (!this.isFetchedPubs) {
        returnedPubs = this.getPubsCache();
      }*/
      this.pubFilterList = returnedPubs;
      return returnedPubs;
    }).catch((error: Response) => {
      if (error.json().code == 401) {
        localStorage.clear();
      }
      return throwError(error.json());
    });
  }
}
