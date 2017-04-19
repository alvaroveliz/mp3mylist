#!/usr/bin/env node

var program = require('commander'),
    path = require('path'),
    paramsFile = path.join(__dirname, '../params.json'),
    params = require(paramsFile),
    SpotifyWebApi = require('spotify-web-api-node');

program.parse(process.argv);

// Set the credentials when making the request
var spotifyApi = new SpotifyWebApi({
  accessToken : params.spotify.accessToken
});

// Get tracks in a playlist
spotifyApi.getUserPlaylists(null)
  .then(function(data) {
    var items = data.body.items;
    for (item in items) {
        var $item = items[item];
        console.log($item.name);
    }
  }, function(err) {
    console.log('Something went wrong!', err);
  });