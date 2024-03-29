// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Sequelize, Model, DataTypes } = require('sequelize');
const { Client, Collection, Intents } = require('discord.js');
const { token, guildId, devEnv } = require('./config.json');
const COMMON = require('./common.json');

// Create a new client instance
const client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'], intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite'
});


const MessagesDb = sequelize.define('messages', {
	id: {
		type: DataTypes.STRING,
		primaryKey: true
	},
    userid: DataTypes.STRING,
	channelid: DataTypes.STRING,
	date: DataTypes.NUMBER,
	content: DataTypes.TEXT
});

const EgsFreeGamesDb = sequelize.define('egsFreeGamesDb', {
	id: {
		type: DataTypes.STRING,
		primaryKey: true
	},
    title: DataTypes.STRING,
	startDate: DataTypes.STRING,
	endDate: DataTypes.STRING
});

const PrimeGamingFreeGamesDb = sequelize.define('egsFreeGamesDb', {
	id: {
		type: DataTypes.STRING,
		primaryKey: true
	},
    title: DataTypes.STRING,
	startDate: DataTypes.STRING,
	endDate: DataTypes.STRING
});

client.commands = new Collection();

// When the client is ready, run this code (only once)
client.once('ready', async () => {
    await MessagesDb.sync();
	await EgsFreeGamesDb.sync();
	await PrimeGamingFreeGamesDb.sync();
	module.exports.COMMON = COMMON;
	module.exports.client = client;
	module.exports.guild = client.guilds.cache.get(guildId);
	module.exports.devEnv = devEnv;
	module.exports.MessagesDb = MessagesDb;
	module.exports.EgsFreeGamesDb = EgsFreeGamesDb;
	module.exports.PrimeGamingFreeGamesDb = PrimeGamingFreeGamesDb;

	const commandsPath = path.join(__dirname, 'commands');
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		client.commands.set(command.data.name, command);
	}

	const eventsPath = path.join(__dirname, 'events');
	const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

	for (const file of eventFiles) {
		const filePath = path.join(eventsPath, file);
		const event = require(filePath);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		} else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	}

	// Jobs
	// const egs = require('./crons/egs');
	// egs.getFreeGamesJob()
	// await egs.getFreeGames()

	// const primeGaming = require('./crons/primeGaming');
	// primeGaming.getFreeGamesJob()
	// await primeGaming.getFreeGames()
	
	const { syncMessages } = require('./crons/syncMessages');
	await syncMessages()

	const { writePostOfTheWeek } = require('./crons/postsOfTheWeek');
	writePostOfTheWeek()

	const { shitPostKingOfTheWeek } = require('./crons/shitPostKingOfTheWeek');
	shitPostKingOfTheWeek()

});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// Login to Discord with your client's token
client.login(token);
