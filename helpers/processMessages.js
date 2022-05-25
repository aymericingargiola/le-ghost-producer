const tools = require('../tools/tools');
module.exports = {
    async processMessages(client, MessagesDb) {
        const channels = client.channels.cache;
        const ignore = ["479676834724708353", "479676949103509504", "497013666756165632", "564730492130295808", "737281956009476187"];
        const textChannels = channels.filter(chan => chan.type === 'GUILD_TEXT' && !ignore.includes(chan.id));
        await tools.asyncForEach(textChannels, async (chan) => {
            console.log(chan.id, chan.name)
            const messages = await chan.messages.fetch({ limit: 100 });
            console.log(`Reception de ${messages.size} messages`);
            if (messages.size > 0) {
                await tools.asyncForEach(messages, async (message) => {
                    const isMessageExist = await MessagesDb.findOne({ where: { id: message.id } });
                    if (!isMessageExist && message.type == 'DEFAULT' && message.content != '') {
                        console.log(`Sauvegarde du message "${message.content.substr(0, 60)}${message.content.length > 60 ? "..." : ""}"`);
                        await MessagesDb.create({
                            id: message.id,
                            userid: message.author.id,
                            channelid: message.channelId,
                            date: message.createdTimestamp,
                            content: message.content
                        });
                    }
                    return true
                })
            }
        })
    }
};