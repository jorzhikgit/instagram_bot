'use strict'

const instagramBot = require('./bot')

module.exports = function (input, done)
{
	let instagramBot2 = instagramBot(input.taskId)
	instagramBot2.startLikeAndSubscribeBoting().then(() => done()).catch(() => done())
	//instagramBot2.startUnsubscribeBoting().then(() => done()).catch(() => done())
};