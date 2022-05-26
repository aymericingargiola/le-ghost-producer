const {client, MessagesDb, COMMON} = require("../index");
module.exports = {
	name: 'messageUpdate',
	async execute(oldMessage, newMessage) {
		const ignoreChans = [];
        const ignoreUsers = [COMMON.users["Le Ghost Producer#9105"].id];
		if (!ignoreChans.includes(newMessage.channelId) && !ignoreUsers.includes(newMessage.author.id)) {
			console.log(`${newMessage.author.tag}[${newMessage.author}] a édité "${oldMessage.content}" en "${newMessage.content}" le ${new Date().toISOString()}`);
			console.log("sauvegarde dans la ddb...");
			await MessagesDb.update({content: newMessage.content},{where:{id: newMessage.id}});
			console.log("Message sauvegardé !");
		}
	},
};