use num_bigint::BigUint;
use num_traits::FromPrimitive;
use rand::rngs::OsRng;
use rsa::{oaep, RSAPublicKey, RSAPrivateKey};
use serde::{Deserialize, Serialize};
use sha2::{Sha256, Sha512};
use wasm_bindgen::prelude::*;

macro_rules! console_log {
    // Note that this is using the `log` function imported above during
    // `bare_bones`
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[wasm_bindgen]
extern "C" {
    // Use `js_namespace` here to bind `console.log(..)` instead of just
    // `log(..)`
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

    // The `console.log` is quite polymorphic, so we can bind it with multiple
    // signatures. Note that we need to use `js_name` to ensure we always call
    // `log` in JS.
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_u32(a: u32);

    // Multiple arguments too!
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_many(a: &str, b: &str);
}


#[derive(Serialize, Deserialize)]
pub struct PubKey {
    n: String,
    e: u32,
}

#[derive(Serialize, Deserialize)]
pub struct PrivateKey {
    n: String,
    e: String,
    d: String,
    p: String,
    q: String,
}

#[derive(Serialize, Deserialize)]
pub struct EncryptInput {
    data: String,
    pub_key: PubKey,
    digest: String,
}


#[derive(Serialize, Deserialize)]
pub struct DecryptInput {
    data: String,
    private_key: PrivateKey,
    digest: String,
}

#[wasm_bindgen]
pub fn encrypt(js_object: JsValue) -> String {
    console_error_panic_hook::set_once();

    let enc_input: EncryptInput = js_object.into_serde().expect("Deserialize failed");

    let pub_key: RSAPublicKey = RSAPublicKey::new(BigUint::parse_bytes(enc_input.pub_key.n.as_bytes(), 16).expect("modulus biguint conversion failed"), BigUint::from_u32(enc_input.pub_key.e).expect("exponent conversion failed")).expect("pubkey instantiation failed");
    // Encrypt
    //console_log!("Data {}", enc_input.data.clone());
    let data = hex::decode(enc_input.data).expect("data not in hexa");
    let mut rng = OsRng::default();
    let enc_data= match enc_input.digest.as_str() {
        "SHA256" => oaep::encrypt(&mut rng, &pub_key, &data[..], &mut Sha256::default(), None),
        "SHA512" => oaep::encrypt(&mut rng, &pub_key, &data[..], &mut Sha512::default(), None),
        _ => panic!("Unsupported digest"), 
    }.expect("Failed encrypting");
    

    //console_log!("Done encryption");
    return hex::encode(enc_data);

}

#[wasm_bindgen]
pub fn decrypt(js_object: JsValue) -> String {
    console_error_panic_hook::set_once();

    let dec_input: DecryptInput = js_object.into_serde().expect("Deserialize failed");

    let private_key  = RSAPrivateKey::from_components(
            BigUint::parse_bytes(dec_input.private_key.n.as_bytes(), 16).expect("Invalid modulus"),
            BigUint::parse_bytes(dec_input.private_key.e.as_bytes(), 10).expect("Invalid exponent"),
            BigUint::parse_bytes(dec_input.private_key.d.as_bytes(), 16).expect("Invalid d"),
            vec![
            BigUint::parse_bytes(dec_input.private_key.p.as_bytes(), 16).expect("Invalid prime p"),
            BigUint::parse_bytes(dec_input.private_key.q.as_bytes(), 16).expect("Invalid prime q"),
            ],
        );
    let data = hex::decode(dec_input.data).expect("data not in hexa");
    let rng: Option<&mut OsRng> = None;
    let clear_data= match dec_input.digest.as_str() {
        "SHA256" => oaep::decrypt(rng, &private_key, &data[..], &mut Sha256::default(), None),
        "SHA512" => oaep::decrypt(rng, &private_key, &data[..], &mut Sha512::default(), None),
        _ => panic!("Unsupported digest"), 
    }.expect("Failed decrypting");
    

    //console_log!("Done decryption");
    return hex::encode(clear_data);
}
