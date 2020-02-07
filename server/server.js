const PORT = 55000;

var server = require('http').createServer();
var io = require('socket.io')(server);

io.on('connection', function(client) {
    
    client.on('test', function() {
        console.log('test received');
    });


    client.on('newlobby',function() {
        client.lobby = {
            id: server.lastLobyyID++,
            players: [server.lastPlayerID++]
        };
        lobbies.push(client.lobby);

    });

    client.on('joinLobby',function() {
        client.lobby = {
            id: server.lastLobyyID++,
        };
        lobbies.push(client.lobby);
    });


    client.on('getLobbyList',function() {
        io.emit('loglobbies', lobbies);
    });
    client.on('joinlobby',function(lobbyid) {
        let joiningLobby = lobbies[lobbyid];
        let playersInLobby = joiningLobby.players;
        playersInLobby.push(2);

        io.emit('loglobbies', lobbies);
    });

    client.on('newplayer',function() {

        client.player = {
            id: server.lastPlayerID++,
            x: randomInt(100,400),
            y: randomInt(100,400)
        };

        client.emit('allplayers',getAllPlayers());
        client.broadcast.emit('newplayer',client.player);

        client.on('click',function(data) {
            console.log('click to '+data.x+', '+data.y);
            client.player.x = data.x;
            client.player.y = data.y;
            io.emit('move',client.player);
        });

        client.on('disconnect',function() {
            io.emit('remove', client.player.id);
            io.emit('');
            console.log('disconnecting: ' + client.player.id);
        });
    });
    
});

server.listen(PORT, function(){
    console.log('Listening on ' + server.address().port);
});

server.lastPlayerID = 0;
server.lastLobyyID = 0;
var lobbies = [];


function getLobbies(){
    return lobbies;
}

function getPlayersInLobby(lobbyNumber){

}

function getAllPlayers(){
    var players = [];
    Object.keys(io.sockets.connected).forEach(function(socketID){
        var player = io.sockets.connected[socketID].player;
        if(player) players.push(player);
    });
    return players;
}

function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

