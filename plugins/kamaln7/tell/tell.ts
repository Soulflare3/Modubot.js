var moment = require('moment');
export class Plugin {
	name:string;
	title:string;
	description:string;
	version:string;
	author:string;

	bot:any;
	database:any;
	client:any;
	commands:any;
	tells:any;

	constructor(bot:any) {
		this.name = 'tell';
		this.title = 'Tell';
		this.description = "Tell module for Modubot";
		this.version = '0.1';
		this.author = 'Kamal Nasser';

		this.bot = bot;
		this.database = bot.database;
		this.client = bot.client;
		this.tells = {};
		this.commands = {
			'tell': 'onCommandTell'
		};

	}

	onCommandTell(from:string, to:string, message:string, args:any) {
		if (args.length < 2) {
			this.client.notice(from, this.bot.prefix + 'tell <person> <message>')
		}

		var person = args[1];
		var message = args.splice(2);
		message = message.join(' ');

		this.getTells(person).push({
			from: person,
			message: message,
			date: moment()
		});

		this.client.notice(from, "I'll pass that along.");
	}

	onMessage(from:string, to:string, message:string) {
		var client = this.client;
		var tells = this.getTells(from);

		for(var i = 0; i < tells.length; i++){
			var tell = tells[i];
			client.notice(from, '[' + tell.date.fromNow() + '] <' + tell.from + '> ' + tell.message);

			tells.splice(i--, 1);
		}
	}

	getTells(person:string) {
		person = person.toLowerCase();

		if (!this.tells.hasOwnProperty(person)) {
			this.tells[person] = [];
		}

		return this.tells[person];
	}

}
