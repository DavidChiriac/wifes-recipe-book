export default async (ctx, config, { strapi }) => {
  const user = ctx.state.user;

  if (!user) {
    return false;
  }

  const recipe = await strapi.entityService.findMany('api::recipe.recipe', {
    filters: { documentId: ctx.params.id },
    populate: { author: true },
  });

  if (!recipe) {
    return false;
  }

  const isOwner = recipe[0].author?.id === user.id;
  const isAdmin = user.role === 'Admin';

  if (!isOwner && !isAdmin) {
    return false;
  }

  return true;
};
