/**
 * AER
 *
 * Copyright © 2014 Fernando Faria <fernando.al.faria@gmail.com> <github.com/myfingersarebroken/aer>
 * Dual licensed under GPLv2 & MIT
 */
 
(function(global) { 'use strict';
	/**
	 * Copyright © 2014 Fernando Faria <fernando.al.faria@gmail.com> <github.com/myfingersarebroken/interval>
	 * Dual licensed under GPLv2 & MIT
	 */
	function _interval(outData,func,wait,times){var state={maxCalls:times||Number.POSITIVE_INFINITY,actualCall:0,data:[],lastComputedData:null,error:[],lastComputedError:null,lastCall:false,proceed:function(){},then:function(){},clear:function(){},stopOnError:true,isRunning:true,args:outData};var interv=(function(w,t){function i(){if(t==0){state.isRunning=false;}if(t==1){state.lastCall=true;}if(t-->0){try{i.state.data[state.actualCall]=func.call(i,state);i.state.lastComputedData=i.state.data[state.actualCall];state.actualCall+=1;}catch(e){if(state.stopOnError){t=0;}i.state.error[state.actualCall]=e;i.state.lastComputedError=i.state.error[state.actualCall];try{i.state.data[state.actualCall]=func.call(i,state);i.state.lastComputedData=i.state.data[state.actualCall];}catch(er){if(!state.stopOnError){state.actualCall+=1;}}}setTimeout(interv,w);}}state.clear=function(){if(!state.isRunning){return null;}t=0;state.isRunning=false;return null;};state.proceed=function(){if(state.isRunning){return null;}t=state.maxCalls-state.actualCall;state.isRunning=true;setTimeout(interv,w);return null;};i.state=state;i.clear=state.clear;i.proceed=state.proceed;return i;})(wait,times||Number.POSITIVE_INFINITY);setTimeout(interv,wait);return interv;}
	function _async(userData,func,wait,times){return _interval(userData,func,wait,times);}

	var
		// aer special directives
		  _directives = {
			  '@new' : _$new
			, '@class' : _$class
			, '@overload' : _$over
			, '@require' : ''
			, '@main' : ''
			, '@register' : ''
			, '@package' : ''
			, '@async' : _async
		}
		// reserved keywords and respective Regex
		, _reserved = {
			  '@protected' : ''
			, '@public' : ''
			, '@private' : ''
			, '@privileged' : ''
		}
		// configs
		, _cfg = {
			  asyncTime : 25
			, asyncMaxAttempts : 10
			, asyncMinimumAttempts : 1
		}
		// registered aer data types and respective regex
		, _classes = {
			  'Number' : {
				  regex : ''
				, constructor : Number
				, ready : true
			}
			, 'String' : {
				  regex : ''
				, constructor : String
				, ready : true
			}
			, 'RegExp' : {
				  regex : ''
				, constructor : RegExp
				, ready : true
			}
			, 'Object' : {
				  regex : ''
				, constructor : Object
				, ready : true
			}
			, 'Array' : {
				  regex : ''
				, constructor : Array
				, ready : true
			}
			, 'Boolean' : {
				  regex : ''
				, constructor : Boolean
				, ready : true
			}
			, 'Error' : {
				  regex : ''
				, constructor : Error
				, ready : true
			}
			, 'Date' : {
				  regex : ''
				, constructor : Date
				, ready : true
			}
			, 'Function' : {
				  regex : ''
				, constructor : Function
				, ready : true
			}
		}
		// saves the namespace implementations
		, _chain = {}
		, _paths = {
			  root : null
		}
		, _waiting = 0
		, _activeScope;
	
	/**
	 * For security reasons with the evaluated function that is created when extend other classes,
	 * we use an secure overload method based on the constructor that ignores aer$classname
	 */
	function _$overload(pointer, args, context) { 'use strict';
		var
			  regex = /function\s+(\w+)s*/
			, types = []
			, executed;

		for (var i = 0; i < args.length; i++) {
			types.push(regex.exec(args[i].constructor.toString())[1]);
		}

		return pointer[types.toString()].apply(context, args);
	}
	
	/**
	 * A great way to overload functions!!! XD
	 * The modified overload that works with the aer$classname prototype attribute
	 */
	function _$$overload(pointer, args, context) { 'use strict';
		var types = [], i, executed;
		
		for (i = 0; i < args.length; i++) {
			types.push(args[i].aer$class);
		}
		
		try {
			executed = pointer[types.toString()].apply(context, args);
		} catch (e) {
			throw Error.call(context, context.aer$class + ' has no such signature [' + types.toString() + '] for the method ' + /function\s+(\w+)s*/.exec(pointer.toString()));
			return;
		}
		
		return executed;
	}
	
	/**
	 * This must be an object that aer['@class'] can recognize overloaded classes implementations
	 */
	function _$over() { 'use strict';
		return _$$overload(_$over, arguments, this);
	}
	_$over['Object'] = function(o) { 'use strict';
		return function() {
			return _$$overload(o, arguments, this);
		}
	}
	
	/**
	 * @function _$new
	 */
	function _$new(aerClass) {
		return (new _classes[aerClass].constructor);
	}
	
	/**
	 * @function _$class
	 */
	function _$class(namespace) {
		var _transitory = new _$transitory();
		_transitory.namespace = namespace;
		return _transitory;
	}
	
	/**
	 * @function _$require
	 */
	Object.prototype.aer$class = 'Object';
	Array.prototype.aer$class = 'Array';
	var _$require = _$over({
		/**
		 * @function _$require
		 * @param {String} namespace
		 */
		  'String' : function(namespace) {
			// if the class already exists, cancel the import
			if (!!_classes[namespace]) { return; }
			
			_async([namespace], function() {
				var 
					  path = state.args[0].split('.').join('/') + '.js'
					, s = document.createElement('script');
					
				s.type = 'text/javascript';
				s.src = path;
				
				document.getElementsByTagName('head')[0].appendChild(s);
			}, _cfg.asyncTime, 1);
		}
		/**
		 * @method _$require
		 * @param {String[]} arr
		 */
		, 'Array' : function(arr) {
			for (var i = 0; i < arr.length; i++) {
				_$require(arr[i]);
			}
		}
	}); 
	
	/**
	 * @function _$inject
	 * @param {Function} implementation
	 * @param {Array} dependencies
	 */
	function _$inject(implementation, dependencies) {
		var
			  fnStart = 'function() {'
			, fnBody = ''
			, fnEnd = '}';
		
		for (var i = 0, l = dependencies.length; i < l; i++) {
			fnBody += '_classes[\'' + dependencies[i] + '\'].constructor.apply(this, arguments);'// : dependencies[i] + '.apply(this, arguments);';
		}
		
		fnBody += 'implementation.apply(this, arguments);';

		return eval('(' + fnStart + fnBody + fnEnd + ')');
	}
	
	/**
	 * @function _$injectPrivileged
	 */
	function _$injectPrivileged() {
		
	}
	
	/**
	 * @function _$transitory
	 */
	function _$transitory() {
		this.namespace = null;
		this.heritage = null;
		this.constructor = null;
	}
	_$transitory.prototype = {
		  aer$class : '_$transitory'
		/**
		 * @method '@inherit'
		 */
		, '@inherit' : function() {
			this.heritage = Array.prototype.slice.call(arguments);
			return this;
		}
		/**
		 * @method '@prototype'
		 * @param {Object} methods - An object with attributes that are functions
		 */
		, '@prototype' : function(methods) {
			_async([methods, this], function(state) {
				if (!!state.args[1].constructor) {
					state.clear();
					
					for (var prop in state.args[0]) {
						if (typeof state.args[0][prop] == 'object') {
							state.args[1].constructor.prototype[prop] = _$over(state.args[0][prop]);
						} else {
							state.args[1].constructor.prototype[prop] = state.args[0][prop];
						}
					}
					
					state.args[1].constructor.prototype.aer$class = state.args[1].namespace;
				}
			}, _cfg.asyncTime);
			
			return this;
		}
		/**
		 * @method '@privileged'
		 * @param {Object} methods - An object with attributes that are functions
		 */
		, '@privileged' : function(methods) {
		
		}
		/**
		 * @method '@'
		 * @param {Function} constructor
		 */
		, '@' : function(constructor) {
			var _supers = !!this.heritage ? this.heritage : [];
			
			_async([this, constructor], function(state) {
				_$chain(state.args[0], state.args[1]);
			}, _cfg.asyncTime, 1);
			
			if (_supers.length > 0) {
				_async([this, _supers], function(state) {
					if (!!state.args[0].constructor) {
						state.clear();
						
						state.args[0].constructor.prototype.$uper = {};
						
						for (var i = 0; i < state.args[1].length; i++) {
							state.args[0].constructor.prototype.$uper[state.args[1][i]] = _classes[state.args[1][i]].constructor;
						
							for (var prop in _classes[state.args[1][i]].constructor.prototype) {
								if (prop !== 'aer$class') {
									state.args[0].constructor.prototype[prop] = _classes[state.args[1][i]].constructor.prototype[prop];
								}
							}
						}
					}
				}, _cfg.asyncTime);
			}
			
			return this;
		}
	}
	
	/**
	 * Creates the namespace and attaches the implementation of the class in it
	 *
	 * @function _$chain
	 * @param {Object} transitory - an _$transitory object
	 * @param {Function} implementation - the implementation of the class
	 */
	function _$chain(transitory, implementation) {
		var
			  ns = transitory.namespace.split('.')
			, dependencies = transitory.heritage || null
			, clone = {}
			, scope = _chain;
		
		// creates the namespace
		do {
			// access the namespace if already created, to properly chain
			scope[ns[0]] = scope[ns[0]] || {};
			scope = scope[ns.shift()];
		} while (ns.length > 0);
		
		scope = (!!!dependencies ? implementation : _$inject(implementation, dependencies));
		scope.prototype.aer$class = transitory.namespace;
		
		transitory.constructor = scope;
		
		// register a direct pointer
		_classes[transitory.namespace] = {
			  regex : ''
			, constructor : transitory.constructor
			, ready : true
		};
	}
	
	/**
	 * @function main
	 */
	function _$main() {
		_async(null, function(state) {
			
		});
	}
	
	// installing the primitives
	_directives['@class']('Object')['@'](Object);
	_directives['@class']('Number')['@'](Number);
	_directives['@class']('Array')['@'](Array);
	_directives['@class']('String')['@'](String);
	_directives['@class']('Boolean')['@'](Boolean);
	_directives['@class']('RegExp')['@'](RegExp);
	_directives['@class']('Error')['@'](Error);
	_directives['@class']('Function')['@'](Function);
	_directives['@class']('Date')['@'](Date);
	
	// nodeJS installation
	try { module.exports = aer } catch (e) {}
	// browser installation
	global.aer = _directives;
})(window /* browser environment */);

