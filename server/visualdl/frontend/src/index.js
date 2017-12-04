import 'normalize.css/normalize.css';
import 'san-mui/index.css';
let App = require('./App');
new App({
    data: {
        titleName: 'VisualDL'
    }
}).attach(document.getElementById('root'));
