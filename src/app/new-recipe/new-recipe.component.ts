import { Component } from '@angular/core';
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

@Component({
  selector: 'app-new-recipe',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    FormsModule,
    FileUploadModule,
  ],
  templateUrl: './new-recipe.component.html',
  styleUrl: './new-recipe.component.scss',
})
export class NewRecipeComponent {
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
    coverPicture: new FormControl(),
    pictures: new FormArray([]),
    minutes: new FormControl(30),
  });

  uploadedFiles: File[] = [];
  uploadedCoverPicture: File | undefined;

  onSubmit(): void {
    console.warn(this.recipeForm.value);
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
