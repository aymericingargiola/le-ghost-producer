const dates = require('../tools/dates');
const { getUserNameById, getUserNickNameById } = require('./getUserInfos');
const { getChannelNameById } = require('./getChannelsInfos');
const { MessagesDb } = require("../index");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
module.exports = {
    async getPostsByDate(dateBegin, dateEnd) {
		let messages = []
		if (!dateEnd) {
			messages = await MessagesDb.findAll({
				where: {
					date: {
						[Op.gte]: dateBegin
					}
				}
			});
		} else {
			messages = await MessagesDb.findAll({
				where: {
					date: {
						[Op.between]: [dateBegin, dateEnd]
					}
				}
			});
		}
        return messages
    },
    async resultByUsers(messages) {
		const resultsByUsers = await messages.reduce(async (previousPromise, message) => {
			let arr = await previousPromise;
			const msg = Object.assign({}, message)
			const userId = msg.dataValues.userid
			const userExist = arr.findIndex(i => i.id === userId)
			if (userExist === -1) {
				const name = await getUserNameById(userId)
				const nickname = await getUserNickNameById(userId)
				arr.push({
					id: userId,
					name: name,
					nickname: nickname,
					number: 1
				})
			}
			else {
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
			const chanId = msg.dataValues.channelid
			const userExist = arr.findIndex(i => i.id === chanId)
			if (userExist === -1) {
				const name = await getChannelNameById(chanId)
				arr.push({
					id: chanId,
					name: name,
					number: 1
				})
			}
			else {
				arr[userExist].number += 1
			}
			return arr
		}, Promise.resolve([]))
        return resultsByChannels
    },
	async getDailyPosts() {
		const date = dates.today(true)
		const messages = await module.exports.getPostsByDate(date)
		const resultByUsers = await module.exports.resultByUsers(messages)
		const resultByChannels = await module.exports.resultByChannels(messages)
		return {
			byUsers: resultByUsers,
			byChannels: resultByChannels
		}
    },
	async getWeeklyPosts() {
		const date = dates.beginingOfTheWeek()
		const messages = await module.exports.getPostsByDate(date)
		const resultByUsers = await module.exports.resultByUsers(messages)
		const resultByChannels = await module.exports.resultByChannels(messages)
		return {
			byUsers: resultByUsers,
			byChannels: resultByChannels
		}
    },
};