function Veggie(type,sprite,whole){
	this.type = type;
	this.pos = {x:0,y:0};
	this.vel = {x:0,y:0};
	this.rot = 0;
	this.rotVel = 0;
	this.whole = whole;
	this.draw = function(img, ctx, scaleFactor){
		ctx.save();
		ctx.translate(this.pos.x, this.pos.y);
		ctx.rotate(Convert.degToRad(this.rot));
		ctx.drawImage(
			img,
			sprite.x,
			sprite.y,
			sprite.w,
			sprite.h,
			scaleFactor * sprite.w/-2,
			scaleFactor * sprite.h/-2,
			scaleFactor * sprite.w,
			scaleFactor * sprite.h);
		ctx.restore();
	}
	this.containsPoint = function(x,y,scaleFactor){
		var x1 = this.pos.x + scaleFactor * sprite.w/-2;
		var x2 = x1 + scaleFactor * sprite.w;
		var y1 = this.pos.y + scaleFactor * sprite.h/-2;
		var y2 = y1 + scaleFactor * sprite.h;
		//console.log(this.type,'(x1,x2):',x1,x2,'(y1,y2):',y1,y2);
		return (x1 <= x && x <= x2) && (y1 <= y && y <= y2);
	};
	this.update = function(){
		//apply velocity
		this.pos.y -= this.vel.y;//cause the canvas is flipped :/
		this.pos.x += this.vel.x;
		//apply gravity
		this.vel.y -= 0.1;//cause the canvas is flipped :/
		//apply rotational velocity
		this.rot += this.rotVel;
	};
	var getSplitVeggies = (function(){
		//prevent creating more splits than are needed
		//this will come in handy when the I implement the flyweight pattern on veggies 
		var _veggies = null;
		return function(){
			if(_veggies == null){
				_veggies = sprite.splits.map(function(splitSprite){
					return new Veggie(self.type, splitSprite, false);
				});
			}
			return _veggies;
		};
	})();
	this.getSplits = function(){
		if(this.whole){
			var self = this;
			var splits = getSplitVeggies();
			splits.forEach(function(split){
				split.rot = self.rot;
				split.pos = {x: self.pos.x, y: self.pos.y};
				split.vel = {x: self.vel.x, y: self.vel.y};
				split.rotVel = self.rotVel;
			});
			if(sprite.splitsAlongX){
				var rotRad = Convert.degToRad(90 - self.rot);
				var dY = 0.5 * sprite.splitSeparation * Math.sin(rotRad);
				var dX = 0.5 * sprite.splitSeparation * Math.cos(rotRad);
				splits[0].pos.x += dX;
				splits[0].pos.y -= dY;
				splits[1].pos.x -= dX;
				splits[1].pos.y += dY;
			} else {
				var rotRad = Convert.degToRad(self.rot + 90);
				var dY = 0.5 * sprite.splitSeparation * Math.sin(rotRad);
				var dX = 0.5 * sprite.splitSeparation * Math.cos(rotRad);
				splits[0].pos.x -= dY;
				splits[0].pos.y += dX;
				splits[1].pos.x += dY;
				splits[1].pos.y -= dX;
			}
			return splits;
		} else {
			return [];
		}
	};
}