export default ({ env }) => ({
	host: env("HOST", "0.0.0.0"),
	url: env("", "https://hopeful-prize-20ee3f34ef.strapiapp.com"),
});
