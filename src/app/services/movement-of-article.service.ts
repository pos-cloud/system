import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { empty } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { MovementOfArticle } from './../models/movement-of-article';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class MovementOfArticleService {

  constructor(
		private _http: HttpClient,
    private _authService: AuthService
  ) { }
  
  public getMovementOfArticle(_id: string): Observable<any> {

    const URL = `${Config.apiURL}"movement-of-field`;

    const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', this._authService.getToken());

    const params = new HttpParams()
        .set('id', _id);

    return this._http.get(URL, {
        headers: headers,
        params: params
    }).pipe(
        map(res => {
            return res;
        }),
        catchError((err) => {
            return empty();
        })
    );
  }

  public getMovementsOfArticles(
    query?: string
  ): Observable<any> {

    const URL = `${Config.apiURL}movements-of-articles`;

    const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')           
        .set('Authorization', this._authService.getToken());

    const params = new HttpParams()
        .set('query', query);

    return this._http.get(URL, {
        headers: headers,
        params: params
    }).pipe(
        map(res => {
            return res;
        }),
        catchError((err) => {
            return empty();
        })
    );
  }

  public getMovementsOfArticlesV2(
    project: {},
    match: {},
    sort: {},
    group: {},
    limit: number = 0,
    skip: number = 0
  ): Observable<any> {

    const URL = `${Config.apiURL}v2/movements-of-articles`;

    const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')           
        .set('Authorization', this._authService.getToken());

    const params = new HttpParams()
        .set('project', JSON.stringify(project))
        .set('match', JSON.stringify(match))
        .set('sort', JSON.stringify(sort))
        .set('group', JSON.stringify(group))
        .set('limit', limit.toString())
        .set('skip', skip.toString());

    return this._http.get(URL, {
        headers: headers,
        params: params
    }).pipe(
        map(res => {
            return res;
        }),
        catchError((err) => {
            return empty();
        })
    );
  }
  
  public saveMovementOfArticle(movementOfArticle: MovementOfArticle): Observable<any> {

    const URL = `${Config.apiURL}movement-of-article`;

    const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', this._authService.getToken());

    return this._http.post(URL, movementOfArticle, {
        headers: headers
    }).pipe(
        map(res => {
            return res;
        }),
        catchError((err) => {
            return empty();
        })
    );
  }

  public saveMovementsOfArticles(movementsOfArticles: MovementOfArticle[]): Observable<any> {

    const URL = `${Config.apiURL}movements-of-articles`;

    const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', this._authService.getToken());

    return this._http.post(URL, { movementsOfArticles: movementsOfArticles }, {
        headers: headers
    }).pipe(
        map(res => {
            return res;
        }),
        catchError((err) => {
            return empty();
        })
    );
  }

  public updateMovementOfArticle(movementOfArticle: MovementOfArticle): Observable<any> {

    const URL = `${Config.apiURL}movement-of-article`;

    const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', this._authService.getToken());

    const params = new HttpParams()
        .set('id', movementOfArticle._id);

    return this._http.put(URL, movementOfArticle, {
        headers: headers,
        params: params
    }).pipe(
        map(res => {
            return res;
        }),
        catchError((err) => {
            return empty();
        })
    );
}

  public deleteMovementOfArticle(_id: string): Observable<any> {

    const URL = `${Config.apiURL}movement-of-article`;

    const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', this._authService.getToken());

    const params = new HttpParams()
        .set('id', _id);

    return this._http.delete(URL, {
        headers: headers,
        params: params
    }).pipe(
        map(res => {
            return res;
        }),
        catchError((err) => {
            return empty();
        })
    );
  }

  public deleteMovementsOfArticles(query: string): Observable<any> {

    const URL = `${Config.apiURL}movements-of-articles`;

    const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', this._authService.getToken());

    const params = new HttpParams()
        .set('query', query);

    return this._http.delete(URL, {
        headers: headers,
        params: params
    }).pipe(
        map(res => {
            return res;
        }),
        catchError((err) => {
            return empty();
        })
    );
  }
}
