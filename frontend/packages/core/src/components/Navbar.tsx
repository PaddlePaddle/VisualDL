import {Link, LinkProps, useLocation} from 'react-router-dom';
import React, {FunctionComponent, useCallback, useEffect, useMemo, useState} from 'react';
import {
    backgroundFocusedColor,
    border,
    borderRadius,
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

import Icon from '~/components/Icon';
import Language from '~/components/Language';
import type {Route} from '~/routes';
import Tippy from '@tippyjs/react';
import ee from '~/utils/event';
import {getApiToken} from '~/utils/fetch';
import logo from '~/assets/images/logo.svg';
import queryString from 'query-string';
import styled from 'styled-components';
import useNavItems from '~/hooks/useNavItems';
import {useTranslation} from 'react-i18next';

const PUBLIC_PATH: string = import.meta.env.SNOWPACK_PUBLIC_PATH;
const API_TOKEN_KEY: string = import.meta.env.SNOWPACK_PUBLIC_API_TOKEN_KEY;

interface NavbarItemProps extends Route {
    cid?: string;
    active: boolean;
    children?: ({active: boolean} & NonNullable<Route['children']>[number])[];
}

function appendApiToken(url: string) {
    if (!API_TOKEN_KEY) {
        return url;
    }
    const parsed = queryString.parseUrl(url);
    return queryString.stringifyUrl({
        ...parsed,
        query: {
            ...parsed.query,
            [API_TOKEN_KEY]: getApiToken()
        }
    });
}

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

const NavItem = styled.div<{active?: boolean}>`
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

    &.nav-item {
        padding: 0 ${rem(20)};
    }

    .nav-link {
        display: inline-block;
        width: 100%;
        height: 100%;
        display: inline-flex;
        justify-content: center;
        align-items: center;
    }

    .nav-text {
        margin: ${rem(20)};
        padding: ${rem(10)} 0 ${rem(7)};
        ${props => border('bottom', rem(3), 'solid', props.active ? navbarHighlightColor : 'transparent')}
        ${transitionProps('border-bottom')}
        text-transform: uppercase;
    }
`;

const SubNav = styled.div`
    overflow: hidden;
    border-radius: ${borderRadius};
`;

const NavItemChild = styled.div<{active?: boolean}>`
    display: block;
    line-height: 3em;

    &,
    &:visited {
        color: ${props => (props.active ? primaryColor : textColor)};
    }

    &:hover {
        background-color: ${backgroundFocusedColor};
    }

    > a {
        display: block;
        padding: 0 ${rem(20)};
    }
`;

const NavbarLink: FunctionComponent<{to?: string} & Omit<LinkProps, 'to'>> = ({to, children, ...props}) => {
    return (
        <Link to={to ? appendApiToken(to) : ''} {...props}>
            {children}
        </Link>
    );
};

const NavbarItem = React.forwardRef<HTMLDivElement, NavbarItemProps>(({id, cid, path, active}, ref) => {
    const {t} = useTranslation('common');

    const name = useMemo(() => (cid ? `${t(id)} - ${t(cid)}` : t(id)), [t, id, cid]);

    if (path) {
        return (
            <NavItem active={active} ref={ref}>
                <NavbarLink to={path} className="nav-link">
                    <span className="nav-text">{name}</span>
                </NavbarLink>
            </NavItem>
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
    const {pathname} = useLocation();

    const changeLanguage = useCallback(() => {
        const language = i18n.language;
        const allLanguages = (i18n.options.supportedLngs || []).filter(lng => lng !== 'cimode');
        const index = allLanguages.indexOf(language);
        const nextLanguage = index < 0 || index >= allLanguages.length - 1 ? allLanguages[0] : allLanguages[index + 1];
        i18n.changeLanguage(nextLanguage);
    }, [i18n]);

    const currentPath = useMemo(() => pathname.replace(PUBLIC_PATH, ''), [pathname]);

    const [navItems] = useNavItems();
    const [items, setItems] = useState<NavbarItemProps[]>([]);
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

    return (
        <Nav>
            <div className="left">
                <Logo href={appendApiToken(PUBLIC_PATH + '/index')}>
                    <img alt="PaddlePaddle" src={PUBLIC_PATH + logo} />
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
                                hideOnClick={false}
                                role="menu"
                                content={
                                    <SubNav>
                                        {item.children.map(child => (
                                            <NavItemChild active={child.active} key={child.id}>
                                                <NavbarLink to={child.path}>
                                                    {t(item.id)} - {t(child.id)}
                                                </NavbarLink>
                                            </NavItemChild>
                                        ))}
                                    </SubNav>
                                }
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
                <NavItem className="nav-item" onClick={changeLanguage}>
                    <Language />
                </NavItem>
                <NavItem className="nav-item" onClick={() => ee.emit('refresh')}>
                    <Icon type="refresh" />
                </NavItem>
            </div>
        </Nav>
    );
};

export default Navbar;
