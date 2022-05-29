const { SlashCommandBuilder } = require('@discordjs/builders');
const { getDailyPosts, buildMessageDetailsString } = require('../helpers/getPosts');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('chansdujour')
		.setDescription('Les chans du jour'),
	async execute(interaction) {
		const title = "Chans du jour"
		const channel = interaction.channel
		interaction.deferReply()
		interaction.deleteReply()
		const dailyPosts = await getDailyPosts()
		const byChansDetails = buildMessageDetailsString(dailyPosts.byChannels, title)
		channel.send(byChansDetails)
	}
};
