const $ = el => document.querySelector(el);
const $$ = el => document.querySelectorAll(el);

const ZONE = $('#zone');

class Base {
    constructor(parent) {
        this.parent = parent;
    }
}

class Substance extends Base {
    constructor(parent, params) {
        super(parent);

        this.data = {
            position: {
                x: params.position.x,
                y: params.position.y
            },
            pieces: []
        }

        this.data.pieces.push(new Piece(this));
    }
}

class Piece extends Base {
    constructor(parent) {
        super(parent);

        this.data = {
            position: {
                x: this.parent.data.position.x,
                y: this.parent.data.position.y
            },
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
}

class Game {
    constructor() {
        this.substances = [];

        this.bindEvents();
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
}

const game = new Game();