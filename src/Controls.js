var Controls = function(canvas,gameLoop,veggieLauncher){
	var _obs = {
		'swipestart':[],
		'swipemove':[],
		'swipestop':[]
	};
	function notifyObs(evnt,x,y){
		_obs[evnt].forEach(function(ob){
			ob(x,y);
		});
	}
	return {
		init: function(){
			document.addEventListener('keyup',function(e){
				if(e.which == 32){//spacebar
					if(!!veggieLauncher){
						veggieLauncher.launch(VeggieFactory.randomSet());
					}
				}
				if(e.which == 17){//Ctrl
					if(!!gameLoop){
						gameLoop.playPause();
					}
				}
				//console.log(e.which);
			});
			var _mouseDown = false;
			canvas.addEventListener('mousedown',function(e){
				_mouseDown = true;
				notifyObs('swipestart',e.offsetX,e.offsetY);
			});
			canvas.addEventListener('mouseup',function(e){
				_mouseDown = false;
				notifyObs('swipestop',e.offsetX,e.offsetY);
			});
			canvas.addEventListener('mousemove',function(e){
				if(!_mouseDown){
					return true;
				}
				notifyObs('swipemove',e.offsetX,e.offsetY);
			});
		},
		on: function(evnt,fn){
			_obs[evnt].push(fn);
		}
	};
};
