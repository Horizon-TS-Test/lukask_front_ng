import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { throwError } from 'rxjs';

import { REST_SERV } from '../rest-url/rest-servers';
import { QuejaType } from '../models/queja-type';
import { Publication } from '../models/publications';
import { Media } from '../models/media';
import { User } from '../models/user';
import { LoginService } from './login.service';

declare var readAllData: any;
declare var writeData: any;

@Injectable({
  providedIn: 'root'
})
export class QuejaService {
  private pubList: Publication[];
  private quejTypeList: QuejaType[];
  private pubUrl: string;
  private qtypeUrl: string;

  private isFetchedPub: boolean;
  private isFetchedQtype: boolean;

  constructor(
    private _http: Http,
    private _loginService: LoginService
  ) {
    this.pubUrl = REST_SERV.publicationsUrl;
    this.qtypeUrl = REST_SERV.qTypeUrl;

    this.isFetchedPub = false;
    this.isFetchedQtype = false;
  }

  getQuejTypeWeb() {
    const qTheaders = new Headers({ 'Content-Type': 'application/json', 'X-Access-Token': this._loginService.getUserId() });

    return this._http.get(this.qtypeUrl, { headers: qTheaders, withCredentials: true }).toPromise()
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

  getQuejasWeb() {
    const pubHeaders = new Headers({ 'Content-Type': 'application/json', 'X-Access-Token': this._loginService.getUserId() });

    return this._http.get(this.pubUrl, { headers: pubHeaders, withCredentials: true }).toPromise()
      .then((response: Response) => {
        const pubs = response.json().data;
        let transformedPubs: Publication[] = [];
        for (let pub of pubs) {
          let pubModel = new Publication(pub.id_publication, pub.latitude, pub.length, pub.detail,
            pub.date_publication, pub.priority_publication, pub.active, pub.type_publication, new User(pub.user_name + " " + pub.user_lastname, pub.user_email, pub.media_profile));

          for (let med of pub.medios) {
            let mediaModel: Media = new Media(med.id_multimedia, med.format_multimedia, med.media_file, med.active);
            pubModel.media.push(mediaModel);
          }

          transformedPubs.push(pubModel);
        }

        this.isFetchedPub = true;
        console.log("[LUKASK QUEJA SERVICE] - PUBLICATIONS FROM WEB", transformedPubs);
        return transformedPubs;
      }).catch((error: Response) => {
        if (error.json().code == 401) {
          localStorage.clear();
        }
        return throwError(error.json());
      });
  }

  getQuejasCache() {
    if ('indexedDB' in window) {
      return readAllData('publication')
        .then((pubs) => {
          let transformedPubs: Publication[] = [];
          for (let pub of pubs) {
            let pubModel = new Publication(pub.id_publication, pub.latitude, pub.length, pub.detail,
              pub.date_publication, pub.priority_publication, pub.active, pub.type_publication, new User(pub.user_name + " " + pub.user_lastname, pub.user_email, pub.media_profile));

            for (let med of pub.medios) {
              let mediaModel: Media = new Media(med.id_multimedia, med.format_multimedia, med.media_file, med.active);
              pubModel.media.push(mediaModel);
            }

            transformedPubs.push(pubModel);
          }

          console.log("[LUKASK QUEJA SERVICE] - PUBLICATIONS FROM CACHE", transformedPubs);
          return transformedPubs;
        });
    }
  }

  getPubList() {
    /**
     * IMPLEMENTING NETWORK FIRST STRATEGY
    */
    return this.getQuejasWeb().then((transformedPubs: Publication[]) => {
      this.pubList = transformedPubs;

      if (!this.isFetchedPub) {
        this.getQuejasCache().then((transformedPubs: Publication[]) => {
          this.pubList = transformedPubs;
        });
      }
      return this.pubList;
    });
  }

  setPubList(pubs: Publication[]) {
    this.pubList = pubs;
  }

  addPubToPubList(pubs: Publication) {
    this.pubList.push(pubs);
  }

  mergeJSONData(queja: Publication) {
    var json = {
      user_id: this._loginService.getUserId(),
      id: new Date().toISOString(),
      latitude: queja.latitude,
      longitude: queja.longitude,
      detail: queja.detail,
      type_publication: queja.type,
      date_publication: queja.date_pub,
      media_files: []
    }

    for (let med of queja.media) {
      json.media_files.push({ file: med.file, fileName: med.fileName });
    }
    /////

    return json;
  }

  sendQueja(queja: Publication) {
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
            console.log(response);
          },
          (err) => {
            console.log(err);
          }
        );
    //}
  }

  mergeFormData(queja: Publication) {
    let formData = new FormData();

    formData.append('latitude', queja.latitude + "");
    formData.append('longitude', queja.longitude + "");
    formData.append('detail', queja.detail);
    formData.append('type_publication', queja.type);
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

      xhr.open("post", this.pubUrl, true);
      xhr.setRequestHeader('X-Access-Token', this._loginService.getUserId());
      xhr.withCredentials = true;
      xhr.send(quejaFormData);
    });
  }
}
