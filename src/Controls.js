var Controls = function(canvas,stage,gameLoop){
	var _obs = {
		'combo':[],
		'slice':[]
	};
	function notifyObs(evnt){
		var args = [].slice.call(arguments,1);
		_obs[evnt].forEach(function(ob){
			ob.apply(null,args);
		});
	}
	function setupCombos(self){
		SwipeEvents(canvas);
		var swipedVeggies = [];
		$(canvas).on('swipestart swipemove',function(e,pos){
			var touchedVeggies = stage.getVeggiesAt(pos.x, pos.y);
			touchedVeggies.forEach(function(veggie){
				stage.splitVeggie(veggie);
				if(swipedVeggies.indexOf(veggie) === -1){
					swipedVeggies.push(veggie);
				}
				notifyObs('slice',veggie.type);
			});
			stage.swipeTrail.push(pos);
		});
		$(canvas).on('swipestop',function(x,y){
			stage.swipeTrail = [];
			if(swipedVeggies.length > 2){
				var center = centerOfVeggies(swipedVeggies);
				notifyObs('combo',swipedVeggies.length,center.x,center.y);
			}
			swipedVeggies = [];
		});
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
