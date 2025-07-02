export interface IRecipe {
  id?: number;
  coverImage?: { url: string; id: string; name: string };
  title: string;
  slug?: string;
  preparation: string;
  ingredients: { name: string; quantity: string }[];
  images?: { url: string; id: string; name: string }[];
  preparationTime?: { hours: string; minutes: string };
  documentId?: string;
}
