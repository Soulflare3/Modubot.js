var irc = require('irc'),
    mysql = require('mysql'),

	plugin = require('./plugin');

Bot = exports.Bot = function (configDir) {
	var defaultConfig = require('../' + configDir + '/config.json');
	var localConfig = require('../' + configDir + '/local/config.json');
	var config = defaultConfig;

	Object.keys(localConfig).forEach(function(key) {
		switch(key){
			case "plugin":
				Object.keys(localConfig[key]).forEach(function(plugin) {
					Object.keys(localConfig[key][plugin]).forEach(function(item) {
						config[key][plugin][item] = localConfig[key][plugin][item];
					});
				});
				break;
			default:
				config[key] = localConfig[key];
		}
	});

	this.config = config;
	this.plugins = this.config.plugins;
	this.hooks = [];
};

Bot.prototype.spawn = function () {
	var config = this.config;
	var client = this.client;
    var database = this.database;

    this.database = mysql.createConnection({
        host     : config.database.host,
        user     : config.database.user,
        password : config.database.password,
        database : config.database.database
    });

	console.log('Connecting to ' + config.host);

	this.client = new irc.Client(config.host, config.nick, {
		port: config.port,
		userName: config.username,
		realName: config.realname,
		channels: config.channels
	});

	for (var i = 0, z = config.plugins.length; i < z; i++) {
		var p = config.plugins[i];
		plugin.load(this, p);
	}

	this.client.addListener('message', function (from, to, message) {
		if (message.charAt(0) == config.command) {
			var command = message.split(' ')[0].replace(config.command, '');

			this.emit('command.' + command, from, to, message, message.split(' '));
		}
	});

	this.client.addListener('raw', function (raw) {
		if (config.debug) {
			console.log(Math.round(new Date().getTime() / 1000) + ' ' + raw.rawCommand + ' ' + raw.args.join(' '));
		}
	});

	this.client.addListener('join', function (channel, nick, message) {
		if (config.debug) {
			console.log('Joined Channel: ', channel);
		}
	});

	/**
	 * Sends errors to plugins and if debug show them
	 */
	this.client.addListener('error', function (message) {
		if (config.debug) {
			console.log('error: ', message);
		}
	});

};
