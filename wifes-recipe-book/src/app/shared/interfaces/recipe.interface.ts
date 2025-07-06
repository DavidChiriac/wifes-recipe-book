export interface IRecipe {
  coverImage?: { url: string; id: string; name: string };
  title: string;
  preparation: string;
  ingredients: { sectionName: string; ingredients: {name: string; quantity: string}[] }[];
  images?: { url: string; id: string; name: string }[];
  preparationTime?: { hours: string; minutes: string };
  documentId?: string;
}
