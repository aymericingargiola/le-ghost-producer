const { devEnv } = require("../index");
const { SlashCommandBuilder } = require('@discordjs/builders');
const { getDailyPosts, buildMessageDetailsString } = require('../helpers/getPosts');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('postsdujour')
		.setDescription('Les posteurs du jour')
		.addStringOption(option =>
		option.setName('position')
			.setDescription('user position')
			.setRequired(false)
			.addChoices({name: 'ma position', value: 'user position'})),
	async execute(interaction) {
		const userPositionOption = interaction.options.getString("position") ? interaction.user.id : null
		const title = userPositionOption ? "Ta position dans les posteurs du jour" : "Posteurs du jour"
		const channel = !devEnv ? interaction.channel : await getChannelById(COMMON.channels['👻bot'].threads['test-bot'].id)
		interaction.deferReply()
		interaction.deleteReply()
		const dailyPosts = await getDailyPosts()
		const byUsersDetails = buildMessageDetailsString(dailyPosts.byUsers, title, userPositionOption)
		channel.send(byUsersDetails)
	}
};
