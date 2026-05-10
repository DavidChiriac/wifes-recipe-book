import { DestroyRef, EventEmitter, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import {
  Auth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  User,
} from '@angular/fire/auth';
import {
  doc,
  Firestore,
  getDoc,
  serverTimestamp,
  setDoc,
} from '@angular/fire/firestore';
import { isPlatformBrowser } from '@angular/common';
import { Capacitor } from '@capacitor/core';
import { UserStateService } from './user-state.service';

/**
 * Authentication service backed by Firebase Auth.
 *
 * Web/PWA: uses `signInWithPopup` (Google provider).
 * Native (Capacitor): uses `@capacitor-firebase/authentication`, then signs the
 *                     resulting credential into the Firebase JS SDK so the rest
 *                     of the app keeps a unified auth state.
 *
 * Backwards-compatible API:
 *   - `userConnected: EventEmitter<boolean>`  (kept; emitted on sign in / out)
 *   - `getToken(): string`                    (kept; returns Firebase ID token from local storage)
 *   - `connect(jwt)`                          (kept; no-op success used by AuthCallbackComponent)
 *   - `login()`                               (kept; now triggers Google sign-in directly)
 */
@Injectable({
  providedIn: 'root',
})
export class LocalAuthService {
  userConnected = new EventEmitter<boolean>(false);

  readonly destroyRef = inject(DestroyRef);
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);
  private readonly userState = inject(UserStateService);
  private readonly platformId = inject(PLATFORM_ID);

  /**
   * Listens to Firebase Auth state. On page refresh, Firebase restores
   * the session from IndexedDB — this re-populates UserStateService.
   * Returns a promise that resolves once the first auth check completes.
   */
  init(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return Promise.resolve();

    return new Promise<void>((resolve) => {
      onAuthStateChanged(this.auth, async (user) => {
        if (user) {
          await this.persistUser(user);
        } else {
          this.userState.clearUser();
          this.userConnected.emit(false);
        }
        resolve();
      });
    });
  }

  /**
   * Triggers Google sign-in. Picks the best implementation per platform.
   */
  signInWithGoogle(): Observable<unknown> {
    if (!isPlatformBrowser(this.platformId)) return of(null);

    if (Capacitor.isNativePlatform()) {
      return from(this.signInGoogleNative());
    }
    return from(this.signInGoogleWeb());
  }

  private async signInGoogleWeb(): Promise<unknown> {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    const credential = await signInWithPopup(this.auth, provider);
    await this.persistUser(credential.user);
    return credential.user;
  }

  private async signInGoogleNative(): Promise<unknown> {
    // Lazy-load the Capacitor plugin so SSR/web bundles don't pull native code.
    const { FirebaseAuthentication } = await import(
      '@capacitor-firebase/authentication'
    );
    const result = await FirebaseAuthentication.signInWithGoogle({ useCredentialManager: false });
    const idToken = result.credential?.idToken;
    if (idToken) {
      const credential = GoogleAuthProvider.credential(idToken);
      const { signInWithCredential } = await import('@angular/fire/auth');
      const userCredential = await signInWithCredential(this.auth, credential);
      await this.persistUser(userCredential.user);
      return userCredential.user;
    }
    return result.user;
  }

  signOut(): Observable<void> {
    const native = Capacitor.isNativePlatform()
      ? import('@capacitor-firebase/authentication').then(({ FirebaseAuthentication }) =>
          FirebaseAuthentication.signOut()
        )
      : Promise.resolve();

    return from(
      native
        .then(() => fbSignOut(this.auth))
        .then(() => {
          this.userState.clearUser();
          this.userConnected.emit(false);
        })
    );
  }

  /** Returns the cached Firebase ID token. */
  getToken(): string {
    return this.userState.user()?.token ?? '';
  }

  /**
   * Build a normalized user profile and store it in the reactive UserStateService.
   * Also ensures a `users/{uid}` doc exists with a `favourites` array.
   */
  private async persistUser(user: User) {
    const token = await user.getIdToken();
    const userDocRef = doc(this.firestore, 'users', user.uid);

    let favourites: string[] = [];
    let isAdmin = false;
    try {
      const [userSnap, adminSnap] = await Promise.all([
        getDoc(userDocRef),
        getDoc(doc(this.firestore, 'admins', user.uid)),
      ]);
      isAdmin = adminSnap.exists();
      if (userSnap.exists()) {
        favourites = (userSnap.data() as any)?.favourites ?? [];
      } else {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          favourites: [],
          createdAt: serverTimestamp(),
        });
      }
    } catch {
      // Non-fatal: rules may forbid until first login completes.
    }

    const profile = {
      uid: user.uid,
      documentId: user.uid,
      id: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      favourites,
      isAdmin,
      token,
    };

    this.userState.setUser(profile);
    this.userConnected.emit(true);
    return profile;
  }
}
