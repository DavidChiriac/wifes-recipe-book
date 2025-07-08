export default (config: any, { strapi }: { strapi: any }) => {
  return async (ctx: any, next: () => Promise<void>) => {
    const today = new Date().toISOString().slice(0, 10);

    try {
      // Check if today has already been processed
      const existingEntry = await strapi.entityService.findMany('api::today-recommended.today-recommended', {
        filters: { date: today },
        limit: 1,
      });

      if (!existingEntry || existingEntry?.length === 0) {
        strapi.log.info('🕒 First request of the day: running daily recipe job');

        try {
          await strapi.service('api::recipe.recipe').getDailyRecommended();

          // Save today's date
          await strapi.entityService.create('api::today-recommended.today-recommended', {
            data: {
              date: today,
            },
          });
        } catch (err) {
          strapi.log.error('❌ Error running daily recipe job:', err);
        }

        try {
          await strapi.service('api::recipe.recipe').deleteUnlinkedMedia();
        } catch(err) {
          strapi.log.error('❌ Error running daily images job:', err);
        }
      }
    } catch (err) {
      strapi.log.error('❌ Error checking TodayRecommended entry:', err);
    }

    await next();
  };
};
