

const PORT = 55000;

var lobbies = require('./lobby-manager.js');



var server = require('http').createServer();
global.io = require('socket.io')(server);
io = global.io;
var game;
let lobby = {}; //temp
lobby.members = {};

server.lastMemberID = 0;
server.lastPlayerID = 0;

// here for now as we only have one lobby
// only the collection needs to be up here in future



io.on('connection', function(client) {


    client.on('playerreadytoggle', function(){
        console.log(client.rooms)
        client.lobby.toggleReady(client);
    });

    client.on('changecharacter', function(data) {
        let character = data.character;
        client.lobby.changeCharacter(client, character);
    });

    client.on('joinlobby', function(){
        lobbies.lobbyManager.quickJoin(client);
    });




    client.on('gameconnect', function() {
        client.lobby.joinGame(client);
        let gameBall = client.game.balls[client.game.lastBallID];


        client.emit("newball", gameBall); // we may be able to contain this transisition inside a game object to parsel sockets together
        client.emit('allplayers', getAllPlayers(client.game)); // probably want this bundled as an init


        client.on('disconnect',function() {
     //       io.emit('remove', client.player.id);
            console.log('killPlayer: ' + client.player.id);
        });

    });

    client.on('stopmove',function() {
        if(client.player)
        client.player.stop();
    });

    // we will want to write out own update mechanic, this will allow us to check for collisions after moving and combine movement of player/ball logic
    client.on('move',function(data) {
        let direction = Math.sign(data.direction);
        if(client.player)
        client.player.move(direction);
    });

});

server.listen(PORT, function(){
    console.log('Listening on ' + server.address().port);
});



function getAllPlayers(game){
    var players = [];
    Object.keys(game.players).forEach(function(socketID){
        var player = game.players[socketID];//io.sockets.connected[socketID].player;
        if(player) players.push(player);
    });
    return players;
}
