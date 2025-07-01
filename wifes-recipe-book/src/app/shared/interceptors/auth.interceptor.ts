import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocalAuthService } from '../services/local-auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private localAuthService: LocalAuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.localAuthService.getToken();
    if (token && !req.url.includes('/api/auth/google/callback')) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      return next.handle(authReq);
    }

    return next.handle(req);
  }
}
