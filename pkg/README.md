# Description

Example of a Web Assembly running in NodeJs.

Here the wasm library is used to cipher some data using RSA OAEP with a SHA256 hashing function used during padding. 

The wasm source library is a Rust library.

The NodeJs has a crypto module that uses an openssl native library but as of today (January 2019), it is not possible to perform RSA ciphering
with OAEP padding and choose the hashing function (only SHA1 is used).

I am really impressed by the wasm performance.

# Setup
Install wasm32-unknown-unknown target and wasm-pack utility

```
rustup target add wasm32-unknown-unknown
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
```

# Build

```
wasm-pack build --release --target nodejs
```

The output is written in the pkg directory.

# Usage

To cipher and decipher 100 times, the phrase "hello from github"
`node index.js hello from github`

if you also want to validate with openssl (that must be in the PATH):
`OPENSSL_VAL=1 node index.js`
