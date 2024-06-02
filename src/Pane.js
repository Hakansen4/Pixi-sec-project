import gsap, { Power0 } from "gsap";
import { Sprite } from "pixi.js";
import { GAME_WIDTH } from ".";
import * as PIXI from 'pixi.js';
import { orangeColor, whiteColor } from "./game";

export class Pane {
  constructor(sizeX, sizeY) {
    this.trashPosition = 1000;

    //letter works
    this.letters = [];
    this.letterCount = 0;
    this.letterSize = 35;

    //old letter works(for end game animation)
    this.oldLetters = [];
    this.oldLetterCount = 0;

    //pane background works
    this.background = new Sprite();
    this.background.tint = orangeColor;
    this.background.anchor.set(0, 0.5);
    this.bgSizeX = sizeX;
    this.background.width = sizeX;
    this.background.height = sizeY;
    this.backgroundPositionX = GAME_WIDTH / 2 - sizeX / 2;
    this.background.position.x = this.backgroundPositionX;
    this.background.position.y = 440;
    this.rectangleSprite = Sprite.from("rectangle");
  }
  draw(e) {
    this.background.texture = this.rectangleSprite.texture;
    this.background.position.x = this.trashPosition;
    e.addChild(this.background);
  }
  addLetter(letter, e) {
    //adding new letter

    //background getting wider in every letter
    this.background.width += this.bgSizeX;
    this.background.position.x = this.backgroundPositionX - this.background.width / 2;

    //every letters positions changing because background getting wider
    this.letters.forEach(element => {
      element.position.x -= this.bgSizeX / 2;
    });

    //adding new letter
    this.letters[this.letterCount] = new PIXI.Text(letter, {
      fill: whiteColor,
      fontWeight: 800,
      fontSize: this.letterSize,
      fontFamily: "Sniglet Regular",
    });
    this.letters[this.letterCount].anchor.set(0.5);
    this.letters[this.letterCount].position.x = this.background.position.x + this.letterSize / 2 + this.letterCount * 24;
    this.letters[this.letterCount].position.y = this.background.position.y;
    e.addChild(this.letters[this.letterCount]);
    this.letterCount++;
  }
  reset() {
    //reseting pane
    this.background.width = this.bgSizeX;
    this.letters.forEach(element => {
      element.position.x = this.trashPosition;
    });
    this.letters = [];
    this.letterCount = 0;
    this.background.position.x = this.trashPosition;
  }
  correctAnimation(positions, rects, riddle, game) {
    //removing background from screen and reseting
    this.background.position.x = this.trashPosition;
    this.background.width = this.bgSizeX;
    this.letterCount = 0;
    //letters animating towards riddle
    this.letters.forEach((letter, index) => {
      //keeping letters for end animation
      this.oldLetters[this.oldLetterCount] = letter;
      this.oldLetterCount++;
      letter.style.fontSize = 50;
      gsap.to(letter.position, {
        x: positions[index].x,
        y: positions[index].y,
        duration: 0.8,
        ease: Power0.easeNone,
        onComplete: () => {
          riddle.rectCompleted(rects[index]);
          game.checkGameEnd();
        }
      });
    });
    this.letters = [];
  }
  wrongAnimation() {
    this.jiggleAnimation(this.background);
    this.letters.forEach(element => {
      this.jiggleAnimation(element);
    });
  }
  jiggleAnimation(target) {
    gsap.to(target, {
      x: target.position.x + 7,
      duration: 0.05,
      repeat: 3,
      yoyo: true,
      ease: 'none',
      onComplete: () => {
        gsap.killTweensOf(target);
        this.reset();
        target.position.x = this.trashPosition;
      }
    });
  }
  endAnim() {
    //removing letters from riddle
    this.oldLetters.forEach(element => {
      element.position.x = this.trashPosition;
    });
  }
}
