import * as PIXI from "pixi.js";
import { Application } from "pixi.js";
import { initAssets } from "./assets";
import { gsap } from "gsap";
import { CustomEase, PixiPlugin } from "gsap/all";
import Game from "./game";

export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 800;

export const app = new Application({
  backgroundColor: 0x000000,
  antialias: true,
  hello: true,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
});

app.ticker.stop();
gsap.ticker.add(() => {
  app.ticker.update();
});

async function init() {

  document.body.appendChild(app.view);

  let assets = await initAssets();
  console.log("assets", assets);

  gsap.registerPlugin(PixiPlugin, CustomEase);
  PixiPlugin.registerPIXI(PIXI);

  const game = new Game();

  app.stage.interactive = true;
  app.stage.on("mousemove",game.captureMousePosition);
  //app.stage.on("click",game.mouseClick);
  app.stage.on("pointerdown",game.mouseDown);
  app.stage.on("mouseup",game.mouseUp);
  app.stage.addChild(game);
  app.ticker.add(game.update);
  app.ticker.start();
}

init();
