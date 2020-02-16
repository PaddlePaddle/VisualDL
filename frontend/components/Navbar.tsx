import Vue from 'vue';
import {createComponent} from '@vue/composition-api';
import styled from 'vue-styled-components';
import {rem, primaryColor} from '~/plugins/style';
import logo from '~/assets/images/logo.svg';

const Nav = styled.nav`
    background-color: ${primaryColor};
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
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    font-weight: 600;
    padding-right: ${rem(40)};
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

// const NavItem = styled(Vue.component('nuxt-link'))`
const NavItem = styled.a`
    padding: 0 ${rem(20)};
`;

const NavItemText = styled.span`
    padding: ${rem(20)} 0 ${rem(17)};
    border-bottom: ${rem(3)} solid #596CD6;
    text-transform: uppercase;
`;

export default createComponent({
    setup(props, {root: {$i18n}}) {
        return () => (
            <Nav>
                <Logo href="/">
                    <LogoImg alt="PaddlePaddle" src={logo}></LogoImg>
                    <LogoText>Visual DL</LogoText>
                </Logo>
                <NavItem>
                    <NavItemText>{$i18n.t('global.metrics')}</NavItemText>
                </NavItem>
            </Nav>
        );
    }
});
