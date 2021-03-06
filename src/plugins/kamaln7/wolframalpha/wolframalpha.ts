var wolfram = require('wolfram');
export class Plugin {
	bot:any;
	database:any;
	client:any;
	commands:any;
	config:any;
	wolfram:any;

	constructor(bot:any, config:any) {
		this.bot = bot;
		this.database = bot.database;
		this.client = bot.client;
		this.config = config;
		this.commands = {
			'wolframalpha': 'onCommandWolframalpha',
			'wa': 'onCommandWolframalpha'
		};

		this.wolfram = wolfram.createClient(config.applicationId);
	}

	onCommandWolframalpha(from:string, to:string, message:string, args:any) {
		if (args.length < 2) {
			this.bot.reply(from, to, 'Usage: .wolframalpha <query>', 'notice');
			return;
		}

		var query = args;
		query.shift();
		query = query.join(' ');
		this.wolfram.query(query, (function(err, results){
			if(err){
				this.bot.reply(from, to, err, 'notice');
				return;
			}

			if(!results || !results.length){
				this.bot.reply(from, to, 'No results.');
				return;
			}

			results.forEach((function(result){
				if(result.primary){
					var result = result.subpods;
					this.bot.reply(from, to, result[0].value);
				}
			}).bind(this));
		}).bind(this));
	}

}
