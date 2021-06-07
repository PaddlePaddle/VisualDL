/**
 * Copyright 2020 Baidu Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from 'react';

// import App from '../src/App';
import {expect} from 'chai';
import {render} from '@testing-library/react';

describe('<App>', () => {
    // it('renders learn react link', () => {
    //     const {getByText} = render(<App />);
    //     const linkElement = getByText(/learn react/i);
    //     expect(document.body.contains(linkElement));
    // });
    it('test demo', () => {
        const {getByText} = render(
            <div>
                <a>hello world!</a>
            </div>
        );
        const linkElement = getByText(/hello world!/i);
        expect(document.body.contains(linkElement));
    });
});
