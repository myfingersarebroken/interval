	function _interval(func, wait, times) {
		/**
		 * @namespace state
		 * @property {Number} maxCalls - A quantidade máxima de chamadas à rotina ou função.
		 * @property {Number} actualCall - A cada chamada da rotina ou função, esta propriedade é incrementada, indicando 
		 *									a chamada atual.
		 * @property {Array} - A cada chamada, o valor computado, caso haja cláusula return, é armazedo no índice correspondente a chamada.
		 * @property {*} lastComputedData - Via de regra, sempre precisaremos do ultimo valor computado e esta propriedade é para facilitar o acesso.
		 * @property {Error[]} error - Se ocorrer alguma exceção, ela é armazenada no índice em que ocorre a chamada da rotina ou função.
		 * @property {Error} lastComputedError - Idem state.lastComputedData, só que armazena o último erro =].
		 * @property {Boolean} stopOnError - Indica se as chamadas devem ou não parar quando ocorrer algum tipo de exception.
		 * @property {Boolean} isRunning - Auto descritiva xD
		 */
		var state = {
			  maxCalls : times || Number.POSITIVE_INFINITY
			, actualCall : 0
			, data : []
			, lastComputedData : null
			, error : []
			, lastComputedError : null
			, continue : function() {}
			, then : function() {}
			, clear : function() {}
			, stopOnError : true
			, isRunning : true
		};
		
		// utilizamos este closure para blindar o escopo da state
        var interv = (function(w, t) {
			function i() {
				if (t == 0) { state.isRunning = false; }
			
				if (t-- > 0) {
					try {
						// o retorno computado é armazenado em state.data
						i.state.data[state.actualCall] = func.call(i, state);
						i.state.lastComputedData = i.state.data[state.actualCall];
						
						// se não ocorrerem erros, incremento o ciclo
						state.actualCall += 1;
					} catch(e) {
						/* Se ocorrer algum tipo de exceção paramos a execução.
						 * Podemos configurar isso já na primeira execução de qualquer chamada de _async.
						 *
						 * @example
						 *		var someAsync = _async(function(state) {
						 *			state.stopOnError = false;
						 *		}, 300, 10);
						 */
						if (state.stopOnError) {
							t = 0;
						}
						
						// salvamos o erro em state.error
						i.state.error[state.actualCall] = e;
						i.state.lastComputedError = i.state.error[state.actualCall];
						 
						// se estiver configurado para não parar a execução mesmo com exceções, continuamos a incrementar os ciclos
						if (!state.stopOnError) {
							state.actualCall += 1
						}
						
						try {
							/* Deixamos que o desenvolvedor decida qual o que fazer em caso de erro
							 */
							i.state.data[state.actualCall] = func.call(i, state);
							i.state.lastComputedData = i.state.data[state.actualCall];
						} catch(er) {}
					}
					
					setTimeout(interv, w);
				}
			}
			
			/**
			 * Para a execução de _async
			 *
			 * @method clear
			 * @memberOf state
			 * @return {null}
			 */
			state.clear = function() {
				if (!state.isRunning) {
					return null;
				}
				
				t = 0;
				state.isRunning = false;
				
				return null;
			};
			/**
			 * Método para continuar a execução a partir do último estado computado
			 * após uma chamada a state.clear()
			 * @see _asyncRoutine~state
			 *
			 * @method continue
			 * @memberOf state
			 * @return {null}
			 */
			state.continue = function() {
				if (state.isRunning) {
					return null;
				}
			
				t = state.maxCalls - state.actualCall;
				state.isRunning = true;
				setTimeout(interv, w);
				
				return null;
			};
			
			// repassamos uma referência de state para manipulação fora do closure
			i.state = state;
			// apenas mais uma referência para facilitar o acesso
			i.clear = state.clear;
			// apenas mais uma referência para facilitar o acesso
			i.continue = state.continue;
			
			return i;
        })(wait, times || Number.POSITIVE_INFINITY);
        
        setTimeout(interv, wait);
		
        return interv;
	} /* @end _interval */
	
	/**
	 * @callback _asyncRoutine
	 * @param {Object} state - Uma state machine compartilhada entre os ciclos de _async
	 */
	
	/**
	 * A facade for _interval
	 *
	 * @function _async
	 */
	function _async(func, wait, times) {
		return _interval(func, wait, times);
	}
