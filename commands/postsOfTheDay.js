const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const {client, guild, MessagesDb} = require("../index");
const { getDailyPosts } = require('../helpers/getPosts');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('postsoftheday')
		.setDescription('Les posteurs du jour'),
	async execute(interaction) {
		const channel = interaction.channel
		const dailyPosts = await getDailyPosts()
		//console.log(dailyPosts)
		const exampleEmbed = new MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Posts du jour')
		.setDescription('Description')
		.addField('Regular field title','Some value here')
		.addField('\u200B','\u200B')
		.addField('Inline field title', 'Some value here', true)
		.addField('Inline field title', 'Some value here', true)
		.addField('Inline field title', 'Some value here', true)
		//await channel.send({ embeds: [exampleEmbed] });
		//await interaction.reply(`test`);
	},
};
