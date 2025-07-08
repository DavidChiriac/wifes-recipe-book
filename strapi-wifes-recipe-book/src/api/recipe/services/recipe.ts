import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::recipe.recipe', ({ strapi }) => ({
  async getDailyRecommended() {
    const recipes = await strapi.entityService.findMany(
        "api::recipe.recipe",
        {
            fields: ["id", "recommended"],
            filters: { $not: { recommended: true } },
        }
    );

    const shuffled = recipes.sort(() => 0.5 - Math.random());

    const existing = await strapi.entityService.findMany(
        "api::recipe.recipe",
        {
            fields: ["id", "recommended"],
            filters: { recommended: true },
        }
    );
    const selected = [
        ...shuffled.slice(0, 4),
        ...existing.sort(() => 0.5 - Math.random()).slice(0, 4),
    ].slice(0, 4);

    console.log('selected: ', selected);
    console.log('existing: ', existing);

    if (selected?.length > 0) {
        existing
            .filter((recipe) => !selected.some(newRecipe => newRecipe.id === recipe.id))
            .forEach(async (recipe) => {
                await strapi.entityService.update(
                    "api::recipe.recipe",
                    recipe?.id,
                    {
                        data: {
                            recommended: false,
                        },
                    }
                );
            });

        selected
            .filter((recipe) => recipe.recommended !== true)
            ?.map((recipe) => recipe?.id)
            .forEach(async (id) => {
                await strapi.entityService.update("api::recipe.recipe", id, {
                    data: {
                        recommended: true,
                    },
                });
            });
        console.log("✅ Updated daily selection with random recipes");
    } else {
        console.warn("⚠️ No daily-selection found");
    }
  },
  async deleteUnlinkedMedia() {
    // 1. Find all media files
    const allMedia = await strapi.entityService.findMany('plugin::upload.file', {
      fields: ['id', 'url'],
      limit: -1,
    });

    // 2. Find all linked media IDs from all relations across your content types
    // This can be complex; you need to scan your content or rely on database constraints.
    // Here's a simplified example for linked media IDs stored in recipes:
    const linkedMediaIdsSet = new Set<number>();

    const recipes = await strapi.entityService.findMany('api::recipe.recipe', {
      populate: ['images', 'coverImage'], // assuming images relation
    });

    recipes?.forEach(recipe => {
      (recipe as any).images?.forEach(img => {
        linkedMediaIdsSet.add(img?.id);
      });
      if((recipe as any).coverImage?.id){
        linkedMediaIdsSet.add((recipe as any).coverImage?.id)
      }
    });

    // 3. Filter out unlinked files
    const unlinkedFiles = allMedia.filter(file => !linkedMediaIdsSet.has((file as any).id));

    // 4. Delete unlinked files
    for (const file of unlinkedFiles) {
      await strapi.plugin('upload').services.upload.remove(file);
      strapi.log.info(`Deleted unlinked media file: ${file.url}`);
    }

    strapi.log.info(`Cleanup done. Deleted ${unlinkedFiles.length} unlinked files.`);
  },
  
}));
