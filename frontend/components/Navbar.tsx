import React, {FunctionComponent} from 'react';
import styled from 'styled-components';
import {useRouter} from 'next/router';
import {useTranslation, Link} from '~/utils/i18n';
import {rem, headerColor, duration, easing, lighten, transitions} from '~/utils/style';

const navItems = ['scalars', 'samples', 'graphs', 'high-dimensional'];

const Nav = styled.nav`
    background-color: ${headerColor};
    color: #fff;
    height: 100%;
    width: 100%;
    padding: 0 ${rem(20)};
    display: flex;
    justify-content: flex-start;
    align-items: center;
`;

const Logo = styled.a`
    font-size: ${rem(20)};
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
        'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
    font-weight: 600;
    margin-right: ${rem(40)};

    > img {
        width: ${rem(98)};
        height: ${rem(31)};
        vertical-align: middle;
        margin-right: ${rem(8)};
    }

    > span {
        vertical-align: middle;
    }
`;

const NavItem = styled.a<{active: boolean}>`
    padding: 0 ${rem(20)};
    height: 100%;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    background-color: ${headerColor};
    ${transitions(['background-color'], `${duration} ${easing}`)}

    &:hover {
        background-color: ${lighten(0.05, headerColor)};
    }

    > span {
        padding: ${rem(10)} 0 ${rem(7)};
        border-bottom: ${rem(3)} solid ${props => (props.active ? '#596cd6' : 'transparent')};
        ${transitions(['border-bottom'], `${duration} ${easing}`)}
        text-transform: uppercase;
    }
`;

const Navbar: FunctionComponent = () => {
    const {t} = useTranslation('common');
    const {pathname} = useRouter();

    return (
        <Nav>
            <Logo href="/">
                <img alt="PaddlePaddle" src="/images/logo.svg" />
                <span>VisualDL</span>
            </Logo>
            {navItems.map(name => {
                const href = `/${name}`;
                return (
                    // https://nextjs.org/docs/api-reference/next/link#if-the-child-is-a-custom-component-that-wraps-an-a-tag
                    <Link href={href} key={name} passHref>
                        <NavItem active={pathname === href}>
                            <span>{t(name)}</span>
                        </NavItem>
                    </Link>
                );
            })}
        </Nav>
    );
};

export default Navbar;
