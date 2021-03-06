const { devEnv } = require("../index");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { getDailyPosts, buildMessageDetailsString } = require('../helpers/getPosts');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('chansdujour')
		.setDescription('Les chans du jour'),
	async execute(interaction) {
		const title = "Chans du jour"
		const channel = !devEnv ? interaction.channel : await getChannelById(COMMON.channels['👻bot'].threads['test-bot'].id)
		interaction.deferReply()
		interaction.deleteReply()
		const dailyPosts = await getDailyPosts()
		const byChansDetails = buildMessageDetailsString(dailyPosts.byChannels, title)
		channel.send(byChansDetails)
	}
};
