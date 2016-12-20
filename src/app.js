'use strict'

const threads = require('threads');
const config = threads.config;
const spawn = threads.spawn;

config.set({
	basepath: {
		node: __dirname + '/bot'
	}
});

const thread = spawn("run");

thread
	.send({taskId: ''})
	.on('message', function (response)
	{
		thread.kill();
	})
	.on('error', function (error)
	{
		console.error('Worker errored:', error);
	})
	.on('exit', function ()
	{
		console.log('Worker has been terminated.');
	});
