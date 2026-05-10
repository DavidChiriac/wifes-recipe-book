import { Component, computed, DestroyRef, effect, inject, input, signal, viewChild } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import {
  FileRemoveEvent,
  FileSelectEvent,
  FileUpload,
  FileUploadModule,
} from 'primeng/fileupload';
import { v4 as uuidv4 } from 'uuid';
import { Router } from '@angular/router';
import { RecipesService } from '../shared/services/recipes.service';
import { IRecipe } from '../shared/interfaces/recipe.interface';
import { catchError, concatMap, Observable, of, tap } from 'rxjs';
import { CommonModule, Location } from '@angular/common';
import { DialogModule } from 'primeng/dialog';

import { DeviceService } from '../shared/services/device.service';
import { AccordionModule } from 'primeng/accordion';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-new-recipe',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    FormsModule,
    FileUploadModule,
    CommonModule,
    DialogModule,
    AccordionModule,
    MultiSelectModule
  ],
  templateUrl: './new-recipe.component.html',
  styleUrl: './new-recipe.component.scss',
})
export class NewRecipeComponent {
  private readonly recipesService = inject(RecipesService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly destroyRef = inject(DestroyRef);

  recipeForm = signal(new FormGroup({
    name: new FormControl('', Validators.required),
    categories: new FormControl<{name: string; id: string}[]>([]),
    ingredients: new FormArray(
      [
        new FormGroup({
          id: new FormControl(uuidv4()),
          sectionName: new FormControl(),
          ingredients: new FormArray([
            new FormGroup({
              id: new FormControl(uuidv4()),
              name: new FormControl('', Validators.required),
              quantity: new FormControl(''),
              calories: new FormControl(),
            }),
          ]),
        }),
      ],
      Validators.required
    ),
    preparation: new FormArray([
      new FormGroup({
        id: new FormControl(uuidv4()),
        step: new FormControl(),
      }),
    ]),
    minutes: new FormControl(30),
    coverImage: new FormControl(undefined),
    images: new FormArray([] as FormControl[]),
  }));

  existingCoverImage: { id: string; name: string; url: string } | undefined;
  existingImages: { id: string; name: string; url: string }[] = [];

  newUploadedCoverImage: { id: string; name: string; url: string } | undefined;
  newUploadedImages: { id: string; name: string; url: string }[] = [];

  coverImagePreview = signal<{ name: string; url: string } | null>(null);
  newImagePreviews = signal<{ name: string; url: string }[]>([]);

  coverUploader = viewChild<FileUpload>('coverUploader');
  imagesUploader = viewChild<FileUpload>('imagesUploader');

  id = input.required<string>();

  isMobile = inject(DeviceService).isMobile;

  imageDeleteDialogVisible = false;
  imageToBeDeleted: { id: string; name: string; url: string } | undefined;

  uploading = false;

  errorModalVisible = false;
  errorMessage = '';

  categoryOptions = signal<{name: string; id: string}[]>([]);

  constructor() {
    this.recipesService.getCategories().pipe(
      catchError(() => of([])),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((categories) => {
      this.categoryOptions.set(categories);
    });

    effect(() => {
      if(this.id()){
        this.populateForm();
      }
    });
  }

  populateForm(): void {
    this.recipesService
      .getSingleRecipe(this.id())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((recipe) => {
        this.recipeForm.set(new FormGroup({
          name: new FormControl(recipe.title, Validators.required),
          categories: new FormControl<{name: string; id: string}[]>(recipe.categories || []),
          ingredients: new FormArray(
            recipe.ingredients?.map((section) => {
              return new FormGroup({
                id: new FormControl(uuidv4()),
                sectionName: new FormControl(section.sectionName),
                ingredients: new FormArray(
                  section.ingredients.map(
                    (ingredient) =>
                      new FormGroup({
                        id: new FormControl(uuidv4()),
                        name: new FormControl(
                          ingredient.name,
                          Validators.required
                        ),
                        quantity: new FormControl(ingredient.quantity),
                        calories: new FormControl(ingredient.calories),
                      })
                  )
                ),
              });
            }) || [],
            Validators.required
          ),
          preparation: new FormArray(
            recipe.preparation?.map((step) => {
              return new FormGroup({
                id: new FormControl(uuidv4()),
                step: new FormControl(step.step),
              });
            }) || []
          ),
          minutes: new FormControl(recipe?.minutes || 0),
          coverImage: new FormControl(undefined),
          images: new FormArray([] as FormControl[]),
        }));

        (recipe.images ?? []).forEach((image) => {
          this.existingImages.push({ ...image });
        });

        this.existingCoverImage = recipe.coverImage
          ? { ...recipe.coverImage }
          : undefined;
      })
  }

  onSubmit(): void {
    let uploadedImages: { id: string; name: string; url: string }[] = [];

    this.uploading = true;

    let uploadImages$: Observable<unknown> =
      this.images.length > 0
        ? this.recipesService
            .uploadImages(this.images.controls.map((control) => control.value))
            .pipe(
              tap((response) => {
                uploadedImages = response;
                this.images.clear();
                uploadedImages.forEach((image) =>
                  this.newUploadedImages.push(image)
                );
              })
            )
        : of(null);

    let uploadCoverImage$: Observable<unknown> = this.coverImage.value
      ? this.recipesService.uploadImages([this.coverImage.value]).pipe(
          tap((response) => {
            this.coverImage.reset();
            this.newUploadedCoverImage = response[0];
          })
        )
      : of(null).pipe(
          tap(() => {
            this.coverImage.setValue(this.existingCoverImage);
          })
        );

    this.existingImages.forEach((id) => this.images.push(new FormControl(id)));

    uploadImages$
      .pipe(
        concatMap(() => uploadCoverImage$),
        concatMap(() => {
          const recipeData = this.transformFormIntoRecipe(this.recipeForm());
          return this.id()
            ? this.recipesService.editRecipe(recipeData, this.existingImages)
            : this.recipesService.createRecipe(recipeData, this.existingImages);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IRecipe) => {
          this.uploading = false;
          this.router.navigate(['recipe/' + response.documentId]);
        },
        error: (error: { message?: string }) => {
          this.errorModalVisible = true;
          this.uploading = false;
          this.errorMessage = error.message ?? 'Unknown error';
        },
      });
  }

  transformFormIntoRecipe(form: FormGroup): IRecipe {
    const recipe: IRecipe = {
      documentId: this.id(),
      coverImage: this.newUploadedCoverImage,
      title: form.controls['name'].getRawValue(),
      categories: form.controls['categories'].getRawValue() || [],
      preparation: form.controls['preparation'].getRawValue(),
      ingredients: form.controls['ingredients']
        .getRawValue()
        ?.map((ingredients: any) => {
          return {
            ...ingredients,
            ingredients: ingredients.ingredients.map((ingredient: any) => {
              return { ...ingredient, calories: Number.parseInt(ingredient.calories) };
            }),
          };
        }),
      images: [...this.newUploadedImages],
      minutes: form.controls['minutes'].getRawValue(),
    };

    return recipe;
  }

  addNewIngredient(index: number): void {
    const ingredientGroup = this.ingredients.at(index);

    const nestedIngredients = ingredientGroup.get('ingredients') as FormArray;

    nestedIngredients.push(
      new FormGroup({
        id: new FormControl(uuidv4()),
        name: new FormControl('', Validators.required),
        quantity: new FormControl(''),
        calories: new FormControl(),
      })
    );
  }

  addNewPreparationStep(): void {
    this.preparation.push(
      new FormGroup({
        id: new FormControl(uuidv4()),
        step: new FormControl(),
      })
    );
  }

  addNewIngredientSection(): void {
    this.ingredients.push(
      new FormGroup({
        id: new FormControl(uuidv4()),
        sectionName: new FormControl(),
        ingredients: new FormArray([
          new FormGroup({
            id: new FormControl(uuidv4()),
            name: new FormControl(undefined, Validators.required),
            quantity: new FormControl(),
            calories: new FormControl(),
          }),
        ]),
      })
    );
  }

  removeIngredient(i: number, j: number): void {
    const section = this.ingredients.at(i);
    const ingredientsArray = section.get('ingredients') as FormArray;

    if (j === 0 && ingredientsArray.length === 1) {
      ingredientsArray.at(0).reset();
    } else if (ingredientsArray.length > 1) {
      ingredientsArray.removeAt(j);
    }
  }

  removePreparationStep(index: number): void {
    this.preparation.removeAt(index);
  }

  get ingredients(): FormArray<FormGroup> {
    return this.recipeForm().get('ingredients') as FormArray;
  }

  get preparation(): FormArray<FormGroup> {
    return this.recipeForm().get('preparation') as FormArray;
  }

  getNestedIngredients(index: number): FormArray {
    return this.ingredients.at(index).get('ingredients') as FormArray;
  }

  get images(): FormArray<FormControl> {
    return this.recipeForm().get('images') as FormArray;
  }

  get coverImage(): FormControl {
    return this.recipeForm().get('coverImage') as FormControl;
  }

  onUpload(event: FileSelectEvent): void {
    event.currentFiles.forEach((file: File) => {
      this.images.push(new FormControl(file));
    });
    this.newImagePreviews.set(
      event.currentFiles.map((file) => ({ name: file.name, url: URL.createObjectURL(file) }))
    );
  }

  onRemove(event: FileRemoveEvent): void {
    this.images.removeAt(
      this.images.getRawValue().indexOf(event.file)
    );
    this.newImagePreviews.update((previews) =>
      previews.filter((p) => p.name !== event.file.name)
    );
  }

  onRemoveCoverImage(): void {
    this.newUploadedCoverImage = undefined;
    this.coverImagePreview.set(null);
    this.coverImage.setValue(undefined);
  }

  removeCoverImagePreview(): void {
    this.coverUploader()?.clear();
    this.onRemoveCoverImage();
  }

  removeExistingCoverImage(): void {
    this.existingCoverImage = undefined;
  }

  removeNewImagePreview(name: string): void {
    const idx = (this.images.getRawValue() as File[]).findIndex((f) => f.name === name);
    if (idx > -1) this.images.removeAt(idx);
    this.newImagePreviews.update((previews) => previews.filter((p) => p.name !== name));
    const uploader = this.imagesUploader();
    if (uploader) {
      uploader.files = uploader.files.filter((f) => f.name !== name);
    }
  }

  onUploadCoverImage(event: FileSelectEvent): void {
    const file = event.currentFiles[0];
    this.coverImage.setValue(file);
    this.coverImagePreview.set({ name: file.name, url: URL.createObjectURL(file) });
  }

  removeUploadedFile(file: { id: string }): void {
    this.imageDeleteDialogVisible = true;
    this.imageToBeDeleted = this.existingImages.find(
      (image) => image.id === file.id
    );
  }

  confirmUploadedFileDelete(): void {
    this.imageDeleteDialogVisible = false;
    this.existingImages = this.existingImages.filter(
      (image) => image.id !== this.imageToBeDeleted?.id
    );
    this.recipesService
      .deleteImage(this.imageToBeDeleted?.id ?? '')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error) => {
          this.errorModalVisible = true;
          this.uploading = false;
          this.errorMessage = error.message;
        },
      });
  }

  cancel(): void {
    this.imageDeleteDialogVisible = false;
    this.errorMessage = '';
    this.errorModalVisible = false;
    this.imageToBeDeleted = undefined;
  }

  goBack(): void {
    this.location.back();
  }

  deleteSection(index: number): void {
    if (this.ingredients.length > 1) {
      this.ingredients.removeAt(index);
    } else {
      const section = this.ingredients.at(0);
      section.reset();

      const nestedIngredients = section.get('ingredients') as FormArray;

      while (nestedIngredients.length) {
        nestedIngredients.removeAt(0);
      }

      nestedIngredients.push(
        new FormGroup({
          id: new FormControl(uuidv4()),
          name: new FormControl('', Validators.required),
          quantity: new FormControl(''),
          calories: new FormControl(),
        })
      );
    }
  }
}
