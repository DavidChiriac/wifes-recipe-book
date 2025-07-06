import cronTasks from "src/cron-tasks";

export default ({ env }) => ({
	host: env("HOST", "0.0.0.0"),
	url: env("", "https://classic-health-62ce790d8e.strapiapp.com"),
	cron: {
		enabled: true,
		tasks: cronTasks,
	},
});
