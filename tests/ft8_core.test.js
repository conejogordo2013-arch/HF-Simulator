const fs = require('fs');
const assert = require('assert');
const vm = require('vm');

const html = fs.readFileSync('sim.html', 'utf8');
const script = html.match(/<script>([\s\S]*)<\/script>/)?.[1];
if (!script) throw new Error('No script found');

function el() {
  return {
    style: {},
    innerText: '',
    innerHTML: '',
    value: '0',
    checked: false,
    clientWidth: 1200,
    clientHeight: 400,
    parentElement: { clientWidth: 1200, clientHeight: 400 },
    addEventListener: () => {},
    getContext: () => ({ fillRect(){}, beginPath(){}, moveTo(){}, lineTo(){}, stroke(){}, createLinearGradient(){ return { addColorStop(){} }; }, fill(){}, drawImage(){}, createImageData(){ return { data: new Uint8ClampedArray(4000)}; }, putImageData(){}, fillText(){} }),
    getBoundingClientRect: () => ({ left: 0, width: 1200 }),
  };
}

const sandbox = {
  console,
  Math,
  Date,
  setInterval: () => 0,
  setTimeout: () => 0,
  requestAnimationFrame: () => 0,
  window: { addEventListener: ()=>{}, AudioContext: function(){}, webkitAudioContext: function(){} },
  document: {
    getElementById: () => el(),
    querySelector: () => el(),
    querySelectorAll: () => [],
    createElement: () => el(),
  }
};
vm.createContext(sandbox);
vm.runInContext(script, sandbox);

assert.equal(typeof sandbox.normalizeFT8Message, 'function');
assert.equal(typeof sandbox.ft8MessageToTones, 'function');
assert.equal(typeof sandbox.genFT8Report, 'function');

assert.equal(sandbox.normalizeFT8Message('CQ K1ABC FN31'), 'CQ K1ABC FN31');
assert.equal(sandbox.normalizeFT8Message('BAD MESSAGE'), '');

const t1 = sandbox.ft8MessageToTones('CQ K1ABC FN31', 0.25);
const t2 = sandbox.ft8MessageToTones('CQ K1ABC FN31', 0.25);
assert.equal(t1.length, 79);
assert.deepEqual(t1, t2);

for (let i=0; i<20; i++) assert.match(sandbox.genFT8Report(), /^-[0-2][0-9]$/);

console.log('FT8 core tests: OK');
