import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WebstorageSsrService } from './webstorage-ssr.service';

@Injectable({
  providedIn: 'root',
})
export class LocalAuthService {
  userConnected = new EventEmitter<boolean>(false);

  constructor(
    private readonly http: HttpClient,
    private readonly localStorageService: WebstorageSsrService
  ) {}

  connect(jwt: string): Observable<any> {
    return this.http.get(
      environment.apiUrl + '/api/auth/google/callback?access_token=' + jwt
    );
  }

  login(): Observable<any> {
    return this.http.get(environment.apiUrl + '/api/connect/google');
  }

  getToken(): string {
    return this.localStorageService.getFromLocalStorage('token', '');
  }
}
