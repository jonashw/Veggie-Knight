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
			var _swipeStarted = false;
			function startSwipe(e){
				notifyObs('swipestart',e.offsetX,e.offsetY);
				_swipeStarted = true;
				setTimeout(function(e){
					_swipeStarted = false;
				},300);
			}
			function stopSwipe(e){
				notifyObs('swipestop',e.offsetX,e.offsetY);
			}
			function continueSwipe(e){
				notifyObs('swipemove',e.offsetX,e.offsetY);
			}

			canvas.addEventListener('mousedown',function(e){
				e.preventDefault();
				_mouseDown = true;
				startSwipe(e);
			});
			canvas.addEventListener('mouseup',function(e){
				_mouseDown = false;
				stopSwipe(e);
			});
			canvas.addEventListener('mousemove',function(e){
				if(!_mouseDown){
					return true;
				}
				if(_swipeStarted){
					continueSwipe(e);
				} else {
					stopSwipe(e);
					startSwipe(e);
				}
				e.stopPropagation();
			});
			document.body.addEventListener('mousemove',function(e){
				if(_swipeStarted){
					_mouseDown = false;
					stopSwipe(e);
				}
			});
		},
		on: function(evnt,fn){
			_obs[evnt].push(fn);
		}
	};
};
