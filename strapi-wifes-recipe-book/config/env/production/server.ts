export default ({ env }) => ({
	host: env("HOST", "0.0.0.0"),
	url: env("", "https://uplifting-happiness-124a800a1d.strapiapp.com"),
});
