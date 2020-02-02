const fs = require("fs");
const crypto = require("crypto");

const pem = fs.readFileSync("../privateKey.pem");
const privateKey = crypto.createPrivateKey(pem);

function encrypt(data) {
  return crypto
    .publicEncrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256"
      },
      Buffer.from(data, "hex")
    )
    .toString("hex"); // convert again to hex for fair comparison
}

function decrypt(data) {
  return crypto
    .privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256"
      },
      Buffer.from(data, "hex")
    )
    .toString("hex");
}

function encryptDecrypt(data) {
  return decrypt(encrypt(data));
}

module.exports = {
  encryptDecrypt
};
