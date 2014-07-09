function SwipeEvents(element){
	//Adds custom 'swipe' events to an element.
	//Requires jQuery
	var _mouseDown = false;
	var _swipeStarted = false;
	var $element = $(element);
	function startSwipe(e){
		$element.trigger('swipestart', getOffset(e));
		_swipeStarted = true;
		setTimeout(function(){
			stopSwipe(e);
		},300);
	}
	function stopSwipe(e){
		_swipeStarted = false;
		$element.trigger('swipestop', getOffset(e));
	}
	function continueSwipe(e){
		$element.trigger('swipemove', getOffset(e));
	}
	//////
	$element.on('mousedown touchstart',function(e){
		e.preventDefault();
		_mouseDown = true;
		startSwipe(e);
	});
	$element.on('mousemove touchmove',function(e){
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
	$(document).on('mouseup touchend',function(e){
		_mouseDown = false;
		if(_swipeStarted){
			stopSwipe(e);
		}
	});
	$(document).on('mouseup touchend',function(e){
		_mouseDown = false;
	});
	function getOffset(e){
		if('originalEvent' in e && 'touches' in e.originalEvent){
			var t = e.originalEvent.touches[0];
			return {
				x: t.pageX - t.target.offsetLeft,
				y: t.pageY - t.target.offsetTop
			};
		} else {
			return {
				x: e.offsetX,
				y: e.offsetY
			};
		}
	}
}
