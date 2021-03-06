const { devEnv } = require("../index");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { getWeeklyPosts, buildMessageDetailsString } = require('../helpers/getPosts');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('chansdelasemaine')
		.setDescription('Les chans de la semaine'),
	async execute(interaction) {
		const title = "Chans de la semaine"
		const channel = !devEnv ? interaction.channel : await getChannelById(COMMON.channels['👻bot'].threads['test-bot'].id)
		interaction.deferReply()
		interaction.deleteReply()
		const dailyPosts = await getWeeklyPosts()
		const byChansDetails = buildMessageDetailsString(dailyPosts.byChannels, title)
		channel.send(byChansDetails)
	}
};
