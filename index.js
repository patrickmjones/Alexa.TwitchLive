/**
 * App ID for the skill
 */
var APP_ID      = "";   // Change to Lambda application id
var CLIENT_ID   = "";   // Change to twitch client id
var USER_ID     = "";   // Change to twitch username

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill  = require('./lib/AlexaSkill');
var Twitch      = require('./lib/Twitch');

/**
 * TwitchLive is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var TwitchLive = function () {
    AlexaSkill.call(this, APP_ID);
    Twitch.ClientID = CLIENT_ID;
    Twitch.UserID = USER_ID;

    this.messages = require('./lang/en');
};

// Extend AlexaSkill
TwitchLive.prototype = Object.create(AlexaSkill.prototype);
TwitchLive.prototype.constructor = TwitchLive;

TwitchLive.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("TwitchLive onSessionStarted requestId: " + sessionStartedRequest.requestId + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

TwitchLive.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("TwitchLive onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);

    var speechOutput = this.messages.WELCOME;
    var repromptText = this.messages.PROMPT;

    response.ask(speechOutput, repromptText);
};

TwitchLive.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("TwitchLive onSessionEnded requestId: " + sessionEndedRequest.requestId + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

TwitchLive.prototype.intentHandlers = {
    // register custom intent handlers
    "TwitchLiveIntent": function (intent, session, response) {
        HandleTwitch(intent, session, response);
    },
    "AMAZON.HelpIntent": function (intent, session, response) {
        response.ask(this.messages.HELP, this.messages.HELP);
    }
};

function HandleTwitch(intent, session, response){
    GetTwitchFollowing(function(responseObj){
        var dots = require("./node_modules/dot").process({path: "./views"});

        var speech = {
            speech: dots.GetTwitchFollowingSpeech({streams:responseObj.streams}),
            type: AlexaSkill.speechOutputType.SSML
        };
        var card = dots.GetTwitchFollowingCard({streams:responseObj.streams});

        response.tellWithCard(speech, "Your Live Channels", card);
    });
}

function GetTwitchFollowing(callback) {
    Twitch.UserGetFollowing(function(channels){
        Twitch.GetLiveChannels(channels, callback);
    });
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the TwitchLive skill.
    var twitchLive = new TwitchLive();
    twitchLive.execute(event, context);
};

