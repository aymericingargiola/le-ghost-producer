const { guild } = require("../index");
module.exports = {
    async getChannelById(id) {
        const chan = await guild.channels.fetch(id)
        return chan
    },
    async getChannelNameById(id) {
        const chan = await module.exports.getChannelById(id)
        return chan.name
    }
};