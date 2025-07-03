export default {
	myJob: {
		task: async ({ strapi }) => {
			console.log("⏰ Cron job triggered");

			const selectRandomRecipes = async () => {
				const recipes = await strapi.entityService.findMany(
					"api::recipe.recipe",
					{
						fields: ["id", "recommended"],
						publicationState: "live",
						filtes: {$not: {recommended: true}}
					}
				);

				const shuffled = recipes.sort(() => 0.5 - Math.random());

				const existing = await strapi.entityService.findMany(
					"api::recipe.recipe",
					{
						fields: ["id", "recommended"],
						publicationState: "live",
						filters: { recommended: true },
					}
				);

				const newRecipes = shuffled.filter(
					(recipe) =>
						!existing.recipes?.some(
							(existingRecipe) => existingRecipe.id === recipe.id
						)
				);
				const selected = newRecipes.slice(0, 4);

				if (selected?.length > 0) {
					existing.forEach(async (recipe) => {
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

					[...selected, ...shuffled.slice(0, 4)]
						.slice(0, 4)
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
			};

			await selectRandomRecipes()
		},

		options: { rule: "0 0 * * *" },
	},
};
