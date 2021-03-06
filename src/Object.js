/**
* Created by LiamF on 17/03/2015.
*/

// Object is going to contain all the stuff we need for server manipulation
// An object will have a position in the world as well as the ability to update to the server
// It's the prototype from this fundamental class that will update player positions and rotations.


AsteroidGame.Object = function(args){
    this.loc = {x:0, y:0};
    this.vel = {x:0, y:0};
    this.rot = 0
    this.angvel = 0;
    this.state = AsteroidGame.INBUFFER;
    this.type = AsteroidGame.NOTYPE;
    this.game = undefined; //Phaser.Game
    this.group = undefined; //Phaser.Group
    this.sprite = undefined; //Phaser.Sprite
    this.assetRef = "unknown";

    if( args !== undefined ){
        this.loc = args.loc || this.loc;
        this.vel = args.vel || this.vol;
        this.angvel = args.angvel || this.angvel;
        this.state = args.state || this.state;
        this.type = args.type || this.type;
        this.game = args.game || AsteroidGame.main.game;
        this.group = args.assetGroup;
        this.assetRef = args.assetRef || "unknown"
    }
};

AsteroidGame.Object.prototype.getLocation = function(){
    return this.loc;
};

AsteroidGame.Object.prototype.setLocation = function(x, y){
    this.loc.x = x || this.loc.x;
    this.loc.y = y || this.loc.y;
};

AsteroidGame.Object.prototype.move = function(x, y){
    this.loc.x = x || this.loc.x;
    this.loc.y = y || this.loc.y;
};


AsteroidGame.Object.prototype.update = function(){
    this.loc.x += this.vel.x * AsteroidGame.deltaTime;
    this.loc.y += this.vel.y * AsteroidGame.deltaTime;
    //TODO: Look in Phaser code and find out how the angle is calculated from angular velocity
    // This makes no sense. I have tried everything. (This is a pathetic last attempt)
    //this.rot += (this.angvel / 2) * AsteroidGame.deltaTime;
};

AsteroidGame.Object.prototype.syncSprite = function(){
    this.sprite.x = this.loc.x;
    this.sprite.y = this.loc.y;
}

AsteroidGame.Object.prototype.create = function(args){
    if( args === null ){
        console.error("Object.create called with null arguments")
        return;
    }
};
