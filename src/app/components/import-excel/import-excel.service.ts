import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { of } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { Config } from '../../app.config';
import { AuthService } from '../login/auth.service';

@Injectable()
export class ImportExcelService {

  constructor(
    public _http: HttpClient,
    public _authService: AuthService
  ) { }

  public import(objectToImport: {}): Promise<any> {
    
    const URL = `${Config.apiV8URL}articles/save-excel`;

    let xhr: XMLHttpRequest = new XMLHttpRequest();

    xhr.open('POST', URL, true);
    xhr.setRequestHeader('Authorization', this._authService.getToken());
    return new Promise((resolve, reject) => {
      let formData: any = new FormData();
      formData.append('excel', objectToImport[0], objectToImport[0].filename);
      xhr.upload.addEventListener("progress", this.progressFunction, false);
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            resolve(JSON.parse(xhr.response));
          } else {
            reject(JSON.parse(xhr.response));
          }
        }
      }
      xhr.send(formData);
    })

    

    // const headers = new HttpHeaders()
    //   .set('Content-Type', 'application/json')
    //   .set('Authorization', this._authService.getToken());

    // return this._http.post(URL, objectToImport, {
    //   headers: headers
    // }).pipe(
    //   map(res => {
    //     console.log(res)
    //     return res;
    //   }),
    //   catchError((err) => {
    //     console.log(err)
    //     return of(err);
    //   })
    // );
  }

  public progressFunction(evt) {
    if (evt.lengthComputable) {
      let percentage: number = Math.round(evt.loaded / evt.total * 100);
      // document.getElementsByClassName('labelFile')[0].innerHTML = percentage + "%";
    }
  }

  public importMovement(objectToImport: {}, transaccionId: string): Observable<any> {

    const URL = `${Config.apiURL}import-movement`;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', this._authService.getToken());

    const params = new HttpParams()
      .set('transaccion', transaccionId);

    return this._http.post(URL, objectToImport, {
      headers: headers
    }).pipe(
      map(res => {
        return res;
      }),
      catchError((err) => {
        return of(err);
      })
    );
  }
}