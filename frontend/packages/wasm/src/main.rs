use wasm_bindgen::prelude::*;

mod high_dimensional;
mod histogram;
mod scalar;
mod utils;

#[macro_use]
extern crate serde_derive;

extern crate web_sys;
macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}

pub fn main() {}

#[wasm_bindgen]
pub fn scalar_transform(js_datasets: &JsValue, smoothing: f64) -> JsValue {
    // web_sys::console::log_1(&"Hello， world!".into());
    utils::set_panic_hook();
    let datasets: Vec<Vec<scalar::Dataset>> = js_datasets.into_serde().unwrap();
    let result: Vec<Vec<scalar::Smoothed>> = scalar::transform(&datasets, smoothing);
    log!("js_datasets is {:?} ", js_datasets);
    JsValue::from_serde(&result).unwrap()
}

#[wasm_bindgen]
pub fn scalar_range(js_datasets: &JsValue) -> JsValue {
    utils::set_panic_hook();
    let datasets: Vec<Vec<scalar::Smoothed>> = js_datasets.into_serde().unwrap();
    let result = scalar::range(&datasets);
    JsValue::from_serde(&result).unwrap()
}

#[wasm_bindgen]
pub fn scalar_axis_range(js_datasets: &JsValue, outlier: bool) -> JsValue {
    utils::set_panic_hook();
    let datasets: Vec<Vec<scalar::Smoothed>> = js_datasets.into_serde().unwrap();
    let result = scalar::axis_range(&datasets, outlier);
    JsValue::from_serde(&result).unwrap()
}

#[wasm_bindgen]
pub fn histogram_transform(js_data: &JsValue, mode: &str) -> JsValue {
    utils::set_panic_hook();
    let data: Vec<histogram::Data> = js_data.into_serde().unwrap();
    match mode {
        "overlay" => {
            let result = histogram::transform_overlay(&data);
            JsValue::from_serde(&result).unwrap()
        }
        "offset" => {
            let result = histogram::transform_offset(&data);
            JsValue::from_serde(&result).unwrap()
        }
        _ => JsValue::null(),
    }
}

#[wasm_bindgen]
pub fn high_dimensional_pca(js_input: &JsValue, dim: usize, n_components: usize) -> JsValue {
    utils::set_panic_hook();
    let input: Vec<f64> = js_input.into_serde().unwrap();
    let result = high_dimensional::pca(input, dim, n_components);
    JsValue::from_serde(&result).unwrap()
}
