/**
 * recipe router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::recipe.recipe', {
  config: {
    update: {
      policies: ['api::recipe.is-owner-or-admin'],
    },
    delete: {
      policies: ['api::recipe.is-owner-or-admin'],
    },
  },
});
