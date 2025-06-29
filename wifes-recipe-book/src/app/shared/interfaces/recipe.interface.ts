export interface IRecipe {
  id?: number;
  coverImage: { url: string };
  coverImageUrl: string;
  title: string;
  slug?: string;
  preparation: string;
  ingredients: { name: string; quantity: string }[];
  images: { url: string }[];
  imagesUrls: string[];
  preparationTime: { hour: string; minutes: string };
  enabled?: boolean;
}
