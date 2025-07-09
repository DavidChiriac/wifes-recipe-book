import { Context } from 'koa';

export default async (ctx: Context, config: any, { strapi }: { strapi: any }) => {
  const { id } = ctx.params;
  const user = ctx.state.user;

  if (!user) {
    return ctx.unauthorized('You must be logged in.');
  }

  const recipe = await strapi.entityService.findOne('api::recipe.recipe', id, {
    populate: { author: true },
  });

  if (!recipe) {
    return ctx.notFound('Recipe not found.');
  }

  const isOwner = recipe.author?.id === user.id;
  const isAdmin = user.roles?.some((role: any) => role.name === 'Admin');

  if (!isOwner && !isAdmin) {
    return ctx.unauthorized('You are not allowed to modify this recipe.');
  }

  return true;
};
