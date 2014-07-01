var Stage = function(canvas,veggieImg,width,height){
	var _img, _ctx;
	function veggieOffStage(veggie){
		return veggie.pos.y < _ctx.canvas.height + 100;
	}
	function clear(){
		_ctx.fillStyle = 'white';
		_ctx.fillRect(0,0, _ctx.canvas.width, _ctx.canvas.height);
		_ctx.fillStyle = '#333';
		_ctx.strokeRect(0,0, _ctx.canvas.width, _ctx.canvas.height);
	}
	return {
		init: function(){
			_ctx = canvas.getContext('2d');
			_ctx.canvas.width = width;
			_ctx.canvas.height = height;
			_img = veggieImg;
			_scaleFactor = width / _img.width;
			console.log('canvas width:',width,' image width:',_img.width, ' scale factor:',_scaleFactor);
		},
		veggies: [],
		getHeight: function(){
			return _ctx.canvas.height;
		},
		draw: function(){
			clear();
			this.veggies.forEach(function(veggie,i){
				veggie.draw(_img,_ctx,_scaleFactor);
			});
			//remove veggies that have left the stage
			this.veggies = this.veggies.filter(function(veggie){
				return veggieOffStage(veggie);
			});
		},
		update: function(){
			this.veggies.forEach(function(veggie,i){
				veggie.update();
			});
		}
	};
};
