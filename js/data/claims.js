// js/data/claims.js — Claims register (section 13.1)

export const claims = {
  C1: {
    claim: 'An AI PC has CPU, GPU and NPU; CPU = fast response, GPU = high throughput, NPU = sustained AI at low power',
    status: 'Per Intel Core Ultra Series 3 brief; verify'
  },
  C2: {
    claim: 'Core Ultra Series 3 NPU up to 50 TOPS',
    status: 'Per Intel; verify'
  },
  C3: {
    claim: 'Core Series 3 (non-Ultra) NPU up to 17 TOPS, AI-ready',
    status: 'Per Intel launch coverage; verify'
  },
  C4: {
    claim: 'Evo laptops are tested for fast charging, long battery, responsiveness on battery and instant wake',
    status: 'Per Intel Evo page; verify'
  },
  C5: {
    claim: 'Some AI features run on-device without internet; not every AI app does',
    status: "General; keep wording 'can stay'"
  },
  C6: {
    claim: 'AMD Ryzen AI and Qualcomm Snapdragon X also include NPUs; Apple has a Neural Engine',
    status: 'Verify current wording'
  },
  C7: {
    claim: 'Snapdragon X laptops are Arm-based and some Windows apps run via emulation',
    status: "Verify; keep soft ('some')"
  },
  C8: {
    claim: 'Macs run macOS',
    status: 'Fact'
  },
  C9: {
    claim: "'Core Ultra X-series' naming for the strongest Series 3 graphics",
    status: "VERIFY or replace with 'Core Ultra 7 or higher'"
  },
  C10: {
    claim: 'All battle numbers are illustrative game values, not benchmarks',
    status: 'Stated on the card (9.3)'
  }
};
