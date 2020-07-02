import {Link, config, i18n, useTranslation} from '~/utils/i18n';
import React, {FunctionComponent, useMemo} from 'react';
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
import {InitConfig} from '@visualdl/i18n';
import Language from '~/components/Language';
import ee from '~/utils/event';
import {getApiToken} from '~/utils/fetch';
import queryString from 'query-string';
import styled from 'styled-components';
import useNavItems from '~/hooks/useNavItems';
import {useRouter} from 'next/router';

const API_TOKEN_KEY: string = globalThis.__vdl_api_token_key__ || '';

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
    const {t, i18n} = useTranslation('common');
    const {pathname, basePath} = useRouter();

    const navItems = useNavItems();

    const path = useMemo(() => pathname.replace(basePath, ''), [pathname, basePath]);

    const indexUrl = useMemo(() => {
        // TODO: fix type
        const subpath = (i18n.options as InitConfig).localeSubpaths?.[i18n.language];
        let path = process.env.PUBLIC_PATH ?? '';
        if (subpath) {
            path += `/${subpath}`;
        }
        path += '/index';
        if (API_TOKEN_KEY) {
            const id = getApiToken();
            if (id) {
                path += `?${queryString.stringify({
                    [API_TOKEN_KEY]: id
                })}`;
            }
        }
        return path;
    }, [i18n.options, i18n.language]);

    return (
        <Nav>
            <div className="left">
                <Logo href={indexUrl}>
                    <img alt="PaddlePaddle" src={`${process.env.PUBLIC_PATH}/images/logo.svg`} />
                    <span>VisualDL</span>
                </Logo>
                {navItems.map(name => {
                    const href = `/${name}`;
                    return (
                        // https://nextjs.org/docs/api-reference/next/link#if-the-child-is-a-custom-component-that-wraps-an-a-tag
                        <Link href={href} key={name} passHref>
                            <NavItem active={path === href}>
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
                <NavItem onClick={() => ee.emit('refresh')}>
                    <Icon type="refresh" />
                </NavItem>
            </div>
        </Nav>
    );
};

export default Navbar;
