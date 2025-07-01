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
    coverPicture: new FormControl(),
    pictures: new FormArray([] as FormControl[]),
  });

  uploadedFiles: File[] = [];
  uploadedCoverPicture: File | undefined;

  slug = '';

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
  }

  populateForm(): void {
    this.recipesService
      .getSingleRecipe(this.slug)
      .pipe(untilDestroyed(this))
      .subscribe((recipe) => {
        this.recipeForm = new FormGroup({
          name: new FormControl(recipe.title, Validators.required),
          ingredients: new FormArray(
            [
              ...recipe.ingredients.map(
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
          hours: new FormControl(parseInt(recipe.preparationTime.hours)),
          minutes: new FormControl(parseInt(recipe.preparationTime.minutes)),
          coverPicture: new FormControl(recipe.coverImageUrl),
          pictures: new FormArray([
            ...recipe.imagesUrls.map((image) => new FormControl(image)),
          ]),
        });
      });
  }

  onSubmit(): void {
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
    console.log({
      coverImage: {
        url: '',
      },
      coverImageUrl: '',
      title: form.controls['name'].getRawValue(),
      slug: this.slug ? this.slug : undefined,
      preparation: form.controls['preparation'].getRawValue(),
      ingredients: form.controls['ingredients'].getRawValue(),
      images: [],
      imagesUrls: [],
      preparationTime: {
        hour: form.controls['hour'].getRawValue(),
        minutes: form.controls['minutes'].getRawValue(),
      },
    });

    return {
      coverImageUrl: '',
      title: form.controls['name'].getRawValue(),
      slug: this.slug ? this.slug : undefined,
      preparation: form.controls['preparation'].getRawValue(),
      ingredients: form.controls['ingredients'].getRawValue(),
      imagesUrls: [],
      preparationTime: {
        hours: form.controls['hour'].getRawValue(),
        minutes: form.controls['minutes'].getRawValue(),
      },
    };
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

  get pictures(): FormArray<FormControl> {
    return this.recipeForm.get('pictures') as FormArray;
  }

  get coverPicture(): FormControl {
    return this.recipeForm.get('coverPicture') as FormControl;
  }

  onUpload(event: FileSelectEvent): void {
    this.uploadedFiles = event.currentFiles;
    this.uploadedFiles.forEach((file: File) => {
      this.pictures.push(new FormControl(file));
    });
    this.uploadedFiles = [];
  }

  onRemove(event: FileRemoveEvent): void {
    this.pictures.removeAt(
      this.pictures.getRawValue().findIndex((file) => file === event.file)
    );
  }

  onRemoveCoverPicture(): void {
    this.coverPicture.setValue(undefined);
  }

  onUploadCoverPicture(event: FileSelectEvent): void {
    this.uploadedCoverPicture = event.currentFiles[0];
    this.coverPicture.setValue(new FormControl(event.currentFiles[0]));
    this.uploadedCoverPicture = undefined;
  }
}
