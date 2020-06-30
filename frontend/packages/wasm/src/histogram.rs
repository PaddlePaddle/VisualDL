trait FloatIterExt {
    fn float_min(&mut self) -> f64;
    fn float_max(&mut self) -> f64;
}

impl<T> FloatIterExt for T
where
    T: Iterator<Item = f64>,
{
    fn float_max(&mut self) -> f64 {
        self.fold(f64::NAN, f64::max)
    }

    fn float_min(&mut self) -> f64 {
        self.fold(f64::NAN, f64::min)
    }
}

struct Histogram {
    left: f64,
    right: f64,
    count: f64,
}

struct Coordinates {
    x: f64,
    dx: f64,
    y: f64,
}
impl Coordinates {
    pub fn new(x: f64, dx: f64, y: f64) -> Self {
        Coordinates { x, dx, y }
    }
}

#[derive(Serialize, Deserialize)]
struct Item(f64, f64, f64);

#[derive(Serialize, Deserialize)]
pub struct Data(f64, f64, Vec<Item>);

#[derive(Serialize, Deserialize)]
struct OverlayItem(f64, f64, f64, f64);

#[derive(Serialize, Deserialize)]
pub struct Overlay {
    min: f64,
    max: f64,
    data: Vec<Vec<OverlayItem>>,
}

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize)]
pub struct Offset {
    minX: f64,
    maxX: f64,
    minZ: f64,
    maxZ: f64,
    minStep: f64,
    maxStep: f64,
    data: Vec<Vec<f64>>,
}

fn compute_histogram(
    data: &Vec<Histogram>,
    mut min: f64,
    mut max: f64,
    bins_num: i64,
) -> Vec<Coordinates> {
    if min == max {
        max = min * 1.1 + 1.;
        min = min / 1.1 - 1.;
    }
    let step_width: f64 = (max - min) / bins_num as f64;
    let mut range: Vec<f64> = vec![];
    let mut optional = Some(min);
    while let Some(i) = optional {
        if i >= max {
            optional = None;
        } else {
            range.push(i);
            optional = Some(i + step_width);
        }
    }
    let mut item_index: usize = 0;
    let mut result: Vec<Coordinates> = vec![];
    for bin_left in range {
        let bin_right: f64 = bin_left + step_width;
        let mut y: f64 = 1.;
        let n: usize = data.len();
        while item_index < n {
            let item_right: f64 = max.min(data[item_index].right);
            let item_left: f64 = min.max(data[item_index].left);
            let overlap: f64 = item_right.min(bin_right) - item_left.max(bin_left);
            let count: f64 = (overlap / (item_right - item_left)) * data[item_index].count;
            if overlap > 0. {
                y += count;
            }
            if item_right > bin_right {
                break;
            }
            item_index += 1;
        }
        result.push(Coordinates::new(bin_left, step_width, y));
    }
    return result;
}

pub fn transform_overlay(data: &Vec<Data>) -> Overlay {
    struct Temp {
        time: f64,
        step: f64,
        min: f64,
        max: f64,
    }
    let mut temp: Vec<Temp> = vec![];
    let mut items: Vec<Vec<Histogram>> = vec![];
    for item in data {
        temp.push(Temp {
            time: item.0,
            step: item.1,
            min: item.2.iter().map(|x| x.0).float_min(),
            max: item.2.iter().map(|x| x.1).float_max(),
        });
        items.push(
            item.2
                .iter()
                .map(|x| Histogram {
                    left: x.0,
                    right: x.1,
                    count: x.2,
                })
                .collect(),
        );
    }
    let min: f64 = temp.iter().map(|x| x.min).float_min();
    let max: f64 = temp.iter().map(|x| x.max).float_max();
    let mut overlay: Vec<Vec<OverlayItem>> = vec![];
    for (i, item) in temp.iter().enumerate() {
        let computed: Vec<Coordinates> = compute_histogram(&items[i], min, max, 30);
        overlay.push(
            computed
                .iter()
                .map(|x| OverlayItem(item.time, item.step, x.x + x.dx / 2.0_f64, x.y.floor()))
                .collect(),
        );
    }
    return Overlay {
        min,
        max,
        data: overlay,
    };
}

pub fn transform_offset(data: &Vec<Data>) -> Offset {
    let overlay: Overlay = transform_overlay(&data);
    let mut min_step: f64 = std::f64::INFINITY;
    let mut max_step: f64 = std::f64::NEG_INFINITY;
    let mut min_z: f64 = std::f64::INFINITY;
    let mut max_z: f64 = std::f64::NEG_INFINITY;
    let mut offset: Vec<Vec<f64>> = vec![];
    for items in overlay.data {
        let step: f64 = items[0].1;
        if step > max_step {
            max_step = step;
        }
        if step < min_step {
            min_step = step;
        }
        let mut res: Vec<f64> = vec![];
        for item in items {
            let x: f64 = item.2;
            let y: f64 = item.3;
            if y > max_z {
                max_z = y;
            }
            if y < min_z {
                min_z = y;
            }
            res.push(x);
            res.push(step);
            res.push(y);
        }
        offset.push(res);
    }
    return Offset {
        minX: overlay.min,
        maxX: overlay.max,
        minZ: min_z,
        maxZ: max_z,
        minStep: min_step,
        maxStep: max_step,
        data: offset,
    };
}
