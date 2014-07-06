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
	function numDigits(n){
		if(n == 0){
			return 1;
		} 
		return Math.floor(Math.log(n) / Math.LN10) + 1;
	}
	return {
		init: function(){
			canvas.style.cursor = 'pointer';
			_ctx = canvas.getContext('2d');
			_ctx.canvas.width = width;
			_ctx.canvas.height = height;
			_img = veggieImg;
			_scaleFactor = width / _img.width;
			//console.log('canvas width:',width,' image width:',_img.width, ' scale factor:',_scaleFactor);
		},
		veggies: [],
		swipeTrail:[],
		notices: [],
		score: null,
		getHeight: function(){
			return _ctx.canvas.height;
		},
		getWidth: function(){
			return _ctx.canvas.width;
		},
		getCanvas: function(){
			return canvas;
		},
		draw: function(){
			clear();
			this.veggies.forEach(function(veggie,i){
				veggie.draw(_img, _ctx, _scaleFactor);
			});
			//remove veggies that have left the stage
			this.veggies = this.veggies.filter(function(veggie){
				return veggieOffStage(veggie);
			});
			_ctx.save();
			_ctx.fillStyle = 'rgba(15,175,15,0.5)';
			this.swipeTrail.forEach(function(swipePoint){
				//_ctx.fillRect(swipePoint.x, swipePoint.y, 5, 5);
			    _ctx.beginPath();
			    _ctx.arc(swipePoint.x, swipePoint.y, 3, 0, 2 * Math.PI, false);
			    _ctx.fill();
			});
			_ctx.fillStyle = 'rgba(0,0,0,0.5)';
			this.notices.forEach(function(notice){
				notice.draw(_ctx);
			});
			if(this.score != null){
				_ctx.font = '40px Verdana';
				var digits = numDigits(this.score);
				var scoreX = canvas.width - (digits * 25) - 8;
				_ctx.fillText(this.score, scoreX, 40);
			}
			_ctx.restore();
		},
		update: function(){
			this.veggies.forEach(function(veggie,i){
				veggie.update();
			});
			this.notices = this.notices.filter(function(notice){
				return !notice.isExpired();
			});
		},
		removeVeggie: function(veggie){
			var index = this.veggies.indexOf(veggie);
			this.veggies.splice(index,1);
		},
		splitVeggie: function(veggie){
			if(!veggie.whole){
				return;
			}
			this.removeVeggie(veggie);
			var self = this;
			veggie.getSplits().forEach(function(split){
				self.veggies.push(split);
			});
		},
		getVeggiesAt: function(x,y){
			return this.veggies.filter(function(veggie){
				return veggie.whole && veggie.containsPoint(x, y, _scaleFactor);
			});
		}
	};
};
