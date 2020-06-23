#[derive(Serialize, Deserialize)]
pub struct Point {
    name: String,
    value: Vec<f64>,
    showing: bool,
}
impl Point {
    pub fn new(name: &str, value: Vec<f64>, showing: bool) -> Self {
        Point {
            name: String::from(name),
            value,
            showing,
        }
    }
}

#[derive(Serialize, Deserialize)]
pub struct DividedPoints(Vec<Point>, Vec<Point>);
impl DividedPoints {
    pub fn new(matched: Vec<Point>, missing: Vec<Point>) -> Self {
        DividedPoints(matched, missing)
    }
}

pub fn divide(
    points: &Vec<Vec<f64>>,
    labels: &Vec<String>,
    visibility: bool,
    keyword: &str,
) -> DividedPoints {
    let mut matched: Vec<Point> = vec![];
    let mut missing: Vec<Point> = vec![];

    for (i, point) in points.iter().enumerate() {
        let mut name: &str = "";
        let ptr: *const String = &labels[i];
        if !ptr.is_null() {
            unsafe {
                name = &(*ptr)[..];
            }
        }
        let point_with_label: Point = Point::new(name, point.to_vec(), visibility);
        if let "" = keyword {
            missing.push(point_with_label);
        } else {
            if String::from(name).contains(&keyword) {
                matched.push(point_with_label);
            } else {
                missing.push(point_with_label);
            }
        }
    }

    return DividedPoints::new(matched, missing);
}
