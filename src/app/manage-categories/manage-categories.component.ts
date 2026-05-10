import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
  computed,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';

import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { DeviceDetectorService } from 'ngx-device-detector';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { CategoriesService } from '../shared/services/categories.service';
import { RecipesService } from '../shared/services/recipes.service';

export interface ICategory {
  id: string;
  name: string;
  icon: string;
}

@Component({
  selector: 'app-manage-categories',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    TableModule,
    TooltipModule,
    FileUploadModule,
  ],
  templateUrl: './manage-categories.component.html',
  styleUrl: './manage-categories.component.scss',
})
export class ManageCategoriesComponent implements OnInit {
  private readonly categoriesService = inject(CategoriesService);
  private readonly recipesService = inject(RecipesService);
  private readonly deviceService = inject(DeviceDetectorService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  categories = signal<ICategory[]>([]);
  loading = signal(true);
  saving = signal(false);

  dialogVisible = signal(false);
  deleteDialogVisible = signal(false);
  editingCategory = signal<ICategory | null>(null);
  categoryToDelete = signal<ICategory | null>(null);
  errorMessage = signal('');
  uploading = signal(false);
  iconPreview = signal<string | null>(null);
  iconFile = signal<File | null>(null);

  isMobile = computed(
    () => isPlatformBrowser(this.platformId) && this.deviceService.isMobile()
  );

  categoryForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    icon: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.categoriesService
      .getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cats) => {
          this.categories.set(cats);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  openNew(): void {
    this.editingCategory.set(null);
    this.categoryForm.reset();
    this.iconPreview.set(null);
    this.iconFile.set(null);
    this.errorMessage.set('');
    this.dialogVisible.set(true);
  }

  openEdit(category: ICategory): void {
    this.editingCategory.set(category);
    this.categoryForm.patchValue({
      name: category.name,
      icon: category.icon,
    });
    this.iconPreview.set(category.icon || null);
    this.iconFile.set(null);
    this.errorMessage.set('');
    this.dialogVisible.set(true);
  }

  confirmDelete(category: ICategory): void {
    this.categoryToDelete.set(category);
    this.deleteDialogVisible.set(true);
  }

  onIconSelect(event: FileSelectEvent): void {
    const file = event.files?.[0];
    if (!file) return;
    this.iconFile.set(file);
    const reader = new FileReader();
    reader.onload = () => this.iconPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  onIconClear(): void {
    this.iconFile.set(null);
    this.iconPreview.set(this.editingCategory()?.icon || null);
  }

  save(): void {
    if (this.categoryForm.invalid && !this.iconFile()) return;
    this.saving.set(true);
    this.errorMessage.set('');

    const name = this.categoryForm.value.name!.trim();
    const file = this.iconFile();

    const doSave = (icon: string) => {
      const editing = this.editingCategory();
      const op: Observable<unknown> = editing
        ? this.categoriesService.updateCategory(editing.id, { name, icon })
        : this.categoriesService.createCategory({ name, icon });

      op.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.saving.set(false);
          this.dialogVisible.set(false);
          this.loadCategories();
        },
        error: (err: any) => {
          this.saving.set(false);
          this.errorMessage.set(err.message ?? 'Failed to save category');
        },
      });
    };

    if (file) {
      this.recipesService.uploadImages([file])
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (uploaded) => doSave(uploaded[0].url),
          error: (err: any) => {
            this.saving.set(false);
            this.errorMessage.set(err.message ?? 'Failed to upload icon');
          },
        });
    } else {
      doSave(this.categoryForm.value.icon?.trim() ?? this.editingCategory()?.icon ?? '');
    }
  }

  delete(): void {
    const cat = this.categoryToDelete();
    if (!cat) return;

    this.saving.set(true);
    this.categoriesService
      .deleteCategory(cat.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.deleteDialogVisible.set(false);
          this.loadCategories();
        },
        error: (err) => {
          this.saving.set(false);
          this.errorMessage.set(err.message ?? 'Failed to delete category');
        },
      });
  }

  cancelDelete(): void {
    this.deleteDialogVisible.set(false);
    this.categoryToDelete.set(null);
  }
}
