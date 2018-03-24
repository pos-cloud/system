import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Company } from './../models/company';
import { Config } from './../app.config';
import { UserService } from './user.service';

@Injectable()
export class CompanyService {

	constructor(
		public _http: Http,
		public _userService: UserService
	) { }

  	getLastCompany () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'companies/sort="code":-1&limit=1', { headers: headers }).map (res => res.json());
  	}

  	getCompany (id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "company/"+id, { headers: headers }).map (res => res.json());
  	}

  	getCompanies () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "companies", { headers: headers }).map (res => res.json());
  	}

  
  	getCompaniesByType (type: string) {
	  	let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()	
		});
		return this._http.get(Config.apiURL + 'companies/where="type":"' + type + '"', { headers: headers }).map (res => res.json());
	}
	
	saveCompany (company : Company) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.post(Config.apiURL + "company",company, { headers: headers }).map (res => res.json());
	}

	deleteCompany (id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.delete(Config.apiURL + "company/"+id, { headers: headers }).map (res => res.json());
	}

  	updateCompany (company: Company){
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.put(Config.apiURL + "company/"+company._id, company, { headers: headers }).map (res => res.json());
  	}
}
