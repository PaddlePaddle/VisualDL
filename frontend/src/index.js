import 'normalize.css/normalize.css';
import 'san-mui/index.css';
import './common/component/ui-common.styl';

import './home/index';
import './scalars/index';
import './images/index';
import './histogram/index';

import App from './App';
new App({
    data: {
        titleName: 'VisualDL'
    }
}).attach(document.getElementById('root'));
