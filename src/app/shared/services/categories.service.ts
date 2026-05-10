import { inject, Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from '@angular/fire/firestore';

export interface ICategory {
  id: string;
  name: string;
  icon: string;
}

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private readonly firestore = inject(Firestore);

  getCategories(): Observable<ICategory[]> {
    const ref = collection(this.firestore, 'categories');
    return from(getDocs(query(ref, orderBy('name')))).pipe(
      map((snap) =>
        snap.docs.map((d) => {
          const data = d.data() as { name?: string; icon?: string; iconUrl?: string };
          return {
            id: d.id,
            name: data.name ?? '',
            icon: data.iconUrl ?? data.icon ?? '',
          };
        })
      )
    );
  }

  createCategory(data: { name: string; icon: string }): Observable<string> {
    const ref = collection(this.firestore, 'categories');
    return from(
      addDoc(ref, { name: data.name, iconUrl: data.icon })
    ).pipe(map((docRef) => docRef.id));
  }

  updateCategory(
    id: string,
    data: { name: string; icon: string }
  ): Observable<void> {
    const docRef = doc(this.firestore, 'categories', id);
    return from(updateDoc(docRef, { name: data.name, iconUrl: data.icon }));
  }

  deleteCategory(id: string): Observable<void> {
    const docRef = doc(this.firestore, 'categories', id);
    return from(deleteDoc(docRef));
  }
}
