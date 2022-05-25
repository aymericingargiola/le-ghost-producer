const tools = require('../tools/tools');
module.exports = {
    async processMessages(client, MessagesDb, force) {
        const channels = client.channels.cache;
        const ignoreChans = [];
        const ignoreUsers = ['978622256135671868'];
        const textChannels = channels.filter(chan => chan.type === 'GUILD_TEXT' && !ignoreChans.includes(chan.id));
        await tools.asyncForEach(textChannels, async (chan) => {
            let lastMessageId;
            let newMessagesSaved;
            while (true) {
                newMessagesSaved = 0;
                const options = { limit: 100 };
                if (lastMessageId) {
                    options.before = lastMessageId
                }
                const messages = await chan.messages.fetch(options);
                if (!messages.last()) {
                    break
                }
                lastMessageId = messages.last().id;
                console.log(`Reception de ${messages.size} messages de ${chan.name}[${chan.id}] | [Dernier message : ${lastMessageId}]`);
                if (messages.size > 0) {
                    await tools.asyncForEach(messages, async (message) => {
                        const isMessageExist = await MessagesDb.findOne({ where: { id: message.id } });
                        if (!isMessageExist && message.type == 'DEFAULT' && message.content != '' && !ignoreUsers.includes(message.author.id)) {
                            console.log(`Sauvegarde du message "${message.content.substr(0, 60)}${message.content.length > 60 ? "..." : ""}"`);
                            await MessagesDb.create({
                                id: message.id,
                                userid: message.author.id,
                                channelid: message.channelId,
                                date: message.createdTimestamp,
                                content: message.content
                            });
                            ++newMessagesSaved
                        }
                        return true
                    })
                }
                if (messages.size != 100 || (!force && newMessagesSaved === 0)) {
                    break
                }
            }
        })
    }
};