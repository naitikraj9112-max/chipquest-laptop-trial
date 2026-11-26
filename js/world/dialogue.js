// js/world/dialogue.js — Dialogue display system (section 7.1)
import { cfg } from '../config.js';
import { uiArt } from '../art/ui.js';

let active = false;
let pages = []; // [{speaker, text}]
let pageIndex = 0;
let charIndex = 0;
let charTimer = 0;
let blipCounter = 0;
let waitingForInput = false;
let onComplete = null;
let choiceMode = false;
let choices = [];
let choiceIndex = 0;
let choiceCallback = null;

export const dialogueUI = {
  get isActive() { return active; },
  get isChoice() { return choiceMode; },

  // Show dialogue pages sequentially
  show(dialogueEntries, callback) {
    if (!Array.isArray(dialogueEntries)) dialogueEntries = [dialogueEntries];
    pages = dialogueEntries.map(e => {
      if (typeof e === 'string') {
        const d = window.CQ?.state ? null : null;
        return { speaker: '', text: e };
      }
      return e;
    });
    pageIndex = 0;
    charIndex = 0;
    charTimer = 0;
    blipCounter = 0;
    waitingForInput = false;
    active = true;
    choiceMode = false;
    onComplete = callback || null;
  },

  // Show a choice menu
  showChoice(prompt, options, callback) {
    choiceMode = true;
    choices = options;
    choiceIndex = 0;
    choiceCallback = callback;
    active = true;
    // Show the prompt text first
    pages = [prompt];
    pageIndex = 0;
    charIndex = prompt.text ? prompt.text.length : 0;
    waitingForInput = true;
  },

  update(dt) {
    if (!active) return;
    if (choiceMode && waitingForInput) return; // waiting for choice

    const page = pages[pageIndex];
    if (!page) return;

    const text = page.text || page;
    
    if (!waitingForInput) {
      charTimer += dt;
      const charsPerMs = cfg.TEXT_CPS / 1000;
      const newChars = Math.floor(charTimer * charsPerMs);
      
      if (newChars > charIndex) {
        const prevIndex = charIndex;
        charIndex = Math.min(newChars, text.length);
        
        // Blip sound every 2 characters
        for (let i = prevIndex; i < charIndex; i++) {
          blipCounter++;
          if (blipCounter % 2 === 0 && window.CQ) {
            window.CQ.audio.playSfx('sfx_blip');
          }
        }
      }

      if (charIndex >= text.length) {
        waitingForInput = true;
      }
    }
  },

  handleA() {
    if (!active) return false;

    if (choiceMode && waitingForInput) {
      // Choice selected
      active = false;
      choiceMode = false;
      if (choiceCallback) choiceCallback(choiceIndex);
      return true;
    }

    if (!waitingForInput) {
      // Complete text instantly (section 3.3: tapping while typing completes)
      const page = pages[pageIndex];
      if (page) charIndex = (page.text || page).length;
      waitingForInput = true;
      return true;
    }

    // Advance to next page
    pageIndex++;
    if (pageIndex >= pages.length) {
      active = false;
      if (onComplete) onComplete();
      return true;
    }

    charIndex = 0;
    charTimer = 0;
    blipCounter = 0;
    waitingForInput = false;
    return true;
  },

  handleUp() {
    if (choiceMode && waitingForInput) {
      choiceIndex = Math.max(0, choiceIndex - 1);
      if (window.CQ) window.CQ.audio.playSfx('sfx_blip');
    }
  },

  handleDown() {
    if (choiceMode && waitingForInput) {
      choiceIndex = Math.min(choices.length - 1, choiceIndex + 1);
      if (window.CQ) window.CQ.audio.playSfx('sfx_blip');
    }
  },

  draw(ctx) {
    if (!active) return;

    const page = pages[pageIndex];
    if (!page) return;

    const speaker = page.speaker || '';
    const text = page.text || page;
    const displayText = text.substring(0, charIndex);

    // Draw the textbox
    const bx = 0, by = 112, bw = 240, bh = 48;

    // Box (WHITE fill, INK border, DUSK inner shadow)
    ctx.fillStyle = cfg.PAL['4'];
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = cfg.PAL['0'];
    ctx.lineWidth = 2;
    ctx.strokeRect(bx + 1, by + 1, bw - 2, bh - 2);

    // Speaker nameplate
    if (speaker && speaker !== 'narrator' && speaker !== 'system') {
      const npW = speaker.length * 8 + 8;
      ctx.fillStyle = cfg.PAL['0'];
      ctx.fillRect(8, by - 12, npW, 12);
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillStyle = cfg.PAL['4'];
      ctx.textBaseline = 'top';
      ctx.fillText(speaker, 12, by - 10);
    }

    // Text with word wrap
    const lines = uiArt.wrapText(displayText, cfg.TEXT_COLS);
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = cfg.PAL['0'];
    ctx.textBaseline = 'top';
    for (let i = 0; i < Math.min(cfg.TEXT_ROWS, lines.length); i++) {
      ctx.fillText(lines[i], 12, 122 + i * 14);
    }

    // Blinking more icon
    if (waitingForInput && !choiceMode) {
      if (Math.floor(Date.now() / 400) % 2 === 0) {
        // Draw small arrow
        ctx.fillStyle = cfg.PAL['0'];
        const ax = 224, ay = 142;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax + 8, ay);
        ctx.lineTo(ax + 4, ay + 5);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Choice menu
    if (choiceMode && waitingForInput) {
      for (let i = 0; i < choices.length; i++) {
        const cy = 122 + i * 14;
        if (i === choiceIndex) {
          ctx.fillStyle = cfg.PAL['5']; // RED highlight
          ctx.fillText('>', 12, cy);
        }
        ctx.fillStyle = cfg.PAL['0'];
        ctx.fillText(choices[i], 24, cy);
      }
    }
  },

  close() {
    active = false;
    choiceMode = false;
    pages = [];
    pageIndex = 0;
  }
};
