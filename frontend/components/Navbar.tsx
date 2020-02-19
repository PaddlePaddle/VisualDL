import React from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'next/router';
// https://github.com/zeit/next.js/issues/9424
import {WithRouterProps} from 'next/dist/client/with-router';
import {WithTranslation} from 'next-i18next';
import {withTranslation, Link} from '~/utils/i18n';
import {styled, rem, headerColor, duration, easing, lighten} from '~/utils/style';

const navItems = ['metrics', 'samples'];

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
    transition: background-color ${duration} ${easing};

    &:hover {
        background-color: ${lighten(0.05, headerColor)};
    }

    > span {
        padding: ${rem(10)} 0 ${rem(7)};
        border-bottom: ${rem(3)} solid ${props => (props.active ? '#596cd6' : 'transparent')};
        text-transform: uppercase;
    }
`;

class Navbar extends React.Component<WithTranslation & WithRouterProps> {
    static propTypes = {
        t: PropTypes.func.isRequired
    };

    render() {
        const {t, router} = this.props;
        return (
            <Nav>
                <Logo href="/">
                    <img alt="PaddlePaddle" src="/images/logo.svg" />
                    <span>Visual DL</span>
                </Logo>
                {navItems.map(name => {
                    const href = `/${name}`;
                    return (
                        // https://nextjs.org/docs/api-reference/next/link#if-the-child-is-a-custom-component-that-wraps-an-a-tag
                        <Link href={href} key={name} passHref>
                            <NavItem active={router.pathname === href}>
                                <span>{t(name)}</span>
                            </NavItem>
                        </Link>
                    );
                })}
            </Nav>
        );
    }
}

export default withTranslation('common')(withRouter(Navbar));
