const dates = require('../tools/dates');
const { getUserNameById, getUserNickNameById, getUserById } = require('./getUserInfos');
const { getChannelNameById } = require('./getChannelsInfos');
const { MessagesDb, COMMON } = require("../index");
const { MessageEmbed } = require('discord.js');
const { MessageAttachment } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const Sequelize = require('sequelize');
const sharp = require('sharp');
const Op = Sequelize.Op;
module.exports = {
    async getPosts({dateBegin, dateEnd, userId, channelId}) {
		let messages = []
		messages = await MessagesDb.findAll({
			where: {
				...((dateBegin || dateEnd) && {date: {
					...((dateBegin && dateEnd) && {[Op.between]: [dateBegin, dateEnd]}),
					...((dateBegin && !dateEnd) && {[Op.gte]: dateBegin}),
					...((!dateBegin && dateEnd) && {[Op.lte]: dateEnd})
				}}),
				...(userId && {userId: {[Op.like]: userId}}),
				...(channelId && {channelId: {[Op.like]: channelId}})
			}
		});
        return messages
    },
    async resultByUsers(messages) {
		const resultsByUsers = await messages.reduce(async (previousPromise, message) => {
			let arr = await previousPromise;
			const msg = Object.assign({}, message)
			const userId = msg.dataValues.userid
			const chanId = msg.dataValues.channelid
			const userExist = arr.findIndex(i => i.id === userId)
			if (userExist === -1) {
				const name = await getUserNameById(userId)
				const nickname = await getUserNickNameById(userId)
				const chanName = await getChannelNameById(chanId)
				arr.push({
					id: userId,
					name: name,
					nickname: nickname,
					number: 1,
					chans: [{
						id: chanId,
						name: chanName,
						number: 1
					}]
				})
			}
			else {
				const chanExist = arr[userExist].chans.findIndex(i => i.id === chanId)
				if (chanExist === -1) {
					const chanName = await getChannelNameById(chanId)
					arr[userExist].chans.push({
						id: chanId,
						name: chanName,
						number: 1
					})
				} else {
					arr[userExist].chans[chanExist].number += 1
				}
				arr[userExist].number += 1
			}
			return arr
		}, Promise.resolve([]))
        return resultsByUsers
    },
    async resultByChannels(messages) {
        const resultsByChannels = await messages.reduce(async (previousPromise, message) => {
			let arr = await previousPromise;
			const msg = Object.assign({}, message)
			const userId = msg.dataValues.userid
			const chanId = msg.dataValues.channelid
			const chanExist = arr.findIndex(i => i.id === chanId)
			if (chanExist === -1) {
				const name = await getChannelNameById(chanId)
				const userName = await getUserNameById(userId)
				const nickname = await getUserNickNameById(userId)
				arr.push({
					id: chanId,
					name: name,
					number: 1,
					users: [{
						id: userId,
						name: userName,
						nickname: nickname,
						number: 1
					}]
				})
			}
			else {
				const userExist = arr[chanExist].users.findIndex(i => i.id === userId)
				if (userExist === -1) {
					const userName = await getUserNameById(userId)
					const nickname = await getUserNickNameById(userId)
					arr[chanExist].users.push({
						id: userId,
						name: userName,
						nickname: nickname,
						number: 1
					})
				} else {
					arr[chanExist].users[userExist].number += 1
				}
				arr[chanExist].number += 1
			}
			return arr
		}, Promise.resolve([]))
        return resultsByChannels
    },
	async getDailyPosts(userId) {
		const date = dates.today(true)
		const messages = await module.exports.getPosts({dateBegin: date, userId: userId})
		const resultByUsers = await module.exports.resultByUsers(messages)
		const resultByChannels = await module.exports.resultByChannels(messages)
		return {
			byUsers: resultByUsers,
			byChannels: resultByChannels
		}
    },
	async getWeeklyPosts({userId, channelId} = {}) {
		const date = dates.beginingOfTheWeek()
		const messages = await module.exports.getPosts({dateBegin: date, userId: userId, channelId: channelId})
		const resultByUsers = await module.exports.resultByUsers(messages)
		const resultByChannels = await module.exports.resultByChannels(messages)
		return {
			byUsers: resultByUsers,
			byChannels: resultByChannels
		}
    },
	buildMessageDetailsString(messages, title, userId) {
		let arr = messages
		arr.sort(function (a, b) {
			return b.number - a.number;
		})
		const userPosition = userId ? arr.findIndex(u => u.id === userId) : null
		arr = userId ? arr.filter(u => u.id === userId) : arr.slice(0, 3)
		let str = ` \n**${title}**\n\n`
		arr.forEach((m, index) => {
			const arrLoop = m.chans ? m.chans : m.users;
			arrLoop.sort(function (a, b) {
				return b.number - a.number;
			})
			if (index != 0) {
				str += '\n'
			}
			str += `${(userPosition ? userPosition : index)+1 === 1 ? '🥇' : (userPosition ? userPosition : index)+1 === 2 ? '🥈' : (userPosition ? userPosition : index)+1 === 3 ? '🥉' : ''}${userPosition+1 > 3 || index+1 > 3 ? `${userPosition ? userPosition+1 : index+1}${(userPosition ? userPosition : index)+1 === 1 ? 'er' : 'eme'}` : ''} - ${m.nickname ? m.nickname : m.name} : **${m.number}**\n`
			str += "```"
			arrLoop.forEach((c, index) => {
				if (index === 0) {
					str += `${c.nickname ? c.nickname : c.name} : ${c.number}`
				} else {
					str += `
${c.nickname ? c.nickname : c.name} : ${c.number}`
				}
			})
			str += "```"
		})
		return str
	},
	async buildShitPostKingMessage(messages) {
		const avatarsPath = "./assets/avatars/"
		let arr = messages
		arr.sort(function (a, b) {
			return b.number - a.number;
		})
		const shitPostKingMessages = arr[0].number;
		const shitPostKingChan = arr[0].chans[0].name;
		const shitPostKingName = arr[0].nickname ? arr[0].nickname : arr[0].name;
		const shitPostKingProfile = await getUserById(arr[0].id);
		const shitPostKingAvatarUrl = shitPostKingProfile.displayAvatarURL();
		const avatar = await fetch(shitPostKingAvatarUrl);
		const avatarBuffer = Buffer.from(await avatar.arrayBuffer());
		const img = await sharp(avatarsPath + 'shitpostking.png')
		.composite([{ 
			input: avatarBuffer,
			top: 210,
			left: 210
		}]).toBuffer()
		const shitpostkingAttachment = new MessageAttachment(img,'shitpostking.png');
		const message = new MessageEmbed()
		.setColor('#0099ff')
		.setTitle(`Félicitation à ${shitPostKingName}, Shitpost King de la semaine !`)
		.setDescription(`Avec ${shitPostKingMessages} messages dans ${shitPostKingChan}`)
    	.setImage('attachment://shitpostking.png');
		return {messages: [message], files: [shitpostkingAttachment]}
	}
};