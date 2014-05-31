function _interval(func, wait, times) {
	// Máquina de estados para o ciclo de assíncronia
	var stateMachine = {
		  maxCalls : times || Number.POSITIVE_INFINITY
		, actualCall : 0
		, data : []
		, error : []
		, continue : function() {}
		, stop : function() {}
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
					
					/* deixamos que o desenvlvedor decida o que fazer quando o ocorrer algum erro e por isso
					 * executamos uma última vez a função passada 'func'
					 *
					 * @example
					 *		var someAsync = _async(function(state1) {
					 *			if (state1.error) {
					 *				return _async(function(state2) {
					 *					// pode fazer alguma coisa
					 *					state1 = state2; // atualiza a referêcia para a stateMachine atual
					 *				}, 300, 5);
					 *			}
					 *		}, 300, 12);
					 */
					try {
						/* Perceba que pode-se retornar um novo _async a qualquer momento bastando apenas atualizar a stateMachine, como no último exemplo
						 * mas deve-se tomar cuidado caso deseje-se continuar os ciclos mesmo após alguma exceção, pois podemos perder a referência à stateMachine
						 * anterior e nunca mais conseguiremos parar as chamadas
						 *
						 * @example
						 *		var myAsync = _async(function(state1) {
						 *			if (state1.error) {
						 *				return _async(function(state2) {
						 *					if (state1 != state2) {
						 *						// veja que é uma boa prática atualizar a referência da stateMachine
						 *						// mas se não fizer, a state2 somente será referenciada através de myAsync.state.data.state
						 *						state1 = state2;
						 *					}
						 *					return 3;
						 *				});
						 *			}
						 *		}, 350, 8);
						 *
						 * @example
						 *		var myAsync2 = _async(function(state1) {
						 *			// aqui, não vamos finalizar o _async quando alguma exceção for lançada
						 *			state1.stopOnError = false;
						 *			
						 *			if (state1.error) {
						 *				return _async(function(state2) {
						 *					// perceba que se atualizarmos a referência para a stateMachine2,
						 *					// perdemos a stateMachine1 e não poderemos mais finalizá-la
						 *					if (state1 != state2) {
						 *						state1 = state2;
						 *					}
						 *				}, 100, 500);
						 *			}
						 *		}, 400, 7);
						 */
						i.state.data[stateMachine.stopOnError ? stateMachine.actualCall : (stateMachine.actualCall += 1)] = func.call(i, stateMachine);
						
						// se estiver configurado para não para a execução mesmo com erros, continuamos a incrementar os ciclos
						/*if (!stateMachine.stopOnError) {
							stateMachine.cycles++;
						}*/
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
})(wait, times);

setTimeout(interv, wait);
	
return interv;
}

/**
 * A facade for _interval
 *
 * @function _async
 */
function _async(func, wait, times) {
	return _interval(func, wait, times || Number.POSITIVE_INFINITY);
}
