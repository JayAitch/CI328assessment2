const PORT = 55000;

var server = require('http').createServer();
var io = require('socket.io')(server);

// here for now as we only have one lobby
// only the collection needs to be up here in future



io.on('connection', function(client) {

    client.on('test', function() {
        console.log('test received');
    });



    client.on('joinlobby', function(){

        client.join('lobby'); // i think we can have a list of rooms
        client.member = {
            position: server.lastMemberID++,
            isready: false,
            socketid : client.id
        }


        lobby.members[client.id] = client.member;

        client.emit('alllobbymembers', lobby.members);

        // this is currrently broadcasting to everything
        client.broadcast.emit('newmember', client.member);


        client.on('changecharacter',function(data) {
            //todo: change the character

            // tell everyone in the lobby the player has changed
            // this should probably be only the people in the lobby
            client.broadcast.emit('characterchange', client.player);
        });


        client.on('playerreadytoggle', function(data){
            console.log('playerreadytoggle');
            let clientId = client.id;
            let isReady = !client.member.isready

            lobby.members[clientId].isready = isReady;

            let isLobbyReady = true;
            io.sockets.to('lobby').emit('playerready', {key: clientId, isready: isReady});

            for(let key in lobby.members){
                // some seriouse jank, deffo move to ood
                if(!lobby.members[key].isready){
                    isLobbyReady = false;
                }
            }

            if(isLobbyReady){
                setTimeout( function () {
                    io.sockets.to('lobby').emit("loadgame");
                    lobby = {};
                    lobby.members = {};
                }, 3000);
            };
        });
    });



    // client.on('triggerload', function(data){
    //     console.log("triggering loading");
    //     // we dont care about the order this happens so we dont need to broadcast - maybe we do who knows
    //     // there might be a way of doing this more cleanly by maintaining a list of sockets
    //     for(let key in lobby.members){
    //         let member = lobby.members[key]
    //         //if (member.hasOwnProperty(socketid)){
    //         io.sockets.to(member.socketid).emit("loadgame");
    //         // }
    //     }
    // });
    //

    client.on('newplayer',function() {
        let playerNumber = server.lastPlayerID % 4;
        let startVectors = getStartVectors(playerNumber);


        let width = 5; //temp
        let height = 2; //temp


        client.player = {
            id: server.lastPlayerID++,
            playnumber: server.lastPlayerID % 4,
            x: startVectors.x,
            y: startVectors.y
          //  bounds: createBounds(startVectors, )
        };


        client.emit('allplayers', getAllPlayers());

        // called on all clients except the socket this thread is in
        client.broadcast.emit('newplayer', client.player);


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

//create this somwhere else in the future
// i can see multiple lobbies being easy if this works
// we may want to run multiple servers, a lobby server and a game server would make the code significantly cleaner

var lobby = {};
lobby.members = {};
players = [];

server.lastMemberID = 0;

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










function createPoint(x,y){
    return {x: x, y:y};
}


function createBounds(position, width, height, isRotated){

    let topLeft, topRight, bottomLeft, bottomRight


    // bounds on a rotated paddle use the width as the height
    if(isRotated){
        topLeft = position;
        topRight = createPoint(position.x + height, position.y);
        bottomLeft = createPoint(position.x, position.y + width);
        bottomRight = createPoint(position.x + height, position.y + width);
    }
    else{
        topLeft = position;
        topRight = createPoint(position.x + width, position.y);
        bottomLeft = createPoint(position.x, position.y + height);
        bottomRight = createPoint(position.x + width, position.y + height);
    }


    let bounds = {topLeft:topLeft, topRight:topRight, bottomLeft:bottomLeft, bottomRight:bottomRight};
    return bounds;
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

