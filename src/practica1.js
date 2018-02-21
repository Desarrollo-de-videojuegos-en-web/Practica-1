/**
 * MemoryGame es la clase que representa nuestro juego. Contiene un array con la cartas del juego,
 * el número de cartas encontradas (para saber cuándo hemos terminado el juego) y un texto con el mensaje
 * que indica en qué estado se encuentra el juego
 */
var MemoryGame = MemoryGame || {};

/**
 * Constructora de MemoryGame
 */
MemoryGame = function(gs) {
	this.cards = [];
	this.pairsFound = 0;
	this.gameMessage = 'Memory Game';
	this.gs = gs;
	this.click = false;
	this.lastCard = null;
};

MemoryGame.prototype.initGame = function() {
	this.randomizeCards();
	this.loop();
}

MemoryGame.prototype.draw = function (){
	game.gs.drawMessage(game.gameMessage);
	for (i = 0; i < game.cards.length; i++) { 
		game.cards[i].draw(game.gs, i);
	}
}

MemoryGame.prototype.loop = function (){
	setInterval(this.draw, 16);
}

MemoryGame.prototype.onClick = function (cardId) { 
	var card = this.cards[cardId];

	// no hacemos nada si no tenemos el turno de click, si seleccionamos una carta que no esta boca abajo, etc
	if (this.click || card == undefined || card.state != 'down') return;
	
	card.flip();
	
	if (this.lastCard == null){ // primera carta seleccionada
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

MemoryGame.prototype.checkGameState = function(){
	if (this.pairsFound == 8){
		this.gameMessage = 'You win!!!';
		this.click = true;
	}else this.gameMessage = 'Match!';
}

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

MemoryGameCard.prototype.flip = function() {
	if (this.state == 'up') this.state = 'down';
	else if (this.state == 'down') this.state = 'up';
}

MemoryGameCard.prototype.found = function() {
	this.state = 'found';
}

MemoryGameCard.prototype.compareTo = function(otherCard) {
	return this.sprite == otherCard.sprite;
}

MemoryGameCard.prototype.draw = function (gs, pos){
	if (this.state == 'down') gs.draw('back', pos);
	else gs.draw(this.sprite, pos);
}