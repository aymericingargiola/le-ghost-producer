const { SlashCommandBuilder } = require('@discordjs/builders');
const { getWeeklyPosts, buildMessageDetailsString } = require('../helpers/getPosts');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('chansdelasemaine')
		.setDescription('Les chans de la semaine'),
	async execute(interaction) {
		const title = "Chans de la semaine"
		const channel = interaction.channel
		interaction.deferReply()
		interaction.deleteReply()
		const dailyPosts = await getWeeklyPosts()
		const byChansDetails = buildMessageDetailsString(dailyPosts.byChannels, title)
		channel.send(byChansDetails)
	}
};
