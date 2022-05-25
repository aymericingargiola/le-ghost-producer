const { SlashCommandBuilder } = require('@discordjs/builders');
const {client, MessagesDb} = require("../index");
const processMessages = require('../helpers/processMessages');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('syncmessages')
		.setDescription('Synchroniser tous les messages avec la BDD'),
	async execute(interaction) {
        if (interaction.user.id === "163761589311242255") {
            console.time("Synchro des messages réalisé en ");
            await processMessages.processMessages(client, MessagesDb);
            console.timeEnd("Synchro des messages réalisé en ");
        } else {
            await interaction.reply('Seul aymeric (lazerzf!ne) peut lancer cette commande (charge lourde)');
        }
	},
};