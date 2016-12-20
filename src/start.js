"use strict"

const app = require("./app")

/*
 * createBot arguments:
 * command - likeAndSubscribe|unsubscribe
 * task_id - name of file with bot parameters
 *
 */

app.createBot("unsubscribe", "task1")