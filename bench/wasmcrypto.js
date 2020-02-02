const fs = require("fs");
const forge = require("node-forge");
const pki = forge.pki;
const wasmCrypto = require("../pkg");

const pem = fs.readFileSync("../privateKey.pem");
const privateKey = pki.privateKeyFromPem(pem);

const publicKeyComponents = {
  n: privateKey.n.toRadix(16),
  e: Number(privateKey.e.toRadix(10))
};
const privateKeyComponents = {
  n: privateKey.n.toRadix(16),
  e: privateKey.e.toRadix(16),
  d: privateKey.d.toRadix(16),
  p: privateKey.p.toRadix(16),
  q: privateKey.q.toRadix(16)
};

function encrypt(data) {
  return wasmCrypto.encrypt({
    data,
    pub_key: publicKeyComponents,
    digest: "SHA256"
  });
}

function decrypt(data) {
  return wasmCrypto.decrypt({
    data,
    private_key: privateKeyComponents,
    digest: "SHA256"
  });
}

function encryptDecrypt(data) {
  return decrypt(encrypt(data));
}

module.exports = {
  encryptDecrypt
};
