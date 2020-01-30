
const path = require('path').join(__dirname, 'wasm_node_example_bg.wasm');
const bytes = require('fs').readFileSync(path);
let imports = {};
imports['./wasm_node_example.js'] = require('./wasm_node_example.js');

const wasmModule = new WebAssembly.Module(bytes);
const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
module.exports = wasmInstance.exports;
