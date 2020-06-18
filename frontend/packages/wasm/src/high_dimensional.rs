#[derive(Serialize, Deserialize)]
pub struct Point {
    name: String,
    value: Vec<f64>,
    showing: bool,
}
impl Point {
    pub fn new(name: String, value: Vec<f64>, showing: bool) -> Self {
        Point {
            name,
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
    points: Vec<Vec<f64>>,
    labels: Vec<String>,
    visibility: bool,
    keyword: String,
) -> DividedPoints {
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

    return DividedPoints::new(matched, missing);
}
