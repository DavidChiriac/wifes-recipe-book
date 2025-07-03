export default {
	myJob: {
		task: async ({ strapi }) => {
			console.log("⏰ Cron job triggered");

			const selectRandomRecipes = async () => {
				const recipes = await strapi.entityService.findMany(
				"api::recipe.recipe",
				{ fields: ["id"], publicationState: 'live' }
				);

				const shuffled = recipes.sort(() => 0.5 - Math.random());

				const existing = await strapi.entityService.findMany(
				"api::daily-selection.daily-selection",
				{ populate: ["recipes"] }
				);

				const dailySelectionId = existing.id;

				const newRecipes = shuffled.filter(recipe => !existing.recipes?.some(existingRecipe => existingRecipe.id === recipe.id))
				const selected = newRecipes.slice(0, 4);

				if (selected?.length > 0) {
					await strapi.entityService.update(
						"api::daily-selection.daily-selection",
						dailySelectionId,
						{
							data: {
								recipes: [...selected, ...shuffled.slice(0,4)].slice(0,4)?.map((recipe) => recipe?.id),
							},
							populate: ["recipes"] 
						}
					);
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
