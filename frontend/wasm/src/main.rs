mod utils;
use wasm_bindgen::prelude::*;

#[macro_use]
extern crate serde_derive;

#[derive(Serialize, Deserialize)]
struct Dataset(f64, i64, f64);

#[derive(Serialize, Deserialize)]
struct Smoothed(i64, i64, f64, f64, f64);

#[wasm_bindgen]
pub fn transform(js_datasets: &JsValue, smoothing: f64) -> JsValue {
    utils::set_panic_hook();

    let datasets: Vec<Vec<Dataset>> = js_datasets.into_serde().unwrap();

    let mut result: Vec<Vec<Smoothed>> = vec![];
    for dataset in datasets.iter() {
        let mut row: Vec<Smoothed> = vec![];
        let mut last: f64 = std::f64::NAN;
        if dataset.len() > 0 {
            last = 0_f64;
        }
        let mut num_accum: i32 = 0;
        let mut start_value: i64 = 0;
        for (i, d) in dataset.iter().enumerate() {
            let mut r: Smoothed = Smoothed(0, d.1, d.2, 0.0, 0.0);
            let next_val: f64 = d.2;
            // second to millisecond.
            let millisecond: i64 = ((d.0 as f64) * 1000_f64).floor() as i64;
            r.0 = millisecond;
            if i == 0 {
                start_value = millisecond;
            }
            // Relative time, millisecond to hours.
            r.4 = ((millisecond - start_value) as f64) / (60 * 60 * 1000) as f64;
            if next_val.is_infinite() {
                r.3 = next_val;
            } else {
                last = last * smoothing + (1.0 - smoothing) * next_val;
                num_accum += 1;
                let mut debias_weight: f64 = 1.0_f64;
                if smoothing != 1.0 {
                    debias_weight = (1.0_f64 - smoothing.powi(num_accum)).into();
                }
                r.3 = last / debias_weight;
            }
            row.push(r);
        }
        result.push(row);
    }
    return JsValue::from_serde(&result).unwrap();
}

#[derive(Serialize, Deserialize)]
struct Range {
    min: f64,
    max: f64,
}

impl Range {
    pub fn new(min: f64, max: f64) -> Self {
        Range { min, max }
    }
}

fn quantile(values: Vec<f64>, p: f64) -> f64 {
    let n: usize = values.len();
    if n == 0 {
        return std::f64::NAN;
    }
    if p <= 0. || n < 2 {
        return values[0];
    }
    if p >= 1. {
        return values[n - 1];
    }
    let i: f64 = ((n - 1) as f64) * p;
    let i0: usize = i.floor() as usize;
    let value0: f64 = values[i0];
    let value1: f64 = values[i0 + 1];
    return value0 + (value1 - value0) * (i - (i0 as f64));
}

#[wasm_bindgen]
pub fn range(js_datasets: &JsValue, outlier: bool) -> JsValue {
    utils::set_panic_hook();

    let datasets: Vec<Vec<Smoothed>> = js_datasets.into_serde().unwrap();
    let mut ranges: Vec<Range> = vec![];

    for data in datasets.iter() {
        let n: usize = data.len();

        if n == 0 {
            continue;
        }

        let values: Vec<f64> = data.iter().map(|x| x.2).collect();
        let mut sorted: Vec<f64> = values.clone();
        sorted.sort_by(|a, b| a.partial_cmp(b).unwrap());

        if !outlier {
            ranges.push(Range::new(sorted[0], sorted[n - 1]));
        } else {
            ranges.push(Range::new(
                quantile(sorted, 0.05_f64),
                quantile(values, 0.95),
            ));
        }
    }

    let mut min: f64 = 0.;
    let mut max: f64 = 1.;

    if ranges.len() != 0 {
        min = ranges
            .iter()
            .min_by(|x, y| x.min.partial_cmp(&y.max).unwrap())
            .unwrap()
            .min;
        max = ranges
            .iter()
            .max_by(|x, y| x.max.partial_cmp(&y.max).unwrap())
            .unwrap()
            .max;
        if min > 0. {
            min *= 0.9;
        } else {
            min *= 1.1;
        }
        if max > 0. {
            max *= 1.1;
        } else {
            max *= 0.9;
        }
    }

    let result = Range::new(min, max);
    return JsValue::from_serde(&result).unwrap();
}

#[derive(Serialize, Deserialize)]
struct Point {
    name: String,
    value: Vec<f64>,
    showing: bool,
}

#[derive(Serialize, Deserialize)]
struct DividedPoints(Vec<Point>, Vec<Point>);

impl Point {
    pub fn new(name: String, value: Vec<f64>, showing: bool) -> Self {
        Point {
            name,
            value,
            showing,
        }
    }
}

impl DividedPoints {
    pub fn new(matched: Vec<Point>, missing: Vec<Point>) -> Self {
        DividedPoints(matched, missing)
    }
}

#[wasm_bindgen]
pub fn divide(
    js_points: &JsValue,
    js_labels: &JsValue,
    visibility: bool,
    keyword: String,
) -> JsValue {
    utils::set_panic_hook();

    let points: Vec<Vec<f64>> = js_points.into_serde().unwrap();
    let labels: Vec<String> = js_labels.into_serde().unwrap();

    let mut matched: Vec<Point> = vec![];
    let mut missing: Vec<Point> = vec![];

    for (i, point) in points.iter().enumerate() {
        let mut name: String = String::from("");
        let ptr: *const String = &labels[i];
        if !ptr.is_null() {
            name = labels[i].clone();
        }
        let point_with_label: Point = Point::new(name.clone(), point.to_vec(), visibility);
        if keyword == String::from("") {
            missing.push(point_with_label);
        } else {
            if name.contains(&keyword) {
                matched.push(point_with_label);
            } else {
                missing.push(point_with_label);
            }
        }
    }

    let result: DividedPoints = DividedPoints::new(matched, missing);
    return JsValue::from_serde(&result).unwrap();
}
