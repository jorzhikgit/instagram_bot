"use strict"

const instagramBot = require("./bot")
const bot = instagramBot()

module.exports = function (input, done)
{
	bot.setTaskId(input.task_id)
	switch (input.command)
	{
		case "likeAndSubscribe":
			bot.startLikeAndSubscribeBoting().then(() => done()).catch(() => done())
			break;
		case "unsubscribe":
			bot.startUnsubscribeBoting().then(() => done()).catch(() => done())
			break;
		default:
			done();
			break;
	}
};