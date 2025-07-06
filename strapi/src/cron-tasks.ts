export default {
	myJob: {
		task: async ({ strapi }) => {
			console.log("⏰ Cron job triggered");

			const selectRandomRecipes = async () => {
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
			};

			await selectRandomRecipes();
		},

		options: { rule: "0 0 * * *" },
	},
};
