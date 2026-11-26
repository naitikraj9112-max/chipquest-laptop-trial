// js/art/tiles.js — Tile definitions (section 6)
import { cfg } from '../config.js';

const T = {};

// tile_floor: Sand colored floor
T.tile_floor = [];
for (let y = 0; y < 16; y++) {
  let row = '';
  for (let x = 0; x < 16; x++) {
    row += 'F'; // SAND
  }
  T.tile_floor.push(row);
}

// tile_carpet: darker carpet with pattern
T.tile_carpet = [];
for (let y = 0; y < 16; y++) {
  let row = '';
  for (let x = 0; x < 16; x++) {
    if ((x + y) % 4 === 0) row += 'E'; // WOOD accent
    else row += '6'; // ORANGE carpet
  }
  T.tile_carpet.push(row);
}

// tile_wall: Blue wall
T.tile_wall = [];
for (let y = 0; y < 16; y++) {
  let row = '';
  for (let x = 0; x < 16; x++) {
    if (y === 15) row += '0'; // INK bottom border
    else if (y < 2) row += '1'; // DUSK top
    else row += 'B'; // BLUE
  }
  T.tile_wall.push(row);
}

// tile_poster: Wall with poster
T.tile_poster = [];
for (let y = 0; y < 16; y++) {
  let row = '';
  for (let x = 0; x < 16; x++) {
    if (y === 15) row += '0';
    else if (x >= 3 && x <= 12 && y >= 2 && y <= 13) {
      if (y === 2 || y === 13 || x === 3 || x === 12) row += '0'; // border
      else if (y < 6) row += '7'; // YELLOW header
      else row += '4'; // WHITE content
    } else {
      row += 'B';
    }
  }
  T.tile_poster.push(row);
}

// tile_shelf: Display shelf
T.tile_shelf = [];
for (let y = 0; y < 16; y++) {
  let row = '';
  for (let x = 0; x < 16; x++) {
    if (y <= 1) row += '0';
    else if (y <= 4) row += '2'; // SLATE shelf top
    else if (y === 5) row += '0';
    else if (y <= 10) row += 'E'; // WOOD
    else if (y === 11) row += '0';
    else row += 'E'; // WOOD legs
  }
  T.tile_shelf.push(row);
}

// tile_counter: Service counter
T.tile_counter = [];
for (let y = 0; y < 16; y++) {
  let row = '';
  for (let x = 0; x < 16; x++) {
    if (y <= 1) row += '2'; // SLATE top
    else if (y === 2) row += '0';
    else if (y <= 12) row += 'E'; // WOOD body
    else if (y === 13) row += '0';
    else row += 'E';
  }
  T.tile_counter.push(row);
}

// tile_table: Display table
T.tile_table = [];
for (let y = 0; y < 16; y++) {
  let row = '';
  for (let x = 0; x < 16; x++) {
    if (y <= 1) row += '3'; // MIST top
    else if (y === 2) row += '0';
    else if (y <= 5) row += '4'; // WHITE surface
    else if (y === 6) row += '0';
    else if (x >= 2 && x <= 4) row += 'E'; // left leg
    else if (x >= 11 && x <= 13) row += 'E'; // right leg
    else row += '.';
  }
  T.tile_table.push(row);
}

// tile_door: Exit door
T.tile_door = [];
for (let y = 0; y < 16; y++) {
  let row = '';
  for (let x = 0; x < 16; x++) {
    if (x <= 1 || x >= 14) row += '0'; // frame
    else if (y <= 1) row += '0'; // top frame
    else if (y >= 14) row += '0'; // bottom frame
    else if (x === 11 && y >= 7 && y <= 9) row += '7'; // YELLOW handle
    else row += 'E'; // WOOD door
  }
  T.tile_door.push(row);
}

// tile_plant: Decorative plant
T.tile_plant = [];
for (let y = 0; y < 16; y++) {
  let row = '';
  for (let x = 0; x < 16; x++) {
    if (y <= 2 && x >= 5 && x <= 10) row += '9'; // GREEN leaves top
    else if (y >= 3 && y <= 5 && x >= 3 && x <= 12) row += '8'; // LIME leaves
    else if (y >= 6 && y <= 7 && x >= 4 && x <= 11) row += '9'; // GREEN
    else if (y >= 8 && y <= 9 && x >= 6 && x <= 9) row += 'E'; // WOOD stem
    else if (y >= 10 && y <= 14 && x >= 4 && x <= 11) {
      if (y === 10 || y === 14 || x === 4 || x === 11) row += 'E'; // pot rim
      else row += '6'; // ORANGE pot
    }
    else row += '.';
  }
  T.tile_plant.push(row);
}

// ===== GYM ARENA TILES (16x16) =====
// tile_gym_door: North double arena portal in store (dark slate frame + cyan/gold archway)
T.tile_gym_door = [];
for (let y = 0; y < 16; y++) {
  let row = '';
  for (let x = 0; x < 16; x++) {
    if (y === 0 || y === 1 || x <= 1 || x >= 14) row += '0';
    else if (y === 2 || y === 3) row += (x % 2 === 0 ? '7' : 'A'); // Gold/Cyan gym marquee
    else if (x === 7 || x === 8) row += 'A'; // Glowing center seam
    else row += '1'; // Dark indigo double door
  }
  T.tile_gym_door.push(row);
}

// tile_gym_wall: Futuristic dark indigo wall with cyan trim
T.tile_gym_wall = [];
for (let y = 0; y < 16; y++) {
  let row = '';
  for (let x = 0; x < 16; x++) {
    if (y === 15) row += '0';
    else if (y === 13 || y === 14) row += 'A'; // Cyan neon trim
    else if (y < 2) row += '0';
    else if ((x + y) % 8 === 0) row += '2';
    else row += '1';
  }
  T.tile_gym_wall.push(row);
}

// tile_gym_banner: Illuminated Gym championship screen on north wall
T.tile_gym_banner = [];
for (let y = 0; y < 16; y++) {
  let row = '';
  for (let x = 0; x < 16; x++) {
    if (y === 15) row += '0';
    else if (y >= 2 && y <= 12 && x >= 2 && x <= 13) {
      if (y === 2 || y === 12 || x === 2 || x === 13) row += '7'; // Gold bezel
      else if (y === 6 || y === 7) row += 'A'; // Cyan data line
      else row += 'B'; // Intel blue screen
    } else {
      row += '1';
    }
  }
  T.tile_gym_banner.push(row);
}

// tile_gym_floor: Deep obsidian tech floor with subtle cyan circuit nodes
T.tile_gym_floor = [];
for (let y = 0; y < 16; y++) {
  let row = '';
  for (let x = 0; x < 16; x++) {
    if (x === 0 || y === 0) row += '0';
    else if (x === 8 && y === 8) row += 'A'; // Circuit node
    else if ((x === 8 || y === 8) && (x + y) % 2 === 0) row += '2';
    else row += '1';
  }
  T.tile_gym_floor.push(row);
}

// tile_gym_carpet: Crimson & Gold Pokemon-Gym center runner carpet
T.tile_gym_carpet = [];
for (let y = 0; y < 16; y++) {
  let row = '';
  for (let x = 0; x < 16; x++) {
    if (x === 0 || x === 15) row += '7'; // Gold edge trim
    else if (x === 1 || x === 14) row += '0';
    else if ((x + y) % 6 === 0) row += '6'; // Warm chevron
    else row += '5'; // Crimson carpet
  }
  T.tile_gym_carpet.push(row);
}

// tile_gym_pedestal: Championship platform tile (blue/silver raised stage)
T.tile_gym_pedestal = [];
for (let y = 0; y < 16; y++) {
  let row = '';
  for (let x = 0; x < 16; x++) {
    if (y === 0 || y === 15 || x === 0 || x === 15) row += '7';
    else if ((x + y) % 4 === 0) row += 'A';
    else row += 'B';
  }
  T.tile_gym_pedestal.push(row);
}

// tile_gym_statue: Classic Pokemon Gym winged/crest pillar statue
T.tile_gym_statue = [];
for (let y = 0; y < 16; y++) {
  let row = '';
  for (let x = 0; x < 16; x++) {
    if (y >= 1 && y <= 4 && x >= 4 && x <= 11) {
      row += (y === 1 || x === 4 || x === 11) ? '0' : '7'; // Gold crest cap
    } else if (y >= 5 && y <= 11 && x >= 3 && x <= 12) {
      if (x === 3 || x === 12) row += '0';
      else if (x === 7 || x === 8) row += 'A'; // Cyan core
      else row += '4'; // Marble pillar
    } else if (y >= 12 && y <= 14 && x >= 2 && x <= 13) {
      row += (y === 14 || x === 2 || x === 13) ? '0' : '2'; // Slate base
    } else {
      row += '.';
    }
  }
  T.tile_gym_statue.push(row);
}

// tile_gym_exit: South exit carpet back to store
T.tile_gym_exit = [];
for (let y = 0; y < 16; y++) {
  let row = '';
  for (let x = 0; x < 16; x++) {
    if (y >= 12) row += '7'; // Threshold bar
    else if (x === 0 || x === 15) row += '0';
    else row += 'A'; // Glowing exit warp mat
  }
  T.tile_gym_exit.push(row);
}

// Register tile data
if (!window._spriteData) window._spriteData = {};
Object.assign(window._spriteData, T);

export const tiles = T;
