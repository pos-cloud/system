import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Table } from './../models/table';
import { Config } from './../app.config';
import { UserService } from './user.service';

@Injectable()
export class TableService {

  constructor(
    public _http: Http,
    public _userService: UserService
  ) { }

  getLastTable () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'tables/sort="description":-1&limit=1', { headers: headers }).map (res => res.json());
  }

  getTable (id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "table/"+id, { headers: headers }).map (res => res.json());
	}

  getTables () {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + "tables", { headers: headers }).map (res => res.json());
	}

  getTablesByRoom (roomId: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.get(Config.apiURL + 'tables/where="room":"'+roomId+'"&sort="description":1', { headers: headers }).map (res => res.json());
	}

  saveTable (table: Table) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.post(Config.apiURL + "table",table, { headers: headers }).map (res => res.json());
	}

  deleteTable (id: string) {
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.delete(Config.apiURL + "table/"+id, { headers: headers }).map (res => res.json());
  }

  updateTable (table: Table){
		let headers = new Headers({
			'Content-Type': 'application/json',
			'Authorization': this._userService.getToken(),
			'Database': this._userService.getDatabase()
		});
		return this._http.put(Config.apiURL + "table/"+table._id, table, { headers: headers }).map (res => res.json());
  }
}
