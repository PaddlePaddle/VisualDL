/* eslint-disable react-hooks/exhaustive-deps */
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

// cspell:words cimode

import {Link, LinkProps, useLocation} from 'react-router-dom';
import {useHistory} from 'react-router-dom';
import React, {FunctionComponent, useCallback, useEffect, useMemo, useState} from 'react';
import {border, borderRadius, rem, size, transitionProps, triangle} from '~/utils/style';

import Icon from '~/components/Icon';
import Language from '~/components/Language';
import type {Route} from '~/routes';
import ThemeToggle from '~/components/ThemeToggle';
import Tippy from '@tippyjs/react';
import ee from '~/utils/event';
import routes from '~/routes';
import {getApiToken} from '~/utils/fetch';
import logo from '~/assets/images/logo.svg';
import queryString from 'query-string';
import styled from 'styled-components';
import useClassNames from '~/hooks/useClassNames';
import useComponents from '~/hooks/useComponents';
import {useTranslation} from 'react-i18next';
import {fetcher} from '~/utils/fetch';
import {isArray} from 'lodash';

const BASE_URI: string = import.meta.env.SNOWPACK_PUBLIC_BASE_URI;
const PUBLIC_PATH: string = import.meta.env.SNOWPACK_PUBLIC_PATH;
const API_TOKEN_KEY: string = import.meta.env.SNOWPACK_PUBLIC_API_TOKEN_KEY;

const MAX_ITEM_COUNT_IN_NAVBAR = 6;

const flatten = <T extends {children?: T[]}>(routes: T[]) => {
    const result: Omit<T, 'children'>[] = [];
    routes.forEach(route => {
        if (route.children) {
            result.push(...flatten(route.children));
        } else {
            result.push(route);
        }
    });
    return result;
};

interface NavbarItemProps {
    active: boolean;
    path?: Route['path'];
    showDropdownIcon?: boolean;
}

interface NavbarItemType {
    id: string;
    cid?: string;
    name: string;
    active: boolean;
    path?: Route['path'];
    children?: NavbarItemType[];
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
    background-color: var(--navbar-background-color);
    color: var(--navbar-text-color);
    ${size('100%')}
    padding: 0 ${rem(20)};
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    ${transitionProps(['background-color', 'color'])}

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
    background-color: var(--navbar-background-color);
    cursor: pointer;
    ${transitionProps('background-color')}

    &:hover {
        background-color: var(--navbar-hover-background-color);
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
        ${props => border('bottom', rem(3), 'solid', props.active ? 'var(--navbar-highlight-color)' : 'transparent')}
        ${transitionProps('border-bottom')}
        text-transform: uppercase;

        &.dropdown-icon {
            &::after {
                content: '';
                display: inline-block;
                width: 0;
                height: 0;
                margin-left: 0.5rem;
                vertical-align: middle;
                ${triangle({
                    pointingDirection: 'bottom',
                    width: rem(8),
                    height: rem(5),
                    foregroundColor: 'currentColor'
                })}
            }
        }
    }
`;

const SubNavWrapper = styled.div`
    overflow: hidden;
    border-radius: ${borderRadius};
`;

const NavItemChild = styled.div<{active?: boolean}>`
    display: block;
    line-height: 3em;

    &,
    &:visited {
        color: ${props => (props.active ? 'var(--primary-color)' : 'var(--text-color)')};
    }

    &:hover {
        background-color: var(--background-focused-color);
    }

    > a {
        display: block;
        padding: 0 ${rem(20)};
    }
`;

const NavbarLink: FunctionComponent<{to?: string} & Omit<LinkProps, 'to'>> = ({to, children, ...props}) => (
    <Link to={to ? appendApiToken(to) : ''} {...props}>
        {children}
    </Link>
);

// FIXME: why we need to add children type here... that's weird...
const NavbarItem = React.forwardRef<HTMLDivElement, NavbarItemProps & {children?: React.ReactNode}>(
    ({path, active, showDropdownIcon, children}, ref) => {
        const classNames = useClassNames('nav-text', {'dropdown-icon': showDropdownIcon}, [showDropdownIcon]);

        if (path) {
            return (
                <NavItem active={active} ref={ref}>
                    <NavbarLink to={path} className="nav-link">
                        <span className={classNames}>{children}</span>
                    </NavbarLink>
                </NavItem>
            );
        }

        return (
            <NavItem active={active} ref={ref}>
                <span className={classNames}>{children}</span>
            </NavItem>
        );
    }
);

NavbarItem.displayName = 'NavbarItem';

const SubNav: FunctionComponent<{
    menu: Omit<NavbarItemType, 'children' | 'cid'>[];
    active?: boolean;
    path?: string;
    showDropdownIcon?: boolean;
}> = ({menu, active, path, showDropdownIcon, children}) => (
    <Tippy
        placement="bottom-start"
        animation="shift-away-subtle"
        interactive
        arrow={false}
        offset={[0, 0]}
        hideOnClick={false}
        role="menu"
        content={
            <SubNavWrapper>
                {menu.map(item => (
                    <NavItemChild active={item.active} key={item.id}>
                        <NavbarLink to={item.path}>{item.name}</NavbarLink>
                    </NavItemChild>
                ))}
            </SubNavWrapper>
        }
    >
        <NavbarItem active={active || false} path={path} showDropdownIcon={showDropdownIcon}>
            {children}
        </NavbarItem>
    </Tippy>
);

const Navbar: FunctionComponent = () => {
    const history = useHistory();
    const {t, i18n} = useTranslation('common');
    // const {pathname: pathnames} = useLocation();
    // console.log('pathnames', pathnames);
    // const paths = pathnames.split('/');
    // paths.shift();
    // paths.shift();
    // // join('/');
    // const pathname = '/' + paths.join('/');
    // console.log('pathname', pathname);
    const {pathname} = useLocation();

    const [navList, setNavlist] = useState<string[]>([]);
    const changeLanguage = useCallback(() => {
        const language = i18n.language;
        const allLanguages = (i18n.options.supportedLngs || []).filter(lng => lng !== 'cimode');
        const index = allLanguages.indexOf(language);
        const nextLanguage = index < 0 || index >= allLanguages.length - 1 ? allLanguages[0] : allLanguages[index + 1];
        i18n.changeLanguage(nextLanguage);
    }, [i18n]);
    const routeEm: any = useMemo(() => {
        return {
            scalar: 'scalar',
            histogram: 'histogram',
            image: 'image',
            audio: 'audio',
            text: 'text',
            fastdeploy_server: 'fastdeploy_server',
            static_graph: 'static_graph',
            dynamic_graph: 'dynamic_graph',
            'high-dimensional': 'embeddings',
            'pr-curve': 'pr_curve',
            'roc-curve': 'roc_curve',
            profiler: 'profiler',
            'hyper-parameter': 'hyper_parameters',
            x2paddle: 'x2paddle',
            fastdeploy_client: 'fastdeploy_client'
        };
    }, []);
    console.log('pathname', pathname);

    const currentPath = useMemo(() => pathname.replace(BASE_URI, ''), [pathname]);

    const [components] = useComponents();
    const routePush = (route: any, component: any) => {
        const Components = isArray(component) ? [...component] : [...component.values()];
        console.log('routeEm[route.id]', navList, navList.includes(routeEm[route.id]));
        if (navList.includes(routeEm[route.id])) {
            // debugger;

            return true;
            // setDefaultRoute(route.id);
        }
        if (route.children) {
            for (const Route of route.children) {
                routePush(Route, Components);
            }
        }
    };
    const newcomponents = useMemo(() => {
        const Components = new Map();
        const parent: any[] = [];
        if (navList.length > 0) {
            for (const item of components) {
                // const Id: any = item.id;
                if (navList.includes(routeEm[item.id])) {
                    // Components.push(item);

                    Components.set(item.id, item);
                }
                if (item.children) {
                    for (const Route of item.children) {
                        const flag = routePush(Route, Components);
                        if (flag && !parent.includes(item.id)) {
                            parent.push(item.id);
                            const newItems = {
                                ...item,
                                children: [Route]
                            };
                            Components.set(item.id, newItems);
                        } else if (flag && parent.includes(item.id)) {
                            // debugger;
                            const newItem = Components.get(item.id);
                            const newItems = {
                                ...newItem,
                                children: [...newItem.children, Route]
                            };
                            Components.set(item.id, newItems);
                        }
                    }
                }
            }
        }
        console.log('Components', [...Components], Components);
        // debugger;
        return [...Components.values()];
    }, [components, navList]);
    const componentsInNavbar = useMemo(() => newcomponents.slice(0, MAX_ITEM_COUNT_IN_NAVBAR), [newcomponents]);
    const flattenMoreComponents = useMemo(
        () => flatten(newcomponents.slice(MAX_ITEM_COUNT_IN_NAVBAR)),
        [newcomponents]
    );
    console.log('currentPath', currentPath);

    const componentsInMoreMenu: any = useMemo(
        () =>
            flattenMoreComponents.map(item => ({
                ...item,
                active: currentPath === item.path
            })),
        [currentPath, flattenMoreComponents]
    );
    const [navItemsInNavbar, setNavItemsInNavbar] = useState<NavbarItemType[]>([]);
    const routesChange = (route: any, parentPath: string, path: string) => {
        // debugger;
        //     if (navList.includes(routeEm[route.id])) {
        //         debugger;
        //     //     if (parentPath) {
        //     //         history.push(`${parentPath}/${route.id}`);
        //     //         return true;
        //     //     } else {
        //     //         history.push(`/${route.id}`);
        //     //         return true;
        //     //     }
        //     //     // setDefaultRoute(route.id);
        //     // }
        //     // if (route.children) {
        //     //     for (const Route of route.children) {
        //     //         routesChange(Route, `/${route.id}`);
        //     //     }
        //     // }
        //     // return false;
        // };
        let id = '';
        if (parentPath) {
            id = parentPath + `/${route.id}`;
        } else {
            id = `/${route.id}`;
        }
        // debugger;
        const paths = path.split('/');
        if (routeEm[route.id] === paths[paths.length - 1]) {
            console.log('path', route.id);
            history.push(id);
            return true;
        }
        if (route.children) {
            for (const Route of route.children) {
                const flag = routesChange(Route, id, path);
                if (flag) {
                    return true;
                }
            }
        }
    };

    useEffect(() => {
        // setLoading(true);
        fetcher('/component_tabs').then((res: any) => {
            console.log('component_tabs', res);

            setNavlist(res);
        });
    }, []);
    useEffect(() => {
        // const defaultRoute = routes;
        if (navList.length > 0 && pathname) {
            console.log('pathname', pathname);

            // routesChange(route, '', path);
            // debugger;
            // const path = routeEm[pathNames];
            if (pathname === '/index') {
                const path = navList[0];
                // for (const route of routes) {
                //     routesChange(route, '', path);
                // }
                for (let index = 0; index < routes.length; index++) {
                    const route = routes[index];
                    const flag = routesChange(route, '', path);
                    if (flag) {
                        return;
                    }
                }
            } else {
                const path = pathname;
                //
                for (let index = 0; index < routes.length; index++) {
                    const route = routes[index];
                    const flag = routesChange(route, '', path);
                    if (flag) {
                        return;
                    }
                }
            }

            // const route = navList[navList.length - 1];
            // debugger;
            // routesChange(route);
        }
    }, [navList]);
    useEffect(() => {
        setNavItemsInNavbar(oldItems =>
            componentsInNavbar.map(item => {
                const children = item.children?.map((child: any) => ({
                    ...child,
                    active: child.path === currentPath
                }));
                if (item.children && !item.path) {
                    const child = item.children.find((child: any) => child.path === currentPath);
                    if (child) {
                        return {
                            ...item,
                            cid: child.id,
                            name: child.name,
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
                                name: item.children?.find((c: any) => c.id === oldItem.cid)?.name ?? item.name,
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
    }, [componentsInNavbar, currentPath, navList]);
    console.log('componentsInNavbar', componentsInNavbar);

    return (
        <Nav>
            <div className="left">
                <Logo href={appendApiToken(BASE_URI + '/index')}>
                    <img alt="PaddlePaddle" src={PUBLIC_PATH + logo} />
                    <span>VisualDL</span>
                </Logo>
                {navItemsInNavbar.map(item => {
                    if (item.children) {
                        return (
                            <SubNav
                                menu={item.children}
                                active={item.active}
                                path={item.path}
                                key={item.active ? `${item.id}-activated` : item.id}
                            >
                                {item.name}
                            </SubNav>
                        );
                    }
                    return (
                        <NavbarItem active={item.active} path={item.path} key={item.id}>
                            {item.name}
                        </NavbarItem>
                    );
                })}
                {componentsInMoreMenu.length ? (
                    <SubNav menu={componentsInMoreMenu} showDropdownIcon>
                        {t('common:more')}
                    </SubNav>
                ) : null}
            </div>
            <div className="right">
                <Tippy
                    placement="bottom-end"
                    animation="shift-away-subtle"
                    interactive
                    arrow={false}
                    offset={[18, 0]}
                    hideOnClick={false}
                    role="menu"
                    content={
                        <SubNavWrapper>
                            <ThemeToggle />
                        </SubNavWrapper>
                    }
                >
                    <NavItem className="nav-item">
                        <Icon type="theme" />
                    </NavItem>
                </Tippy>
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
