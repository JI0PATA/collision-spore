const $ = el => document.querySelector(el);
const $$ = el => document.querySelectorAll(el);
const on = (el, ev, func) => el.addEventListener(ev, func);

const ZONE = $('#zone');

const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;

class Base {
  constructor(parent) {
    this.parent = parent;
  }

  draw() {
    this.el.style.top = `${this.data.position.y}px`;
    this.el.style.left = `${this.data.position.x}px`;
  }

  updateSize() {
    this.el.style.width = `${this.data.size}px`;
    this.el.style.height = `${this.data.size}px`;
  }

  static checkCollision(piece1, piece2) {
    let a = piece1.r + piece2.r;
    let x = piece1.x - piece2.x;
    let y = piece1.y - piece2.y;

    return a > Math.sqrt((x * x) + (y * y));
  }
}

class Substance extends Base {
  constructor(parent, params) {
    super(parent);

    this.data = {
      minSize: 40,
      maxSize: 200,
      position: {
        x: params.position.x,
        y: params.position.y,
      },
      pieces: [],
      countPieces: 10,
      color: this.parent.colors[0]
    };
    this.parent.colors.splice(0, 1);
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

  removePieceInData(piece) {
    this.data.pieces.splice(this.data.pieces.indexOf(piece), 1);
    this.checkSplitting();
  }

  checkSplitting() {
    if (this.data.pieces.length === 1) {
      let piece = this.data.pieces[0];

      this.data.position.x = piece.data.position.x;
      this.data.position.y = piece.data.position.y;

      piece.animateCollapse();
    }
  }
}

class Piece extends Base {
  constructor(parent) {
    super(parent);

    this.data = {
      size: this.parent.data.minSize,
      position: {
        x: this.parent.data.position.x,
        y: this.parent.data.position.y
      },
      offsets: {
        x: Game.random(-1, 0) === 0 ? Game.random(3, 8) : Game.random(-8, -3),
        y: Game.random(-1, 0) === 0 ? Game.random(3, 8) : Game.random(-8, -3)
      }
    };

    this.createElement();
  }

  createElement() {
    this.el = document.createElement('div');
    this.el.className = 'spore';
    this.el.style.width = `${this.data.size}px`;
    this.el.style.height = `${this.data.size}px`;
    this.el.style.left = `${this.data.position.x}px`;
    this.el.style.top = `${this.data.position.y}px`;
    this.el.style.backgroundColor = `${this.parent.data.color}`;
    ZONE.appendChild(this.el);
  }

  update() {
    if (!this.parent.canMove) return;

    this.checkEdge();

    this.data.position.x += this.data.offsets.x;
    this.data.position.y += this.data.offsets.y;
    this.draw();

    this.checkCollision();
  }

  checkEdge() {
    if (this.data.position.x - this.data.size / 2 <= 0 && this.data.offsets.x < 0) this.data.offsets.x *= -1;
    if (this.data.position.x + this.data.size / 2 >= SCREEN_WIDTH && this.data.offsets.x > 0) this.data.offsets.x *= -1;

    if (this.data.position.y - this.data.size / 2 <= 0 && this.data.offsets.y < 0) this.data.offsets.y *= -1;
    if (this.data.position.y + this.data.size / 2 >= SCREEN_HEIGHT && this.data.offsets.y > 0) this.data.offsets.y *= -1;
  }

  animateCollapse() {
    this.parent.canMove = false;
    this.parent.canCheckCollision = false;

    this.data.size = this.parent.data.maxSize;
    this.updateSize();

    this.animate = this.el.animate({
      width: [`${this.parent.data.maxSize}px`, `${this.parent.data.minSize}px`],
      height: [`${this.parent.data.maxSize}px`, `${this.parent.data.minSize}px`]
    }, {
      duration: 300,
      delay: 300,
    });

    this.animate.onfinish = _ => {
      this.parent.canMove = true;
      this.data.size = this.parent.data.minSize;
      this.updateSize();
      this.parent.splitting();
      setTimeout(_ => {
        this.parent.canCheckCollision = true;
      }, 1000);
    }
  }

  checkCollision() {
    if (!this.parent.canCheckCollision) return;

    this.parent.data.pieces.forEach(piece => {
      if (this === piece) return;

      if (Base.checkCollision({
        r: this.data.size / 2,
        x: this.data.position.x,
        y: this.data.position.y,
      }, {
        r: piece.data.size / 2,
        x: piece.data.position.x,
        y: piece.data.position.y,
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
    this.parent.removePieceInData(this);
  }
}

class Game {
  constructor() {
    this.substances = [];

    this.colors = ['red', 'cyan', 'yellow', 'green', 'blue', 'black'];

    this.loop();
    this.bindEvents();
  }

  loop() {

    this.substances.forEach(substance => {
      substance.update();
    });

    requestAnimationFrame(_ => this.loop());
  }

  bindEvents() {
    on(ZONE, 'click', ev => {
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

let game = new Game();