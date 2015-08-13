# ParentBot
A module that provides a simple base class for a Steam bot that can be easliy overwritten and customized.

# Installation
First you will need to install [node.js](http://nodejs.org) if you haven't already. <b>This will only work with Node.js v0.12.x</b>. 

Once you have node and npm installed, type this command in shell, cmd, powershell, etc:
```js
npm install steam-parentbot
```

Once it's installed, you will need to create your config file, you may use the one in the examples folder, or you can create one anywhere. It must follow the same structure as the one in example.js.

# Options
To initialize the bot, you must use `var Bot = new ChildBot(username, password)`, but you may also add an optional `options` object. This object can contain the following (and any others if you are adding to the bot):
```javascript
//Without options
var Bot = new ChildBot(username, password);

//With options
var Bot = new ChildBot(username, password, {
	apikey: '1234567890', //steam api key, will be registered automatically if one isn't found
	sentryfile: 'username.sentry', //sentry file that stores steamguard info, defaults to username.sentry
	logfile: 'username.log', //filename to log stuff to, defaults to username.log
	guardCode: 'XXXXX' //steam guard code, only needed if you get error 63 when logging in, can remove after sentry is generated
});

```

# Default methods and handlers
The base class ParentBot comes with a lot of built in methods and listeners. You can add your own, and edit the built in ones right in your config file. 

The event handlers are:
```javascript
_onError() //steamClient.on('error')
_onConnected() //steamClient.on('connected')
_onLogOnResponse(response) //steamClient.on('logOnResponse')
_onLoggedOff(eresult) //steamClient.on('loggedOff')
_onDebug() //steamClient.on('debug')

_onUpdateMachineAuth(response, callback) //steamUser.on('updateMachineAuth')

_onFriendMsg(steamID, message, type, chatter) //steamFriends.on('friendMsg')
_onFriend(steamID, relationship) //steamFriends.on('friend')
```

The two default methods are
```javascript
connect() //steamClient.connect()
logOn() //steamClient.logOn()
```

This module does not come with trade offers or trading involved, but like usual, you may add it to your config file. Check out example.js for an example of this.

# Help
If you have any questions about this, or need help editing something, feel free to open an issue or send me an <a href=mailto:smith.kyle1734@gmail.com>email</a>. I usually can respond pretty quickly, but sometimes, if i'm busy, I may not be at my phone or computer and may not answer right away. If you want to also, you can add me on <a href="http://steamcommunity.com/id/dragonbanshee">Steam</a>.

# Contributors
Feel free to add your name and github link here if you contributed. Also add what you did to contribute. 
- <a href="https://github.com/dragonbanshee">dragonbanshee (project creator)</url>


