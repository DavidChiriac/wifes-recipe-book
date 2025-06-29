export default {
	myJob: {
		task: ({ strapi }) => {
			const selectRandomRecipes = async () => {
				const recipes = await strapi.entityService.findMany(
					"api::recipe.recipe",
					{
						fields: ["id"],
					}
				);

				const shuffled = recipes.sort(() => 0.5 - Math.random());
				const selected = shuffled.slice(0, 4);

				// Fetch the existing single type
				const existing = await strapi.entityService.findMany(
					"api::daily-selection.daily-selection",
					{
						populate: ["recipes"],
					}
				);

				const id = existing?.[0]?.id;

				// Update the single type
				if (id) {
					await strapi.entityService.update(
						"api::daily-selection.daily-selection",
						id,
						{
							data: {
								recipes: selected.map((recipe) => recipe.id),
							},
						}
					);
				}
			};
		},

		options: { rule: "0 0 * * *" },
	},
};
