var httpmodule = require('https');

/**
 * App ID for the skill
 */
var APP_ID = ""; // Change to Lambda application id
var CLIENT_ID = ""; // Change to twitch client id
var USER_ID = ""; // Change to twitch username
var TWITCH_API = "https://api.twitch.tv/kraken/";

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * TwitchLive is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var TwitchLive = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
TwitchLive.prototype = Object.create(AlexaSkill.prototype);
TwitchLive.prototype.constructor = TwitchLive;

TwitchLive.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("TwitchLive onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

TwitchLive.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("TwitchLive onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    var speechOutput = "Welcome to Twitch Live.";
    var repromptText = "Ask me who's streaming.";
    response.ask(speechOutput, repromptText);
};

TwitchLive.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("TwitchLive onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

TwitchLive.prototype.intentHandlers = {
    // register custom intent handlers
    "TwitchLiveIntent": function (intent, session, response) {
       HandleTwitch(intent, session, response);
    },
    "AMAZON.HelpIntent": function (intent, session, response) {
        response.ask("You can ask me who is streaming now!", "You can ask me who is streaming now!");
    }
};

function HandleTwitch(intent, session, response){
    GetTwitchFollowing(intent, session, response, function(err, responseObj){
		var say = 'The following channels are live:  <break time="0.4s"/>';
		responseObj.streams.forEach(function(c) {
			say += c.channel.display_name + " is playing " + c.channel.game + '.<break time="0.2s"/>';
		});
		
		var speechOutput = {
            speech: '<speak>' + say + '</speak>',
            type: AlexaSkill.speechOutputType.SSML
        };
		var card = say.replace(/<break[^>]+>/g,"\n");
		response.tellWithCard(speechOutput, "Your Live Channels", card);
	});
}

function GetTwitchFollowing(intent, session, response, callback) {
    httpmodule.get(TWITCH_API + "users/" + USER_ID + "/follows/channels?client_id=" + CLIENT_ID, function(res){
        var responseString = '';
        
        res.on('data', function (data) {
            responseString += data;
        });
        
        res.on('end', function () {
            var responseObj = JSON.parse(responseString);
            
			var channels = [];
			responseObj.follows.forEach(function(c){
				channels.push(c.channel.display_name);
			});

			GetLiveChannels(intent, session, response, channels,callback);
        });
    }).on("error", function(e){
        console.log("Got error: " + e.message);
        callback(e.message, {});
    });
}

function GetLiveChannels(intent, session, response, channels, callback) {
	var serviceURL = TWITCH_API + "streams?client_id=" + CLIENT_ID + "&channel=" + channels.join(',');
    httpmodule.get(serviceURL, function(res){
        var responseString = '';
        
        res.on('data', function (data) {
            responseString += data;
        });
        
        res.on('end', function () {
            var responseObj = JSON.parse(responseString);
            
            callback(null, responseObj);
        });
    }).on("error", function(e){
        console.log("Got error: " + e.message);
        callback(e.message, {});
    });
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the TwitchLive skill.
    var twitchLive = new TwitchLive();
    twitchLive.execute(event, context);
};

