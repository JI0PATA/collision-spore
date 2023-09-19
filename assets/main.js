const $ = el => document.querySelector(el);

const ZONE = $('#zone');

const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;

class Base {
    constructor(parent) {
        this.parent = parent;
    }

    updateSize() {
        this.el.style.width = `${this.data.size}px`;
        this.el.style.height = `${this.data.size}px`;
    }

    static checkCollision(piece1, piece2) {
        const a = piece1.r + piece2.r;
        const x = piece1.x - piece2.x;
        const y = piece1.y - piece2.y;

        return a > Math.sqrt((x * x) + (y * y));
    }
}

class Substance extends Base {
    constructor(parent, params) {
        super(parent);

        this.data = {
            maxSize: 200,
            minSize: 60,
            position: {
                x: params.position.x,
                y: params.position.y
            },
            pieces: [],
            countPieces: 5
        }

        this.canMove = false;
        this.canCheckCollision = false;
        this.difSize = this.data.maxSize - this.data.minSize;

        this.data.pieces.push(new Piece(this));
        this.data.pieces[0].animateCollapse();
    }

    update() {
        this.data.pieces.forEach(piece => {
            piece.update();
        });
    }

    splitting() {
        for (let i = 0; i < this.data.countPieces; i++) {
            this.data.pieces.push(new Piece(this));
        }
    }

    removePieceFromArray(piece) {
        this.data.pieces.splice(this.data.pieces.indexOf(piece), 1);
        this.checkSplitting();
    }

    checkSplitting() {
        if (this.data.pieces.length === 1) {
            const piece = this.data.pieces[0];

            this.data.position.x = piece.data.position.x;
            this.data.position.y = piece.data.position.y;

            piece.animateCollapse();
        }
    }
}

class Piece extends Base {
    MIN_SPEED = 1;
    MAX_SPEED = 3;

    constructor(parent) {
        super(parent);

        this.data = {
            size: this.parent.data.minSize,
            position: {
                x: this.parent.data.position.x,
                y: this.parent.data.position.y
            },
            accelerations: {
                x: Game.random(-1, 0) === 0 ? Game.random(this.MIN_SPEED, this.MAX_SPEED) : Game.random(-this.MAX_SPEED, -this.MIN_SPEED),
                y: Game.random(-1, 0) === 0 ? Game.random(this.MIN_SPEED, this.MAX_SPEED) : Game.random(-this.MAX_SPEED, -this.MIN_SPEED),
            }
        }

        this.createElement();
    }

    createElement() {
        this.el = document.createElement('div');
        this.el.className = 'spore';
        this.el.style.width = `${this.data.size}px`;
        this.el.style.height = `${this.data.size}px`;
        this.el.style.left = `${this.data.position.x}px`;
        this.el.style.top = `${this.data.position.y}px`;

        ZONE.appendChild(this.el);
    }

    update() {
        if (!this.parent.canMove) return;

        this.checkEdge();

        this.data.position.x += this.data.accelerations.x;
        this.data.position.y += this.data.accelerations.y;

        this.draw();

        this.checkCollision();
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

    animateCollapse() {
        this.parent.canMove = false;
        this.parent.canCheckCollision = false;

        this.data.size = this.parent.data.maxSize;
        this.updateSize();

        const maxSize = this.parent.data.maxSize;
        const minSize = this.parent.data.minSize;

        this.animate = this.el.animate({
            width: [`${maxSize}px`, `${minSize}px`],
            height: [`${maxSize}px`, `${minSize}px`]
        }, {
            duration: 300,
            delay: 300
        });

        this.animate.onfinish = _ => {
            this.data.size = this.parent.data.minSize;
            this.updateSize();
            this.parent.canMove = true;
            this.parent.splitting();
            setTimeout(_ => {
                this.parent.canCheckCollision = true;
            }, 1000);
        }
    }

    checkCollision() {
        if (!this.parent.canCheckCollision) return;

        this.parent.data.pieces.forEach((piece) => {
            // Выходим из цикла, если мы сравниваем один и тот же кружок
            if (this === piece) return;

            if (Base.checkCollision({
                r: this.data.size / 2,
                x: this.data.position.x,
                y: this.data.position.y
            }, {
                r: piece.data.size / 2,
                x: piece.data.position.x,
                y: piece.data.position.y
            })) {
                if (this.data.size > piece.data.size) this.consume(piece);
                else piece.consume(this);
            }
        });
    }

    consume(piece) {
        this.data.size += piece.data.size - this.parent.data.minSize + this.parent.difSize / this.parent.data.countPieces;
        this.updateSize();
        piece.removeElement();
    }

    removeElement() {
        this.el.remove();
        this.parent.removePieceFromArray(this);
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