const {client, MessagesDb} = require("../index");
module.exports = {
	name: 'messageCreate',
	async execute(messageCreate) {
		const ignoreChans = [];
        const ignoreUsers = ['978622256135671868'];
		if (!ignoreChans.includes(messageCreate.channelId) && !ignoreUsers.includes(messageCreate.author.id)) {
			console.log(`${messageCreate.author.tag}[${messageCreate.author}] a écrit "${messageCreate}" dans ${messageCreate.channel.name}[${messageCreate.channel}] le ${new Date().toISOString()}`);
			console.log("sauvegarde dans la ddb...");
			await MessagesDb.create({
				id: messageCreate.id,
				userid: messageCreate.author.id,
				channelid: messageCreate.channelId,
				date: messageCreate.createdTimestamp,
				content: messageCreate.content
			});
			console.log("Message sauvegardé !");
		}
	},
};