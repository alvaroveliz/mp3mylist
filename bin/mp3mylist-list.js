#!/usr/bin/env node

var program = require('commander'),
    inquirer = require('inquirer'),
    path = require('path'),
    paramsFile = path.join(__dirname, '../params.json'),
    params = require(paramsFile),
    SpotifyWebApi = require('spotify-web-api-node');

program.parse(process.argv);

// Set the credentials when making the request
var spotifyApi = new SpotifyWebApi({
    accessToken: params.spotify.accessToken
});

// Get tracks in a playlist
var lists = [];
var items = [];
var total = 0;
var limit = 20;
var pages = 1;
var page = 1;

var getTrackList = function(playlistId) {
    console.log(playlistId);
    spotifyApi.getPlaylistTracks(null, playlistId)
        .then(function(data) {
            console.log('The playlist contains these tracks', data.body);
        }, function(err) {
            console.log('Something went wrong!', err);
        })
}

var getMoreItems = function(page) {
    console.log('Page ' + page + ' of ' + pages);
    var offset = (page - 1) * limit;
    spotifyApi.getUserPlaylists('alvaroveliz', { offset: offset })
        .then(function(data) {
            var items = data.body.items;

            for (item in items) {
                lists.push(items[item]);
                var index = parseInt(item) + offset + 1;
                console.log(index + ') ' + items[item].name);
            }

            if (page < pages) {
                inquirer.prompt([{ type: 'input', name: 'more', message: 'Input a playlist number to donwload or press enter to see more playlists…' }])
                    .then(function(opts) {
                        var option = parseInt(opts.more);
                        if (!option) {
                            getMoreItems(page + 1);
                        } else if (option > 0 && option <= total) {
                            getTrackList(lists[option - 1]);
                        } else {
                            console.log('Invalid option!');
                            process.exit();
                        }
                    });
            }
        }, function(err) {
            console.log('Something went wrong!');
        });
}

console.log('Listing Spotify Playlists');

spotifyApi.getUserPlaylists(null, { offset: 0 })
    .then(function(data) {
        total = data.body.total;
        limit = data.body.limit;
        pages = parseInt(Math.ceil(total / limit));
        getMoreItems(page, data.body.items);
    }, function(err) {
        console.log('Something went wrong!', err);
    });
