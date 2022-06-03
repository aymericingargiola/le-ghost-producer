const playwright = require('playwright');
const CronJob = require('cron').CronJob;
const {COMMON, PrimeGamingFreeGamesDb} = require("../index");
const { getChannelById } = require('../helpers/getChannelsInfos');
const tools = require('../tools/tools');
const primeUrl = "https://gaming.amazon.com/home";
module.exports = {
    async checkResponse(response) {
        const isStatus200 = response.status() === 200
        const isGraphQl = isStatus200 ? response.url().includes("graphql?") : false
        const json = isGraphQl ? await response.json() : null
        const isFreeGamesJson = json?.data?.games
        return isFreeGamesJson
    },
    async getFreeGames() {
        var job = new CronJob(
            '0 20 * * *',
            async function() {
                console.log("Checking new Prime Gaming free games...")
                let freeGames = [];
                const browser = await playwright.chromium.launch();
                try {
                    const page = await browser.newPage();
                    await page.goto(primeUrl);
                    const promise = page.waitForResponse(async response => await module.exports.checkResponse(response));
                    const response = await promise;
                    freeGames = await response.json();
                } catch (err) {
                    browser.close();
                    console.log(`Error while checking Prime Gaming free games !`, err)
                }
                await tools.asyncForEach(freeGames.data.games.items, async (game) => {
                    console.log(game.id)
                    const id = game.id;
                    const isFreeGameExist = await PrimeGamingFreeGamesDb.findOne({ where: { id: id } });
                    if (isFreeGameExist) return
                    const title = game.assets.title;
                    const url = game.assets.externalClaimLink ? game.assets.externalClaimLink : primeUrl;
                    const startDate = game.offers[0].startTime;
                    const endDate = game.offers[0].endTime;
                    console.log(`${title}[${id}] is a new free game !`)
                    await PrimeGamingFreeGamesDb.create({
                        id: id,
                        title: title,
                        startDate: startDate,
                        endDate: endDate
                    });
                    console.log(`${title}[${id}] saved to database.`)
                    const channel = await getChannelById(COMMON.channels['🎮videogames'].id)
                    channel.send(`[Prime Gaming] **${title}** : <${url}>`)
                    return true
                })
                browser.close();
                console.log("Checking done.")
            },
            null,
            false,
            'Europe/Paris'
        )
        job.start()
    }
};