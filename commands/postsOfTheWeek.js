const { SlashCommandBuilder } = require('@discordjs/builders');
const { getWeeklyPosts, buildMessageDetailsString } = require('../helpers/getPosts');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('postsdelasemaine')
		.setDescription('Les posteurs de la semaine')
		.addStringOption(option =>
			option.setName('position')
				.setDescription('user position')
				.setRequired(false)
				.addChoices({name: 'ma position', value: 'user position'})),
	async execute(interaction) {
		const userPositionOption = interaction.options.getString("position") ? interaction.user.id : null
		const title = userPositionOption ? "Ta position dans les posteurs de la semaine" : "Posteurs de la semaine"
		const channel = interaction.channel
		interaction.deferReply()
		interaction.deleteReply()
		const dailyPosts = await getWeeklyPosts()
		const byUsersDetails = buildMessageDetailsString(dailyPosts.byUsers, title, userPositionOption)
		channel.send(byUsersDetails)
	}
};
