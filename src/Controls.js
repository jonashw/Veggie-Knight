var Controls = function(canvas,stage,gameLoop,veggieLauncher){
	var _obs = {
		'swipestart':[],
		'swipemove':[],
		'swipestop':[],
		'combo':[],
		'slice':[]
	};
	function notifyObs(evnt){
		var args = [].slice.call(arguments,1);
		_obs[evnt].forEach(function(ob){
			ob.apply(null,args);
		});
	}
	function setupSwipe(){
		var _mouseDown = false;
		var _swipeStarted = false;
		function startSwipe(e){
			notifyObs('swipestart',e.offsetX,e.offsetY);
			_swipeStarted = true;
			setTimeout(function(){
				stopSwipe(e);
			},300);
		}
		function stopSwipe(e){
			_swipeStarted = false;
			notifyObs('swipestop',e.offsetX,e.offsetY);
		}
		function continueSwipe(e){
			notifyObs('swipemove',e.offsetX,e.offsetY);
		}
		//
		canvas.addEventListener('mousedown',function(e){
			e.preventDefault();
			_mouseDown = true;
			startSwipe(e);
		});
		canvas.addEventListener('mouseup',function(e){
			_mouseDown = false;
			if(_swipeStarted){
				stopSwipe(e);
			}
		});
		canvas.addEventListener('mousemove',function(e){
			if(!_mouseDown){
				return true;
			}
			if(_swipeStarted){
				continueSwipe(e);
			} else {
				startSwipe(e);
			}
			e.stopPropagation();
		});
		document.body.addEventListener('mouseup',function(e){
			_mouseDown = false;
		});
	}
	function setupCombos(self){
		function centerOfVeggies(veggies){
			if(veggies.length === 0){
				return {x:0,y:0};
			}
			var sums = {x:0, y:0};
			veggies.forEach(function(veggie){
				sums.x += veggie.pos.x;
				sums.y += veggie.pos.y;
			});
			return {
				x: sums.x / veggies.length,
				y: sums.y / veggies.length
			};
		}
		var swipedVeggies = [];
		self.on('swipestart swipemove',function(x,y){
			var touchedVeggies = stage.getVeggiesAt(x, y);
			touchedVeggies.forEach(function(veggie){
				stage.splitVeggie(veggie);
				if(swipedVeggies.indexOf(veggie) === -1){
					swipedVeggies.push(veggie);
				}
				notifyObs('slice',veggie.type);
			});
			stage.swipeTrail.push({x:x,y:y});
		});
		self.on('swipestop',function(x,y){
			stage.swipeTrail = [];
			if(swipedVeggies.length > 2){
				var center = centerOfVeggies(swipedVeggies);
				notifyObs('combo',swipedVeggies.length,center.x,center.y);
			}
			swipedVeggies = [];
		});
	}
	return {
		init: function(){
			document.addEventListener('keyup',function(e){
				if(e.which == 32){//Space
					if(!!gameLoop){
						gameLoop.playPause();
					}
				}
			});
			setupSwipe();
			if(!!stage){
				setupCombos(this);
			}
		},
		on: function(evnts,fn){
			evnts.split(' ').forEach(function(evnt){
				_obs[evnt].push(fn);
			});
		}
	};
};
