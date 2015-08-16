var Steam = require('steam');
var SteamWebLogon = require('steam-weblogon');
var GetSteamApiKey = require('steam-web-api-key');
var Winston = require('winston');
var fs = require('fs');
var crypto = require('crypto');
var SteamTrade = require('steam-trade');
var SteamTradeOffers = require('steam-tradeoffers');

var ParentBot = function (username, password, options) {
    var that = this;

    this.username = username;
    this.password = password;
    this.options = options || {};

    this.steamClient = new Steam.SteamClient();
    this.steamUser = new Steam.SteamUser(this.steamClient);
    this.steamFriends = new Steam.SteamFriends(this.steamClient);
    this.steamTrading = new Steam.SteamTrading(this.steamClient);
    this.steamWebLogon = new SteamWebLogon(this.steamClient, this.steamUser);
    this.steamTrade = new SteamTrade();
    this.offers = new SteamTradeOffers();

    this.apikey = this.options.apikey || undefined;
    this.sentryfile = this.options.sentryfile || this.username + '.sentry';
    this.logfile = this.options.logfile || this.username + '.log';
    this.guardCode = this.options.guardCode || undefined;

    this.logger = new (Winston.Logger)({
        transports: [
            new (Winston.transports.Console)({
                colorize: true,
                timestamp: true,
                label: that.username,
                level: 'silly',
                json: false
            }),
            new (Winston.transports.File)({
                level: 'debug',
                timestamp: true,
                json: false,
                filename: that.logfile
            })
        ]
    });

    if (this.sentryfile) {
        fs.existsSync(this.sentryfile)
        ? this.logger.info('Using sentry file ' + this.sentryfile)
        : this.logger.warn('Sentry defined in options doesn\'t exists and will be created on successful login');
    }

    //SteamClient
    this.steamClient.on('error', function () { that._onError() });
    this.steamClient.on('connected', function () { that._onConnected() });
    this.steamClient.on('logOnResponse', function (res) { that._onLogOnResponse(res) });
    this.steamClient.on('loggedOff', function (eresult) { that._onLoggedOff(eresult) });
    this.steamClient.on('debug', that.logger.silly);

    //SteamUser events
    this.steamUser.on('updateMachineAuth', function (res, callback) { that._onUpdateMachineAuth(res, callback) });

    //SteamFriends events
    this.steamFriends.on('friendMsg', function (steamID, message, type, chatter) { that._onFriendMsg(steamID, message, type, chatter) });
    this.steamFriends.on('friend', function (steamID, relationship) { that._onFriend(steamID, relationship); });
}

var prototype = ParentBot.prototype;

prototype.connect = function () {
    this.steamClient.connect();
    this.logger.debug('Connecting to Steam...');
}

prototype.logOn = function () {
    this.logger.debug('Logging in...');
    var that = this;
    try {
		var sha = '';
		if (fs.existsSync(this.sentryfile)) {
            var file = fs.readFileSync(this.sentryfile);
            sha = crypto
						.createHash('sha1')
                        .update(file)
                        .digest();
        }

        if (this.options.guardCode) {
            this.steamUser.logOn({
                account_name: that.username,
                password: that.password,
                auth_code: that.guardCode,
                sha_sentryfile: sha
            });
        }
        else {
            this.steamUser.logOn({
                account_name: that.username,
                password: that.password,
                sha_sentryfile: sha
            });
        }
    }
	catch (err) {
        this.logger.error('Error logging in: ' + err);
        process.exit(err);
    }
}

prototype._onError = function () {
    this.logger.error('Disconnected from Steam, reconnecting...');
    this.connect();
}

prototype._onConnected = function () {
    this.logger.verbose('Connected to Steam, logging in...');
    this.logOn();
}

prototype._onLogOnResponse = function (response) {
    var that = this;
    if (response.eresult === Steam.EResult.OK) {
        this.logger.info('Logged into Steam!');
        this.steamFriends.setPersonaState(Steam.EPersonaState = 1);
        this.steamWebLogon.webLogOn(function (webSessionID, cookies) {
            cookies.forEach(function(cookie) {
              that.steamTrade.setCookie(cookie.trim());
            }
            that.steamTrade.sessionID = webSessionID;
            if (!that.apikey) {
                GetSteamApiKey({
                    sessionID: webSessionID,
                    webCookie: cookies
                }, function (e, api) {
                    if (e) that.logger.error('Error getting API key: ' + e);
                    else {
                        that.apikey = api;
                        that.offers.setup({
                          sessionID: webSessionID,
                          webCookie: cookies,
                          APIKey: that.apikey
                        });
                    }
                });
            }
            else {
              that.offers.setup({
                sessionID: webSessionID,
                webCookie: cookies,
                APIKey: that.apikey
              });
            }
            that.logger.info('Logged into Steam web');
        });
    }
    else {
        this.logger.warn('EResult for logon: ' + response.eresult);
        process.exit(response.eresult);
    }
}

prototype._onLoggedOff = function () {
    this.logger.error('Logged off of Steam, logging in again...');
    this.logOn();
}

prototype._onUpdateMachineAuth = function (response, callback) {
    this.logger.debug('New sentry: ' + response.filename);
    fs.writeFileSync(this.sentryfile, response.bytes);
    callback({
        sha_file: crypto.createHash('sha1').update(response.bytes).digest()
    });
}

prototype._onFriendMsg = function (steamID, message, type, chatter) {
    if (type === Steam.EChatEntryType.ChatMsg) {
        this.logger.info('Message from ' + steamID + ': ' + message);
        this.steamFriends.sendMessage(steamID, 'Hi, thanks for messaging me! If you are getting this message, it means that my ' +
                                                'owner hasn\'t configured me properly. Annoy them with messages until they do!');
    }
}

prototype._onFriend = function (steamID, relationship) {
    if (relationship === Steam.EFriendRelationship.RequestRecipient) {
        this.steamFriends.addFriend(steamID);
        this.steamFriends.sendMessage(steamID, 'Hi, thanks for adding me! If you are getting this message, it means that my ' +
                                                'owner hasn\'t configured me properly. Annoy them with messages until they do!');
    }
}

exports.ParentBot = ParentBot;
exports.create = function (username, password, options) {
    return new ParentBot(username, password, options);
}
