import { Texture, CanvasSource } from 'pixi.js';
import { COLORS } from './palette';

function hexToRgb(hex) {
  return [(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff];
}

function createCanvas(w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return [canvas, ctx];
}

function px(ctx, x, y, color) {
  const [r, g, b] = hexToRgb(color);
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(x, y, 1, 1);
}

function hspan(ctx, x1, x2, y, color) {
  for (let x = x1; x <= x2; x++) px(ctx, x, y, color);
}

function drawHead(ctx, c, mouth) {
  // Hair
  hspan(ctx, 16, 30, 2, c.hair);
  hspan(ctx, 15, 31, 3, c.hair);
  hspan(ctx, 14, 32, 4, c.hair);
  hspan(ctx, 14, 32, 5, c.hair);
  px(ctx, 17, 3, c.hairLight); px(ctx, 20, 3, c.hairLight); px(ctx, 24, 3, c.hairLight);
  px(ctx, 25, 4, c.hairLight); px(ctx, 28, 3, c.hairLight);
  px(ctx, 16, 4, c.hairLight); px(ctx, 22, 4, c.hairLight); px(ctx, 30, 4, c.hairLight);
  px(ctx, 14, 5, c.hairDark); px(ctx, 32, 5, c.hairDark);
  px(ctx, 15, 4, c.hairDark); px(ctx, 31, 4, c.hairDark);
  px(ctx, 14, 6, c.hair); px(ctx, 14, 7, c.hair);
  px(ctx, 32, 6, c.hair); px(ctx, 32, 7, c.hair);

  // Face
  hspan(ctx, 15, 31, 6, c.skin);
  hspan(ctx, 15, 31, 7, c.skin);
  hspan(ctx, 15, 31, 8, c.skin);
  hspan(ctx, 15, 31, 9, c.skin);
  hspan(ctx, 15, 31, 10, c.skin);
  hspan(ctx, 16, 30, 11, c.skin);
  hspan(ctx, 17, 29, 12, c.skin);
  hspan(ctx, 18, 28, 13, c.skin);
  hspan(ctx, 19, 27, 14, c.skin);
  px(ctx, 15, 8, c.skinShadow); px(ctx, 15, 9, c.skinShadow); px(ctx, 15, 10, c.skinShadow);
  px(ctx, 16, 11, c.skinShadow); px(ctx, 17, 12, c.skinShadow);
  px(ctx, 18, 13, c.skinShadow); px(ctx, 19, 14, c.skinShadow);
  px(ctx, 31, 8, c.skinShadow); px(ctx, 31, 9, c.skinShadow); px(ctx, 31, 10, c.skinShadow);
  px(ctx, 30, 11, c.skinShadow); px(ctx, 29, 12, c.skinShadow);
  px(ctx, 28, 13, c.skinShadow); px(ctx, 27, 14, c.skinShadow);
  hspan(ctx, 20, 26, 14, c.skinShadow);

  // Eyebrows
  hspan(ctx, 17, 20, 7, c.hairDark);
  hspan(ctx, 26, 29, 7, c.hairDark);

  // Eyes
  const eyeY = mouth === 'focused' ? 10 : 9;
  px(ctx, 17, eyeY, 0xf0ede8); px(ctx, 18, eyeY, 0xf0ede8);
  px(ctx, 19, eyeY, 0x2a2018); px(ctx, 20, eyeY, 0x2a2018);
  px(ctx, 21, eyeY, 0xf0ede8);
  px(ctx, 25, eyeY, 0xf0ede8);
  px(ctx, 26, eyeY, 0x2a2018); px(ctx, 27, eyeY, 0x2a2018);
  px(ctx, 28, eyeY, 0xf0ede8); px(ctx, 29, eyeY, 0xf0ede8);

  // Nose
  px(ctx, 23, 10, c.skinShadow);
  px(ctx, 23, 11, c.skinShadow);
  px(ctx, 23, 12, c.skinShadow);
  px(ctx, 24, 12, c.skinShadow);

  // Mouth
  if (mouth === 'smile') {
    px(ctx, 20, 13, 0x2a2018); px(ctx, 26, 13, 0x2a2018);
    hspan(ctx, 21, 25, 14, 0x2a2018);
    hspan(ctx, 22, 24, 15, c.skinShadow);
  } else {
    hspan(ctx, 21, 25, 13, 0x2a2018);
    hspan(ctx, 22, 24, 14, c.skinShadow);
  }

  // Ears
  px(ctx, 14, 8, c.skin); px(ctx, 14, 9, c.skin); px(ctx, 14, 10, c.skinShadow);
  px(ctx, 32, 8, c.skin); px(ctx, 32, 9, c.skin); px(ctx, 32, 10, c.skinShadow);
}

function drawBody(ctx, c) {
  // Neck
  hspan(ctx, 20, 26, 15, c.skin);
  hspan(ctx, 21, 25, 16, c.skin);
  px(ctx, 20, 15, c.skinShadow); px(ctx, 26, 15, c.skinShadow);

  // Collar
  hspan(ctx, 17, 29, 17, COLORS.collarWhite);
  px(ctx, 22, 17, 0xe0e0e0); px(ctx, 23, 17, 0xe0e0e0); px(ctx, 24, 17, 0xe0e0e0);

  // Shirt
  for (let y = 18; y <= 28; y++) {
    for (let i = 13; i <= 33; i++) {
      if (i <= 15) px(ctx, i, y, c.shirtDark);
      else if (i >= 31) px(ctx, i, y, c.shirtDark);
      else if (i >= 22 && i <= 24) px(ctx, i, y, c.shirtLight);
      else px(ctx, i, y, c.shirt);
    }
  }

  // Belt
  hspan(ctx, 13, 33, 29, c.pantsDark);
  px(ctx, 22, 29, COLORS.beltBuckle); px(ctx, 23, 29, COLORS.beltBuckle); px(ctx, 24, 29, COLORS.beltBuckle);

  // Pants
  for (let y = 30; y <= 39; y++) {
    for (let i = 14; i <= 21; i++) px(ctx, i, y, i <= 15 ? c.pantsDark : c.pants);
    for (let i = 25; i <= 32; i++) px(ctx, i, y, i >= 31 ? c.pantsDark : c.pants);
    px(ctx, 21, y, c.pantsDark); px(ctx, 25, y, c.pantsDark);
  }

  // Shoes
  for (let i = 13; i <= 22; i++) { px(ctx, i, 40, c.shoe); px(ctx, i, 41, c.shoe); }
  for (let i = 13; i <= 22; i++) px(ctx, i, 42, i <= 14 ? c.shoeLight : c.shoe);
  hspan(ctx, 13, 22, 43, c.shoeLight);
  for (let i = 24; i <= 33; i++) { px(ctx, i, 40, c.shoe); px(ctx, i, 41, c.shoe); }
  for (let i = 24; i <= 33; i++) px(ctx, i, 42, i >= 32 ? c.shoeLight : c.shoe);
  hspan(ctx, 24, 33, 43, c.shoeLight);
}

function drawCharacterIdle(ctx, c) {
  drawHead(ctx, c, 'neutral');
  drawBody(ctx, c);

  for (let y = 18; y <= 22; y++) { px(ctx, 10, y, c.shirtDark); px(ctx, 11, y, c.shirt); px(ctx, 12, y, c.shirt); }
  for (let y = 23; y <= 27; y++) { px(ctx, 9, y, c.skinShadow); px(ctx, 10, y, c.skin); px(ctx, 11, y, c.skin); }
  px(ctx, 8, 28, c.skin); px(ctx, 9, 28, c.skin); px(ctx, 10, 28, c.skin); px(ctx, 11, 28, c.skin);
  px(ctx, 8, 29, c.skinShadow); px(ctx, 9, 29, c.skinShadow); px(ctx, 10, 29, c.skin);

  for (let y = 18; y <= 22; y++) { px(ctx, 34, y, c.shirt); px(ctx, 35, y, c.shirt); px(ctx, 36, y, c.shirtDark); }
  for (let y = 23; y <= 27; y++) { px(ctx, 35, y, c.skin); px(ctx, 36, y, c.skin); px(ctx, 37, y, c.skinShadow); }
  px(ctx, 35, 28, c.skin); px(ctx, 36, 28, c.skin); px(ctx, 37, 28, c.skin); px(ctx, 38, 28, c.skin);
  px(ctx, 36, 29, c.skin); px(ctx, 37, 29, c.skinShadow); px(ctx, 38, 29, c.skinShadow);
}

function drawCharacterWorking(ctx, c, frame) {
  drawHead(ctx, c, 'focused');
  drawBody(ctx, c);

  if (frame === 0) {
    for (let y = 18; y <= 20; y++) { px(ctx, 10, y, c.shirtDark); px(ctx, 11, y, c.shirt); px(ctx, 12, y, c.shirt); }
    for (let y = 21; y <= 24; y++) { px(ctx, 9, y, c.skinShadow); px(ctx, 10, y, c.skin); px(ctx, 11, y, c.skin); }
    px(ctx, 10, 25, c.skin); px(ctx, 11, 25, c.skin); px(ctx, 12, 25, c.skin); px(ctx, 13, 25, c.skin);
    for (let y = 18; y <= 20; y++) { px(ctx, 34, y, c.shirt); px(ctx, 35, y, c.shirt); px(ctx, 36, y, c.shirtDark); }
    for (let y = 21; y <= 24; y++) { px(ctx, 35, y, c.skin); px(ctx, 36, y, c.skin); px(ctx, 37, y, c.skinShadow); }
    px(ctx, 33, 25, c.skin); px(ctx, 34, 25, c.skin); px(ctx, 35, 25, c.skin); px(ctx, 36, 25, c.skin);
  } else {
    for (let y = 18; y <= 20; y++) { px(ctx, 10, y, c.shirtDark); px(ctx, 11, y, c.shirt); px(ctx, 12, y, c.shirt); }
    for (let y = 21; y <= 23; y++) { px(ctx, 9, y, c.skinShadow); px(ctx, 10, y, c.skin); px(ctx, 11, y, c.skin); }
    px(ctx, 10, 24, c.skin); px(ctx, 11, 24, c.skin); px(ctx, 12, 24, c.skin); px(ctx, 13, 24, c.skin);
    for (let y = 18; y <= 20; y++) { px(ctx, 34, y, c.shirt); px(ctx, 35, y, c.shirt); px(ctx, 36, y, c.shirtDark); }
    for (let y = 21; y <= 23; y++) { px(ctx, 35, y, c.skin); px(ctx, 36, y, c.skin); px(ctx, 37, y, c.skinShadow); }
    px(ctx, 33, 24, c.skin); px(ctx, 34, 24, c.skin); px(ctx, 35, 24, c.skin); px(ctx, 36, 24, c.skin);
  }
}

function drawCharacterDone(ctx, c) {
  drawHead(ctx, c, 'smile');
  drawBody(ctx, c);

  px(ctx, 10, 18, c.shirtDark); px(ctx, 11, 18, c.shirt); px(ctx, 12, 18, c.shirt);
  px(ctx, 10, 17, c.shirt); px(ctx, 11, 17, c.shirt);
  px(ctx, 9, 16, c.skin); px(ctx, 10, 16, c.skin); px(ctx, 10, 15, c.skinShadow);
  px(ctx, 8, 14, c.skin); px(ctx, 9, 14, c.skin); px(ctx, 9, 13, c.skinShadow);
  px(ctx, 7, 12, c.skin); px(ctx, 8, 12, c.skin);
  px(ctx, 6, 10, c.skin); px(ctx, 7, 10, c.skin); px(ctx, 7, 11, c.skin);
  px(ctx, 5, 8, c.skin); px(ctx, 6, 8, c.skin); px(ctx, 6, 9, c.skin);

  px(ctx, 34, 18, c.shirt); px(ctx, 35, 18, c.shirt); px(ctx, 36, 18, c.shirtDark);
  px(ctx, 35, 17, c.shirt); px(ctx, 36, 17, c.shirt);
  px(ctx, 36, 16, c.skin); px(ctx, 37, 16, c.skin); px(ctx, 36, 15, c.skinShadow);
  px(ctx, 37, 14, c.skin); px(ctx, 38, 14, c.skin); px(ctx, 37, 13, c.skinShadow);
  px(ctx, 38, 12, c.skin); px(ctx, 39, 12, c.skin);
  px(ctx, 39, 10, c.skin); px(ctx, 40, 10, c.skin); px(ctx, 39, 11, c.skin);
  px(ctx, 40, 8, c.skin); px(ctx, 41, 8, c.skin); px(ctx, 40, 9, c.skin);
}

function generateCharacterTextures(colors) {
  const size = 48;

  function makeFrame(drawFn) {
    const [canvas, ctx] = createCanvas(size, size);
    drawFn(ctx);
    return new Texture({ source: new CanvasSource({ resource: canvas, scaleMode: 'nearest' }) });
  }

  return {
    idle: makeFrame((ctx) => drawCharacterIdle(ctx, colors)),
    working: [
      makeFrame((ctx) => drawCharacterWorking(ctx, colors, 0)),
      makeFrame((ctx) => drawCharacterWorking(ctx, colors, 1)),
    ],
    done: makeFrame((ctx) => drawCharacterDone(ctx, colors)),
    checkpoint: makeFrame((ctx) => drawCharacterIdle(ctx, colors)),
  };
}

const textureCache = new Map();

export function getCharacterTextures(variantIndex, colors) {
  if (!textureCache.has(variantIndex)) {
    textureCache.set(variantIndex, generateCharacterTextures(colors));
  }
  return textureCache.get(variantIndex);
}
