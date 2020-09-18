import React, {FunctionComponent, useCallback, useState} from 'react';
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

export type ChartTooboxItem = NormalChartToolboxItem | ToggleChartToolboxItem;

type ChartToolboxProps = {
    items: ChartTooboxItem[];
    reversed?: boolean;
    tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
};

const ChartToolbox: FunctionComponent<ChartToolboxProps & WithStyled> = ({
    tooltipPlacement,
    items,
    reversed,
    className
}) => {
    const [activeStatus, setActiveStatus] = useState<boolean[]>(new Array(items.length).fill(false));
    const onClick = useCallback(
        (index: number) => {
            const item = items[index];
            if (item.toggle) {
                item.onClick?.(!activeStatus[index]);
                setActiveStatus(m => {
                    const n = [...m];
                    n.splice(index, 1, !m[index]);
                    return n;
                });
            } else {
                item.onClick?.();
            }
        },
        [items, activeStatus]
    );

    const getToolboxItem = useCallback(
        (item: ChartTooboxItem, index: number) => (
            <ToolboxItem
                key={index}
                active={item.toggle && !item.activeIcon && activeStatus[index]}
                onClick={() => onClick(index)}
            >
                <Icon type={item.toggle ? (activeStatus[index] && item.activeIcon) || item.icon : item.icon} />
            </ToolboxItem>
        ),
        [activeStatus, onClick]
    );

    return (
        <>
            <Toolbox className={className} size={items.length} reversed={reversed}>
                {items.map((item, index) =>
                    item.tooltip ? (
                        <Tippy
                            content={
                                item.toggle ? (activeStatus[index] && item.activeTooltip) || item.tooltip : item.tooltip
                            }
                            placement={tooltipPlacement || 'top'}
                            theme="tooltip"
                            key={index}
                        >
                            {getToolboxItem(item, index)}
                        </Tippy>
                    ) : (
                        getToolboxItem(item, index)
                    )
                )}
            </Toolbox>
        </>
    );
};

export default ChartToolbox;
