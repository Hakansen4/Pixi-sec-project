import gsap, { Power0 } from "gsap";
import { Sprite } from "pixi.js";
import { GAME_WIDTH } from ".";
import { creamColor, orangeColor } from "./game";

export class Riddle {
  constructor(scale) {
    this.trashPosition = 1000;

    //rectangle works
    this.sprite = [];
    this.scale = scale;
    this.numerOfRectangles = 9;

    //getting sprite
    this.rectangleSprite = Sprite.from("rectangle");
  }
  draw(e) {
    //this is algorithm for riddle shape in the game.
    //it is creating rectangles in desired positions.
    let Xscaler = -1;
    let Yscaler = 0;
    for (let x = 0; x < this.numerOfRectangles; x++) {
      if (x === 4) {
        Xscaler = -1;
        Yscaler = 1;
      } else if (x === 5) {
        Xscaler = 1;
      }
      else if (x === 6) {
        Xscaler = -1;
        Yscaler = 2;
      }

      Xscaler++;
      this.sprite[x] = new Sprite();
      this.sprite[x].width = this.scale;
      this.sprite[x].height = this.scale;
      this.sprite[x].anchor.set(0.5, 0.5);
      this.sprite[x].x = (GAME_WIDTH - 4 * this.scale) / 2 + (Xscaler * (this.scale + 10));
      this.sprite[x].y = 130 + Yscaler * (this.scale + 10);
      this.sprite[x].texture = this.rectangleSprite.texture;
      this.sprite[x].tint = creamColor;
      e.addChild(this.sprite[x]);
    }
  }
  getPositions(rectangleNumber) {
    //giving desired rectangles positions for correct finded animation.(letters moving to the rectangles)
    let positions = [];
    for (let x = 0; x < rectangleNumber.length; x++) {
      positions[x] = this.sprite[rectangleNumber[x] - 1].position;
    }
    return positions;
  }
  rectCompleted(rectangleNumber) {
    //giving rectangles completed and changing colors
    this.sprite[rectangleNumber - 1].tint = orangeColor;
  }
  endAnim() {
    //destroy animation
    this.sprite.forEach(element => {
      gsap.to(element, {
        width: 0,
        height: 0,
        duration: 1,
        ease: Power0.easeNone
      });
    });
  }
}
