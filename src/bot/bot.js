'use strict'

const config = require('./../helpers/config')
const logger = require('./../helpers/logger')
const fs = require('fs')
const webdriver = require('selenium-webdriver')
const promoise = require('bluebird')
const by = webdriver.By
const delay = config.get("delay")
const xpathFirstPhoto = config.get("xpath_first_photo")
const xpathLikeClass = config.get("xpath_like_class")
const xpathLikeButton = config.get("xpath_like_button")
const xpathSubscribeButton = config.get("xpath_subscribe_button")
const likedClass = config.get("liked_class")
//TODO
const subscribeButtonText = config.get("subscribe_button_text")
const unsubscribeButtonText = config.get("unsubscribe_button_text")

class InstagramBot {
	constructor (taskId)
	{
		this.taskId = taskId
		this._taskPath = config.get("data_dir") + this.taskId + ".json"
	}

	startLikeAndSubscribeBoting ()
	{
		return new promoise((resolve, reject) =>
		{
			this._getTask().then(() =>
			{
				this._startBrowser();
				logger.info(this.taskId + ': start boting');
				logger.info(this.taskId + ': start like and subscribe');
				this._doLikeAndSubscribeBoting().then(() =>
				{
					this._stopBrowser()
					this.save().then(() =>
					{
						logger.info(this.taskId + ': save boting');
						logger.info(this.taskId + ': stop boting');
						resolve();
					}).catch(() =>
					{
						logger.info(this.taskId + ': save task error');
						reject();
					})
				}).catch(() =>
				{
					this._stopBrowser()
					this.save().then(() =>
					{
						logger.info(this.taskId + ': boting error');
						logger.info(this.taskId + ': save boting');
						reject();
					}).catch(() =>
					{
						logger.info(this.taskId + ': save task error');
						reject();
					})
				})
			}).catch(() =>
			{
				logger.info(this.taskId + ': task read error');
				reject();
			})
		})
	}

	startUnsubscribeBoting ()
	{
		return new promoise((resolve, reject) =>
		{
			this._getTask().then(() =>
			{
				this._startBrowser();
				logger.info(this.taskId + ': start boting');
				logger.info(this.taskId + ': start unsubscribe');
				this._doUnsubscribeBoting().then(() =>
				{
					this._stopBrowser()
					this.save().then(() =>
					{
						logger.info(this.taskId + ': save boting');
						logger.info(this.taskId + ': stop boting');
						resolve();
					}).catch(() =>
					{
						logger.info(this.taskId + ': save task error');
						reject();
					})
				}).catch(() =>
				{
					this._stopBrowser()
					this.save().then(() =>
					{
						logger.info(this.taskId + ': boting error');
						logger.info(this.taskId + ': save boting');
						reject();
					}).catch(() =>
					{
						logger.info(this.taskId + ': save task error');
						reject();
					})
				})
			}).catch(() =>
			{
				logger.info(this.taskId + ': task read error');
				reject();
			})
		})
	}

	_getTask ()
	{
		return new promoise((resolve, reject) =>
		{
			logger.info(this.taskId + ': task read');
			fs.readFile(this._taskPath, (err, data) =>
			{
				if (err)
				{
					reject();
				}
				else
				{
					this._task = JSON.parse(data)
					resolve();
				}
			})
		})
	}

	_doUnsubscribeBoting ()
	{
		return new promoise((resolve, reject) =>
		{
			if (this._task.users_for_unsubscribe.length)
			{
				this._auth()
					.then(() => this._openUser(this._task.users_for_unsubscribe[0])
									.then(() => this._unSubscribe()
													.then(() => {
														this._task.users_for_unsubscribe.splice(0, 1)
														this.save()
															.then(() => this._doUnsubscribeBoting()
																				   .then(() => resolve())
																				   .catch(err => reject(err)))
															.catch(err => reject(err))
													})
													.catch(err => reject(err)))
									.catch(err => reject(err)))
					.catch(err => reject(err))
			}
			else
			{
				resolve();
			}
		})
	}

	_doLikeAndSubscribeBoting ()
	{
		return new promoise((resolve, reject) =>
		{
			if (this._task.users_for_like.length)
			{
				this._auth()
					.then(() => this._openUser(this._task.users_for_like[0])
									.then(() => this._subscribe(this._task.users_for_like[0])
													.then(() => this._findFirstFoto()
																	.then(() => this._like()
																					.then(() =>
																					{
																						this._task.users_for_like.splice(0, 1)
																						this.save()
																							.then(() => this._doLikeAndSubscribeBoting()
																											.then(() => resolve())
																											.catch(err => reject(err)))
																							.catch(err => reject(err))
																					}).catch(err => reject(err)))
																	.catch(err => reject(err)))
													.catch(err => reject(err)))
									.catch(err => reject(err)))
					.catch(err => reject(err))
			}
			else
			{
				resolve();
			}
		})
	}

	save ()
	{
		return new promoise((resolve, reject) =>
		{
			fs.writeFile(this._taskPath, JSON.stringify(this._task), (err) =>
			{
				if (err)
				{
					reject();
				}
				else
				{
					resolve();
				}
			})
		})
	}

	_startBrowser ()
	{
		this._browser = this._browser || new webdriver
				.Builder()
				.withCapabilities(webdriver.Capabilities.phantomjs())
				.build()
	}

	_stopBrowser ()
	{
		if (this._browser)
		{
			this._browser.quit()
		}
	}

	_auth ()
	{
		return new promoise((resolve, reject) =>
		{
			this._browser.manage().window().setSize(1024, 700);
			this._browser.get('https://www.instagram.com/accounts/login/');
			this._sleep().then(() =>
			{
				this._browser.findElement(by.name('username')).sendKeys(this._task.instagram_account_user_id);
				this._browser.findElement(by.name('password')).sendKeys(this._task.instagram_account_password);
				this._browser.findElement(by.xpath('//button')).click();
				this._sleep().then(() => resolve()).catch(err => reject(err));
			}).catch(err => reject(err));
		})
	}

	_openUser (accountId)
	{
		return new promoise((resolve, reject) =>
		{
			this._sleep().then(() =>
			{
				logger.info(this.taskId + ': open user - ' + accountId);
				this._browser.get('https://instagram.com/' + accountId);
				this._sleep().then(() => resolve()).catch(err => reject(err));
			}).catch(err => reject(err));
		})
	}

	_subscribe (accountId)
	{
		return new promoise((resolve, reject) =>
		{
			this._sleep().then(() =>
			{
				logger.info(this.taskId + ': find subscribe button');
				this._browser.findElement(by.xpath(xpathSubscribeButton)).getText().then((text) =>
				{
					if (text == subscribeButtonText)
					{
						logger.info(this.taskId + ': do subscribe');
						this._browser.findElement(by.xpath(xpathSubscribeButton)).click().then(() => {
							this._task.users_for_unsubscribe.push(accountId)
							this.save().then(() => resolve()).catch(err => reject(err))
						}).catch(err => reject(err));
					}
					else
					{
						logger.info(this.taskId + ': already subscribed');
						resolve()
					}
				}).catch(err => reject(err))
			}).catch(err => reject(err));
		})
	}

	_unSubscribe ()
	{
		return new promoise((resolve, reject) =>
		{
			this._sleep().then(() =>
			{
				logger.info(this.taskId + ': find unsubscribe button');
				this._browser.findElement(by.xpath(xpathSubscribeButton)).getText().then((text) =>
				{
					console.log(text)
					if (text == unsubscribeButtonText)
					{
						logger.info(this.taskId + ': do unsubscribe');
						this._browser.findElement(by.xpath(xpathSubscribeButton)).click().then(() => {
							resolve()
						}).catch(err => reject(err));
					}
					else
					{
						logger.info(this.taskId + ': already unsubscribed');
						resolve()
					}
				}).catch(err => reject(err))
			}).catch(err => reject(err));
		})
	}

	_findFirstFoto ()
	{
		return new promoise((resolve, reject) =>
		{
			this._sleep().then(() =>
			{
				logger.info(this.taskId + ': find first foto');
				this._browser.findElement(by.xpath(xpathFirstPhoto)).click().then(() => resolve()).catch(err => reject(err));
			}).catch(err => reject(err));
		})
	}

	_like ()
	{
		return new promoise((resolve, reject) =>
		{
			this._sleep().then(() =>
			{
				logger.info(this.taskId + ': find like class');
				this._browser.findElement(by.xpath(xpathLikeClass)).getAttribute('class').then((className) =>
				{
					if (className.indexOf(likedClass) === -1)
					{
						logger.info(this.taskId + ': do like');
						this._browser.findElement(by.xpath(xpathLikeButton)).click().then(() => resolve()).catch(err => reject(err));
					}
					else
					{
						logger.info(this.taskId + ': already liked');
						resolve()
					}
				}).catch(err => reject(err));
			}).catch(err => reject(err));
		})
	}

	_sleep ()
	{
		return new promoise((resolve, reject) =>
		{
			let maxDelay = delay + 250
			let minDelay = delay - 250 || 500
			this._browser.sleep(Math.random() * (maxDelay - minDelay) + minDelay).then(() => resolve()).catch(err => reject(err));
		})
	}
}

module.exports = function (taskId)
{
	return new InstagramBot(taskId)
}