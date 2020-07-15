import {Link, config, i18n, useTranslation} from '~/utils/i18n';
import React, {FunctionComponent, useEffect, useMemo, useState} from 'react';
import {
    backgroundFocusedColor,
    border,
    navbarBackgroundColor,
    navbarHighlightColor,
    navbarHoverBackgroundColor,
    primaryColor,
    rem,
    size,
    textColor,
    textInvertColor,
    transitionProps
} from '~/utils/style';
import useNavItems, {NavItem as BaseNavItem} from '~/hooks/useNavItems';

import Icon from '~/components/Icon';
import {InitConfig} from '@visualdl/i18n';
import Language from '~/components/Language';
import Tippy from '@tippyjs/react';
import ee from '~/utils/event';
import {getApiToken} from '~/utils/fetch';
import queryString from 'query-string';
import styled from 'styled-components';
import {useRouter} from 'next/router';

const API_TOKEN_KEY = process.env.API_TOKEN_KEY;
const PUBLIC_PATH = process.env.PUBLIC_PATH;

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

const NavItemChild = styled.a<{active?: boolean}>`
    display: block;
    padding: 0 ${rem(20)};
    line-height: 3em;

    &,
    &:visited {
        color: ${props => (props.active ? primaryColor : textColor)};
    }

    &:hover {
        background-color: ${backgroundFocusedColor};
    }
`;

interface NavItem extends BaseNavItem {
    cid?: string;
    active: boolean;
    children?: ({active: boolean} & NonNullable<BaseNavItem['children']>[number])[];
}

const changeLanguage = () => {
    const {language} = i18n;
    const {allLanguages} = config;
    const index = allLanguages.indexOf(language);
    const nextLanguage = index < 0 || index >= allLanguages.length - 1 ? allLanguages[0] : allLanguages[index + 1];
    i18n.changeLanguage(nextLanguage);
};

const NavbarItem = React.forwardRef<HTMLAnchorElement, NavItem>(({path, id, cid, active}, ref) => {
    const {t} = useTranslation('common');

    const name = useMemo(() => (cid ? `${t(id)} - ${t(cid)}` : t(id)), [t, id, cid]);

    if (path) {
        // https://nextjs.org/docs/api-reference/next/link#if-the-child-is-a-custom-component-that-wraps-an-a-tag
        return (
            <Link href={path} passHref>
                <NavItem active={active} ref={ref}>
                    <span className="nav-text">{name}</span>
                </NavItem>
            </Link>
        );
    }
    return (
        <NavItem active={active} ref={ref}>
            <span className="nav-text">{name}</span>
        </NavItem>
    );
});

NavbarItem.displayName = 'NavbarItem';

const Navbar: FunctionComponent = () => {
    const {t, i18n} = useTranslation('common');
    const {pathname, basePath} = useRouter();

    const currentPath = useMemo(() => pathname.replace(basePath, ''), [pathname, basePath]);

    const navItems = useNavItems();
    const [items, setItems] = useState<NavItem[]>([]);
    useEffect(() => {
        setItems(oldItems =>
            navItems.map(item => {
                const children = item.children?.map(child => ({
                    ...child,
                    active: child.path === currentPath
                }));
                if (item.children && !item.path) {
                    const child = item.children.find(child => child.path === currentPath);
                    if (child) {
                        return {
                            ...item,
                            cid: child.id,
                            path: currentPath,
                            active: true,
                            children
                        };
                    } else {
                        const oldItem = oldItems.find(oldItem => oldItem.id === item.id);
                        if (oldItem) {
                            return {
                                ...item,
                                ...oldItem,
                                active: false,
                                children
                            };
                        }
                    }
                }
                return {
                    ...item,
                    active: currentPath === item.path,
                    children
                };
            })
        );
    }, [navItems, currentPath]);

    const indexUrl = useMemo(() => {
        // TODO: fix type
        const subpath = (i18n.options as InitConfig).localeSubpaths?.[i18n.language];
        let path = PUBLIC_PATH ?? '';
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
                    <img alt="PaddlePaddle" src={`${PUBLIC_PATH}/images/logo.svg`} />
                    <span>VisualDL</span>
                </Logo>
                {items.map(item => {
                    if (item.children) {
                        return (
                            <Tippy
                                placement="bottom-start"
                                animation="shift-away-subtle"
                                interactive
                                arrow={false}
                                offset={[0, 0]}
                                theme="navbar"
                                hideOnClick={false}
                                role="menu"
                                content={item.children.map(child => (
                                    <Link href={child.path} key={child.id} passHref>
                                        <NavItemChild active={child.active}>
                                            {t(item.id)} - {t(child.id)}
                                        </NavItemChild>
                                    </Link>
                                ))}
                                key={item.active ? `${item.id}-activated` : item.id}
                            >
                                <NavbarItem {...item} />
                            </Tippy>
                        );
                    }
                    return <NavbarItem {...item} key={item.id} />;
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
