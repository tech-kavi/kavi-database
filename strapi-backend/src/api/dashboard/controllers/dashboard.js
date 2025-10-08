'use strict';

/**
 * A set of functions called "actions" for `dashboard`
 */

module.exports = {
  // expertDetails: async (ctx, next) => {
  //   try {
  //     const totalExperts = await strapi.entityService.count('api::expert.expert');

  //     // Average Quote (from experts.original_quote)
  //   const experts = await strapi.entityService.findMany('api::expert.expert', {
  //     fields: ['original_quote'],
  //     limit: -1, // fetch all experts
  //   });

  //   // Filter only valid quotes (non-null, non-0, numeric)
  //   const validQuotes = experts
  //     .map(e => Number(e.original_quote))
  //     .filter(q => !isNaN(q) && q > 0);

  //       const avgQuote = validQuotes.length
  //     ? (validQuotes.reduce((a, b) => a + b, 0) / validQuotes.length).toFixed(2)
  //     : 0;

  //    // Average Quote (from experiences)
  //     const experiences = await strapi.entityService.findMany('api::experience.experience', {
  //       fields: ['type'],
  //       limit: -1, // fetch all to calculate average
  //     });
  //     // const quotes = experiences.map(e => Number(e.quote) || 0);
  //     // const avgQuote = quotes.length
  //     //   ? (quotes.reduce((a, b) => a + b, 0) / quotes.length).toFixed(2)
  //     //   : 0;

  //       // Count experiences by type
  //     const typeCounts = experiences.reduce((acc, exp) => {
  //       const type = exp.type || 'Unknown';
  //       acc[type] = (acc[type] || 0) + 1;
  //       return acc;
  //     }, {});

  //     // Calls Completed
  //     const callsCompleted = await strapi.documents('api::project.project').count({status:'published'});


  //     ctx.send({
  //       totalExperts,
  //       avgQuote,
  //       callsCompleted,
  //       typeCounts,
  //     });
  //   } catch (err) {
  //     console.error(err);
  //     ctx.send({ error: 'Failed to fetch dashboard stats', details: err }, 500);
  //   }
  // },




// recentExperts: async (ctx, next) => {
//     try {
//       const { period } = ctx.request.query; // week, month, 3month, 6month, year
//       const now = new Date();

//       // Helper to get past date based on period
//       const getPastDate = (period) => {
//         const date = new Date();
//         switch (period) {
//           case 'week':
//             date.setDate(now.getDate() - 7);
//             break;
//           case 'month':
//             date.setMonth(now.getMonth() - 1);
//             break;
//           case '3month':
//             date.setMonth(now.getMonth() - 3);
//             break;
//           case '6month':
//             date.setMonth(now.getMonth() - 6);
//             break;
//           case 'year':
//             date.setFullYear(now.getFullYear() - 1);
//             break;
//           default:
//             date.setDate(now.getDate() - 7); // default to week
//         }
//         return date.toISOString();
//       };

//       const count = await strapi.entityService.count('api::expert.expert', {
//         filters: { createdAt: { $gte: getPastDate(period) } },
//       });

//       ctx.send({ count });
//     } catch (err) {
//       console.error(err);
//       ctx.send({ error: 'Failed to fetch expert count', details: err }, 500);
//     }
//   },

expertDetails: async (ctx) => {
  try {
    const knex = strapi.db.connection;

    // Total experts
    // const [{ count: totalExperts }] = await knex("experts").whereNotNull('published_at').count("id");

    // // Average original_quote (ignoring null/0)
    // const [{ avg: avgQuote }] = await knex("experts")
    //   .whereNotNull("original_quote")
    //   .andWhere("original_quote", ">", 0)
    //   .avg("original_quote as avg");

    const [{ totalExperts, avgQuote }] = await knex("experts")
    .whereNotNull('published_at')
    .andWhere(builder => builder.where('original_quote', '>', 0).orWhereNull('original_quote'))
    .count("id as totalExperts")
    .avg("original_quote as avgQuote");


    // Count experiences by type
    const typeCountsRaw = await knex("experiences")
      .select("type")
      .count("* as count")
      .whereNotNull('published_at')
      .groupBy("type");

    // Format typeCounts as { type: count }
    const typeCounts = typeCountsRaw.reduce((acc, row) => {
      acc[row.type || "Unknown"] = Number(row.count);
      return acc;
    }, {});

    // Calls completed (only published projects)
    // const [{ count: callsCompleted }] = await knex("projects")
    //   .whereNotNull("published_at") // only published
    //   .count("id");

    //   const [{ avgfinal: avgCallPrice }] = await knex("projects")
    //   .whereNotNull("published_at") // only published
    //   .andWhere("final_amount",">",0)
    //   .avg("final_amount as avgfinal");

    const [{ callsCompleted, avgCallPrice }] = await knex("projects")
    .whereNotNull("published_at")
    .andWhere("final_amount", ">", 0)
    .count("id as callsCompleted")
    .avg("final_amount as avgCallPrice");


    ctx.send({
      totalExperts: Number(totalExperts),
      avgQuote: avgQuote ? parseFloat(avgQuote).toFixed(2) : "0.00",
      callsCompleted: Number(callsCompleted),
      avgCallPrice: avgCallPrice ? parseFloat(avgCallPrice).toFixed(2) : "0.00",
      typeCounts,
    });
  } catch (err) {
    console.error(err);
    ctx.send({ error: "Failed to fetch dashboard stats", details: err }, 500);
  }
},


recentExperts: async (ctx) => {
  try {
    const { period } = ctx.request.query;
    const now = new Date();

    const getPastDate = (period) => {
      const date = new Date();
      switch (period) {
        case "week": date.setDate(now.getDate() - 7); break;
        case "month": date.setMonth(now.getMonth() - 1); break;
        case "3month": date.setMonth(now.getMonth() - 3); break;
        case "6month": date.setMonth(now.getMonth() - 6); break;
        case "year": date.setFullYear(now.getFullYear() - 1); break;
        default: date.setDate(now.getDate() - 7);
      }
      return date.toISOString();
    };

    const knex = strapi.db.connection;

    const [{ count }] = await knex("experts")
      .where("created_at", ">=", getPastDate(period))
      .count("id")
      .whereNotNull('published_at');

      // console.log(count);

    ctx.send({ count: Number(count) });
  } catch (err) {
    console.error(err);
    ctx.send({ error: "Failed to fetch expert count", details: err }, 500);
  }
},



};
