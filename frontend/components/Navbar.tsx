import {createComponent} from '@vue/composition-api';
import {RawLocation} from 'vue-router';
import {styled, rem, headerColor, styledNuxtLink, duration, easing, lighten} from '~/plugins/style';
import logo from '~/assets/images/logo.svg';

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
`;

const LogoImg = styled.img`
    width: ${rem(98)};
    height: ${rem(31)};
    vertical-align: middle;
    margin-right: ${rem(8)};
`;

const LogoText = styled.span`
    vertical-align: middle;
`;

const NavItem = styled.a`
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
`;

const NavItemText = styled.span`
    padding: ${rem(10)} 0 ${rem(7)};
    border-bottom: ${rem(3)} solid transparent;
    text-transform: uppercase;

    .nuxt-link-active & {
        border-bottom-color: #596cd6;
    }
`;

export default createComponent({
    name: 'Navbar',
    setup(_props, {root: {$i18n, $accessor}}) {
        const NavItemNuxtLink = styledNuxtLink(NavItem);

        const navItemRoute = (name: string): RawLocation => {
            return {
                name: `${$accessor.locale}__${name}`
            };
        };

        return () => (
            <Nav>
                <Logo href="/">
                    <LogoImg alt="PaddlePaddle" src={logo}></LogoImg>
                    <LogoText>Visual DL</LogoText>
                </Logo>
                {navItems.map(name => (
                    <NavItemNuxtLink to={navItemRoute(name)} key={name}>
                        <NavItemText>{$i18n.t(`global.${name}`)}</NavItemText>
                    </NavItemNuxtLink>
                ))}
            </Nav>
        );
    }
});
