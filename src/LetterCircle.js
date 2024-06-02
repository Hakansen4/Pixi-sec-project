import gsap, { Power0 } from "gsap";
import { Sprite } from "pixi.js";
import * as PIXI from 'pixi.js';
import { orangeColor, whiteColor } from "./game";


export class LetterCircle {
  constructor(letter, size, positionX, positionY) {
    this.trashPosition = 1000;
    this.isCaptured = false;

    this.size = size;
    this.positionX = positionX;
    this.positionY = positionY;
    
    this.circleButton = new Sprite();
    
    this.letter = new PIXI.Text(letter, {
      fill: orangeColor,
      fontWeight: 500,
      fontSize: 65,
      fontFamily: "Sniglet Regular",
    });

    this.circleSprite = Sprite.from("circle");
  }
  draw(e) {
    //circle button works
    this.circleButton.texture = this.circleSprite.texture;
    this.circleButton.width = this.size;
    this.circleButton.height = this.size;
    this.circleButton.anchor.set(0.5, 0.5);
    this.circleButton.position.x = this.positionX;
    this.circleButton.position.y = this.positionY;
    this.circleButton.alpha = 0;
    this.circleButton.zIndex = 0.5;

    //letter works
    this.letter.anchor.set(0.5);
    this.letter.position.x = this.positionX;
    this.letter.position.y = this.positionY;
    this.letter.zIndex = 1;

    e.addChild(this.circleButton, this.letter);
  }
  move(newPositionX, newPositionY, moveDuration) {
    this.moveAnimation(this.letter.position,newPositionX,newPositionY,moveDuration);

    this.moveAnimation(this.circleButton.position,newPositionX,newPositionY,moveDuration);
  }
  moveAnimation(target,xPosition,yPosition,duration)
  {
    gsap.to(target,{
      x:xPosition,
      y:yPosition,
      duration: duration,
      ease: Power0.easeNone
    });
  }
  capture() {
    //capture animation
    this.isCaptured = true;
    this.circleButton.tint = orangeColor;
    this.circleButton.alpha = 1;
    this.letter.style.fill = whiteColor;
  }
  reset() {
    //reseting letter circle
    this.isCaptured = false;
    this.circleButton.tint = whiteColor;
    this.circleButton.alpha = 0;
    this.letter.style.fill = orangeColor;
  }
  endAnim() {
    //destroy animation
    this.letter.position.x = this.trashPosition;
  }
}
