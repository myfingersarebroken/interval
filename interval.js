function _interval(func, wait, times) {
		// Máquina de estados para o ciclo de assíncronia
		var stateMachine = {
			  maxCalls : times || Number.POSITIVE_INFINITY
			, actualCall : 0
			, data : []
			, lastComputedData : null
			, error : []
			, lastComputedError : null
			, wait : function() {}
			, continue : function() {}
			, then : function() {}
			, clear : function() {}
			, stopOnError : true
		};
		
		// utilizamos este closure para blindar o escopo da stateMachine
        var interv = (function(w, t) {
			function i() {
				if (t-- > 0) {
					try {
						// o retorno computado é armazenado em stateMachine.data
						i.state.data[stateMachine.actualCall] = func.call(i, stateMachine);
						i.state.lastComputedData = i.state.data[stateMachine.actualCall];
						
						// se não ocorrerem erros, incremento o ciclo
						stateMachine.actualCall += 1;
					} catch(e) {
						/* Se ocorrer algum tipo de exceção paramos a execução.
						 * Podemos configurar isso já na primeira execução de qualquer chamada de _async.
						 *
						 * @example
						 *		var someAsync = _async(function(state) {
						 *			state.stopOnError = false;
						 *		}, 300, 10);
						 */
						if (stateMachine.stopOnError) {
							t = 0;
						}
						
						// salvamos o erro em stateMachine.error
						i.state.error[stateMachine.actualCall] = e;
						i.state.lastComputedError = i.state.error[stateMachine.actualCall];
						
						/* deixamos que o desenvlvedor decida o que fazer quando o ocorrer algum erro e por isso
						 * executamos uma última vez a função passada 'func'
						 *
						 * @example
						 */
						try {
							/* Perceba que pode-se retornar um novo _async a qualquer momento bastando apenas atualizar a stateMachine, como no último exemplo
							 * mas deve-se tomar cuidado caso deseje-se continuar os ciclos mesmo após alguma exceção, pois podemos perder a referência à stateMachine
							 * anterior e nunca mais conseguiremos parar as chamadas
							 */
							i.state.data[stateMachine.actualCall] = func.call(i, stateMachine);
							i.state.lastComputedData = i.state.data[stateMachine.actualCall];
							
							// se estiver configurado para não para a execução mesmo com erros, continuamos a incrementar os ciclos
							stateMachine.actualCall += 1
						} catch(er) {}
					}
					
					setTimeout(interv, w);
				}
			}
			
			// definimos agora a função de finalização do _async
			stateMachine.clear = function() { t = 0; return null; };
			// repassamos uma referência de stateMachine para manipulação fora do closure
			i.state = stateMachine;
			// apenas mais uma referência para o método clear()
			i.clear = stateMachine.clear;
			
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
