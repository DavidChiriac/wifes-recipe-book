import { SocialUser } from '@abacritt/angularx-social-login';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocalAuthService {
  user$ = new BehaviorSubject<SocialUser | null>(null);

  constructor() {}
}
