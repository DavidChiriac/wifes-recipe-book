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
  ],
  templateUrl: './new-recipe.component.html',
  styleUrl: './new-recipe.component.scss',
})
export class NewRecipeComponent implements OnInit {
  recipeForm = new FormGroup({
    id: new FormControl(),
    name: new FormControl('', Validators.required),
    ingredients: new FormArray(
      [
        new FormGroup({
          id: new FormControl(uuidv4()),
          ingredient: new FormControl('', Validators.required),
          quantity: new FormControl(''),
        }),
      ],
      Validators.required
    ),
    preparation: new FormControl(''),
    hours: new FormControl(0),
    minutes: new FormControl(30),
    coverImage: new FormControl(),
    images: new FormArray([] as FormControl[]),
  });

  uploadedFiles: File[] = [];
  uploadedcoverImage: File | undefined;

  slug = 'margarina';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly recipesService: RecipesService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(untilDestroyed(this)).subscribe((params) => {
      if (params?.['id']) {
        this.slug = params['id'];
        this.populateForm();
      }
    });
    this.populateForm();
  }

  populateForm(): void {
    this.recipesService
      .getSingleRecipe(this.slug)
      .pipe(untilDestroyed(this))
      .subscribe((recipe) => {
        this.recipeForm = new FormGroup({
          id: new FormControl(recipe.id),
          name: new FormControl(recipe.title, Validators.required),
          ingredients: new FormArray(
            [
              ...recipe.ingredients?.map(
                (ingredient) =>
                  new FormGroup({
                    id: new FormControl(uuidv4()),
                    ingredient: new FormControl(
                      ingredient.name,
                      Validators.required
                    ),
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
          coverImage: new FormControl(''),
          images: new FormArray([] as FormControl[]),
        });

        (recipe.images ?? []).forEach((image) => {
          this.uploadedFiles.push(new File([image.url], image.name));
        });

        this.uploadedcoverImage = new File(
          [recipe.coverImage?.url ?? ''],
          recipe.coverImage?.name ?? ''
        );
      });
  }

  onSubmit(): void {
    if (this.images.length > 0) {
      this.recipesService
        .uploadImages(this.images.getRawValue())
        .pipe(untilDestroyed(this))
        .subscribe((response) => {
          this.images.clear();
          response.forEach((image: { documentId: string }) => {
            this.images.push(new FormControl(image.documentId));
          });
        });
    }

    if (Boolean(this.coverImage.getRawValue())) {
      const filesArray = new FormArray([this.coverImage.value]);

      this.recipesService
        .uploadImages(filesArray.getRawValue())
        .pipe(untilDestroyed(this))
        .subscribe((response) => {
          this.coverImage.setValue(new FormControl(response[0].documentId));
        });
    }

    console.warn(this.recipeForm.value);
    if (!this.slug || this.slug === '') {
      this.recipesService
        .createRecipe(this.transformFormIntoRecipe(this.recipeForm))
        .pipe(untilDestroyed(this))
        .subscribe((response) => {
          this.router.navigate(['recipe/' + response.slug]);
        });
    } else {
      this.recipesService
        .editRecipe(this.transformFormIntoRecipe(this.recipeForm))
        .pipe(untilDestroyed(this))
        .subscribe((response) => {
          this.router.navigate(['recipe/' + response.slug]);
        });
    }
  }

  transformFormIntoRecipe(form: FormGroup): IRecipe {
    const recipe: IRecipe = {
      id: form.controls['id'].getRawValue(),
      coverImage: form.controls['coverImage'].getRawValue(),
      title: form.controls['name'].getRawValue(),
      slug: this.slug ? this.slug : undefined,
      preparation: form.controls['preparation'].getRawValue(),
      ingredients: form.controls['ingredients'].getRawValue(),
      images: [],
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
        ingredient: new FormControl('', Validators.required),
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
    console.log(this.images);
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
    this.coverImage.setValue(new FormControl(event.currentFiles[0] as File));
    console.log(this.coverImage);
  }

  removeFile(file: File): void {
    this.uploadedFiles = this.uploadedFiles.filter((image) => image !== file);
  }
}
