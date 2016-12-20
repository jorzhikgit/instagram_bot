"use strict"

const logger = require("./helpers/logger")
const threads = require("threads")
const config = threads.config
const pool = threads.Pool
const workersPool = new pool()

config.set({
	basepath: {
		node: __dirname
	}
})

workersPool
	.on("finished", () =>
	{
		logger.info("all bots done");
		workersPool.killAll();
	});

module.exports.createBot = function (command = "unsubscribe", task_id = "default")
{
	let worker = workersPool
		.run('./bot/runner')
		.send({
			command: command,
			task_id: task_id
		})
	worker
		.on('error', () =>
		{
			logger.info("bot error: task_id: " + task_id + " command: " + command);
		})
		.on("done", () =>
		{
			logger.info("bot done: task_id: " + task_id + " command: " + command);
		})
}

module.exports.killAll = () => workersPool.killAll()