const $ = el => document.querySelector(el);

const ZONE = $('#zone');

const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;

class Base {
    constructor(parent) {
        this.parent = parent;
    }
}

class Substance extends Base {
    constructor(parent, params) {
        super(parent);

        this.data = {
            maxSize: 200,
            position: {
                x: params.position.x,
                y: params.position.y
            },
            pieces: []
        }

        this.data.pieces.push(new Piece(this));
    }

    update() {
        this.data.pieces.forEach(piece => {
            piece.update();
        });
    }
}

class Piece extends Base {
    #MIN_SPEED = 3;
    #MAX_SPEED = 8;

    constructor(parent) {
        super(parent);

        this.data = {
            size: this.parent.data.maxSize,
            position: {
                x: this.parent.data.position.x,
                y: this.parent.data.position.y
            },
            accelerations: {
                x: Game.random(-1, 0) === 0 ? Game.random(this.#MIN_SPEED, this.#MAX_SPEED) : Game.random(-this.#MAX_SPEED, -this.#MIN_SPEED),
                y: Game.random(-1, 0) === 0 ? Game.random(this.#MIN_SPEED, this.#MAX_SPEED) : Game.random(-this.#MAX_SPEED, -this.#MIN_SPEED),
            }
        }

        this.createElement();
    }

    createElement() {
        this.el = document.createElement('div');
        this.el.className = 'spore';
        this.el.style.width = `200px`;
        this.el.style.height = `200px`;
        this.el.style.left = `${this.data.position.x}px`;
        this.el.style.top = `${this.data.position.y}px`;

        ZONE.appendChild(this.el);
    }

    update() {
        this.checkEdge();

        this.data.position.x += this.data.accelerations.x;
        this.data.position.y += this.data.accelerations.y;

        this.draw();
    }

    draw() {
        this.el.style.top = `${this.data.position.y}px`;
        this.el.style.left = `${this.data.position.x}px`;
    }

    checkEdge() {
        const halfSize = this.data.size / 2;

        if (this.data.position.x - halfSize <= 0 && this.data.accelerations.x < 0) this.data.accelerations.x *= -1;
        if (this.data.position.x + halfSize >= SCREEN_WIDTH && this.data.accelerations.x > 0) this.data.accelerations.x *= -1;

        if (this.data.position.y - halfSize <= 0 && this.data.accelerations.y < 0) this.data.accelerations.y *= -1;
        if (this.data.position.y + halfSize >= SCREEN_HEIGHT && this.data.accelerations.y > 0) this.data.accelerations.y *= -1;
    }
}

class Game {
    constructor() {
        this.substances = [];

        this.bindEvents();
        this.loop();
    }

    loop() {
        this.substances.forEach((substance => {
            substance.update();
        }))

        requestAnimationFrame(_ => this.loop());
    }

    bindEvents() {
        ZONE.addEventListener('click', ev => {

            this.substances.push(new Substance(this, {
                position: {
                    x: ev.clientX,
                    y: ev.clientY
                }
            }));
        });
    }

    static random(min, max) {
        return Math.round(Math.random() * (max - min) + min);
    }
}

const game = new Game();