const { guild } = require("../index");
module.exports = {
    async getUserById(id) {
        const user = await guild.members.fetch(id)
        return user
    },
    async getUserNameById(id) {
        const user = await module.exports.getUserById(id)
        return user.user.username
    },
    async getUserNickNameById(id) {
        const user = await module.exports.getUserById(id)
        return user.nickname
    }
};