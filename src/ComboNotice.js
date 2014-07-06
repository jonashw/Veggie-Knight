function ComboNotice(comboSize,x,y){
	var expiry = new Date();
	expiry.setSeconds(expiry.getSeconds() + 2);//2-second lifetime
	this.isExpired = function(){
		return expiry < new Date();
	};
	this.draw = function(ctx){
		ctx.save();
		ctx.strokeStyle = 'rgba(255,255,255,0.8)';
		ctx.fillStyle = 'rgba(0,0,0,1)';
		ctx.font = "30px Verdana";
		ctx.lineWidth = 4;
		ctx.strokeText(comboSize, x, y);
		ctx.fillText(comboSize, x, y);
		ctx.font = "15px Verdana";
		if(comboSize < 10){
			ctx.strokeText('-veggie', x + 20, y-4);
			ctx.fillText('-veggie', x + 20, y-4);
			ctx.strokeText('combo!', x + 10, y + 15);
			ctx.fillText('combo!', x + 10, y + 15);
		} else {
			ctx.strokeText('-veggie', x + 40, y-4);
			ctx.fillText('-veggie', x + 40, y-4);
			ctx.strokeText('combo!', x + 20, y + 15);
			ctx.fillText('combo!', x + 20, y + 15);
		}
		ctx.restore();
	};
}
