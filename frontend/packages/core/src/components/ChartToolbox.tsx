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

import React, {FunctionComponent, useCallback, useContext, useMemo, useState} from 'react';
import {WithStyled, em, rem, transitionProps} from '~/utils/style';

import Icon from '~/components/Icon';
import type {Icons} from '~/components/Icon';
import Tippy from '@tippyjs/react';
import styled from 'styled-components';

const Toolbox = styled.div<{size?: number; reversed?: boolean}>`
    font-size: ${em(16)};
    line-height: 1;
    height: 1em;
    display: grid;
    grid-template-columns: ${props => (props.size == null ? 'repeat(auto-fill, 1em)' : `repeat(${props.size}, 1em)`)};
    grid-gap: ${rem(14)};
    place-items: center;
    justify-content: ${props => (props.reversed ? 'end' : 'start')};
    align-content: center;
`;

const ToolboxItem = styled.a<{active?: boolean}>`
    cursor: pointer;
    color: ${props => (props.active ? 'var(--primary-color)' : 'var(--text-lighter-color)')};
    ${transitionProps('color')}

    &:hover {
        color: ${props => (props.active ? 'var(--primary-focused-color)' : 'var(--text-light-color)')};
    }

    &:active {
        color: ${props => (props.active ? 'var(--primary-active-color)' : 'var(--text-color)')};
    }
`;

const ChartToolboxMenuWrapper = styled.div`
    background-color: var(--background-color);
    ${transitionProps('background-color')};

    > a {
        cursor: pointer;
        display: block;
        padding: ${rem(10)};
        background-color: var(--background-color);
        ${transitionProps(['color', 'background-color'])};

        &:hover {
            background-color: var(--background-focused-color);
        }
    }
`;

const ChartToolboxMenuIcon = styled(Icon)`
    vertical-align: middle;
    font-size: 78%;
    margin-left: 0.6em;
`;

interface ChartToolboxItemChild {
    label: string;
    onClick?: () => unknown;
    children?: ChartToolboxItemChild[];
}

type BaseChartToolboxItem = {
    icon: Icons;
    tooltip?: string;
};

type NormalChartToolboxItem = {
    toggle?: false;
    onClick?: () => unknown;
} & BaseChartToolboxItem;

type ToggleChartToolboxItem = {
    toggle: true;
    activeIcon?: Icons;
    activeTooltip?: string;
    onClick?: (value: boolean) => unknown;
} & BaseChartToolboxItem;

type MenuChartToolboxItem = {
    toggle?: false;
    tooltip: undefined;
    menuList: ChartToolboxItemChild[];
} & BaseChartToolboxItem;

export type ChartToolboxItem = NormalChartToolboxItem | ToggleChartToolboxItem | MenuChartToolboxItem;

const ChartToolboxIcon = React.forwardRef<
    HTMLAnchorElement,
    {
        toggle?: boolean;
        icon: Icons;
        activeIcon?: Icons;
        activeStatus?: boolean;
        onClick?: () => unknown;
    }
>(({toggle, icon, activeIcon, activeStatus, onClick}, ref) => {
    return (
        <ToolboxItem ref={ref} active={toggle && !activeIcon && activeStatus} onClick={() => onClick?.()}>
            <Icon type={toggle ? (activeStatus && activeIcon) || icon : icon} />
        </ToolboxItem>
    );
});

ChartToolboxIcon.displayName = 'ChartToolboxIcon';

type ChartToolboxItemProps = {
    tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
};

type ChartToolboxProps = {
    items: ChartToolboxItem[];
    reversed?: boolean;
} & ChartToolboxItemProps;

const ChartToolboxItemContext = React.createContext<ChartToolboxItemProps>({
    tooltipPlacement: 'top'
});

const NormalChartToolbox: FunctionComponent<NormalChartToolboxItem> = ({icon, tooltip, onClick}) => {
    const toolboxIcon = useMemo(() => <ChartToolboxIcon icon={icon} onClick={onClick} />, [icon, onClick]);
    const {tooltipPlacement} = useContext(ChartToolboxItemContext);

    return tooltip ? (
        <Tippy content={tooltip} placement={tooltipPlacement || 'top'} theme="tooltip">
            {toolboxIcon}
        </Tippy>
    ) : (
        toolboxIcon
    );
};

const ToggleChartToolbox: FunctionComponent<ToggleChartToolboxItem> = ({
    icon,
    tooltip,
    activeIcon,
    activeTooltip,
    onClick
}) => {
    const [active, setActive] = useState(false);
    const click = useCallback(() => {
        setActive(a => {
            onClick?.(!a);
            return !a;
        });
    }, [onClick]);
    const toolboxIcon = useMemo(
        () => <ChartToolboxIcon icon={icon} activeIcon={activeIcon} activeStatus={active} toggle onClick={click} />,
        [icon, activeIcon, active, click]
    );
    const {tooltipPlacement} = useContext(ChartToolboxItemContext);

    return tooltip ? (
        <Tippy content={(active && activeTooltip) || tooltip} placement={tooltipPlacement || 'top'} theme="tooltip">
            {toolboxIcon}
        </Tippy>
    ) : (
        toolboxIcon
    );
};

const ChartToolboxMenu: FunctionComponent<ChartToolboxItemChild> = ({label, onClick, children}) => {
    return children ? (
        <Tippy
            content={
                <ChartToolboxMenuWrapper>
                    {children.map((item, index) => (
                        <ChartToolboxMenu {...item} key={index} />
                    ))}
                </ChartToolboxMenuWrapper>
            }
            placement="right-start"
            animation="shift-away-subtle"
            interactive
            hideOnClick={false}
            arrow={false}
            role="menu"
            theme="menu"
            offset={[0, 0]}
        >
            <a>
                {label} <ChartToolboxMenuIcon type="chevron-right" />
            </a>
        </Tippy>
    ) : (
        <ChartToolboxMenuWrapper>
            <a onClick={() => onClick?.()}>{label}</a>
        </ChartToolboxMenuWrapper>
    );
};

const MenuChartToolbox: FunctionComponent<MenuChartToolboxItem> = ({icon, menuList}) => {
    return (
        <Tippy
            content={
                <ChartToolboxMenuWrapper>
                    {menuList.map((item, index) => (
                        <ChartToolboxMenu {...item} key={index} />
                    ))}
                </ChartToolboxMenuWrapper>
            }
            placement="right-start"
            animation="shift-away-subtle"
            interactive
            hideOnClick={false}
            arrow={false}
            role="menu"
            theme="menu"
        >
            <ChartToolboxIcon icon={icon} />
        </Tippy>
    );
};

const ChartToolbox: FunctionComponent<ChartToolboxProps & WithStyled> = ({
    tooltipPlacement,
    items,
    reversed,
    className
}) => {
    const contextValue = useMemo(() => ({tooltipPlacement}), [tooltipPlacement]);

    return (
        <>
            <Toolbox className={className} size={items.length} reversed={reversed}>
                <ChartToolboxItemContext.Provider value={contextValue}>
                    {items.map((item, index) => {
                        if ((item as MenuChartToolboxItem).menuList) {
                            const i = item as MenuChartToolboxItem;
                            return <MenuChartToolbox {...i} key={index} />;
                        }
                        if ((item as ToggleChartToolboxItem).toggle) {
                            const i = item as ToggleChartToolboxItem;
                            return <ToggleChartToolbox {...i} key={index} />;
                        }
                        const i = item as NormalChartToolboxItem;
                        return <NormalChartToolbox {...i} key={index} />;
                    })}
                </ChartToolboxItemContext.Provider>
            </Toolbox>
        </>
    );
};

export default ChartToolbox;
