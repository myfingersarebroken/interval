	/**
	 * A safe setTimeout / setInterval implementation
	 * Visando melhorar a interface de timeout e ter um retorno do stack trace adequado, as chamadas assíncronas sempre serão executadas
	 * no contexto de uma state machine.
	 * Essa state machine sempre é retornada para a variável que armazena _async, assim, permitindo maior controle sobre o que ocorre no programa.
	 * A rotina passada para _async poderá ter cláusula 'return', esta por sua vez sendo armazenada em sua_variavel.state.data['indice_da_chamada_em_que_ocorreu_a_rotina'].
	 * A respeito da state machine, ela também é repassada como parâmetro implícito para a rotina passada para _async, sendo possível manipulações
	 * de dentro da rotina, obtendo maior controle sobre o fluxo de execução.
	 * Note que a state machine referente à rotina assíncrona é um objeto e, logo, se precisarmos de variáveis compartilhadas entre as chamadas, devemos
	 * defini-las como atributos de 'state', ao invés de declará-las com a palavra-chave 'var'.
	 *
	 * @example
	 *		var myAsync = _async(function(state) {
	 *			// Detro desta rotina, o parâmetro intrínseco 'state' representa a state machine desta mesma rotina.
	 *			// Esta state machine também pode ser referenciada pela variável myAsync através de myAsync.state.
	 *			// Os atributos customizados definidos para 'state' são compartilhados entre as chamadas, logo, se definirmos um atributo
	 *			// state.myName, podemos acessá-lo nas próximas chamadas tanto por state.myName quanto por myAsync.state.myName.
	 *			// Para não sobrescrever o atributo a cada ciclo de excução da rotina, como boa prática sempre verificaremos se o atributo
	 *			// já existe, como segue abaixo:
	 *			if (!state.mySharedAttribute) {
	 *				state.mySharedAttribute = 'my value';
	 *			}
	 *		}, 250, 35);
	 *
	 *
	 * @example fibonnaci
	 *		// apenas para ilustrar as possibilidades de computação
	 *		var fib = _async(function(state) {
	 *			if(state.actualCall == 0) {
	 *				return 0;
	 *			} else if(state.actualCall == 1) {
	 *				return 1;
	 *			} else {
	 *				return state.data[state.actualCall - 1] + state.data[state.actualCall - 2];
	 *			}
	 *		}, 1000);
	 *
	 *
	 * @function _interval
	 * @param {_asyncRoutine} func - The routine to execute
	 * @param {Number} wait - The milisseconds between excutions
	 * @param {Number} times - Maximum number of excutions
	 * @return {Object} A state machine of the asynchronous calls
	 * @author Fernando Faria - cin_ffaria@uolinc.com
	 */
	function _interval(func, wait, times) {
		/**
		 * @class state
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
							/* Deixamos que o desenvolvedor decida qual decisão tomar em caso de erro
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
			 * @memberOf _asyncRoutine~state
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
			 * @memberOf _asyncRoutine~state
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
			// apenas mais uma referência para o método clear()
			i.clear = state.clear;
			
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
