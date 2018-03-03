/**
 * MemoryGame es la clase que representa nuestro juego. Contiene un array con la cartas del juego,
 * el número de cartas encontradas (para saber cuándo hemos terminado el juego) y un texto con el mensaje
 * que indica en qué estado se encuentra el juego
 */
var MemoryGame = MemoryGame || {};

/**
 * Constructora del tablero de juego. Recibe como parámetro el graphic server que gestiona el juego.
 */
MemoryGame = function(gs) {
	this.cards = [];
	this.pairsFound = 0;
	this.gameMessage = 'Memory Game';
	this.gs = gs;
	this.click = false;
	this.lastCard = null;
};

/**
 * Inicializa el juego. Para ello genera y 'randomiza' el tablero y comienza el bucle del mismo.
 */
MemoryGame.prototype.initGame = function() {
	this.randomizeCards();
	this.loop();
}

/**
 * Pinta las cartas del tablero.
 */
MemoryGame.prototype.draw = function (){
	game.gs.drawMessage(game.gameMessage);
	for (i = 0; i < game.cards.length; i++) { 
		game.cards[i].draw(game.gs, i);
	}
}

/**
 * Bucle de juego. Llama a draw() con setInterval para que se ejecute cada cierto tiempo.
 */
MemoryGame.prototype.loop = function (){
	setInterval(this.draw, 16);
}

/**
 * Gestiona las pulsaciones del ratón sobre una carta.
 * @param {int} cardId Posición del tablero que ocupa la carta seleccionada
 */
MemoryGame.prototype.onClick = function (cardId) { 
	var card = this.cards[cardId];

	// no hacemos nada si no tenemos el turno de click, si seleccionamos una carta que no esta boca abajo, etc
	if (this.click || card == undefined || card.state != 'down') return;
	
	card.flip();
	
	if (this.lastCard == null){ // primera carta seleccionada, la guardamos y salimos
		this.lastCard = card;
		return;
	}else{ // segunda carta seleccionada; comprobamos si son iguales, en otro caso las volteamos
		if (this.lastCard.compareTo(card)){ // las marcamos como encontradas y comprobamos si el juego ha terminado
			this.lastCard.found();
			card.found();
			this.lastCard = null;
			this.pairsFound++;
			this.checkGameState();
		}else{ // volteamos ambas cartas estableciendo un lock sobre el juego
			this.click = true;
			this.resetCards(this, card, 1000);
		}
	}	
}

/**
 * Genera un array de cartas en base a una lista con el nombre de sus sprites y las desordena.
 * El bucle para desordenarlas recorre el array desde el final hacia delante e intercambia la carta i-ésima con 
 * la j-ésima siendo j<i.
 */
MemoryGame.prototype.randomizeCards = function(){
	var cardSprites = ['8-ball', 'potato', 'dinosaur', 'kronos', 'rocket', 'unicorn', 'guy', 'zeppelin', 
						'8-ball', 'potato', 'dinosaur', 'kronos', 'rocket', 'unicorn', 'guy', 'zeppelin']
	for (let sprite of cardSprites) { 
		this.cards.push(new MemoryGameCard(sprite));
	}
	var currentIndex = this.cards.length, temporaryValue, randomIndex;
	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		temporaryValue = this.cards[currentIndex];
		this.cards[currentIndex] = this.cards[randomIndex];
		this.cards[randomIndex] = temporaryValue;
	}

}

/**
 * Comprueba si el juego ha terminado. Si se han volteado 8 parejas (16 cartas) el juego termina, en otro caso
 * se muestra un mensaje match.
 */
MemoryGame.prototype.checkGameState = function(){
	if (this.pairsFound == 8){
		this.gameMessage = 'You win!!!';
		this.click = true;
	}else this.gameMessage = 'Match!';
}

/**
 * Voltea las dos últimas cartas seleccionadas si no ha habido match.
 * @param {MemoryGame} obj Sesión de juego que contiene el tablero y la carta volteada en el turno anterior
 * @param {MemoryGameCard} card Carta volteada en el último movimiento
 * @param {int} time Tiempo en ms a esperar para voltear las cartas
 */
MemoryGame.prototype.resetCards = function(obj, card, time){
	obj.gameMessage = 'Fail!!';
	setTimeout(function(){
		card.flip();
		obj.lastCard.flip();
		obj.lastCard = null;
		obj.click = false;
	}, time);
}

/**
 * Constructora de las cartas del juego. Recibe como parámetro el nombre del sprite que representa la carta.
 * Dos cartas serán iguales si tienen el mismo sprite.
 * La carta puede guardar la posición que ocupa dentro del tablero para luego poder dibujarse
 * @param {string} id Nombre del sprite que representa la carta
 */
MemoryGameCard = function(id) { // states: down, up, find
	this.sprite = id;
	this.state = 'down';
};

/**
 * Voltea la carta seleccionada cambiando el estado de la misma. Los estados pueden ser up y down.
 */
MemoryGameCard.prototype.flip = function() {
	if (this.state == 'up') this.state = 'down';
	else if (this.state == 'down') this.state = 'up';
}

/**
 * Marca una carta como found.
 */
MemoryGameCard.prototype.found = function() {
	this.state = 'found';
}

/**
 * Determina si dos cartas son iguales comparando su sprite.
 * @param {MemoryGameCard} otherCard Carta con la comparar
 */
MemoryGameCard.prototype.compareTo = function(otherCard) {
	return this.sprite == otherCard.sprite;
}

/**
 * Dibuja el sprite de una carta en función de su estado.
 * @param {CustomGraphicServer} gs Graphic server encargado de dibujar la carta
 * @param {int} pos Posición que ocupa la carta en el tablero (0-15)
 */
MemoryGameCard.prototype.draw = function (gs, pos){
	if (this.state == 'down') gs.draw('back', pos);
	else gs.draw(this.sprite, pos);
}