#!/usr/bin/env node

var program = require('commander'),
    path = require('path'),
    paramsFile = path.join(__dirname, '../params.json'),
    params = require(paramsFile),
    SpotifyWebApi = require('spotify-web-api-node'),
    http = require('http'),
    url = require('url'),
    open = require('open'),
    fs = require('fs');

program.parse(process.argv);

var scopes = ['playlist-read-private', 'playlist-read-collaborative'];
var spotifyApi = new SpotifyWebApi({
    clientId: params.spotify.clientId,
    clientSecret: params.spotify.clientSecret,
    redirectUri: params.spotify.redirectUri
});

if (params.spotify.accessToken == true) {
    console.log('> Updating access token');
    spotifyApi.refreshAccessToken()
        .then(function(data) {
            console.log('The access token has been refreshed!');

            var accessToken = data.body['access_token'];
            fs.exists(paramsFile, function(exists) {
                if (exists) {
                    params.spotify['accessToken'] = accessToken;
                    var json = JSON.stringify(params);
                    fs.writeFile(paramsFile, json);
                } else {
                    console.log('File doesnt exists. Create and configure params.json file and try again.');
                }
            });
        }, function(err) {
            console.log('Could not refresh access token', err);
        });

} else {
    var authorizeURL = spotifyApi.createAuthorizeURL(scopes);

    console.log('> Opening default browser');
    open(authorizeURL);

    console.log('> Starting local server at : ' + params.spotify.redirectUri);
    var server = http.createServer();
    server.on('request', function(request, response) {
        var urlParts = url.parse(request.url, true);
        var urlParams = urlParts.query;
        var urlPath = urlParts.pathname;

        if (request.method === 'GET' && urlPath === '/callback/' && typeof urlParams.code != 'undefined') {
            // AccessToken
            spotifyApi
                .authorizationCodeGrant(urlParams.code)
                .then(function(data) {
                    var accessToken = data.body['access_token'];

                    fs.exists(paramsFile, function(exists) {
                        if (exists) {
                            params.spotify['accessToken'] = accessToken;
                            var json = JSON.stringify(params);
                            fs.writeFile(paramsFile, json);
                        } else {
                            console.log('File doesnt exists. Create and configure params.json file and try again.');
                        }
                    });

                    setTimeout(function() {
                        console.log('> Stopping server.');
                        process.exit();
                    }, 5000);

                }, function(err) {
                    console.log('Something went wrong!', err);
                    process.exit();
                });

            response.end('<html><body><p>Code saved. This server will close in 5 seconds.</body></html>');
        } else {
            response.statusCode = 404;
            response.end('<html><body><h1>Something was wrong. Try again.</h1></body></html>');
            process.exit();
        }
    }).listen(3333);
}
