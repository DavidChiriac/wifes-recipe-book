import fetch from 'node-fetch';

export default {
  /**
   * Cron job that runs every hour to keep the server awake.
   */
  '*/30 * * * *': async () => {
    const url = 'https://uplifting-happiness-124a800a1d.strapiapp.com/api/recipes';

    try {
      const response = await fetch(url);

      if (response.ok) {
        strapi.log.info('[KEEPALIVE] Ping successful');
      } else {
        strapi.log.warn(`[KEEPALIVE] Ping failed with status: ${response.status}`);
      }
    } catch (error: any) {
      strapi.log.error(`[KEEPALIVE] Ping error: ${error.message}`);
    }
  },
};
