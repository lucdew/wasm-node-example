#!/usr/bin/env node

const crypto = require("./pkg");
const spawn = require("child_process").spawn;

const privateKeyComponents = {
  n:
    "00d397b84d98a4c26138ed1b695a8106ead91d553bf06041b62d3fdc50a041e222b8f4529689c1b82c5e71554f5dd69fa2f4b6158cf0dbeb57811a0fc327e1f28e74fe74d3bc166c1eabdc1b8b57b934ca8be5b00b4f29975bcc99acaf415b59bb28a6782bb41a2c3c2976b3c18dbadef62f00c6bb226640095096c0cc60d22fe7ef987d75c6a81b10d96bf292028af110dc7cc1bbc43d22adab379a0cd5d8078cc780ff5cd6209dea34c922cf784f7717e428d75b5aec8ff30e5f0141510766e2e0ab8d473c84e8710b2b98227c3db095337ad3452f19e2b9bfbccdd8148abf6776fa552775e6e75956e45229ae5a9c46949bab1e622f0e48f56524a84ed3483b",
  e: "65537",
  d:
    "00c4e70c689162c94c660828191b52b4d8392115df486a9adbe831e458d73958320dc1b755456e93701e9702d76fb0b92f90e01d1fe248153281fe79aa9763a92fae69d8d7ecd144de29fa135bd14f9573e349e45031e3b76982f583003826c552e89a397c1a06bd2163488630d92e8c2bb643d7abef700da95d685c941489a46f54b5316f62b5d2c3a7f1bbd134cb37353a44683fdc9d95d36458de22f6c44057fe74a0a436c4308f73f4da42f35c47ac16a7138d483afc91e41dc3a1127382e0c0f5119b0221b4fc639d6b9c38177a6de9b526ebd88c38d7982c07f98a0efd877d508aae275b946915c02e2e1106d175d74ec6777f5e80d12c053d9c7be1e341",
  p:
    "00f827bbf3a41877c7cc59aebf42ed4b29c32defcb8ed96863d5b090a05a8930dd624a21c9dcf9838568fdfa0df65b8462a5f2ac913d6c56f975532bd8e78fb07bd405ca99a484bcf59f019bbddcb3933f2bce706300b4f7b110120c5df9018159067c35da3061a56c8635a52b54273b31271b4311f0795df6021e6355e1a42e61",
  q:
    "00da4817ce0089dd36f2ade6a3ff410c73ec34bf1b4f6bda38431bfede11cef1f7f6efa70e5f8063a3b1f6e17296ffb15feefa0912a0325b8d1fd65a559e717b5b961ec345072e0ec5203d03441d29af4d64054a04507410cf1da78e7b6119d909ec66e6ad625bf995b279a4b3c5be7d895cd7c5b9c4c497fde730916fcdb4e41b"
};

const pubKeyComponents = {
  n: privateKeyComponents.n,
  e: Number(privateKeyComponents.e)
};

function encrypt(data) {
  return crypto.encrypt({
    data: Buffer.from(data, "utf-8").toString("hex"),
    pub_key: pubKeyComponents,
    digest: "SHA256"
  });
}

function decrypt(data) {
  const res = crypto.decrypt({
    data,
    private_key: privateKeyComponents,
    digest: "SHA256"
  });
  return Buffer.from(res, "hex").toString("utf-8");
}

async function decryptWithOpenssl(encData) {
  let res = Buffer.from([]);
  return new Promise((resolve, reject) => {
    const cp = spawn(
      "openssl",
      "pkeyutl -decrypt -inkey ./privateKey.pem -pkeyopt rsa_padding_mode:oaep -pkeyopt rsa_oaep_md:sha256  -pkeyopt rsa_mgf1_md:sha256".split(
        " "
      ),
      {
        cwd: __dirname,
        stdio: ["pipe", "pipe", "pipe"],
        shell: true
      }
    );
    cp.on("error", reject);
    cp.on("exit", code => {
      if (code === 0) {
        return resolve(res.toString("utf-8"));
      } else {
        reject(new Error("Exited with status " + code));
      }
    });
    cp.stdout.on("data", data => {
      res = Buffer.concat([res, data]);
    });
    const stdinData = Buffer.from(encData, "hex");
    cp.stdin.write(stdinData);
    cp.stdin.end();
  });
}

const data =
  (process.argv.length >= 2 && process.argv.slice(2).join(" ")) ||
  "hello world";

async function encDec() {
  let startTime = Date.now();
  const encData = encrypt(data);
  console.log(`encrypt exec time=${Date.now() - startTime}`);

  if (process.env.OPENSSL_VAL) {
    const openSslDecrypt = await decryptWithOpenssl(encData);
    console.log(`openssl decrypt result=${openSslDecrypt}`);
  }

  startTime = Date.now();
  const clearData = decrypt(encData);
  console.log(
    `decrypt result=${clearData}, exec time=${Date.now() - startTime}`
  );
}

(async () => {
  for (let idx = 0; idx < 100; idx++) {
    await encDec();
  }
})().catch(err => console.error(err));
