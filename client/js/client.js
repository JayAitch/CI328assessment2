var Client = {};
//Client.socket = io('http://localhost:55000');





function startClient(ip, socket){
    // error handle fained connection in lobby switch
    Client.socket = io('http://' + ip + ":" + socket);
    Client.sendTest = function(){
        console.log("test sent");
        Client.socket.emit('test');
    };

    Client.sendChangeCharacter = function(characterID){
        Client.socket.emit("changecharacter", {character: characterID});
    }


    Client.askGameConnect = function(){
        Client.socket.emit('gameconnect');
    };

    Client.sendClick = function(x,y){
        Client.socket.emit('click',{x:x,y:y});
    };
    Client.sendMove = function (direction){
        Client.socket.emit('move', {direction:direction});
    };

    Client.sendStopMove = function(){
        Client.socket.emit('stopmove');
    }

    //Jordan any ideas why data.character isn't working here?
    Client.socket.on('newplayer',function(data){
         Game.addNewPlayer(data.id, data.characterID, data.x, data.y);
    });


    Client.socket.on('collisionplayer',function(data){
        Game.onCollisionPlayerBall(data.player, data.ball);
    });

    //Jordan any ideas why data.character isn't working here?
    Client.socket.on('allplayers',function(data){
        for(var i = 0; i < data.length; i++){
           Game.addNewPlayer(data[i].id, data[i].characterID ,data[i].x ,data[i].y);
        }

        Client.socket.on('move',function(data){
            if(Game.movePlayer){
                Game.movePlayer(data.id,data.x,data.y);
            }

        });

        Client.socket.on('remove',function(id){
            Game.removePlayer(id);
        });

        Client.socket.on('goalscored',function(data){
            Game.goalScored(data.id);
        });

        Client.socket.on('playerdeath',function(data){
            Game.playerDeath(data.id);
        });

        Client.socket.on('endgame',function(data){
            Game.endGame(data.id);
        });

    });


    Client.socket.on('newball',function(data){
        if(Game.addNewBall){
            Game.addNewBall(data.x,data.y);
        }

    });


    Client.socket.on('moveball',function(data){
        if(Game.moveBall){
            Game.moveBall(data.x,data.y);
        }
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
        if(Lobby.newLobbyMember) {
            Lobby.newLobbyMember(data.socketid, data.ready, data.position)
        }
    });




    Client.memberReadyToggle = function(){
        Client.socket.emit('playerreadytoggle');
    }



    Client.socket.on('playerready', function(data){
        console.log(data);
        if(Lobby.memberReadied){
            Lobby.memberReadied(data.key, data.isready);
        }

    });

    Client.socket.on('characterchange', function (data) {
        console.log(data);
        Lobby.changeLobbyCharacter(data.key, data.character);
    });

    // this could target a specific lobby?
    Client.socket.on('alllobbymembers',function (data) {
        console.log('alllobbymemebrs');
        for(let key in data){
            let member = data[key];
            Lobby.newLobbyMember(key, member.ready, member.character);
        }
    });

    // convert to using this kind of prototype notation
}

