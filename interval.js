/**
 * @function interval
 * @param func {Function} The function to execute
 * @param wait {Number} The milisseconds between excutions
 * @param times {Number} Maximum number of excutions
 * @return {Object} An object with a clear() method to stop the interval
 * @author Fernando Faria
 */
function interval(func, wait, times) {
	var interv = (function(w, t) {
		function i() {
			if (typeof t === 'undefined' || t-- > 0) {
				setTimeout(interv, w);
				
				try {
					func.call(null);
				} catch(e) {
					t = 0;
					
					throw e.toString();
				}
			}
		}
		
		i.clear = function() { t = 0; return null; }
		
		return i;
	})(wait, times);
	
	setTimeout(interv, wait);
	
	return { clear : interv.clear }
}
