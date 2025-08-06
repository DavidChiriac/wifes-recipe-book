export interface IRecipe {
  id?: string;
  coverImage?: { url: string; id: string; name: string };
  title: string;
  categories: {name: string; icon: string; id: string}[];
  preparation: {step: string}[];
  ingredients: { sectionName: string; ingredients: {name: string; quantity: string; calories: number}[] }[];
  images?: { url: string; id: string; name: string }[];
  preparationTime?: { hours: string; minutes: string };
  documentId?: string;
  author?: {documentId: string};
  totalCalories?: number;
  isFavourite?: boolean;
}
