/**
 * A safe setTimeout / setInterval implementation
 * Visando melhorar a interface de timeout e ter um retorno do stack trace adequado, as chamadas assíncronas sempre serão executadas
 * no contexto de um novo objeto limpo, que servirá como máquina de estados.
 * Assim, sempre podemos consultar este objeto com os retornos atualizados e tomar as decisões adequadas.
 *
 * @example
 *		_interval(function() { alert('safe interval!!!') }, 100, 12);
 *
 * @function _interval
 * @param {Function} func - The function to execute
 * @param {Number} wait - The milisseconds between excutions
 * @param {Number} times - Maximum number of excutions
 * @param {Object} context - Optional; A context to apply the function if needed
 * @return {Object} An object with a clear() method to stop the assync interval
 * @author Fernando Faria - cin_ffaria@uolinc.com
 */
function _interval(func, wait, times) {
	// Máquina de estados para o ciclo de assíncronia
	var stateMachine = {
		  maxCycles : times || Number.POSITIVE_ININITY
		, cycles : 0
		, data : null
		, error : null
		, clear : function() {}
		, stopOnError : true
	};
	
	// utilizamos este closure para blindar o escopo da stateMachine
var interv = (function(w, t) {
		function i() {
			if (typeof t !== 'number' || t-- > 0) {
				try {
					// o retorno computado é armazenado em stateMachine.data
					i.state.data = func.call(i, stateMachine);
					
					// atualizamos o ciclo
					stateMachine.cycles++;
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
					i.state.error = e;
					
					/* deixamos que o desenvlvedor decida o que fazer quando o ocorrer algum erro e por isso
					 * executamos uma última vez a função passada 'func', sem incremetar o ciclo atual
					 *
					 * @example
					 *		var someAsync = _async(function(state1) {
					 *			if (state1.error) {
					 *				return _async(function(state2) {
					 *					// pode fazer alguma coisa
					 *				}, 300, 5);
					 *			}
					 *		}, 300, 12);
					 */
					try {
						i.state.data = func.call(i, stateMachine);
						
						if (!stateMachine.stopOnError) {
							stateMachine.cycles++;
						}
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
	return _interval(func, wait, times);
}
