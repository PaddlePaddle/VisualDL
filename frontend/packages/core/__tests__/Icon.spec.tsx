import Icon from '../components/Icon';
import React from 'react';
import {shallow} from 'enzyme';

describe('Icon component', () => {
    const click = jest.fn();
    const icon = shallow(<Icon type="close" onClick={click} />);

    test('icon has one empty `i` element', () => {
        expect(icon.is('i')).toBe(true);
        expect(icon.children().length).toBe(0);
    });

    test('icon has class name `vdl-icon`', () => {
        expect(icon.hasClass('vdl-icon')).toBe(true);
    });

    test('icon with type has class name `icon-${type}`', () => {
        expect(icon.hasClass('icon-close')).toBe(true);
    });

    test('icon click', () => {
        icon.simulate('click');
        expect(click.mock.calls.length).toBe(1);
    });
});
