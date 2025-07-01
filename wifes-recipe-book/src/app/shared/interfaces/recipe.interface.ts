export interface IRecipe {
  id?: number;
  coverImageUrl: string;
  title: string;
  slug?: string;
  preparation: string;
  ingredients: { name: string; quantity: string }[];
  imagesUrls: string[];
  preparationTime: { hours: string; minutes: string };
}
