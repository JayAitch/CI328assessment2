var Client = {};
//Client.socket = io('http://localhost:55000');





function startClient(ip, socket){
    // error handle fained connection in lobby switch
    Client.socket = io('http://' + ip + ":" + socket);
    Client.sendTest = function(){
        console.log("test sent");
        Client.socket.emit('test');
    };




    Client.askNewPlayer = function(){
        Client.socket.emit('newplayer');
    };

    Client.sendClick = function(x,y){
        Client.socket.emit('click',{x:x,y:y});
    };
    Client.sendMove = function (direction){
        Client.socket.emit('move', {direction:direction});
    }

    Client.socket.on('newplayer',function(data){
        Game.addNewPlayer(data.id,data.x,data.y);
    });

    Client.socket.on('allplayers',function(data){
        for(var i = 0; i < data.length; i++){
            Game.addNewPlayer(data[i].id,data[i].x,data[i].y);
        }

        Client.socket.on('move',function(data){
            console.log(data);
            Game.movePlayer(data.id,data.x,data.y);
        });

        Client.socket.on('remove',function(id){
            Game.removePlayer(id);
        });
    });


// callback to rotate player based on their position
// performs css translation to maintain consistant game-server data
    Client.socket.on('setrotation',function(data){
        rotateCanvas(data["player-number"]);
    });









    // not like this
    Client.triggerLoad = function(){
        Client.socket.emit('triggerload');
    }


    Client.socket.on('loadgame',function(data){
        console.log(data);
       Game.triggerGame();
    });




    Client.askJoinLobby = function(){
        Client.socket.emit('joinlobby');
        // extend this by passing in lobby id or something
    };





    Client.socket.on('newmember',function(data){
        console.log(data);
        Lobby.newLobbyMember(data.socketid, data.ready, data.position)
    });




    Client.memberReadyToggle = function(){
        Client.socket.emit('playerreadytoggle');
    }



    Client.socket.on('playerready', function(data){
        console.log(data);
        Lobby.memberReadied(data.key, data.isready);
    });



    // this could target a specific lobby?
    Client.socket.on('alllobbymembers',function (data) {
        console.log('alllobbymemebrs');
        for(let key in data){
            let member = data[key];
            console.log('alllobbymemebrs');
            Lobby.newLobbyMember(key, member.ready, member.position);
        }
    });

    // convert to using this kind of prototype notation
}

