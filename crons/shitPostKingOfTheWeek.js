const { client, COMMON, devEnv } = require("../index");
const CronJob = require('cron').CronJob;
const { getWeeklyPosts, buildShitPostKingMessage } = require('../helpers/getPosts');
const { getChannelById } = require('../helpers/getChannelsInfos');
module.exports = {
    async shitPostKingOfTheWeek() {
        var job = new CronJob(
            '0 23 * * SUN',
            async function() {
                console.log("Building Shitpost king of the week...")
                const channel = await getChannelById(COMMON.channels["🚨annonces📣"].id)
                const dailyPosts = await getWeeklyPosts({channelId: COMMON.channels["🤡meme-cemetary"].id})
                const shitPostKing = await buildShitPostKingMessage(dailyPosts.byUsers)
                channel.send({ embeds: shitPostKing.messages, files: shitPostKing.files })
                console.log("Shitpost king of the week sent !")
            },
            null,
            false,
            'Europe/Paris'
        )
        job.start()
    }
};