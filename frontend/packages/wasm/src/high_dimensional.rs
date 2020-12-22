use rulinalg::matrix::{BaseMatrix, Matrix};

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
}
