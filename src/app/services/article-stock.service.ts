import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { ArticleStock } from './../models/article-stock';
import { Article } from './../models/article';
import { Config } from './../app.config';
import { AuthService } from './auth.service';

import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";

@Injectable()
export class ArticleStockService {

	constructor(
		public _http: Http,
		private http: HttpClient,
    public _authService: AuthService
  ) { }

	getLastArticleStock() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + 'article-stocks/sort="code":-1&limit=1', { headers: headers }).map(res => res.json());
	}

	getArticleStock(id) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + "article-stock/" + id, { headers: headers }).map(res => res.json());
	}

	getArticleStocks() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + "article-stocks", { headers: headers }).map(res => res.json());
	}

	getStockByArticle(articleId: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.get(Config.apiURL + 'article-stocks/where="article": "' + articleId +  '"', { headers: headers }).map(res => res.json());
	}

	saveArticleStock(articleStock: ArticleStock) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.post(Config.apiURL + "article-stock", articleStock, { headers: headers }).map(res => res.json());
	}

	deleteArticleStock(id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.delete(Config.apiURL + "article-stock/" + id, { headers: headers }).map(res => res.json());
	}

	updateArticleStock(articleStock: ArticleStock) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.put(Config.apiURL + "article-stock/" + articleStock._id, articleStock, { headers: headers }).map(res => res.json());
	}

	updateRealStock(article: Article, amount: number, stockMovement: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._authService.getToken()
		});
		return this._http.put(Config.apiURL + 'amount-stock-by-article/' + article._id, '{"amount":' + amount + ', "stockMovement":"' + stockMovement + '"}', { headers: headers }).map(res => res.json());
	}

	public getArticleStocksV2(
    project: {},
    match: {},
    sort: {},
    group: {},
    limit: number = 0,
    skip: number = 0
  ): Observable<any> {

	const URL = `${Config.apiURL}v2/article-stocks`;

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

    return this.http.get(URL, {
      headers: headers,
      params: params
    }).pipe(
      map(res => {
        return res;
      })
    );
  }
}
