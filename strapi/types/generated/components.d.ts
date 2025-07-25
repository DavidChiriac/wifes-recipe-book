import type { Schema, Struct } from '@strapi/strapi';

export interface RecipeIngredient extends Struct.ComponentSchema {
  collectionName: 'components_recipe_ingredients';
  info: {
    displayName: 'ingredient';
  };
  attributes: {
    name: Schema.Attribute.String;
    quantity: Schema.Attribute.String;
  };
}

export interface RecipeIngredientsSection extends Struct.ComponentSchema {
  collectionName: 'components_recipe_ingredients_sections';
  info: {
    displayName: 'ingredients-section';
  };
  attributes: {
    ingredients: Schema.Attribute.Component<'recipe.ingredient', true>;
    sectionName: Schema.Attribute.String;
  };
}

export interface RecipePreparationTime extends Struct.ComponentSchema {
  collectionName: 'components_recipe_preparation_times';
  info: {
    displayName: 'preparationTime';
  };
  attributes: {
    hours: Schema.Attribute.Integer;
    minutes: Schema.Attribute.Integer;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'recipe.ingredient': RecipeIngredient;
      'recipe.ingredients-section': RecipeIngredientsSection;
      'recipe.preparation-time': RecipePreparationTime;
    }
  }
}
