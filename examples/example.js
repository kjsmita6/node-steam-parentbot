var util = require('util');
var ParentBot = require('../ParentBot.js'); //change to 'steam-parentbot' if not running from examples directory
var Steam = ParentBot.Steam; //instance of the Steam object

var MySQL = require('mysql'); //require your own modules

var ChildBot = function () {
    ChildBot.super_.apply(this, arguments);
}

util.inherits(ChildBot, ParentBot);

var Bot = new ChildBot('username', 'password', {
  apikey: '1234567890987654321', //default apikey option for steam
  guardCode: 'ABCDE', //put guardcode here, remove after successful login
  sellPrice: '1 ref' //add your own options
});

ChildBot.prototype._onFriendMsg = function (steamID, message, type) { //overwrite default event handlers
    if(type === Steam.EChatEntryType.ChatMsg) {
      if(message === '!prices') {
        Bot.steamFriends.sendMessage(steamID, 'Selling for ' + Bot.options.sellPrice); //use your custom options
      }
      this.logger.info(steamID + ' sent: ' + message);
    }
    else {
      console.log(type);
    }
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
