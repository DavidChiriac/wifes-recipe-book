import { computed, Injectable, signal } from '@angular/core';

export interface UserProfile {
  uid: string;
  documentId: string;
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  favourites: string[];
  isAdmin: boolean;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserStateService {
  private readonly _user = signal<UserProfile | null>(null);

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.isAdmin ?? false);
  readonly uid = computed(() => this._user()?.uid ?? null);
  readonly favourites = computed(() => this._user()?.favourites ?? []);

  setUser(profile: UserProfile): void {
    this._user.set(profile);
  }

  clearUser(): void {
    this._user.set(null);
  }

  updateFavourites(favourites: string[]): void {
    const current = this._user();
    if (current) {
      this._user.set({ ...current, favourites });
    }
  }
}
