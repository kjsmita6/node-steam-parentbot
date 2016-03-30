'use strict' // must have 'use strict' at top

const ParentBot = require('../parentbot.js').ES6; // JavaScript ES6 example
const Steam = ParentBot.Steam; // Steam object

const MySQL = require('mysql'); // require your own modules

class ChildBot extends ParentBot {
	_onFriendMsg(steamID, message, type) { // overwrite default event handlers
		if(type === Steam.EChatEntryType.ChatMsg) {
	      	this.logger.info(steamID + ' sent: ' + message);
	      	if(message === '!prices') {
	        	Bot.steamFriends.sendMessage(steamID, 'Selling for ' + Bot.options.sellPrice); //use your custom options
	      	}
	   	}
	    else {
	      console.log(type);
	    }
	}
}

let Bot = new ChildBot('username', 'password', {
	apikey: '1234567890987654321', // default apikey option for steam
	guardCode: 'ABCDE', // put guardcode here, remove after successful login
	sellPrice: '1 ref' // add your own options
});

Bot.connect(); // connect to Steam

Bot.steamTrading.on('tradeProposed', function (tradeID, steamID) { // create your own listeners
    Bot.steamTrading.respondToTrade(tradeID, false);
    Bot.logger.verbose('Trade request from ' + steamID);
});


Bot.connection = MySQL.createConnection({ // add properties to the bot from an external module
    host: 'localhost',
    user: 'root',
    password: 'password'
});

Bot.connection.connect(function (e) { // call methods on your new property
    if (e) Bot.logger.error('Error connecting to MySQL: ' + e)
});