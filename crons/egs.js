const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const CronJob = require('cron').CronJob;
const {COMMON, client, EgsFreeGamesDb} = require("../index");
const { getChannelById } = require('../helpers/getChannelsInfos');
const tools = require('../tools/tools');
const egsUrl = "https://store.epicgames.com";
module.exports = {
    async getFreeGames() {
        var job = new CronJob(
            '0 20 * * *',
            async function() {
                console.log("Checking new Epic Games Store free games...")
                let freeGames = [];
                try {
                    const egsFreeGame = await fetch("https://store-site-backend-static-ipv4.ak.epicgames.com/freeGamesPromotions?locale=fr&country=FR&allowCountries=FR");
                    const response = egsFreeGame.body._outBuffer.toString();
                    const formatResponse = response.substr(0, response.lastIndexOf("{}}") + 3);
                    const json = JSON.parse(formatResponse);
                    freeGames = json.data.Catalog.searchStore.elements.filter(g => g.title != "Mystery Game");
                } catch (err) {
                    console.log(`Error while checking Epic Games Store free games !`, err)
                    return
                }
                await tools.asyncForEach(freeGames, async (game) => {
                    const id = game.id;
                    const isFreeGameExist = await EgsFreeGamesDb.findOne({ where: { id: id } });
                    if (isFreeGameExist) return
                    const title = game.title;
                    const offerType = game.offerType.toLowerCase();
                    const productSlug = game.productSlug;
                    const url = `${egsUrl}/${offerType === "bundle" ? "bundles" : "p"}/${productSlug}`;
                    const startDate = game.promotions.promotionalOffers[0].promotionalOffers[0].startDate;
                    const endDate = game.promotions.promotionalOffers[0].promotionalOffers[0].endDate;
                    console.log(`${title}[${id}] is a new free game !`)
                    await EgsFreeGamesDb.create({
                        id: id,
                        title: title,
                        startDate: startDate,
                        endDate: endDate
                    });
                    console.log(`${title}[${id}] saved to database.`)
                    const channel = await getChannelById(COMMON.channels['🎮videogames'].id)
                    channel.send(`Nouveau jeu Epic Games Store gratuit ! ${title} : ${url}`)
                })
            },
            null,
            false,
            'Europe/Paris'
        )
        job.start()
    }
};