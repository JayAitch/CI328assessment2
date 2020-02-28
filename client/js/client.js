var Client = {};
//Client.socket = io('http://localhost:55000');





function startClient(ip, socket){
    // error handle fained connection in lobby switch
    Client.socket = io('http://' + ip + ":" + socket);
    Client.sendTest = function(){
        console.log("test sent");
        Client.socket.emit('test');
    };




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

    Client.socket.on('newplayer',function(data){
         Game.addNewPlayer(data.id,data.x,data.y);
    });



    Client.socket.on('allplayers',function(data){
        for(var i = 0; i < data.length; i++){
           Game.addNewPlayer(data[i].id,data[i].x,data[i].y);
        }

        Client.socket.on('move',function(data){
            if(Game.movePlayer){
                Game.movePlayer(data.id,data.x,data.y);
            }

        });

        Client.socket.on('remove',function(id){
            Game.removePlayer(id);
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

        console.log(data);
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

