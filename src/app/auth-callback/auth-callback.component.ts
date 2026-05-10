import { Router } from '@angular/router';
import { Component, inject, OnInit } from '@angular/core';

/**
 * Legacy auth-callback route from the Strapi-based OAuth flow.
 *
 * Firebase Auth on web uses `signInWithPopup`, which never redirects
 * back through this route, so we simply send the user home. Kept so
 * external links to `/auth/google/callback` don't 404.
 */
@Component({
  selector: 'app-auth-callback',
  template: `<span>Redirecting…</span>`,
})
export class AuthCallbackComponent implements OnInit {
  private readonly router = inject(Router);

  ngOnInit() {
    this.router.navigate(['/']);
  }
}
