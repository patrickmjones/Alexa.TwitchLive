'use strict';

var https = require('https');

var self = module.exports = {
	APIURL: "https://api.twitch.tv/kraken/",
	ClientID: "",
	UserID: "",

	UserGetFollowing: function(callback) {
		var serviceURL = self.APIURL + "users/" + self.UserID + "/follows/channels?client_id=" + self.ClientID;

		https.get(serviceURL, function(res){
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

				callback(channels);
			});
		}).on("error", function(e){
			console.log("Got error: " + e.message);
			callback(e.message);
		});
	},

	GetLiveChannels: function(channels, callback) {
		var serviceURL = self.APIURL + "streams?client_id=" + self.ClientID + "&channel=" + channels.join(',');

		https.get(serviceURL, function(res){
			var responseString = '';
			
			res.on('data', function (data) {
				responseString += data;
			});
			
			res.on('end', function () {
				var responseObj = JSON.parse(responseString);
				
				callback(responseObj);
			});
		}).on("error", function(e){
			console.log("Got error: " + e.message);
			callback(e.message);
		});

	}
}
