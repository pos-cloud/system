import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Make } from './../models/make';

@Injectable()
export class MakeService {
  
  private url: string;

  constructor(private _http: Http) { 
    this.url = 'http://localhost:3000/api/';
  }

  getLastMake () {
    return this._http.get(this.url+'makes/sort="description":-1&limit=1').map (res => res.json());
  }

  getMake (id) {
    return this._http.get(this.url+"make/"+id).map (res => res.json());
  }

  getMakes () {
    return this._http.get(this.url+"makes").map (res => res.json());
  }

  saveMake (make : Make) {
    return this._http.post(this.url+"make",make).map (res => res.json());
  }
  
  deleteMake (id: string) {
    return this._http.delete(this.url+"make/"+id).map (res => res.json());
  }

  updateMake (make: Make){
    return this._http.put(this.url+"make/"+make._id, make).map (res => res.json());
  }
}