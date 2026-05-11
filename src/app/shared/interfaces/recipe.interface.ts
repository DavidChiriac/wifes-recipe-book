export interface IRecipe {
  id?: string;
  coverImage?: { url: string; id: string; name: string };
  title: string;
  categories: {name: string; icon: string; id: string}[];
  preparation: {step: string}[];
  ingredients: { sectionName: string; ingredients: {name: string; quantity: string; calories: number}[] }[];
  images?: { url: string; id: string; name: string }[];
  minutes?: number;
  documentId?: string;
  author?: {documentId: string; displayName?: string};
  totalCalories?: number;
  isFavourite?: boolean;
}
