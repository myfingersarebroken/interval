/**
 * @function interval
 * @param {Function} func - The function to execute
 * @param {Number} wait - The milisseconds between excutions
 * @param {Number} times - Maximum number of excutions
 * @param {Object} context - Optional; A context to apply the function if needed
 * @return {Object} An object with a clear() method to stop the interval
 * @author Fernando Faria
 */
function interval(func, wait, times, context) {
		var
			  times = times
			, context = typeof times === 'object' ? times : context;

        var interv = (function(w, t) {
                function i() {
                        if (typeof t !== 'number' || t-- > 0) {
                                setTimeout(interv, w);
                                
                                try {
                                        func.call((context || null));
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
