# Description

Example of WASM usage with nodejs

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

# Usage

`node index.js`

if you validate with openssl (that must be in the PATH)
`OPENSSL_VAL=1 node index.js`
