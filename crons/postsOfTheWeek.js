const { client, COMMON, devEnv } = require("../index");
const CronJob = require('cron').CronJob;
const { getWeeklyPosts, buildMessageDetailsString } = require('../helpers/getPosts');
const { getChannelById } = require('../helpers/getChannelsInfos');
module.exports = {
    async writePostOfTheWeek() {
        var job = new CronJob(
            '0 23 * * SUN',
            async function() {
                const channel = await getChannelById(!devEnv ? COMMON.channels['🎮videogames'].id : COMMON.channels['👻bot'].threads['test-bot'].id)
                const dailyPosts = await getWeeklyPosts()
                const byUsersDetails = buildMessageDetailsString(dailyPosts.byUsers, "Posteurs de la semaine")
                channel.send(byUsersDetails)
            },
            null,
            false,
            'Europe/Paris'
        )
        job.start()
    }
};