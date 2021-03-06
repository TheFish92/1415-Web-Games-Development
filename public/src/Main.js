/**
* Created by LiamF on 16/03/2015.
*/


AsteroidGame.Point = function(x, y){
    this.x = x || 0;
    this.y = y || 0;
};

// The main class constructor . Commonly known as "game" in other projects
AsteroidGame.Main = function(args){
    this.game = undefined; // Phaser game class
    this._width = 800; //width of the phaser canvas
    this._height = 600; //height of the phaser canvas
    this._hidden = false; //is the canvas hidden?
    this.cursors = undefined // Phaser input cursors
    this.players = [];
    this.controlledPlayer = undefined; // Hook up to players[controlledplayerindex]
    this.asteroids = [];
    this.bullets = [];
    // Phaser Groups
    this.playerGroup = undefined;
    this._gamepreloadcallbacks = [];
    this.asteroidGroup = undefined;
    this.bulletGroup = undefined;
    this.preloaded = false;
    // Points to index of controlled player in players array.
    // This should be synced with the server!
    this.controlledPlayerIndex = -1;
    this.server = undefined;

    // Pass the arguments to the variables
    if( args !== undefined ){
        this._width = args.width || this._width;
        this._height = args.height || this._height;
        this._hidden = args.hidden || this._hidden;
    }

    // Call this function to start the game.
    function start(){

    }

    this.getWidth = function(){
        return _width;
    };
    this.getHeight = function(){
        return _height;
    };
    this.isHidden = function(){
        return _hidden;
    }
};


// Phaser preload callback
AsteroidGame.Main.prototype.preload = function(){

    var main = AsteroidGame.main;
    main.game.load.image('player', 'assets/p1.png');
    main.game.load.image('enemy', 'assets/p2.png');

    main.preloaded = true;
    console.log(main._gamepreloadcallbacks);
    if( main._gamepreloadcallbacks !== undefined ){
        for( var i = 0, max = main._gamepreloadcallbacks.length; i < max; i++ ){
            if( main._gamepreloadcallbacks[i] !== undefined ){
                if( typeof main._gamepreloadcallbacks[i].callback == "function" ){
                    main._gamepreloadcallbacks[i](main._gamepreloadcallbacks[i].args);
                }
            }
        }
    }
};

// Phaser create callback
AsteroidGame.Main.prototype.create = function(){
    // Store the game variable so we doing have to type "this.game" all the time!
    var main = AsteroidGame.main,
        g = main.game,
        players = main.players,
        asteroids = main.asteroids,
        bullets = main.bullets;

    this.players = undefined;

    g.renderer.clearBeforeRender = false;
    g.renderer.roundPixels = true;
    g.stage.disableVisibilityChange = true;

    g.physics.startSystem(Phaser.Physics.ARCADE);

    main.playerGroup = g.add.group();
    main.playerGroup.enableBody = true;
    main.playerGroup.physicsBodyType = Phaser.Physics.ARCADE;

    main.asteroidGroup = g.add.group();


    main.server = new AsteroidGame.Server();
    main.server.ipAddress = "localhost:3000";
    main.server.connect();

    var uniqueID = main.server.getUniquePlayerId();
    main.controlledPlayerIndex = uniqueID;
    var player = new AsteroidGame.Player({
        clientName: "The Fish",
        id: uniqueID,
        game: g,
        type: AsteroidGame.PLAYERTYPE,
        assetRef: 'player',
        assetGroup: main.playerGroup,
        loc: new AsteroidGame.Point(10, 10),
        size: new AsteroidGame.Point(5, 5)
    });

    

    main.server.initPlayers();
    //this.server.ipAddress = document.URL;
    main.server.onPlayerConnect(main.playerConnect);

    players[uniqueID] = player;
    main.controlledPlayer = players[uniqueID]

    main.server.addControlledPlayerToServer(player);
    main.server.onUpdatePlayerLocations(main.updatePlayerLocations)
        
    main.cursors = g.input.keyboard.createCursorKeys();
    g.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);
    AsteroidGame.state = AsteroidGame.PLAYING;
};

AsteroidGame.Main.prototype.update = function(){
    
    var main = AsteroidGame.main,
    	cursors = main.cursors,
    	game = main.game,
    	player = main.players[AsteroidGame.main.controlledPlayerIndex-1];

    if( AsteroidGame.state === AsteroidGame.PLAYING ){
        // use setTimeout in server as we don't want this running every time it can
        AsteroidGame.deltaTime = (new Date().getTime() - AsteroidGame._previousTick) / 1000;
        AsteroidGame._previousTick = new Date().getTime();
        
        var main = AsteroidGame.main;
        for( var i = 0; i < main.players.length; i++ ){
            var player = main.players[i];
            if( player !== undefined ){
                player.update();
            }
        }

        this.game.physics.arcade.collide(main.playerGroup, main.playerGroup);

        /*for( var i = 0, max = main.players.length; i < max; i = i + 1 ){
            for( var x = i + 1; x < max; x++ ){
                if( main.players[i] !== undefined && main.players[x] !== undefined ){
                    this.game.physics.arcade.collide(main.players[i], main.players[x]);
                }
            }
        }*/
    }


    var p = main.players[main.controlledPlayerIndex]
    if( cursors.up.isDown )
    {
    	p.accelerateForward();
        p.dirty = true;
    }else{
    	p.resetAcceleration();
    }

    if( cursors.right.isDown ){
    	p.turnRight();
        p.dirty = true;
    } else if ( cursors.left.isDown ){
    	p.turnLeft();
        p.dirty = true;
    } else {
    	p.resetAngularVelocity();
        p.dirty = true;
    }
    

};

AsteroidGame.Main.prototype.render = function(){
    var main = AsteroidGame.main,
    p = main.players[main.controlledPlayerIndex];

    if( p !== undefined )
        if( p.sprite !== undefined ){
            //main.game.debug.body(p.sprite)
            //main.game.debug.bodyInfo(p.sprite, 30, 30, "rgb(255,255,255)")
            main.game.debug.spriteInfo(p.sprite, 30, 30);
        }
}

AsteroidGame.Main.prototype.start = function(){
    // Define the phaser game
    var displayType = this._hidden ? Phaser.HEADLESS : Phaser.AUTO;

    this.game = new Phaser.Game(this._width, this._height, displayType, '', {preload: this.preload, create: this.create, update: this.update, render: this.render})
    AsteroidGame._previousTick = new Date().getTime;
};

AsteroidGame.Main.prototype.addObjectToBuffer = function(object){
    if( this.hasObjectInBuffer(object) === false ){
        var uniqueId = AsteroidGame.getUniqueObjectId();
        this._objectBuffer[uniqueId] = object;
    }
};

AsteroidGame.Main.prototype.hasObjectInBuffer = function(object){
    return this._objectBuffer.indexOf(object) !== -1;
};

AsteroidGame.Main.prototype.addPlayer = function(args){
    var main = AsteroidGame.main;

    if( args.id === undefined || args.id === main.controlledPlayerIndex || args.id === -1 || main.players[args.id] !== undefined ){
        console.log("addPlayer unsuccessful, may be trying to overwrite local player");
        return;
    }

    args.assetRef = "enemy";
    args.game = main.game;
    args.group = main.playerGroup || this.game.add.group();
    args.type = AsteroidGame.PLAYERTYPE;
    args.size = new AsteroidGame.Point(5, 5);
    args.bulletGroup = main.bulletGroup;
    console.log("adding player:");
    console.log(args);
    var player = new AsteroidGame.Player(args);
    console.log("Args Location")
    console.log(args.loc);
    player.group = main.playerGroup;
    player.loadSprite();
    player.setLocation(args.loc.x, args.loc.y);
    player.setVelocity(args.loc.x, args.loc.y);
    this.players[args.id] = player;
    this.bullets[args.id] = [64]; // Preload 64
}

AsteroidGame.Main.prototype.playerConnect = function(player){
    console.log("ADDING PLAYER "+player.id)
	if( player !== undefined ){
        if( player.id !== AsteroidGame.main.controlledPlayerIndex || player.id === -1 ){
            AsteroidGame.main.addPlayer(player);
        }
    }
}

AsteroidGame.Main.prototype.updatePlayerLocations = function(playersFromServer){ // Listener for socket emit
	var main = AsteroidGame.main;
        //console.log(playersFromServer);
        for( var i = 0, max = playersFromServer.length; i < max; i++ ){
            var playeridx = playersFromServer[i].id;
            if( playeridx !== main.controlledPlayerIndex ) {
                if (main.players[playeridx] !== undefined) {
                    //console.log("Updating Location");
                    //console.log(main.players[playeridx])
                    main.players[playeridx].updateLocationFromServer(playersFromServer[i])
                }
            }
        }
}
