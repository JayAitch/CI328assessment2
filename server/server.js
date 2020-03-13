

const PORT = 55000;
var gameManager = require('./game-manager.js');
gameManager.createManager();
var server = require('http').createServer();
global.io = require('socket.io')(server);
io = global.io;
var game;
let lobby = {}; //temp
lobby.members = {};

let ball;//temp
server.lastMemberID = 0;
server.lastPlayerID = 0;

// here for now as we only have one lobby
// only the collection needs to be up here in future

io.on('connection', function(client) {

    client.on('test', function() {
        console.log('test received');
    });



    client.on('joinlobby', function(){

            client.join('lobby'); // i think we can have a list of rooms
            client.member = {
                position: server.lastMemberID,
                isready: false,
                socketid : client.id,
                character : "BIG"
            }

            server.lastMemberID++;
            lobby.members[client.id] = client.member;

            // just the connecting client
            client.emit('alllobbymembers', lobby.members);

            // all lobby members that arnt the connecting client
            client.broadcast.to('lobby').emit('newmember', client.member);


            client.on('changecharacter',function(data) {
                //todo: change the character
                client.member.character = data.character;
                console.log(client.member);
                // tell everyone in the lobby the player has changed
                // this should probably be only the people in the lobby
                io.sockets.in('lobby').emit('characterchange', {key:client.id, character: client.member.character});
            });


            client.on('playerreadytoggle', function(data){
                console.log('playerreadytoggle');
                let clientId = client.id;
                let isReady = !client.member.isready

                lobby.members[clientId].isready = isReady;

                let isLobbyReady = true;
                io.sockets.in('lobby').emit('playerready', {key: clientId, isready: isReady});

                // go through and make sure everyone is ready
                for(let key in lobby.members){
                    // some seriouse jank, deffo move to ood
                    if(!lobby.members[key].isready){
                        isLobbyReady = false;
                    }
                }

                // if they are all ready clear the lobby and trigger game load
                if(isLobbyReady){

                    setTimeout( function () {
                        if(game){
                            game.destroy();
                        }
                        // creating lobbies and multiple games should be easy now the game is handling where the updates go!
                        game = gameManager.createNewGame(lobby.members);
                        io.sockets.in('lobby').emit("loadgame");
                        lobby = {};
                        lobby.members = {};
                        server.lastMemberID = 0;
                    }, 3000);
                };
            });
    });

    // this logic should now be done when the lobby ready trigger is caused
    // this also fixes a potential issue with the duplication of players
    // this encapsulating should be done through loadgame calls
    client.on('gameconnect', function() {

        client.player = game.players[client.id];
        let gameBall = game.balls[game.lastBallID];

        client.emit("newball", gameBall); // we may be able to contain this transisition inside a game object to parsel sockets together
        client.emit('allplayers', getAllPlayers()); // probably want this bundled as an init

        client.on('stopmove',function(data) {
            client.player.stop();
        });

        // we will want to write out own update mechanic, this will allow us to check for collisions after moving and combine movement of player/ball logic
        client.on('move',function(data) {
            let direction = Math.sign(data.direction);
            client.player.move(direction);
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



function getAllPlayers(){
    var players = [];
    Object.keys(game.players).forEach(function(socketID){
        var player = game.players[socketID];//io.sockets.connected[socketID].player;
        if(player) players.push(player);
    });
    return players;
}
