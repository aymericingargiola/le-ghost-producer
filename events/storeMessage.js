module.exports = {
	name: 'messageCreate',
	execute(messageCreate) {
		console.log(`${messageCreate.author.tag}[${messageCreate.author}] a écrit "${messageCreate}" dans ${messageCreate.channel.name}[${messageCreate.channel}] le ${new Date().toISOString()}`);
	},
};