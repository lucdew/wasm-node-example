# Description

Example of a Web Assembly running in NodeJs.

Here the wasm library is used to cipher some data using RSA OAEP with a SHA256 hashing function used during padding. 
The wasm source library is a Rust library.

The motivation was that the NodeJs 10 LTS crypto module did not allow to choose the digest algorithm for padding.
Since NodeJs 12 LTS it is now possible.

Of course NodeJs native library is much faster than Wasm but wasm is still faster than pure Js.


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
I did a comparison with [node-forge](https://github.com/digitalbazaar/forge "node-forge") purely implemented in Js and node 12 LTS [crypto module](https://nodejs.org/docs/latest-v12.x/api/crypto.html "crypto module").
Here are the results on a 2Ghz cpu (time in ms):
```
node result={"min":0.5114709995687008,"max":2.042315000668168,"mean":0.6080665966651092,"median":0.5462704999372363,"sum":182.41997899953276,"p90":0.7890670001506805}
node forge result={"min":23.34494400024414,"max":70.36826699972153,"mean":24.476129116655017,"median":23.935032499954104,"sum":7342.838734996505,"p90":25.016551000531763}
wasm result={"min":11.79477300029248,"max":15.787391000427306,"mean":12.15538023333686,"median":12.024071000050753,"sum":3646.6140700010583,"p90":12.451067500282079}
```
Node crypto module is 20 times faster than wasm.
But wasm is 2 times faster than node forge.

And it is not a straight apple to apple comparison since for node-forge and node the [Chinese Remainder Theorem](https://en.wikipedia.org/wiki/Chinese_remainder_theorem "Chinese remainder theorem") precomputed values are cached, so node-forge has an advantage.


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
