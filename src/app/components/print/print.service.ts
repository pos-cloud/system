import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { of } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { Print } from './print';
import { Config } from '../../app.config';
import { AuthService } from '../login/auth.service';

@Injectable()
export class PrintService {

	constructor(
		private _http: HttpClient,
		private _authService: AuthService
	) { }

	public toPrint(print: Print): Observable<any> {

		const URL = `${Config.apiURL}to-print`;

		const headers = new HttpHeaders()
			.set('Content-Type', 'application/json')
			.set('Authorization', this._authService.getToken());

		return this._http.post(URL, print, {
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


	public toPrintURL(url: string, file: string): Observable<any> {

		const URL = `${Config.apiURL}printURL`;

		const headers = new HttpHeaders()
			.set('Content-Type', 'application/json')
			.set('Authorization', this._authService.getToken());

		const params = new HttpParams()
			.set('file', file)
			.set('url', url);

		return this._http.get(URL, {
			headers: headers,
			params: params
		}).pipe(
			map(res => {
				return res;
			}),
			catchError((err) => {
				return of(err);
			})
		);
	}

	public getBarcode(barcode: string): Observable<any> {

		const URL = `${Config.apiURL}barcode/${barcode}`;

		const headers = new HttpHeaders()
			.set('Content-Type', 'application/json')
			.set('Authorization', this._authService.getToken());

		return this._http.get(URL, {
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

	public saveFile(file, folder, name) {
		return new Promise((resolve, reject) => {
			let data = new FormData();
			data.append('file', file);
			let xhr = new XMLHttpRequest();
			xhr.open('POST', Config.apiURL + 'upload-file/' + folder + '/' + name, true);
			xhr.setRequestHeader('Authorization', this._authService.getToken());
			xhr.onreadystatechange = function () {
				if (xhr.readyState == 4) {
					if (xhr.status == 200) {
						resolve(JSON.parse(xhr.response));
					} else {
						reject(xhr.response);
					}
				}
			}
			xhr.send(data);
		});
	}
}
