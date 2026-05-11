import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { DeviceService } from '../shared/services/device.service';
import { IUser, UsersService } from '../shared/services/users.service';
import { UserStateService } from '../shared/services/user-state.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-manage-users',
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    TableModule,
    TooltipModule,
    TagModule,
  ],
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.scss',
})
export class ManageUsersComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly usersService = inject(UsersService);
  private readonly userState = inject(UserStateService);

  isMobile = inject(DeviceService).isMobile;
  currentUid = this.userState.uid;

  loading = signal(true);
  users = signal<IUser[]>([]);
  togglingUid = signal<string | null>(null);

  constructor() {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.usersService
      .getUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (users) => {
          this.users.set(users);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  toggleAdmin(user: IUser): void {
    this.togglingUid.set(user.uid);
    this.usersService
      .setAdmin(user.uid, !user.isAdmin)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.users.update((users) =>
            users.map((u) =>
              u.uid === user.uid ? { ...u, isAdmin: !u.isAdmin } : u
            )
          );
          this.togglingUid.set(null);
        },
        error: () => this.togglingUid.set(null),
      });
  }
}
