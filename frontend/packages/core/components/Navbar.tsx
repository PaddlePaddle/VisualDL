import {Link, config, i18n, useTranslation} from '~/utils/i18n';
import React, {FunctionComponent} from 'react';
import {
    border,
    navbarBackgroundColor,
    navbarHighlightColor,
    navbarHoverBackgroundColor,
    rem,
    size,
    textInvertColor,
    transitionProps
} from '~/utils/style';

import Icon from '~/components/Icon';
import Language from '~/components/Language';
import ee from '~/utils/event';
import intersection from 'lodash/intersection';
import styled from 'styled-components';
import {useRouter} from 'next/router';

const buildNavItems = process.env.NAV_ITEMS;
const allNavItems = ['scalars', 'samples', 'graphs', 'high-dimensional'];
const navItems = buildNavItems
    ? intersection(
          buildNavItems.split(',').map(item => item.trim()),
          allNavItems
      )
    : allNavItems;

const Nav = styled.nav`
    background-color: ${navbarBackgroundColor};
    color: ${textInvertColor};
    ${size('100%')}
    padding: 0 ${rem(20)};
    display: flex;
    justify-content: space-between;
    align-items: stretch;

    > .left {
        display: flex;
        justify-content: flex-start;
        align-items: center;
    }

    > .right {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        margin-right: -${rem(20)};
    }
`;

const Logo = styled.a`
    font-size: ${rem(20)};
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
        'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
    font-weight: 600;
    margin-right: ${rem(40)};

    > img {
        ${size(rem(31), rem(98))}
        vertical-align: middle;
        margin-right: ${rem(8)};
    }

    > span {
        vertical-align: middle;
    }
`;

const NavItem = styled.a<{active?: boolean}>`
    padding: 0 ${rem(20)};
    height: 100%;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    background-color: ${navbarBackgroundColor};
    cursor: pointer;
    ${transitionProps('background-color')}

    &:hover {
        background-color: ${navbarHoverBackgroundColor};
    }

    > .nav-text {
        padding: ${rem(10)} 0 ${rem(7)};
        ${props => border('bottom', rem(3), 'solid', props.active ? navbarHighlightColor : 'transparent')}
        ${transitionProps('border-bottom')}
        text-transform: uppercase;
    }
`;

const changeLanguage = () => {
    const {language} = i18n;
    const {allLanguages} = config;
    const index = allLanguages.indexOf(language);
    const nextLanguage = index < 0 || index >= allLanguages.length - 1 ? allLanguages[0] : allLanguages[index + 1];
    i18n.changeLanguage(nextLanguage);
};

const Navbar: FunctionComponent = () => {
    const {t} = useTranslation('common');
    const {pathname} = useRouter();

    return (
        <Nav>
            <div className="left">
                <Logo href={process.env.PUBLIC_PATH || '/'}>
                    <img alt="PaddlePaddle" src={`${process.env.PUBLIC_PATH}/images/logo.svg`} />
                    <span>VisualDL</span>
                </Logo>
                {navItems.map(name => {
                    const href = `/${name}`;
                    return (
                        // https://nextjs.org/docs/api-reference/next/link#if-the-child-is-a-custom-component-that-wraps-an-a-tag
                        <Link href={href} key={name} passHref>
                            <NavItem active={pathname === href}>
                                <span className="nav-text">{t(name)}</span>
                            </NavItem>
                        </Link>
                    );
                })}
            </div>
            <div className="right">
                <NavItem onClick={changeLanguage}>
                    <Language />
                </NavItem>
                <NavItem onClick={() => ee.emit('refresh-running')}>
                    <Icon type="refresh" />
                </NavItem>
            </div>
        </Nav>
    );
};

export default Navbar;
