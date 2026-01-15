// Variables globals de funcionament
  let font;
  let stickers = [];
  let container;
  let draggingSticker = null;
  let offsetX = 0;
  let offsetY = 0;

//Variables de configuració
  // Lletres
  const textSickers = "Adriana Yue.";
  let textStickersColor = "#303030";  
  let textSizeFactor = 0.6;
  let textStrokeFactor = 0.165;
  let wordSpacingFactor = 0.5;
  let hoveredScaleFactor = 1.02;
  let spaceFactor = 0.8;
  let hitboxExtension = 150;

  // Shadow
  let shadowX = 0;
  let shadowY = 10;
  let shadowBlur = shadowY * 2;
  let shadowColor = 'rgba(0, 0, 0, 0.25)';

  // Aleatorietat
  let xRandomFactor = 0.05;
  let yRandomFactor = 0.15;
  let rRandomFactor = 0.15;

  let stickerStroke = getComputedStyle(document.documentElement)
  .getPropertyValue('--sticker-stroke-color').trim();
//



// Carregar array de fonts abans d'iniciar
function preload() {
  font = [loadFont("/assets/Inter_18pt-Black.ttf"), loadFont("/assets/ClashDisplay-Bold.otf"), loadFont("/assets/Sentient-Bold.otf")];
}

// Es crea el canvas ocupant tot un <div> i s'activa la funció de crear stickers
function setup() {
  container = document.getElementById("type-canvas");
  if (!container) { // Per si la pàgina no ha carregat
    console.error("Container not found!");
    return;
  }

  const w = container.offsetWidth;
  const h = container.offsetHeight;
  const canvas = createCanvas(w, h);
  canvas.parent(container);

  textFont(random(font)); // fonts randomitzades equitatiavment
  textAlign(CENTER, CENTER);
  createStickers();
}


// S'actualitza el color segons la variant del CSS, i s'actualitzen i posiciones els stickers
function draw() {
  let bgColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--bg-color').trim();
  
  background(bgColor);
  cursor("default");

  for (let s of stickers) {
    s.update();
    s.display();
  }
}


// Es genera l'array de stickers a partir del text. El seu tamany es determina a partir de l'altura de la finestra. 
function createStickers() {
  stickers = [];

  const size = height * textSizeFactor;
  const strokeW = size * textStrokeFactor;

  textSize(size);

  let widths = [];
  let totalWidth = 0;

  // Es calcula l'amplada de cada lletra per determinar l'espaiat entre elles
  for (let c of textSickers) {
    if (c === " ") { // espai entre paraules
      widths.push(size * wordSpacingFactor);
      totalWidth += size * wordSpacingFactor;
    } else {
      const w = textWidth(c) + strokeW;
      widths.push(w);
      totalWidth += w;
    }
  }

  let x = (width - totalWidth * spaceFactor) / 4; // punt d'inici
  let y = height / 2;

  for (let i = 0; i < textSickers.length; i++) {
    const c = textSickers[i];
    const w = widths[i] * spaceFactor;

    if (c !== " ") {
      stickers.push(
        new Sticker(
          c,
          x + w / 2 + random(-size * xRandomFactor, size * xRandomFactor), // horizontal
          y + random(-size * yRandomFactor, size * yRandomFactor), // vertical
          random(-rRandomFactor, rRandomFactor), // rotació
          size,
          strokeW
        )
      );
    }
    x += w;
  }
}

// Si s'apreta el ratoli, es comprova si s'esta agafant un sticker i es guarda l'index de la lletra i l'offset amb el que s'ha agafat
function mousePressed() {
  for (let i = stickers.length - 1; i >= 0; i--) {
    if (stickers[i].isHovered()) {
      draggingSticker = stickers[i];
      offsetX = mouseX - draggingSticker.x;
      offsetY = mouseY - draggingSticker.y;

      stickers.push(stickers.splice(i, 1)[0]); // puja sticker a dalt de tot
      break;
    }
  }
}

// Es buida l'index de l'sticker agafat
function mouseReleased() {
  draggingSticker = null;
}

// S'ajusta el canvas a la mida del container i es tornen a generar els stickers
function windowResized() {
  if (!container) return;
  const w = container.offsetWidth;
  const h = container.offsetHeight;
  resizeCanvas(w, h);
  createStickers();
}

// Classe que conté totes les propietats i funcions dels stickers
class Sticker {
  // Es defineixen les propietats que se li donaran en ser creat a cada sticker
  constructor(char, x, y, rot, size, strokeW) {
    this.char = char;
    this.x = x;
    this.y = y;
    this.rotation = rot;
    this.size = size;
    this.strokeW = strokeW;
  }

  // S'actualitza la posició del sticker si s'està arrossegant
  update() {
    if (this === draggingSticker) { // es defineix hitbox per als marges
      let w = textWidth(this.char);
      let h = this.size - textAscent() + hitboxExtension;

      let halfW = w / 2;
      let halfH = h / 2;

      this.x = constrain(mouseX - offsetX, halfW, width - halfW);
      this.y = constrain(mouseY - offsetY, halfH, height - halfH);
    }
  }

  // Es comprova si el ratolí està sobre el sticker
  isHovered() {
    textSize(this.size); // es defineix hitbox d'agafar
    const w = textWidth(this.char) + this.strokeW * 2;
    const h = this.size - textAscent() + hitboxExtension;

    return (
      mouseX > this.x - w / 2 && mouseX < this.x + w / 2 && mouseY > this.y - h / 2 && mouseY < this.y + h / 2);
  }

  // Es dibuixa l'sticker amb els efectes corresponents
  display() {
    const hovered = this.isHovered();

    push(); // s'ailla l'sticker per donar-li els efectes corresponents

      translate(this.x, this.y);
      rotate(this.rotation);

      if (hovered) { // efectes hover
        cursor("grab");
        scale(hoveredScaleFactor);
        rotate(-this.rotation / 2);
      }

      textSize(this.size);
      textAlign(CENTER, CENTER);

      drawingContext.lineJoin = "round";

      drawingContext.shadowOffsetX = shadowX;
      drawingContext.shadowOffsetY = shadowY;
      drawingContext.shadowBlur = shadowBlur;
      drawingContext.shadowColor = shadowColor;

      noFill();
      stroke(stickerStroke);
      strokeWeight(this.strokeW);
      text(this.char, 0, 0);

      drawingContext.shadowColor = "transparent"; // si es fan alhora, hi ha ombra entre el fill i stroke

      noStroke();
      fill(textStickersColor); // te l he canviat aqui, pero no se si es correcte
      text(this.char, 0, 0);

    pop();
  }
}