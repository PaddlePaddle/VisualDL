use rulinalg::matrix::{BaseMatrix, Matrix};
// use wasm_bindgen::prelude::*;

// #[wasm_bindgen]
// extern "C" {
//     // Use `js_namespace` here to bind `console.log(..)` instead of just
//     // `log(..)`
//     #[wasm_bindgen(js_namespace = console)]
//     fn log(s: &str);
// }

// macro_rules! console_log {
//     // Note that this is using the `log` function imported above during
//     // `bare_bones`
//     ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
// }

const THRESHOLD_DIM_NORMALIZE: usize = 50;

#[derive(Serialize, Deserialize)]
pub struct PCAResult {
    pub vectors: Vec<Vec<f64>>,
    pub variance: Vec<f64>,
}
impl PCAResult {
    pub fn new(vectors: Vec<Vec<f64>>, variance: Vec<f64>) -> Self {
        PCAResult {
            vectors,
            variance,
        }
    }
}

fn normalize(input: &Vec<f64>, dim: usize) -> Vec<f64> {
    let len = input.len();
    let mut normalized: Vec<f64> = vec![];
    let mut centroid = vec![0f64; dim];
    let row = len / dim;
    for i in 0..row {
        let vector = &input[(i * dim)..((i + 1) * dim)];
        for j in 0..dim {
            centroid[j] += vector[j];
        }
    }
    for j in 0..dim {
        centroid[j] /= row as f64;
    }
    for i in 0..row {
        let vector = &input[(i * dim)..((i + 1) * dim)];
        let mut sub = vec![0f64; dim];
        let mut norm2 = 0f64;
        for j in 0..dim {
            sub[j] = vector[j] - centroid[j];
            norm2 += sub[j] * sub[j];
        }
        if norm2 > 0f64 {
            let norm = norm2.sqrt();
            for j in 0..dim {
                sub[j] /= norm;
            }
        }
        normalized.append(&mut sub);
    }
    normalized
}

pub fn pca(input: Vec<f64>, dim: usize, n_components: usize) -> PCAResult {
    let len = input.len();
    if len % dim != 0 {
        panic!("Input matrix size error!");
    }
    let normalized = if dim >= THRESHOLD_DIM_NORMALIZE {
        normalize(&input, dim)
    } else {
        input
    };
    let row = len / dim;
    let column = dim;
    let matrix = Matrix::new(row, column, normalized);
    let mt = &matrix.transpose();
    let scalar = mt * &matrix;
    let sigma = scalar / row as f64;
    let (s, u, _v) = sigma.svd().ok().unwrap();
    let sd = s.diag().cloned().collect::<Vec<_>>();
    let total_variance = sd.iter().sum::<f64>();
    let variance = sd.iter().map(|x| x / total_variance).collect::<Vec<_>>();
    let vectors = matrix.row_iter().map(|vector| {
        let mut new_v = vec![0f64; n_components];
        for new_dim in 0..n_components {
            let mut dot = 0f64;
            for old_dim in 0..column {
                dot += vector[old_dim] * u.row(old_dim)[new_dim];
            }
            new_v[new_dim] = dot;
        }
        new_v
    }).collect::<Vec<Vec<_>>>();
    return PCAResult::new(vectors, variance);
    // let means = matrix.mean(Axes::Row);
    // let means_matrix = Matrix::from_fn(row, column, |i, _j| means[i]);
    // let x = &matrix - &means_matrix;
    // let (sigma, u, v) = x.svd().ok().unwrap();
    // let mut u = u;
    // let mut vt = v.transpose();
    // println!("{}", &u);
    // println!("{}", &vt);
    // let sigma = Vector::new(sigma.diag().cloned().collect::<Vec<_>>());
    // for i in 0..row {
    //     let mut u_col = u.col_mut(i);
    //     let mut v_row = vt.row_mut(i);
    //     let mut u_col_iter = u_col.iter();
    //     let e: f64 = if let Some(e) = u_col_iter.next() {
    //         *e
    //     } else {
    //         continue;
    //     };
    //     let mut absmax = e.abs();
    //     let mut signum;
    //     for e in u_col_iter {
    //         let abs = e.abs();
    //         if abs <= absmax {
    //             continue;
    //         }
    //         absmax = abs;
    //         signum = e.signum();
    //         if signum < 0.0 {
    //             for e in u_col.iter_mut() {
    //                 *e *= signum;
    //             }
    //             for e in v_row.iter_mut() {
    //                 *e *= signum;
    //             }
    //         }
    //     }
    // }
    // let total_variance = sigma.dot(&sigma);
    // let components = vt.sub_slice([0, 0], n_components, column).into_matrix();
    // let transform = (&matrix - &means_matrix) * (&components.transpose());
    // let singular = Vector::from_fn(n_components, |x| sigma[x]);
    // let singular_matrix = Matrix::new(1, n_components, singular);
    // let variance = &singular_matrix.elemul(&singular_matrix) / total_variance;

    // return PCAResult::new(transform, variance, n_components);
}
