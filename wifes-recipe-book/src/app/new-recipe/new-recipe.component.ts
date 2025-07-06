import { Component, OnInit } from '@angular/core';
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
  FileUploadModule,
} from 'primeng/fileupload';
import { v4 as uuidv4 } from 'uuid';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { RecipesService } from '../shared/services/recipes.service';
import { IRecipe } from '../shared/interfaces/recipe.interface';
import { EditorModule } from 'primeng/editor';
import { concatMap, of, tap } from 'rxjs';
import { environment } from '../../environments/environment.prod';
import { CommonModule } from '@angular/common';
import { DeviceService } from '../shared/services/device.service';
import { DialogModule } from 'primeng/dialog';

@UntilDestroy()
@Component({
  selector: 'app-new-recipe',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    FormsModule,
    FileUploadModule,
    EditorModule,
    CommonModule,
    DialogModule,
  ],
  templateUrl: './new-recipe.component.html',
  styleUrl: './new-recipe.component.scss',
})
export class NewRecipeComponent implements OnInit {
  recipeForm = new FormGroup({
    name: new FormControl('', Validators.required),
    ingredients: new FormArray(
      [
        new FormGroup({
          id: new FormControl(uuidv4()),
          name: new FormControl('', Validators.required),
          quantity: new FormControl(''),
        }),
      ],
      Validators.required
    ),
    preparation: new FormControl(''),
    hours: new FormControl(0),
    minutes: new FormControl(30),
    coverImage: new FormControl(undefined, Validators.required),
    images: new FormArray([] as FormControl[]),
  });

  existingCoverImage: { id: string; name: string; url: string } | undefined;
  existingImages: { id: string; name: string; url: string }[] = [];

  documentId = '';

  isMobile!: boolean;

  imageDeleteDialogVisible = false;
  imageToBeDeleted: { id: string; name: string; url: string } | undefined;

  uploading = false;

  errorModalVisible = false;
  errorMessage = 'banana';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly recipesService: RecipesService,
    private readonly router: Router,
    private readonly deviceService: DeviceService
  ) {
    this.isMobile = deviceService.isMobile();
  }

  ngOnInit(): void {
    this.route.params.pipe(untilDestroyed(this)).subscribe((params) => {
      if (params?.['id']) {
        this.documentId = params['id'];
        console.log(this.documentId);
        this.populateForm();
      }
    });
  }

  populateForm(): void {
    this.recipesService
      .getSingleRecipe(this.documentId)
      .pipe(untilDestroyed(this))
      .subscribe((recipe) => {
        this.recipeForm = new FormGroup({
          name: new FormControl(recipe.title, Validators.required),
          ingredients: new FormArray(
            [
              ...recipe.ingredients?.map(
                (ingredient) =>
                  new FormGroup({
                    id: new FormControl(uuidv4()),
                    name: new FormControl(ingredient.name, Validators.required),
                    quantity: new FormControl(ingredient.quantity),
                  })
              ),
            ],
            Validators.required
          ),
          preparation: new FormControl(recipe.preparation),
          hours: new FormControl(parseInt(recipe.preparationTime?.hours || '')),
          minutes: new FormControl(
            parseInt(recipe.preparationTime?.minutes || '')
          ),
          coverImage: new FormControl(undefined),
          images: new FormArray([] as FormControl[]),
        });

        (recipe.images ?? []).forEach((image) => {
          this.existingImages.push({
            ...image,
            url: (environment.prod ? '' : environment.apiUrl) + image.url,
          });
        });

        this.existingCoverImage = recipe.coverImage
          ? {
              ...recipe.coverImage!,
              url:
                (environment.prod ? '' : environment.apiUrl) +
                recipe.coverImage?.url,
            }
          : undefined;
      });
  }

  onSubmit(): void {
    let uploadedImages: string[] = [];

    this.uploading = true;

    let uploadImages$ =
      this.images.length > 0
        ? this.recipesService
            .uploadImages(this.images.controls.map((control) => control.value))
            .pipe(
              tap((response) => {
                uploadedImages = response;
                this.images.clear();
                uploadedImages.forEach((image) =>
                  this.images.push(new FormControl(image))
                );
              })
            )
        : of(null);

    let uploadCoverImage$ = this.coverImage.value
      ? this.recipesService.uploadImages([this.coverImage.value]).pipe(
          tap((response) => {
            this.coverImage.setValue(response[0].id);
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
          const recipeData = this.transformFormIntoRecipe(this.recipeForm);
          return this.documentId
            ? this.recipesService.editRecipe(recipeData, this.existingImages)
            : this.recipesService.createRecipe(recipeData, this.existingImages);
        }),
        untilDestroyed(this)
      )
      .subscribe({
        next: (response) => {
          this.uploading = false;
          this.router.navigate(['recipe/' + response.documentId]);
        },
        error: (error) => {
          this.errorModalVisible = true;
          this.errorMessage = error.message;
        },
      });
  }

  transformFormIntoRecipe(form: FormGroup): IRecipe {
    const recipe: IRecipe = {
      documentId: this.documentId,
      coverImage:
        form.controls['coverImage'].getRawValue()?.id ??
        form.controls['coverImage'].getRawValue(),
      title: form.controls['name'].getRawValue(),
      preparation: form.controls['preparation'].getRawValue(),
      ingredients: form.controls['ingredients'].getRawValue(),
      images: [...this.images.getRawValue()],
      preparationTime: {
        hours: form.controls['hours'].getRawValue(),
        minutes: form.controls['minutes'].getRawValue(),
      },
    };

    return recipe;
  }

  addNewIngredient(): void {
    this.ingredients.push(
      new FormGroup({
        id: new FormControl(uuidv4()),
        name: new FormControl('', Validators.required),
        quantity: new FormControl(''),
      })
    );
  }

  removeIngredient(index: number): void {
    if (index === 0 && this.ingredients.controls.length === 1) {
      this.ingredients.reset();
    } else if (this.ingredients.controls.length > 1) {
      this.ingredients.removeAt(index);
    }
  }

  get ingredients(): FormArray<FormGroup> {
    return this.recipeForm.get('ingredients') as FormArray;
  }

  get images(): FormArray<FormControl> {
    return this.recipeForm.get('images') as FormArray;
  }

  get coverImage(): FormControl {
    return this.recipeForm.get('coverImage') as FormControl;
  }

  onUpload(event: FileSelectEvent): void {
    event.currentFiles.forEach((file: File) => {
      this.images.push(new FormControl(file));
    });
  }

  onRemove(event: FileRemoveEvent): void {
    this.images.removeAt(
      this.images.getRawValue().findIndex((file) => file === event.file)
    );
  }

  onRemovecoverImage(): void {
    this.coverImage.setValue(undefined);
  }

  onUploadcoverImage(event: FileSelectEvent): void {
    this.coverImage.setValue(event.currentFiles[0]);
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
    this.recipesService.deleteImage(this.imageToBeDeleted?.id ?? '').pipe(untilDestroyed(this)).subscribe({
      error: (error) => {
          this.errorModalVisible = true;
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
}
