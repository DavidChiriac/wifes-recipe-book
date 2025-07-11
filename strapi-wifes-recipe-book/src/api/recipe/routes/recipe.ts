export default {
	routes: [
		{
			method: "PUT",
			path: "/recipes/:id",
			handler: "recipe.update",
			config: {
				policies: ["api::recipe.is-owner-or-admin"],
			},
		},
		{
			method: "DELETE",
			path: "/recipes/:id",
			handler: "recipe.delete",
			config: {
				policies: ["api::recipe.is-owner-or-admin"],
			},
		},
		{
			method: "GET",
			path: "/recipes/:id",
			handler: "recipe.findOne",
		},
		{
			method: "GET",
			path: "/recipes",
			handler: "recipe.find",
		},
		{
			method: "POST",
			path: "/recipes",
			handler: "recipe.create",
		},
	],
};
