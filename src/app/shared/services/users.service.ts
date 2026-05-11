import { inject, Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import {
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDocs,
  setDoc,
} from '@angular/fire/firestore';

export interface IUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin: boolean;
  recipeCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly firestore = inject(Firestore);

  getUsers(): Observable<IUser[]> {
    const usersRef = collection(this.firestore, 'users');
    const adminsRef = collection(this.firestore, 'admins');
    const recipesRef = collection(this.firestore, 'recipes');

    return from(
      Promise.all([getDocs(usersRef), getDocs(adminsRef), getDocs(recipesRef)])
    ).pipe(
      map(([usersSnap, adminsSnap, recipesSnap]) => {
        const adminIds = new Set(adminsSnap.docs.map((d) => d.id));

        // Count recipes per authorId
        const recipeCounts = new Map<string, number>();
        recipesSnap.docs.forEach((d) => {
          const authorId = (d.data() as any).authorId;
          if (authorId) {
            recipeCounts.set(authorId, (recipeCounts.get(authorId) ?? 0) + 1);
          }
        });

        return usersSnap.docs.map((d) => {
          const data = d.data() as any;
          return {
            uid: d.id,
            email: data.email ?? null,
            displayName: data.displayName ?? null,
            photoURL: data.photoURL ?? null,
            isAdmin: adminIds.has(d.id),
            recipeCount: recipeCounts.get(d.id) ?? 0,
          };
        });
      })
    );
  }

  setAdmin(uid: string, isAdmin: boolean): Observable<void> {
    const adminRef = doc(this.firestore, 'admins', uid);
    if (isAdmin) {
      return from(setDoc(adminRef, { uid }));
    } else {
      return from(deleteDoc(adminRef));
    }
  }
}
