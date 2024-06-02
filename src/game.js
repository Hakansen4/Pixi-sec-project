import { Container, Sprite } from "pixi.js";
import { GAME_HEIGHT, GAME_WIDTH } from ".";
import * as PIXI from 'pixi.js';
import { Tutorial } from "./Tutorial";
import { Pane } from "./Pane";
import { LetterChooser } from "./LetterChooser";
import { Riddle } from "./Riddle";
import gsap from "gsap";

export const orangeColor = "#e79250";
export const whiteColor = "#ffffff";
export const creamColor = "#FDEDEC";
export const greenColor = "#2ECC71";

export default class Game extends Container {

  constructor() {
    super();
    //question values
    this.letters = ["G","O","L","D"];
    this.answers = ["GOLD","GOD","DOG","LOG"];
    this.answerPositions = [
      [1,2,3,4],
      [1,5,7],
      [7,8,9],
      [3,6,9]
    ];

    //need global values
    this.isGameEnded = false;
    this.sortableChildren = true;
    this.isStarted = false;
    this.mousePosition;
    this.isHolding;

    //captured letters works
    this.capturedLetterCount = 0;
    this.capturedLetters = [];
    this.isCaptured = false;

    //tracking line works
    this.lines = [];
    this.lineCount = -1;
    this.lineWidth = 10;
    this.lineAlpha = 1;
    this.lineStartX = 0;
    this.lineStartY = 0;

    //timer works for tutorial
    this.timer = 0;
    this.tutorialTimer = 0;
    this.tutorialTime = 100;
    this.onTutorial = false;

    //component works
    this.riddle = new Riddle(80);
    this.chooser = new LetterChooser(250);
    this.pane = new Pane(20,60);
    this.tutorial = new Tutorial();

    this.init();
    this.mouseClick = this.mouseClick.bind(this);
    this.update = this.update.bind(this);
    this.captureMousePosition = this.captureMousePosition.bind(this);
    this.circlePointCollision = this.circlePointCollision.bind(this);
    this.mouseDown = this.mouseDown.bind(this);
    this.mouseUp = this.mouseUp.bind(this);
  }

  init() {
    this.drawBackground();
    this.riddle.draw(this);
    this.pane.draw(this);
    this.tutorial.draw(this);
    this.chooser.draw(this);
    this.chooser.createLetters(this,this.letters);
  }
  update()
  {
    if(this.isGameEnded)
      return;
    this.timer++;
    this.checkCollectLetter();
    this.lineMovement();
    this.checkForTutorial();
  }
  checkGameEnd()
  {
    //checking is game end.(when player find a word, that word removing form answers array.)
    if(this.answers.length === 0)
    {
      this.isGameEnded = true;
      this.endGame();
    }
  }
  endGame()
  {
    //calling end animations from components
    this.riddle.endAnim();
    this.chooser.endAnim();
    this.pane.endAnim();
  }
  checkForTutorial()
  {
    //checking tutorial timer. If conditions occur starting tutorial
    if(this.isHolding)
      this.tutorialTimer = this.timer;
    else if(!this.onTutorial  &&  this.timer - this.tutorialTimer > this.tutorialTime)
    {
      let position = this.chooser.getLetterCircle(this.answers[0]);
      this.lineCount = 0;
      this.tutorial.startHandAnim(position,this,0,this.answers[0]);
      this.onTutorial = true;
    }
  }
  setLineStarter(position)
  {
    //setting line starters for tracking line
    this.lineStartX = position.x;
    this.lineStartY = position.y;
  }
  lineMovement()
  {
      //calling line movement for player or tutorial
      if(this.isHolding  &&  this.isCaptured){
        this.moveLine(this.mousePosition);
      }
      else if(this.tutorial.isFinalCycle)
      {
        this.moveLine(this.tutorial.hand.position);
      }
  }
  moveLine(targetPosition)
  {
    //creating tracking line with given values
    if(this.lines[this.lineCount] === undefined)
      this.lines[this.lineCount] = new PIXI.Graphics();

    this.lines[this.lineCount].clear();
    this.lines[this.lineCount].lineStyle(this.lineWidth,orangeColor,this.lineAlpha);
    this.lines[this.lineCount].moveTo(this.lineStartX,this.lineStartY);
    this.lines[this.lineCount].lineTo(targetPosition.x,targetPosition.y);
    this.lines[this.lineCount].zIndex = 0;
    this.addChild(this.lines[this.lineCount]);
  }
  newLine(letterCircle)
  {
    //creating new line. In every letter circle creating new line.
    if(this.lineCount > 0)
      {
        this.lines[this.lineCount].clear();
        this.lines[this.lineCount].lineStyle(this.lineWidth,orangeColor,this.lineAlpha);
        this.lines[this.lineCount].moveTo(this.lineStartX,this.lineStartY);
        this.lines[this.lineCount].lineTo(letterCircle.letter.position.x,letterCircle.letter.position.y);
        this.addChild(this.lines[this.lineCount]);
      }
      this.lineStartX = letterCircle.letter.position.x;
      this.lineStartY = letterCircle.letter.position.y;
      this.lineCount++;
  }
  clearLine()
  {
    //clearing lines
    if (this.lines && this.lines.length > 0) {
      this.lines.forEach(element => {
        element.clear();
      });
    this.lineCount = 0;
   }
  }
  captureMousePosition(e)
  {
    //getting mouse values when mouse move
    this.mousePosition = e.data.global;
  }
  mouseClick()
  {
    //checking shuffle button is clicked or not
    if(this.rectangelePointCollision(this.mousePosition,this.chooser.shuffleButton))
    {
      //if it clicked then shuffling array and moving letter circles to their new positions
      this.shuffleArray(this.letters);
      this.chooser.moveletters(this.letters);
    } 
  }
  mouseDown()
  {
    this.clearLine();
    this.isHolding = true;
    this.isCaptured = false;
    this.tutorialTimer = this.timer;
    this.onTutorial = false;
    this.tutorial.stop(this);
  }
  mouseUp()
  {
    this.isCaptured = false;
    this.isHolding = false;
    this.clearLine()
    
    let collected = "";
    let isCorrect = false;

    //summing captured letters for the word we collected
    this.capturedLetters.forEach(element => {
      collected += element;
    });

    //checking is word is an answer or not
    for(let x = 0; x < this.answers.length; x++)
      {
        if(collected === this.answers[x])
        {
          isCorrect = true;
          this.wordIsCorrect(x);
          break;
        }
      }
    
    if(!isCorrect)
    {
      this.pane.wrongAnimation();
      this.capturedLetters = [];
      this.capturedLetterCount = 0;
      this.chooser.letterCircles.forEach(element =>{
      element.reset();
      });
    }
  }
  wordIsCorrect(x)
  {
    //reseting tutorial timer
    this.onTutorial = false;
    this.tutorialTimer = this.timer;
    //removing correct answered word
    this.answers.splice(x,1);
    //getting correct answered word's riddle positions, then sending to the correctAnimation
    let answerPos = this.riddle.getPositions(this.answerPositions[x]);
    this.pane.correctAnimation(answerPos,this.answerPositions[x],this.riddle,this);
    //correct answered word's riddle position removed
    this.answerPositions.splice(x,1);
    //reseting captured letters values
    this.capturedLetterCount = 0;
    this.chooser.letterCircles.forEach(element =>{
      element.reset();
    });
    this.capturedLetters = [];
    this.capturedLetterCount = 0;
    
    //shuffling letterChooser
    this.shuffleArray(this.letters);
    this.chooser.moveLetterNoAnim(this.letters);
  }
  drawBackground()
  {
    let backgroundImage = Sprite.from("background");
    backgroundImage.anchor.set(0.5);
    backgroundImage.x = GAME_WIDTH * 0.5;
    backgroundImage.y = GAME_HEIGHT * 0.5;
    backgroundImage.width = GAME_WIDTH;
    backgroundImage.height = GAME_HEIGHT;
    this.addChild(backgroundImage);
  }
  shuffleArray(array)
  {
    //shuffling array randomly
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements at indices i and j
    }
    return array;
  }
  checkCollectLetter()
  {
    //checking letter Circle is captured by player

    if(!this.isHolding)
      return;

    //checking mouse position with letter circles positions for collision.
    for(let x = 0; x < 4; x++)
    {
        if(!this.chooser.letterCircles[x].isCaptured &&  
          this.circlePointCollision(this.mousePosition,this.chooser.letterCircles[x].circleButton,
                                                                this.chooser.circleButtonsSize / 2))
        {
          this.saveCaptured(this.chooser.letterCircles[x]);
          this.newLine(this.chooser.letterCircles[x]);
        }
    }
  }
  saveCaptured(lettercircle)
  {
      //capturing letter
      this.isCaptured = true;
      this.capturedLetters[this.capturedLetterCount] = lettercircle.letter.text;
      lettercircle.capture();
      this.pane.addLetter(lettercircle.letter.text, this);
      this.capturedLetterCount++;
  }
  circlePointCollision(point,circle,radius)
  {
    //checking given circle and poin's positions for collision
    if(point === undefined)
      return;

    let distX = point.x - circle.x;
    let distY = point.y - circle.y;
    let distance = Math.sqrt((distX*distX) + (distY*distY));
    if(distance <= radius){
      return true;
    }
    return false;
  }
  rectangelePointCollision(point,rectangle){
    //checking given rectangle and poin's positions for collision
    if(point.x >= rectangle.position.x  &&  point.x <= rectangle.position.x + rectangle.width &&
       point.y >= rectangle.position.y  &&  point.y <= rectangle.position.y + rectangle.height){
        return true;
       }
       return false;
  }
}


/*
const RectType = {
  RANDOM: 'Random',
  HAND: 'Hand',
  INSTALL: 'install'

};

class Rect{
  constructor(bgSize,picSize){
    this.trashPosition = 1000;
    this.isMoving = false;
    this.type = RectType;
    this.rectangleButton = Sprite.from("rectangle");
    this.rectangleButton.width = bgSize;
    this.rectangleButton.height = bgSize;

    this.picture = Sprite.from("random");
    this.picture.width = picSize;
    this.picture.height = picSize;
    this.picture.zIndex = 1;
  }
  create(e, positionX, positionY,texture,type){
    this.type = type;

    this.rectangleButton.position.x = positionX;
    this.rectangleButton.position.y = positionY;
    
    this.picture.position.x = positionX;
    this.picture.position.y = positionY;
    this.picture.texture = Sprite.from(texture).texture;

    e.addChild(this.rectangleButton,this.picture);
  }
  move(posX,posY){
    this.movePosition(posX,posY,this.rectangleButton);
    this.movePosition(posX,posY,this.picture);
  }
  moveDown(value){
    this.move(this.rectangleButton.position.x,this.rectangleButton.position.x + value * this.rectangleButton.width);
  }
  movePosition(posX,posY,target){
    if(this.isMoving)
      return;

    gsap.to(target,{
      x:posX,
      y:posY,
      duration:0.5,
      onStart: () => {
        this.isMoving = true;
      },
      onComplete: () => {
        this.isMoving = false;
      }
    })
  }
  destroy(){
    this.rectangleButton.position.x = this.trashPosition;
    this.picture.position.x = this.trashPosition;
    this.type = null;
  }
}

class Table{
  constructor(Size){

    this.rects = [];
    this.rectCount = 0;
    this.rectSizeCalculator = Size;

    this.backgroundRect = Sprite.from("rectangle");
    this.backgroundRect.width = Size;
    this.backgroundRect.height = Size;
    this.backgroundRect.anchor.set(0.5,0.5);
    this.backgroundRect.position.x = GAME_WIDTH / 2;
    this.backgroundRect.position.y = GAME_HEIGHT / 2 + 50;
    this.backgroundRect.zIndex = 0;

  }
  draw(e){
    e.addChild(this.backgroundRect);
  }
  checkSlideDestroy(posX_1,posY_1,type_1,posX_2,posY_2,type_2){
    let isWorked = false;
    if(this.isFinded(posX_1,posY_1,type_1)){
      isWorked = true;
      this.destoyAction(posX_1,posY_1,type_1);
      //console.log("Destroy = " + posX_1 + " / " +posY_1 + " / "+type_1);
    }
    if(this.isFinded(posX_2,posY_2,type_2)){
      isWorked = true;
      this.destoyAction(posX_2,posY_2,type_2);
      //console.log("Destroy = " + posX_2 + " / " +posY_2 + " / "+type_2);
    }

    if(!isWorked)
      console.log("FALSE");

  }
  checkMoveDown(){
    for(let x = 0; x < this.rects.length; x++){
      let nullCounter = 0;
      for(let y = 0; y < this.rects.length; y++){
        if(this.rects[x][y] == null)
          nullCounter++;
        else if(nullCounter > 0)
          this.rects[x][y].moveDown(nullCounter);
      }
    }
  }
  moveRects(firstX,firstY,secX,secY){
    let firstPosX = this.rects[secX][secY].picture.position.x;
    let firstPosY = this.rects[secX][secY].picture.position.y;
    let secPosX = this.rects[firstX][firstY].picture.position.x;
    let secPosY = this.rects[firstX][firstY].picture.position.y;

    this.rects[firstX][firstY].move(firstPosX,firstPosY);
    
    this.rects[secX][secY].move(secPosX,secPosY);

    let temp = this.rects[firstX][firstY];
    this.rects[firstX][firstY] = this.rects[secX][secY];
    this.rects[secX][secY] = temp;
  }
  createRects(game,size){
    let rectSize = this.rectSizeCalculator / size;

    let startX = this.backgroundRect.position.x - this.backgroundRect.width / 2;
    let startY = this.backgroundRect.position.y + this.backgroundRect.width / 2 - rectSize;

    for (let i = 0; i < size; i++) {
      this.rects[i] = [];
  }

    for(let x = 0; x < size ; x++)
    {
      for(let y = 0; y < size; y++)
      {
        let randNumber = Math.floor(Math.random() * 3);
        switch(randNumber){
          case 0:
            if(!this.checkSpawnPos(y,x,RectType.RANDOM)){
              y--;
              break;
            }
            this.rects[y][x] = this.spawnRect(rectSize,game,startX + y * rectSize,startY - x * rectSize,"random",RectType.RANDOM);
            break;
          case 1:
            if(!this.checkSpawnPos(y,x,RectType.HAND)){
              y--;
              break;
            }
            this.rects[y][x] = this.spawnRect(rectSize,game,startX + y * rectSize,startY - x * rectSize,"hand",RectType.HAND);
            break;
          case 2:
            if(!this.checkSpawnPos(y,x,RectType.INSTALL)){
              y--;
              break;
            }
            this.rects[y][x] = this.spawnRect(rectSize,game,startX + y * rectSize,startY - x * rectSize,"install",RectType.INSTALL);
            break;
          default:
            break;
        }
      }
    }
  }
  checkSpawnPos(posX,posY,type){
    //check left
    if(posX - 1 >= 0  &&  this.rects[posX - 1][posY].type == type){
      if(this.checkSpawnNeighbor(posX -1,posY,type))
        return false;
    }
    //check up
    if(posY -1 >= 0 &&  this.rects[posX][posY - 1].type == type){
      return false;
    }
    return true;
  }
  checkSpawnNeighbor(posX,posY,type){
    //check left
    if(posX - 1 >= 0 &&this.rects[posX - 1][posY].type == type)
      return true;
    //check right
    if(posX + 1 < this.rects.length && this.rects[posX + 1][posY]?.type == type)
      return true;
    //check down
    if(posY + 1 < this.rects.length && this.rects[posX][posY + 1]?.type == type)
      return true;
    //check up
    if(posY - 1 >= 0  && this.rects[posX][posY - 1].type == type)
      return true;

    return false;
  }
  checkNeighbor(posX,posY,type,senderX,senderY){
    //check left
    if(posX - 1 >= 0 &&this.rects[posX - 1][posY]?.type == type  &&  ((senderX != posX - 1)  ||  (senderY != posY)))
      return true;
    //check right
    if(posX + 1 < this.rects.length && this.rects[posX + 1][posY]?.type == type &&  ((senderX != posX+1)  ||  (senderY != posY)))
      return true;
    //check down
    if(posY + 1 < this.rects.length && this.rects[posX][posY + 1]?.type == type &&  ((senderX != posX)  ||  (senderY != posY+1)))
      return true;
    //check up
    if(posY - 1 >= 0  && this.rects[posX][posY - 1]?.type == type  &&  ((senderX != posX)  ||  (senderY != posY-1)))
      return true;

    return false;
  }
  isFinded(posX,posY,type){
    let count = 0;
    //check left
    if(posX - 1 >= 0 &&this.rects[posX - 1][posY]?.type == type){
      count++;
      if(this.checkNeighbor(posX-1,posY,type,posX,posY))
        return true;
    }
    //check right
    if(posX + 1 < this.rects.length && this.rects[posX + 1][posY]?.type == type){
      count++;
      if(this.checkNeighbor(posX + 1,posY,type,posX,posY))
        return true;
    }
    //check down
    if(posY + 1 < this.rects.length && this.rects[posX][posY + 1]?.type == type){
      count++;
      if(this.checkNeighbor(posX,posY + 1,type,posX,posY))
        return true;
    }
    //check up
    if(posY - 1 >= 0  && this.rects[posX][posY - 1]?.type == type){
      count++;
      if(this.checkNeighbor(posX,posY - 1,type,posX,posY))
        return true;
    }

    if(count >= 2)
      return true;

    return false;
  }
  destoyAction(posX,posY,type){
    this.rects[posX][posY].destroy();
    this.rects[posX][posY] = null;
    //check left
    if(posX - 1 >= 0 &&this.rects[posX - 1][posY]?.type == type){
      this.destoyAction(posX - 1,posY,type);
    }
    //check right
    if(posX + 1 < this.rects.length && this.rects[posX + 1][posY]?.type == type){
      this.destoyAction(posX+1,posY,type);
    }
    //check down
    if(posY + 1 < this.rects.length && this.rects[posX][posY + 1]?.type == type){
      this.destoyAction(posX,posY+1,type);
    }
    //check up
    if(posY - 1 >= 0  && this.rects[posX][posY - 1]?.type == type){
      this.destoyAction(posX,posY-1,type);
    }
  }
  spawnRect(size,game,posX,posY,texture,type){
    let newRect = new Rect(size,size);
    newRect.create(game,posX,posY,texture,type);
    return newRect;
  }
}



export default class Game extends Container{
  constructor(){
    super();
    this.sortableChildren = true;

    this.canCapture = true;
    this.isHolding = false;
    this.isCaptured = false;
    this.mousePosition;
    this.mouseStartPos;
    this.rectPosX;
    this.rectPosY;
    this.rectType;

    this.table = new Table(350);
    this.tableSize = 5;
    this.init();
    this.update = this.update.bind(this);
    this.captureMousePosition = this.captureMousePosition.bind(this);
    this.circlePointCollision = this.circlePointCollision.bind(this);
    this.mouseDown = this.mouseDown.bind(this);
    this.mouseUp = this.mouseUp.bind(this);
  }
  
  init() {
    this.drawBackground();
    this.table.draw(this);
    this.table.createRects(this,this.tableSize);
  }
  drawBackground()
  {
    let backgroundImage = Sprite.from("background");
    backgroundImage.anchor.set(0.5);
    backgroundImage.x = GAME_WIDTH * 0.5;
    backgroundImage.y = GAME_HEIGHT * 0.5;
    backgroundImage.width = GAME_WIDTH;
    backgroundImage.height = GAME_HEIGHT;
    this.addChild(backgroundImage);
  }
  update(){
    if(!this.canCapture)
      return;
    this.checkCapture();
    this.checkSlide();
  }
  checkSlide(){
    if(!this.isHolding)
      return;
    //console.log("Start X: " + this.mouseStartPos.x + "  Current X= "+ this.mousePosition.x);
    //console.log("Start Y: " + this.mouseStartPos.y + "  Current Y= "+ this.mousePosition.y);
    //Down
    if(this.mouseStartPos.y - this.mousePosition.y > 10)
      console.log("DOWN");
    //Up
    else if(this.mousePosition.y - this.mouseStartPos.y > 10)
      console.log("UP");
    //right
    else if(this.mousePosition.x - this.mouseStartPos.x > 10)
      console.log("RIGHT");
    //left
    else if(this.mouseStartPos.x - this.mousePosition.x > 10)
      console.log("LEFT");
  }
  checkCapture(){
    if(!this.isHolding)
      return;


    for(let y = 0; y < this.tableSize; y++){
      for(let x = 0; x < this.tableSize; x++){
        if(this.table.rects[x][y] != null &&  this.rectangelePointCollision(this.mousePosition,this.table.rects[x][y].rectangleButton)){
          if(!this.isCaptured){
            this.rectPosX = x;
            this.rectPosY = y;
            this.rectType = this.table.rects[x][y].type;
            this.isCaptured = true;
            return; 
          }
          else{
            if(this.rectPosX != x ||  this.rectPosY != y){
                this.table.moveRects(this.rectPosX,this.rectPosY,x,y);
                this.table.checkSlideDestroy(x,y,this.rectType,
                    this.rectPosX,this.rectPosY,this.table.rects[this.rectPosX][this.rectPosY].type);
                this.table.checkMoveDown();
                this.isCaptured = false;
                this.canCapture = false;
            }
          }
        }
      }
    }
  }
  captureMousePosition(e)
  {
    //getting mouse values when mouse move
    this.mousePosition = e.data.global;
  }
  mouseDown(){
    this.isHolding = true;
    this.mouseStartPos = this.mousePosition;
  }
  mouseUp(){
    this.isHolding = false;
    this.isCaptured = false;
    this.rectPosX = null;
    this.rectPosY = null;
    this.canCapture = true;
  }

  circlePointCollision(point,circle,radius)
  {
    //checking given circle and poin's positions for collision
    if(point === undefined)
      return;

    let distX = point.x - circle.x;
    let distY = point.y - circle.y;
    let distance = Math.sqrt((distX*distX) + (distY*distY));
    if(distance <= radius){
      return true;
    }
    return false;
  }
  rectangelePointCollision(point,rectangle){
    //checking given rectangle and poin's positions for collision
    if(point.x >= rectangle.position.x  &&  point.x <= rectangle.position.x + rectangle.width &&
       point.y >= rectangle.position.y  &&  point.y <= rectangle.position.y + rectangle.height){
        return true;
       }
       return false;
  }

}*/