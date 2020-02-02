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

# Performance
I did a comparison with [node-forge](https://github.com/digitalbazaar/forge "node-forge") which is purely implemented in Javascript and here are the results on a 2Ghz cpu (time in ms):
```
node forge result={"mean":25.711784426678594,"median":25.00139099964872,"sum":7713.535328003578,"p90":27.446467999834567}
wasm result={"mean":12.430581233302751,"median":12.093277499545366,"sum":3729.1743699908257,"p90":13.090865499805659}
```
Basically wasm is 2 times faster.

And it is not a straight apple to apple comparison since for node-forge the [Chinese Remainder Theorem](https://en.wikipedia.org/wiki/Chinese_remainder_theorem "Chinese remainder theorem") precomputed values are cached, so node-forge has an advantage.


# Usage

To cipher and decipher 100 times, the phrase "hello from github"
`node index.js hello from github`

if you also want to validate with openssl (that must be in the PATH):
`OPENSSL_VAL=1 node index.js`


To bench against node-forge:
```
cd bench
npm i
node index.js
```
