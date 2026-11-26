// js/data/claims.js — Claims register (section 13.1)

export const claims = {
  C1: {
    claim: 'Core Ultra Series 3 (Panther Lake, Intel 18A): up to 16C (4P+8E+4LPE), 5.1 GHz, 12 Xe3 / Arc B390, 50 NPU TOPS, LPDDR5X-9600 / DDR5-7200',
    status: 'Verified per Intel CES 2026 & Panther Lake datasheet (27 Nov 2026 report)'
  },
  C2: {
    claim: 'Core Ultra X9 388H / X7 368H (50 NPU TOPS, Arc B390 12 Xe3); Ultra 5 338H/335/325 (47 TOPS), Ultra 7 355 (49 TOPS)',
    status: 'Verified per Intel ARK Launch SKU matrix'
  },
  C3: {
    claim: 'Core Series 3 (Wildcat Lake, Intel 18A): up to 6C (2P+4LPE), up to 4.8 GHz, 2 Xe3 cores, up to 17 NPU TOPS & 40 platform TOPS, 10-28W',
    status: 'Verified per Intel Hot Chips / Computex 2026 report'
  },
  C4: {
    claim: 'Core Ultra Series 2 200V (8C, Xe2 Arc 140V, 48 NPU TOPS, 120 overall TOPS, 16/32GB LP5X-8533) & 200H/HX (up to 24C, 5.5 GHz, 13 NPU TOPS)',
    status: 'Verified per Intel Series 2 datasheets'
  },
  C5: {
    claim: 'Representative OEM systems: Lenovo ThinkPad X9-15p Gen 1 Aura Ed. (X9 388H), Yoga Slim 7 Ultra 14, IdeaPad Pro 5 14/16, ThinkPad P1 Gen 8 (285H), Acer TravelMate P6 14 AI, Swift Spin 14 AI, Swift Air 14, ASUS ExpertBook B3 G2, Vivobook 15 X1504',
    status: 'Verified per OEM PSREF & announcement citations in report'
  },
  C6: {
    claim: 'AMD Ryzen AI and Qualcomm Snapdragon X include NPUs; Apple Silicon uses Neural Engine on macOS',
    status: 'Verified comparison notes; Arm emulation note for some Windows apps'
  },
  C7: {
    claim: 'Supported local AI runtimes: OpenVINO, Windows ML, ONNX Runtime, DirectML, WebNN; TOPS are peak INT8',
    status: 'Verified per Intel technical report (Nov 2026)'
  },
  C8: {
    claim: 'All battle numbers are illustrative game values; real performance, battery & Copilot+ depend on OEM SKU & cooling',
    status: 'Disclosed on Trainer Card (9.3)'
  }
};
