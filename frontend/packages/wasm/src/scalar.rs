#[derive(Serialize, Deserialize)]
pub struct Dataset(f64, i64, f64);

#[derive(Serialize, Deserialize)]
pub struct Smoothed(i64, i64, f64, f64, f64);

#[derive(Serialize, Deserialize)]
pub struct Range {
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

pub fn transform(datasets: Vec<Vec<Dataset>>, smoothing: f64) -> Vec<Vec<Smoothed>> {
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
    return result;
}

pub fn range(datasets: Vec<Vec<Smoothed>>, outlier: bool) -> Range {
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

    return Range::new(min, max);
}
