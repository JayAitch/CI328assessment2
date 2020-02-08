const PORT = 55000;

var server = require('http').createServer();
var io = require('socket.io')(server);


io.on('connection', function(client) {
    
    client.on('test', function() {
        console.log('test received');
    });
    
    client.on('newplayer',function() {
        let playerNumber = server.lastPlayerID % 4;
        let startVectors = getStartVectors(playerNumber);

        client.player = {
            id: server.lastPlayerID++,
            playnumber: server.lastPlayerID % 4,
            x: startVectors.x,
            y: startVectors.y
        };

        client.emit('allplayers',getAllPlayers());

        client.broadcast.emit('newplayer',client.player);


        // temp: callback to force rotation of the canvas so the player is at the bottom
        client.emit('setrotation', {"player-number": playerNumber});

        // we will want to write out own update mechanic, this will allow us to check for collisions after moving and combine movement of player/ball logic
        client.on('move',function(data) {

            // restict movement to player goal
            let moveDirection = getMoveDirection(playerNumber);
            let moveSpeed = 10;

            // dont let the client hack the move speed through inputing a higher direction
            let direction = Math.sign(data.direction);

            let xMovement = moveDirection.x * (moveSpeed * data.direction);
            let yMovement = moveDirection.y * (moveSpeed * data.direction);


            client.player.x += xMovement;
            client.player.y += yMovement;
            io.emit('move', client.player);
        });


        client.on('click',function(data) {
            console.log('click to '+data.x+', '+data.y);
            client.player.x = data.x;
            client.player.y = data.y;
            io.emit('move',client.player);
        });

        client.on('disconnect',function() {
            io.emit('remove', client.player.id);
            console.log('disconnecting: ' + client.player.id);
        });
    });
    
});

server.listen(PORT, function(){
    console.log('Listening on ' + server.address().port);
});

server.lastPlayerID = 0;

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


// get where the player should start
function getStartVectors(playnumber){
    const width = 800;
    const height = 800;
    const playerWidth = 30;
    const playerHeight = 30
    switch (playnumber) {
        case 0:   return {x: 0 + playerWidth, y: height/2}
        case 1:   return {x: width/2, y: height - playerHeight}
        case 2:   return {x: width - playerWidth, y: height/2}
        case 3:   return {x: width/2, y: 0 + playerHeight}
    }
}

// which direction does the player move in
function getMoveDirection(playerNumber){
    // invert inputs for opersite players, restrict movement to 1 axis
    switch (playerNumber) {
        case 0:   return {x: 0, y:1 }
        case 1:   return {x: 1, y:0 }
        case 2:   return {x: 0, y:-1 }
        case 3:   return {x: -1, y:0 }
    }
}

