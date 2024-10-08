import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AuthService } from '../login/auth.service';
import { ModelService } from '../model/model.service';

@Injectable()
export class GalleryService extends ModelService {
  constructor(public _http: HttpClient, public _authService: AuthService) {
    super(
      `galleries`, // PATH
      _http,
      _authService
    );
  }
}
