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

const Toolbox = styled.div`
    font-size: ${em(16)};
    height: 1em;
    line-height: 1;
    margin-bottom: ${rem(18)};
    display: flex;
`;

const ToolboxItem = styled.a<{active?: boolean}>`
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
        margin-left: ${rem(14)};
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
};

const ChartToolbox: FunctionComponent<ChartToolboxProps & WithStyled> = ({cid, items, className}) => {
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
            <Toolbox className={className}>
                {items.map((item, index) => (
                    <ToolboxItem
                        key={index}
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
                place="top"
                textColor={tooltipTextColor}
                backgroundColor={tooltipBackgroundColor}
                effect="solid"
            />
        </>
    );
};

export default ChartToolbox;
