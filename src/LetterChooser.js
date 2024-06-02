import gsap, { Power0 } from "gsap";
import { Sprite } from "pixi.js";
import { GAME_HEIGHT, GAME_WIDTH } from ".";
import { LetterCircle } from "./LetterCircle";

export class LetterChooser {
  constructor(scale) {
    //circle works
    this.circle = new Sprite();
    this.circle.height = scale;
    this.circle.width = scale;
    this.circle.anchor.set(0.5);
    this.circle.x = GAME_WIDTH / 2;
    this.circle.y = GAME_HEIGHT - scale + 50;
    this.circleAlphaValue = 0.7;
    this.circle.alpha = this.circleAlphaValue;

    //button works
    this.shuffleButton = new Sprite();
    this.shuffleButton.width = 50;
    this.shuffleButton.height = 50;
    this.shuffleButton.anchor.set(0);
    this.shuffleButton.x = this.circle.x - this.shuffleButton.width / 2;
    this.shuffleButton.y = this.circle.y - this.shuffleButton.height / 2;

    this.letterCircles = [];
    this.circleButtonsSize = 70;

    //letter works
    this.letters = [];
    this.positionsX = [];
    this.positionsY = [];
    this.letterMoveDuration = 0.5;
    this.position1_x = this.circle.position.x;
    this.position1_y = this.circle.position.y - 80;
    this.position2_x = this.circle.position.x + 80;
    this.position2_y = this.circle.position.y;
    this.position3_x = this.circle.position.x;
    this.position3_y = this.circle.position.y + 80;
    this.position4_x = this.circle.position.x - 80;
    this.position4_y = this.circle.position.y;

    this.positionsX[0] = this.position1_x;
    this.positionsX[1] = this.position2_x;
    this.positionsX[2] = this.position3_x;
    this.positionsX[3] = this.position4_x;

    this.positionsY[0] = this.position1_y;
    this.positionsY[1] = this.position2_y;
    this.positionsY[2] = this.position3_y;
    this.positionsY[3] = this.position4_y;



    //sprite works
    this.randomSprite = Sprite.from("random");
    this.circleSprite = Sprite.from("circle");
  }
  draw(e) {
    this.circle.texture = this.circleSprite.texture;
    this.shuffleButton.texture = this.randomSprite.texture;
    e.addChild(this.circle, this.shuffleButton);
  }
  createLetters(e, letter) {
    //creating letter circles
    for (let x = 0; x < 4; x++) {
      this.letterCircles[x] = new LetterCircle(letter[x], this.circleButtonsSize, this.positionsX[x],
        this.positionsY[x], this.circleAlphaValue);
      this.letterCircles[x].draw(e);
    }
  }
  moveletters(letter) {
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 4; y++) {
        if (letter[x] === this.letterCircles[y].letter.text) {
          this.letterCircles[y].move(this.positionsX[x], this.positionsY[x], this.letterMoveDuration);
          break;
        }
      }
    }
  }
  moveLetterNoAnim(letter) {
    //moving letter circles immediately.(this is used when word correctly find.)
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 4; y++) {
        if (letter[x] === this.letterCircles[y].letter.text) {
          this.letterCircles[y].move(this.positionsX[x], this.positionsY[x], 0);
          break;
        }
      }
    }
  }
  getLetterCircle(word) {
    //getting word's letters
    let letters = [];
    for (let x = 0; x < word.length; x++) {
      letters[x] = word[x];
    }
    //then returning letter circle which matched with word's letters
    let letterPositions = [];
    let lettercount = 0;
    letters.forEach(element => {
      for (let x = 0; x < this.letterCircles.length; x++) {
        if (element === this.letterCircles[x].letter.text)
          letterPositions[lettercount] = this.letterCircles[x];
      }
      lettercount++;
    });
    return letterPositions;
  }
  endAnim() {
    this.destroyAnimation(this.circle);
    this.destroyAnimation(this.shuffleButton);
    this.letterCircles.forEach(element => {
      element.endAnim();
      this.destroyAnimation(element);
    });
  }
  destroyAnimation(target)
  {
    //destroy anim
    gsap.to(target,{
      width:0,
      height:0,
      duration:1,
      ease: Power0.easeNone
    })
  }
}
