const stats = require("stats-lite");
const nodeforgecrypto = require("./nodeforgecrypto");
const wasmcrypto = require("./wasmcrypto");

// return time in micros
function now() {
  const hrTime = process.hrtime();
  return hrTime[0] * 1000 + hrTime[1] / 1000000;
}

class Measure {
  constructor() {
    this.startTime = 0;
    this.endTime = 0;
    this.execTime = 0;
  }

  start() {
    this.startTime = now();
  }

  end() {
    this.endTime = now();
    this.execTime = this.endTime - this.startTime;
  }
}

function toStats(measures) {
  const times = measures.map(m => m.execTime);
  return {
    min: Math.min(...times),
    max: Math.max(...times),
    mean: stats.mean(times),
    median: stats.median(times),
    sum: stats.sum(times),
    p90: stats.percentile(times, 0.9)
  };
}

function bench(name, func, data, iter) {
  console.log("starting " + name);
  const measures = Array.from(Array(iter), _ => new Measure());
  for (let idx = 0; idx < iter; idx++) {
    const m = measures[idx];
    m.start();
    const res = func(data);
    m.end();
    if (idx !== 0 && idx % 50 === 0) {
      console.log("Done " + idx);
    }
    if (res !== data) {
      throw new Error(`assertion failure, got ${res}, expected ${data}`);
    }
  }
  console.log("done " + name);
  return toStats(measures);
}

const ITER = 300;
const data = Buffer.from(
  "hello from hello from hello from hello from hello from hello from hello from hello from ",
  "ascii"
).toString("hex");
const wasmStats = bench("wasm", wasmcrypto.encryptDecrypt, data, ITER);
const nfStats = bench("node-forge", nodeforgecrypto.encryptDecrypt, data, ITER);

console.log("node forge result=" + JSON.stringify(nfStats));
console.log("wasm result=" + JSON.stringify(wasmStats));
