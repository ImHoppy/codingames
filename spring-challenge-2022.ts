"use strict"
const rl = function() : string {
	return (readline());
}

class Entity {
	TYPE_MONSTER = 0;
	TYPE_MY_HERO = 1;
	TYPE_OTHER_HERO = 2;
	MY_BASE = 1;
	OTHER_BASE = 2;
	distanceFromMyBase: number;
	constructor(
		public id: number,
		public type: number,
		public x: number,
		public y: number,
		public shieldLife: number,
		public isControlled: number,
		public health: number,
		public vx: number,
		public vy: number,
		public nearBase: number,
		public threatFor: number,
		public isalive: boolean,
		private me: Player
	) {
		this.distanceFromMyBase = this.getDistanceFrom(
			this.me.basePosX,
			this.me.basePosY
		);
	}
	isDangerousForMyBase = (): boolean => {
		return this.threatFor === this.MY_BASE;
	};
	getDistanceFrom = (x: number, y: number): number => {
		return Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));
	};
}

class Player {
	constructor(
		public basePosX: number,
		public basePosY: number,
		public baseHealth: number,
		public mana: number
	) { }
	setHealth = (value: number) => {
		this.baseHealth = value;
	};
	setMana = (value: number) => {
		this.mana = value;
	};
	canCast = (): boolean => {
		return this.mana >= 10;
	};
}

class Game {
	ACTION_WAIT = "WAIT";
	ACTION_MOVE = "MOVE";
	ACTION_SPELL = "SPELL";
	SPELL_WIND = "WIND";
	SPELL_CONTROL = "CONTROL";
	SPELL_SHIELD = "SHIELD";

	me: Player;
	enemy: Player;
	entities: Entity[];
	heroes: Entity[];
	turns: number;

	constructor(baseX: number, baseY: number, private nheroes: number) {
		this.me = new Player(baseX, baseY, 3, 0);
		this.enemy = new Player(
			baseX === 0 ? 17630 : 0,
			baseY === 0 ? 9000 : 0,
			3,
			0
		);
		this.turns = 0;
		this.heroes = [];
	}

	newTurn = (
		health: number,
		mana: number,
		enemyHealth: number,
		enemyMana: number
	) => {
		this.heroes = [];
		this.me.setHealth(health);
		this.me.setMana(mana);
		this.enemy.setHealth(enemyHealth);
		this.enemy.setMana(enemyMana);
		this.entities = [];
		if (this.entities != undefined)
			this.entities.forEach((e, i) => {
				e.isalive = false;
			})
		else
			this.entities = [];
		this.turns++;
	};

	idle = (hero: number) => {
		switch (hero) {
			case 0:
				console.log(`MOVE ${Math.abs(this.me.basePosX - 6250)} ${Math.abs(this.me.basePosY - 6250)} idle`);
				break;
			case 1:
				console.log(`MOVE ${Math.abs(this.me.basePosX - 8000)} ${Math.abs(this.me.basePosY - 2200)} idle`);
				break;
			case 2:
				console.log(`MOVE ${Math.abs(this.me.basePosX - 2200)} ${Math.abs(this.me.basePosY - 7500)} idle`);
				break;
			default:
				break;
		}
	}
	
	addEntity = (entity: Entity) => {
		var found = this.entities[entity.id];
		if (found == undefined)
			this.entities[entity.id] = entity;
		else
		{
			// found = {...entity}; // Error due to private me property
			found.x = entity.x;
			found.y = entity.y;
			found.shieldLife = entity.shieldLife;
			found.isControlled = entity.isControlled;
			found.health = entity.health;
			found.vx = entity.vx;
			found.vy = entity.vy;
			found.nearBase = entity.nearBase;
			found.threatFor = entity.threatFor;
			found.isalive = entity.isalive;
			found.distanceFromMyBase = entity.distanceFromMyBase;
		}
	};

	addHeroes = (entity: Entity) => {
		var found = this.heroes.find(e => {
			e.id == entity.id;
		})
		if (found == undefined)
			this.heroes.push(entity);
		else
		{
			// found = {...entity}; // Error due to private me property
			found.x = entity.x;
			found.y = entity.y;
			found.shieldLife = entity.shieldLife;
			found.isControlled = entity.isControlled;
			found.health = entity.health;
			found.vx = entity.vx;
			found.vy = entity.vy;
			found.nearBase = entity.nearBase;
			found.threatFor = entity.threatFor;
			found.isalive = entity.isalive;
			found.distanceFromMyBase = entity.distanceFromMyBase;
		}
	};


	nextAction = (hero: number): string => {
		// In the first league: MOVE <x> <y> | WAIT; In later leagues: | SPELL <spellParams>;


		
		return `${this.ACTION_MOVE} ${1000*hero} ${1000*hero}`;
	};
	debug = (message: string, ...rest) => {
		console.error(message, ...rest);
	};
}

const [baseX, baseY] = rl().split(" ").map(Number); // The corner of the map representing your base
const heroesPerPlayer: number = Number(rl()); // Always 3
const game = new Game(baseX, baseY, heroesPerPlayer);

// game loop
while (true) {
	const myBaseInput: number[] = rl().split(" ").map(Number);
	const enemyBaseInput: number[] = rl().split(" ").map(Number);
	game.newTurn(
		myBaseInput[0],
		myBaseInput[1],
		enemyBaseInput[0],
		enemyBaseInput[1]
	);

	const entityCount: number = Number(rl()); // Amount of heros and monsters you can see
	for (let i = 0; i < entityCount; i++) {
		const inputs: number[] = rl().split(" ").map(Number);
		var entity = new Entity(
			inputs[0], // Unique identifier
			inputs[1], // 0=monster, 1=your hero, 2=opponent hero
			inputs[2] + inputs[7], // Position of this entity
			inputs[3] + inputs[8],
			inputs[4], // Ignore for this league; Count down until shield spell fades
			inputs[5], // Ignore for this league; Equals 1 when this entity is under a control spell
			inputs[6], // Remaining health of this monster
			inputs[7], // Trajectory of this monster
			inputs[8],
			inputs[9], // 0=monster with no target yet, 1=monster targeting a base
			inputs[10], // Given this monster's trajectory, is it a threat to 1=your base, 2=your opponent's base, 0=neither
			true,
			game.me
		);
		if (entity.type == entity.TYPE_MONSTER)
			game.addEntity(entity);
		else
			game.addHeroes(entity);
		console.error(entity.id);
	}

	for (let i = 0; i < heroesPerPlayer; i++) {
		var min:Entity = null;
		game.entities.forEach((value, index) => {
			if (value.type == 0 && value.isDangerousForMyBase && value.isalive)
			{
				var curr:number = value.distanceFromMyBase;
				if (min == null || min.distanceFromMyBase > curr)
					min = value;
			}
		})
		if (min != null)
		{
			var enemyinbase:Entity[] = game.heroes.filter(element => element.type == element.TYPE_OTHER_HERO && element.distanceFromMyBase < 1500);
			if (enemyinbase[0])
				console.error("ENNEMIES DANS LA BASE !!");
			if (min.distanceFromMyBase < 1500 && min.health > 4)
			{
				if (i == 2 && game.me.canCast)
				{
					console.log(`SPELL CONTROL ${min.id} ${game.enemy.basePosX} ${game.enemy.basePosY}`); continue;
				}
				else if (game.me.canCast)
				{
					console.log(`SPELL WIND 8000 4000`);  continue;
				}
			}
			else if (min.distanceFromMyBase < 2000 && min.health > 6)
			{
				if (i == 1 && game.me.canCast)
				{
					console.log(`SPELL WIND 8000 4000`);  continue;
				}
				if (i == 0 || i == 2)
				{
					console.log(`MOVE ${min.x} ${min.y}`); continue;
				}
			}
			console.log(`MOVE ${min.x} ${min.y}`); continue;

		}
		else
			game.idle(i);
			// console.log("WAIT");
			// console.log(game.nextAction(i));
	}
}