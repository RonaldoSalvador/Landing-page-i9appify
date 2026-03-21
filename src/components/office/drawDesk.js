import { COLORS } from './palette';

export function drawDeskArea(g, x, y) {
  g.roundRect(x + 8, y + 2, 112, 118, 4);
  g.fill({ color: 0x000000, alpha: 0.04 });

  // Chair back
  g.rect(x + 38, y + 56, 52, 4);
  g.fill({ color: COLORS.chairSeat });
  g.rect(x + 39, y + 56, 50, 2);
  g.fill({ color: COLORS.chairBase });

  // Armrests
  g.rect(x + 34, y + 60, 8, 12);
  g.fill({ color: COLORS.chairSeat });
  g.rect(x + 35, y + 60, 6, 2);
  g.fill({ color: COLORS.chairBase });
  g.rect(x + 86, y + 60, 8, 12);
  g.fill({ color: COLORS.chairSeat });
  g.rect(x + 87, y + 60, 6, 2);
  g.fill({ color: COLORS.chairBase });

  // Seat cushion
  g.rect(x + 42, y + 68, 44, 14);
  g.fill({ color: 0x2a2a3a });
  g.rect(x + 44, y + 70, 40, 10);
  g.fill({ color: COLORS.chairSeat });

  // Center pole
  g.rect(x + 62, y + 108, 4, 4);
  g.fill({ color: COLORS.chairBase });

  // Star base with casters
  const cx = x + 64;
  const cy = y + 114;
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const wx = cx + Math.cos(angle) * 16;
    const wy = cy + Math.sin(angle) * 8;
    g.rect(Math.round(wx) - 2, Math.round(wy) - 1, 4, 3);
    g.fill({ color: COLORS.chairBase });
    g.rect(Math.round(wx) - 1, Math.round(wy) + 1, 2, 2);
    g.fill({ color: 0x5a5a6a });
  }
}

export function drawWorkstationBack(g, x, y) {
  const deskLight = 0xe0ccaa, deskBase = COLORS.deskTop, deskDark = 0xc4af8c;
  g.rect(x + 10, y + 4, 108, 44);
  g.fill({ color: deskBase });

  for (let row = 0; row < 11; row++) {
    const shade = row % 3 === 0 ? deskLight : row % 3 === 1 ? deskBase : deskDark;
    g.rect(x + 10, y + 4 + row * 4, 108, 3);
    g.fill({ color: shade });
  }

  g.rect(x + 10, y + 4, 2, 44);
  g.fill({ color: deskDark });
  g.rect(x + 116, y + 4, 2, 44);
  g.fill({ color: deskDark });

  // Monitor outer frame
  g.roundRect(x + 34, y + 8, 60, 30, 2);
  g.fill({ color: 0x1a1a22 });
  g.roundRect(x + 35, y + 9, 58, 28, 1);
  g.fill({ color: COLORS.monitorFrame });
  g.roundRect(x + 37, y + 11, 54, 24, 1);
  g.fill({ color: COLORS.monitorScreen });

  for (let i = 0; i < 5; i++) {
    g.rect(x + 39, y + 13 + i * 4, 25 + ((i * 7) % 20), 1);
    g.fill({ color: COLORS.monitorScreenOn, alpha: 0.2 });
  }

  g.rect(x + 37, y + 11, 54, 2);
  g.fill({ color: 0xffffff, alpha: 0.08 });
  g.rect(x + 63, y + 9, 2, 1);
  g.fill({ color: 0x222222 });
  g.rect(x + 37, y + 35, 54, 3);
  g.fill({ color: COLORS.monitorFrame });

  // Stand
  g.rect(x + 61, y + 38, 6, 5);
  g.fill({ color: COLORS.chairBase });
  g.rect(x + 62, y + 39, 4, 3);
  g.fill({ color: 0x5a5a6a });
  g.roundRect(x + 52, y + 43, 24, 4, 2);
  g.fill({ color: COLORS.chairBase });
  g.roundRect(x + 54, y + 43, 20, 2, 1);
  g.fill({ color: 0x5a5a6a });
}

export function drawWorkstationFront(g, x, y) {
  g.rect(x + 10, y + 48, 108, 6);
  g.fill({ color: COLORS.deskEdge });
  g.rect(x + 10, y + 53, 108, 2);
  g.fill({ color: COLORS.deskShadow, alpha: 0.3 });
  g.rect(x + 12, y + 55, 104, 2);
  g.fill({ color: 0x000000, alpha: 0.1 });

  // Keyboard
  g.roundRect(x + 40, y + 48, 36, 8, 1);
  g.fill({ color: COLORS.keyboard });
  g.rect(x + 41, y + 48, 34, 1);
  g.fill({ color: 0x4a4a52 });
  for (let row = 0; row < 3; row++) {
    for (let key = 0; key < 8; key++) {
      g.rect(x + 42 + key * 4, y + 49 + row * 2, 3, 1);
      g.fill({ color: 0x5a5a5a });
    }
  }
  g.rect(x + 50, y + 55, 12, 1);
  g.fill({ color: 0x5a5a5a });

  // Mouse
  g.rect(x + 80, y + 46, 16, 18);
  g.fill({ color: 0x2a2a3a });
  g.roundRect(x + 83, y + 48, 10, 13, 3);
  g.fill({ color: COLORS.keyboard });
  g.rect(x + 84, y + 48, 8, 2);
  g.fill({ color: 0x4a4a52 });
  g.rect(x + 87, y + 48, 2, 3);
  g.fill({ color: 0x5a5a62 });
  g.rect(x + 83, y + 48, 1, 13);
  g.fill({ color: 0x2a2a32 });
}

export function drawScreenGlow(g, x, y) {
  g.roundRect(x + 37, y + 11, 54, 24, 1);
  g.fill({ color: COLORS.monitorScreenOn });
  g.roundRect(x + 31, y + 7, 66, 32, 3);
  g.fill({ color: COLORS.monitorScreenOn, alpha: 0.06 });
}

// === Desk Accessories ===

function drawCoffeeMug(g, x, y) {
  g.rect(x, y + 2, 8, 8);
  g.fill({ color: COLORS.mugBody });
  g.rect(x, y + 2, 8, 2);
  g.fill({ color: COLORS.mugRim });
  g.rect(x + 8, y + 4, 3, 4);
  g.fill({ color: COLORS.mugHandle });
  g.rect(x + 2, y, 1, 1);
  g.fill({ color: 0xffffff, alpha: 0.35 });
  g.rect(x + 4, y - 1, 1, 1);
  g.fill({ color: 0xffffff, alpha: 0.25 });
  g.rect(x + 3, y - 2, 1, 1);
  g.fill({ color: 0xffffff, alpha: 0.15 });
}

function drawMiniPlant(g, x, y) {
  g.rect(x + 1, y + 8, 8, 6);
  g.fill({ color: COLORS.plantPot });
  g.rect(x, y + 6, 10, 3);
  g.fill({ color: COLORS.plantPot });
  g.circle(x + 5, y + 4, 3);
  g.fill({ color: COLORS.plantGreen });
  g.circle(x + 3, y + 2, 2);
  g.fill({ color: COLORS.plantDark });
  g.circle(x + 7, y + 2, 2);
  g.fill({ color: COLORS.plantGreen });
  g.circle(x + 5, y + 1, 2);
  g.fill({ color: COLORS.plantDark });
}

function drawPostIts(g, x, y) {
  g.rect(x, y, 7, 7);
  g.fill({ color: COLORS.postItPink });
  g.rect(x + 3, y + 2, 8, 8);
  g.fill({ color: COLORS.postItYellow });
  g.rect(x + 3, y + 2, 8, 2);
  g.fill({ color: 0xeedd44 });
  g.rect(x + 4, y + 5, 5, 1);
  g.fill({ color: 0x000000, alpha: 0.12 });
  g.rect(x + 4, y + 7, 4, 1);
  g.fill({ color: 0x000000, alpha: 0.12 });
}

function drawBookStack(g, x, y) {
  g.rect(x, y + 4, 10, 3);
  g.fill({ color: COLORS.bookRed });
  g.rect(x, y + 2, 10, 3);
  g.fill({ color: COLORS.bookBlue });
  g.rect(x + 1, y, 8, 3);
  g.fill({ color: COLORS.bookGreen });
  g.rect(x, y + 4, 1, 3);
  g.fill({ color: 0x000000, alpha: 0.15 });
  g.rect(x, y + 2, 1, 3);
  g.fill({ color: 0x000000, alpha: 0.15 });
}

function drawPhotoFrame(g, x, y) {
  g.rect(x, y, 8, 10);
  g.fill({ color: COLORS.photoFrame });
  g.rect(x + 1, y + 1, 6, 8);
  g.fill({ color: 0x88aacc });
}

function drawWaterBottle(g, x, y) {
  g.rect(x + 1, y, 4, 2);
  g.fill({ color: COLORS.waterCap });
  g.rect(x, y + 2, 6, 10);
  g.fill({ color: COLORS.waterBottle });
  g.rect(x + 1, y + 3, 4, 4);
  g.fill({ color: 0xaaddee, alpha: 0.5 });
}

const ACCESSORY_POOL = [
  drawCoffeeMug, drawMiniPlant, drawPostIts,
  drawBookStack, drawPhotoFrame, drawWaterBottle,
];

const LEFT_SLOT  = { dx: 14, dy: 38 };
const RIGHT_SLOT = { dx: 100, dy: 38 };

export function drawDeskAccessories(g, x, y, agentIndex) {
  const seed = agentIndex * 7 + 3;
  const idx1 = seed % ACCESSORY_POOL.length;
  const idx2 = (seed + 2) % ACCESSORY_POOL.length;

  ACCESSORY_POOL[idx1](g, x + LEFT_SLOT.dx, y + LEFT_SLOT.dy);
  if (idx2 !== idx1) {
    ACCESSORY_POOL[idx2](g, x + RIGHT_SLOT.dx, y + RIGHT_SLOT.dy);
  }
}
