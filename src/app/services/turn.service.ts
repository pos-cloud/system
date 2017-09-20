import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Turn, TurnState } from './../models/turn';
import { Config } from './../app.config';
import { UserService } from './user.service';

@Injectable()
export class TurnService {

  constructor(
    public _http: Http,
    public _userService: UserService
  ) { }

  getOpenTurn(employeeId: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._userService.getToken()
    });
    return this._http.get(Config.apiURL + 'turns/where="employee":"' + employeeId + '","state":"' + TurnState.Open + '"', { headers: headers }).map (res => res.json());
	}

  getLastTurn() {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._userService.getToken()
    });
    return this._http.get(Config.apiURL + 'turns/sort="code":-1&limit=1', { headers: headers }).map (res => res.json());
  }

  getTurn(id) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._userService.getToken()
    });
    return this._http.get(Config.apiURL + "turn/" + id, { headers: headers }).map (res => res.json());
  }

  getTurns() {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._userService.getToken()
    });
    return this._http.get(Config.apiURL + "turns", { headers: headers }).map (res => res.json());
  }

  saveTurn(turn: Turn) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._userService.getToken()
    });
    return this._http.post(Config.apiURL + "turn", turn, { headers: headers }).map (res => res.json());
  }
  
  deleteTurn(id: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._userService.getToken()
    });
    return this._http.delete(Config.apiURL + "turn/" + id, { headers: headers }).map (res => res.json());
  }

  updateTurn(turn: Turn) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': this._userService.getToken()
    });
    return this._http.put(Config.apiURL + "turn/" + turn._id, turn, { headers: headers }).map (res => res.json());
  }
}
