import Page404 from '../pages/404';
import React from 'react';
import {shallow} from 'enzyme';

describe('Page 404', () => {
    test('page with content `404 - errors:page-not-found`', () => {
        const page = shallow(<Page404 namespacesRequired={['errors']} />);
        expect(page.text()).toEqual('404 - errors:page-not-found');
    });
});
