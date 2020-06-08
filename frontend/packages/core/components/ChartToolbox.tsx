import React, {FunctionComponent, useCallback, useState} from 'react';
import {
    WithStyled,
    em,
    primaryActiveColor,
    primaryColor,
    primaryFocusedColor,
    rem,
    textColor,
    textLightColor,
    textLighterColor,
    tooltipBackgroundColor,
    tooltipTextColor,
    transitionProps
} from '~/utils/style';

import Icon from '~/components/Icon';
import ReactTooltip from 'react-tooltip';
import {nanoid} from 'nanoid';
import styled from 'styled-components';

const Toolbox = styled.div<{reversed?: boolean}>`
    font-size: ${em(16)};
    line-height: 1;
    display: flex;
    flex-direction: ${props => (props.reversed ? 'row-reverse' : 'row')};
    align-items: center;
`;

const ToolboxItem = styled.a<{active?: boolean; reversed?: boolean}>`
    cursor: pointer;
    color: ${props => (props.active ? primaryColor : textLighterColor)};
    ${transitionProps('color')}

    &:hover {
        color: ${props => (props.active ? primaryFocusedColor : textLightColor)};
    }

    &:active {
        color: ${props => (props.active ? primaryActiveColor : textColor)};
    }

    & + & {
        ${props => `margin-${props.reversed ? 'right' : 'left'}: ${rem(14)};`}
    }
`;

type BaseChartToolboxItem = {
    icon: string;
    tooltip?: string;
};

type NormalChartToolboxItem = {
    toggle?: false;
    onClick?: () => unknown;
} & BaseChartToolboxItem;

type ToggleChartToolboxItem = {
    toggle: true;
    activeIcon?: string;
    activeTooltip?: string;
    onClick?: (value: boolean) => unknown;
} & BaseChartToolboxItem;

export type ChartTooboxItem = NormalChartToolboxItem | ToggleChartToolboxItem;

type ChartToolboxProps = {
    cid?: string;
    items: ChartTooboxItem[];
    reversed?: boolean;
    tooltipPlace?: 'top' | 'bottom' | 'left' | 'right';
};

const ChartToolbox: FunctionComponent<ChartToolboxProps & WithStyled> = ({
    cid,
    items,
    reversed,
    tooltipPlace,
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

    const [id] = useState(`chart-toolbox-tooltip-${cid || nanoid()}`);

    return (
        <>
            <Toolbox className={className} reversed={reversed}>
                {items.map((item, index) => (
                    <ToolboxItem
                        key={index}
                        reversed={reversed}
                        active={item.toggle && !item.activeIcon && activeStatus[index]}
                        onClick={() => onClick(index)}
                        data-for={item.tooltip ? id : null}
                        data-tip={
                            item.tooltip
                                ? item.toggle
                                    ? (activeStatus[index] && item.activeTooltip) || item.tooltip
                                    : item.tooltip
                                : null
                        }
                    >
                        <Icon type={item.toggle ? (activeStatus[index] && item.activeIcon) || item.icon : item.icon} />
                    </ToolboxItem>
                ))}
            </Toolbox>
            <ReactTooltip
                id={id}
                place={tooltipPlace ?? 'top'}
                textColor={tooltipTextColor}
                backgroundColor={tooltipBackgroundColor}
                effect="solid"
            />
        </>
    );
};

export default ChartToolbox;
