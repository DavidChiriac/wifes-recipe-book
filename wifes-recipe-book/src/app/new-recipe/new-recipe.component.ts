import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
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
import { concatMap, of, tap, map } from 'rxjs';
import { environment } from '../../environments/environment.prod';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DeviceDetectorService } from 'ngx-device-detector';

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
    FloatLabelModule,
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
          sectionName: new FormControl(),
          ingredients: new FormArray([
            new FormGroup({
              id: new FormControl(uuidv4()),
              name: new FormControl('', Validators.required),
              quantity: new FormControl(''),
            }),
          ]),
        }),
      ],
      Validators.required
    ),
    preparation: new FormControl(''),
    hours: new FormControl(0),
    minutes: new FormControl(30),
    coverImage: new FormControl(undefined),
    images: new FormArray([] as FormControl[]),
  });

  existingCoverImage: { id: string; name: string; url: string } | undefined;
  existingImages: { id: string; name: string; url: string }[] = [];

  newUploadedCoverImage: { id: string; name: string; url: string } | undefined;
  newUploadedImages: { id: string; name: string; url: string }[] = [];

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
    private readonly deviceService: DeviceDetectorService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isMobile = deviceService.isMobile();
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.route.params.pipe(untilDestroyed(this)).subscribe((params) => {
        if (params?.['id']) {
          this.documentId = params['id'];
          this.documentId;
          this.populateForm();
        }
      });
    }
  }

  populateForm(): void {
    this.recipesService
      .getSingleRecipe(this.documentId)
      .pipe(untilDestroyed(this))
      .subscribe((recipe) => {
        this.recipeForm = new FormGroup({
          name: new FormControl(recipe.title, Validators.required),
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
                      })
                  )
                ),
              });
            }) || [],
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
    let uploadedImages: { id: string; name: string; url: string }[] = [];

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
                  this.newUploadedImages.push(image)
                );
              })
            )
        : of(null);

    let uploadCoverImage$ = this.coverImage.value
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
          this.uploading = false;
          this.errorMessage = error.message;
        },
      });
  }

  transformFormIntoRecipe(form: FormGroup): IRecipe {
    const recipe: IRecipe = {
      documentId: this.documentId,
      coverImage: this.newUploadedCoverImage,
      title: form.controls['name'].getRawValue(),
      preparation: form.controls['preparation'].getRawValue(),
      ingredients: form.controls['ingredients'].getRawValue(),
      images: [...this.newUploadedImages],
      preparationTime: {
        hours: form.controls['hours'].getRawValue(),
        minutes: form.controls['minutes'].getRawValue(),
      },
    };

    return recipe;
  }

  addNewIngredient(index: number): void {
    const ingredientGroup = this.ingredients.at(index) as FormGroup;

    const nestedIngredients = ingredientGroup.get('ingredients') as FormArray;

    nestedIngredients.push(
      new FormGroup({
        id: new FormControl(uuidv4()),
        name: new FormControl('', Validators.required),
        quantity: new FormControl(''),
      })
    );
  }

  addNewIngredientSection(): void {
    this.ingredients.push(
      new FormGroup({
        id: new FormControl(uuidv4()),
        sectionName: new FormControl(''),
        ingredients: new FormArray([
          new FormGroup({
            id: new FormControl(uuidv4()),
            name: new FormControl('', Validators.required),
            quantity: new FormControl(''),
          }),
        ]),
      })
    );
  }

  removeIngredient(i: number, j: number): void {
    const section = this.ingredients.at(i) as FormGroup;
    const ingredientsArray = section.get('ingredients') as FormArray;

    if (j === 0 && ingredientsArray.length === 1) {
      ingredientsArray.at(0).reset();
    } else if (ingredientsArray.length > 1) {
      ingredientsArray.removeAt(j);
    }
  }

  get ingredients(): FormArray<FormGroup> {
    return this.recipeForm.get('ingredients') as FormArray;
  }

  getNestedIngredients(index: number): FormArray {
    return this.ingredients.at(index).get('ingredients') as FormArray;
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

  onRemoveCoverImage(): void {
    this.newUploadedCoverImage = undefined;
    this.coverImage.setValue(undefined);
  }

  onUploadCoverImage(event: FileSelectEvent): void {
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
    this.recipesService
      .deleteImage(this.imageToBeDeleted?.id ?? '')
      .pipe(untilDestroyed(this))
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

  deleteSection(index: number): void {
    if (this.ingredients.length > 1) {
      this.ingredients.removeAt(index);
    } else {
      const section = this.ingredients.at(0) as FormGroup;
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
        })
      );
    }
  }
}
