function Veggie(sprite){
	this.sprite = sprite;
	this.pos = {x:0,y:0};
	this.vel = {x:0,y:0};
	this.rot = 0;
	this.rotVel = 0;
	this.draw = function(img, ctx, scaleFactor){
		ctx.save();
		ctx.translate(this.pos.x, this.pos.y);
		ctx.rotate(Convert.degToRad(this.rot));
		ctx.drawImage(
			img,
			this.sprite.x,
			this.sprite.y,
			this.sprite.w,
			this.sprite.h,
			scaleFactor * this.sprite.w/-2,
			scaleFactor * this.sprite.h/-2,
			scaleFactor * this.sprite.w,
			scaleFactor * this.sprite.h);
		ctx.restore();
	}
	this.update = function(){
		//apply velocity
		this.pos.y -= this.vel.y;//cause the canvas is flipped :/
		this.pos.x += this.vel.x;
		//apply gravity
		this.vel.y -= 0.1;//cause the canvas is flipped :/
		//apply rotational velocity
		this.rot += this.rotVel;
	};
}
