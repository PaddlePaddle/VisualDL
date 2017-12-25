import 'normalize.css/normalize.css';
import 'san-mui/index.css';
import './common/ui/ui-common.styl';

import './home/index';
import './scalars/index';
import './images/index';

import App from './App';
new App({
    data: {
        titleName: 'VisualDL'
    }
}).attach(document.getElementById('root'));
