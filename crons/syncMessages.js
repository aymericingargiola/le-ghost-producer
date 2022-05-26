const CronJob = require('cron').CronJob;
const { processMessages } = require('../helpers/processMessages');
module.exports = {
    async syncMessages() {
        await processMessages()
        var job = new CronJob(
            '0 0 * * *',
            async function() {
                await processMessages()
            },
            null,
            false,
            'Europe/Paris'
        )
        job.start()
    }
};