import gsap from "gsap";
import { Sprite } from "pixi.js";
import { GAME_WIDTH } from ".";
import * as PIXI from 'pixi.js';
import { greenColor, whiteColor } from "./game";

export class Tutorial {
  constructor() {
    this.trashPosition = 1000;
    this.isFinalCycle = false;

    //hand works
    this.hand = Sprite.from("hand");
    this.hand.width = 0;
    this.hand.height = 0;
    this.hand.position.x = this.trashPosition;
    this.hand.zIndex = 2;
    this.hand.alpha = 0;

    //table works
    this.table = Sprite.from("rectangle");
    this.table.width = 200;
    this.table.height = 40;
    this.table.anchor.set(0, 0);
    this.tablePosition = GAME_WIDTH / 2 - this.table.width / 2;
    this.table.position.x = this.trashPosition;
    this.table.position.y = 355;
    this.table.tint = greenColor;

    //table text works
    this.tableText;
    this.tableTextFontSize = 17;
  }
  draw(game) {
    game.addChild(this.hand, this.table);
  }
  stop() {
    //reseting tutorial
    gsap.killTweensOf(this.hand);
    this.hand.position.x = this.trashPosition;
    this.isFinalCycle = false;
    this.hand.alpha = 0;
    this.hand.width = 0;
    this.hand.height = 0;
    this.table.position.x = this.trashPosition;
    if (this.tableText != undefined)
      this.tableText.position.x = this.trashPosition;
  }
  startHandAnim(positions, game, index, word) {
    this.table.position.x = this.tablePosition;
    this.hand.position = positions[0].letter.position;

    this.tableText = new PIXI.Text("Connect the letters " + word, {
      fill: whiteColor,
      fontWeight: 500,
      fontSize: this.tableTextFontSize,
      fontFamily: "Sniglet Regular",
    });

    this.tableText.position.x = this.table.position.x + 8;
    this.tableText.position.y = this.table.position.y + 6;
    game.addChild(this.tableText);

    let cycleCount = 0;
    
    let timeline = gsap.timeline({
      repeat: 2,
    });
    //hand spawn animation
    timeline.to(this.hand, {
      duration: 0.5,
      width: 50,
      height: 50,
      alpha: 1
    });
    //hand move animation
    for (let x = 0; x < positions.length; x++) {
      timeline.to(this.hand, {
        duration: 0.8,
        x: positions[x].letter.position.x,
        y: positions[x].letter.position.y,
        ease: 'power1.inOut',
        onStart: () => {
          if (cycleCount === 2 && x === 0) {
            //in final cycle we have tracking line
            this.isFinalCycle = true;
            game.setLineStarter(positions[x].letter.position);
          }
        },
        onComplete: () => {
          if (cycleCount === 2) {
            //capturing letterCircle when reaching them.
            if (x === 0) {
              game.saveCaptured(positions[x]);
            }

            else {
              game.newLine(positions[x]);
              game.saveCaptured(positions[x]);
            }

          }
        }
      });
    }
    //hand disappear animations
    timeline.to(this.hand, {
      duration: 0.9,
      width: 0,
      height: 0,
      alpha: 0,
      onComplete: () => {
        cycleCount++;
        game.clearLine();
        if (cycleCount === 3) {
          //after the third cycle finished, tutorial completed word and we need to write word to the riddle and reset tutorial.
          game.wordIsCorrect(index);
          this.stop();
          game.clearLine();
        }
      }
    });
  }
}
