var util = require('util');
var ParentBot = require('../parentBot.js').ParentBot; //change to 'steam-parentbot' if not running from examples directory

var MySQL = require('mysql'); //require your own modules

var ChildBot = function () {
    ChildBot.super_.apply(this, arguments);
}

util.inherits(ChildBot, ParentBot);

var Bot = new ChildBot('username', 'password'); //initiate the constructor, 1st arg is username, 2nd is password, 3rd (optional) is an options object

ChildBot.prototype._onFriendMsg = function (steamID, message, chatter, type) { //overwrite default event handlers
    this.logger.info(steamID + ' sent: ' + message);
}

Bot.steamTrading.on('tradeProposed', function (tradeID, steamID) { //create your own listeners
    Bot.steamTrading.respondToTrade(tradeID, false);
    Bot.logger.verbose('Trade request from ' + steamID);
});


Bot.connection = MySQL.createConnection({ //add properties to the bot from an external module
    host: 'localhost',
    user: 'root',
    password: 'password'
});

Bot.connection.connect(function (e) { //call methods on your new property
    if (e) Bot.logger.error('Error connecting to MySQL: ' + e)
});

 
Bot.connect(); //connect to steam
