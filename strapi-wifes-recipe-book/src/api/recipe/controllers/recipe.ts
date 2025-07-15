// path: src/api/recipe/controllers/recipe.ts

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::recipe.recipe', ({ strapi }) => ({
    async find(ctx) {
        const user = ctx.state.user;
        let favouriteIds: number[] = [];

        if (user) {
            const userData = await strapi.entityService.findMany('plugin::users-permissions.user', {
                filters: { id: user.id },
                populate: { favourites: true },
            }) as any;

            favouriteIds = userData[0]?.favourites?.map((fav: any) => fav.id) ?? [];
        }

        const { data, meta } = await super.find(ctx);

        const updatedData = data.map((item: any) => {
            const isFav = favouriteIds.includes(item.id);
            return {
                ...item,
                ...(isFav ? { isFavourite: true } : {})
            };
        });

        return { data: updatedData, meta };
    },
    async findOne(ctx) {
        const user = ctx.state.user;
        let favouriteIds: number[] = [];

        if (user) {
            const userData = await strapi.entityService.findMany('plugin::users-permissions.user', {
                filters: { id: user.id },
                populate: { favourites: true },
            }) as any;

            favouriteIds = userData[0]?.favourites?.map((fav: any) => fav.id) ?? [];
        }

        const { data, meta } = await super.findOne(ctx);

        const updatedData = favouriteIds.includes(data.id) ? {
            ...data,
            isFavourite: true
        } : data;

        return { data: updatedData, meta };
    },
    async setFavourite(ctx) {
        const user = ctx.state.user;
        const recipeId = parseInt(ctx.params.id);
        let isFavourite = false;

        const userData = await strapi.entityService.findMany('plugin::users-permissions.user', {
            filters: { id: user.id },
            populate: { favourites: true },
        }) as any;

        if (!user) return ctx.throw('You must be logged in.');


        isFavourite = userData[0].favourites?.some(recipe => recipe.id === recipeId);

        const updateData = isFavourite
            ? { favourites: { disconnect: [{ id: recipeId }] } }
            : { favourites: { connect: [{ id: recipeId }] } };

        await strapi.db.query('plugin::users-permissions.user').update({
            where: { id: userData[0].id },
            data: updateData,
        });

        ctx.send({ message: `Recipe ${isFavourite ? 'added to' : 'removed from'} favourites.` });
    },
}));
