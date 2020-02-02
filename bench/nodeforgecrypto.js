const fs = require("fs");
const forge = require("node-forge");
const pki = forge.pki;

const pem = fs.readFileSync("../privateKey.pem");
const privateKey = pki.privateKeyFromPem(pem);
const publicKey = forge.pki.rsa.setPublicKey(privateKey.n, privateKey.e);

function encrypt(data) {
  return publicKey.encrypt(data, "RSA-OAEP", {
    md: forge.md.sha256.create()
  });
}

function decrypt(data) {
  return privateKey.decrypt(data, "RSA-OAEP", {
    md: forge.md.sha256.create()
  });
}

function encryptDecrypt(data) {
  return decrypt(encrypt(data));
}

module.exports = {
  encryptDecrypt
};
