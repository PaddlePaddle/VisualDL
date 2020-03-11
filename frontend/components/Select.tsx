import React, {FunctionComponent, useState, useCallback, useEffect, useMemo} from 'react';
import styled from 'styled-components';
import without from 'lodash/without';
import {useTranslation} from '~/utils/i18n';
import useClickOutside from '~/hooks/useClickOutside';
import {
    WithStyled,
    em,
    backgroundColor,
    backgroundFocusedColor,
    textLighterColor,
    selectedColor,
    borderColor,
    borderFocusedColor,
    borderRadius,
    duration,
    easing,
    ellipsis,
    transitions,
    math,
    css
} from '~/utils/style';
import Checkbox from '~/components/Checkbox';
import Icon from '~/components/Icon';

export const padding = em(10);
export const height = em(36);
const minWidth = em(160);

// prettier-ignore
const Wrapper = styled.div<{opened?: boolean}>`
    height: ${height};
    line-height: calc(${height} - 2px);
    min-width: ${minWidth};
    max-width: 100%;
    display: inline-block;
    position: relative;
    border: 1px solid ${borderColor};
    /* eslint-disable-next-line */
    border-radius: ${borderRadius} ${borderRadius} ${props => (props.opened ? '0 0' : `${borderRadius} ${borderRadius}`)};
    transition: border-color ${duration} ${easing};
    background-color: ${backgroundColor};

    &:hover {
        border-color: ${borderFocusedColor};
    }
`;

const Trigger = styled.div<{selected?: boolean}>`
    padding: ${padding};
    display: inline-flex;
    width: 100%;
    height: 100%;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    ${props => (props.selected ? '' : `color: ${textLighterColor}`)}
`;

const TriggerIcon = styled(Icon)<{opened?: boolean}>`
    width: ${em(14)};
    height: ${em(14)};
    text-align: center;
    display: block;
    flex-shrink: 0;
    transform: rotate(${props => (props.opened ? '180' : '0')}deg) scale(${10 / 14});
    transition: transform ${duration} ${easing};
`;

const Label = styled.span`
    flex-grow: 1;
    padding-right: ${em(10)};
    ${ellipsis()}
`;

const List = styled.div<{opened?: boolean; empty?: boolean}>`
    position: absolute;
    top: 100%;
    width: calc(100% + 2px);
    max-height: ${math(`4.35 * ${height} + 2 * ${padding}`)};
    overflow-x: hidden;
    overflow-y: auto;
    left: -1px;
    padding: ${padding} 0;
    border: inherit;
    border-top-color: ${borderColor};
    border-radius: 0 0 ${borderRadius} ${borderRadius};
    display: ${props => (props.opened ? 'block' : 'none')};
    z-index: 9999;
    line-height: 1;
    background-color: inherit;
    box-shadow: 0 5px 6px 0 rgba(0, 0, 0, 0.05);
    ${props =>
        props.empty
            ? `
                color: ${textLighterColor};
                text-align: center;
            `
            : ''}
`;

const listItem = css`
    display: block;
    cursor: pointer;
    padding: 0 ${padding};
    height: ${height};
    line-height: ${height};
    width: 100%;
    ${transitions(['color', 'background-color'], `${duration} ${easing}`)}
    &:hover {
        background-color: ${backgroundFocusedColor};
    }
`;

const ListItem = styled.div<{selected?: boolean}>`
    ${ellipsis()}
    ${listItem}
    ${props => (props.selected ? `color: ${selectedColor};` : '')}
`;

const MultipleListItem = styled(Checkbox)<{selected?: boolean}>`
    ${listItem}
    display: flex;
    align-items: center;
`;

export type SelectValueType = string | number | symbol;

type SelectListItem<T> = {
    value: T;
    label: string;
};

type SelectProps<T> = {
    list?: (SelectListItem<T> | string)[];
    value?: T | T[];
    onChange?: (value: T | T[]) => unknown;
    multiple?: boolean;
    placeholder?: string;
};

const Select: FunctionComponent<SelectProps<SelectValueType> & WithStyled> = ({
    list: propList,
    value: propValue,
    placeholder,
    multiple,
    className,
    onChange
}) => {
    const {t} = useTranslation('common');

    const [isOpened, setIsOpened] = useState(false);
    const toggleOpened = useCallback(() => setIsOpened(!isOpened), [isOpened]);
    const setIsOpenedFalse = useCallback(() => setIsOpened(false), []);

    const [value, setValue] = useState(multiple ? (Array.isArray(propValue) ? propValue : []) : propValue);
    useEffect(() => setValue(multiple ? (Array.isArray(propValue) ? propValue : []) : propValue), [
        multiple,
        propValue,
        setValue
    ]);

    const isSelected = useMemo(
        () => !!(multiple ? value && (value as SelectValueType[]).length !== 0 : (value as SelectValueType)),
        [multiple, value]
    );
    const changeValue = useCallback(
        (mutateValue: SelectValueType, checked?: boolean) => {
            let newValue;
            if (multiple) {
                newValue = value as SelectValueType[];
                if (checked) {
                    if (!newValue.includes(mutateValue)) {
                        newValue = [...newValue, mutateValue];
                    }
                } else {
                    if (newValue.includes(mutateValue)) {
                        newValue = without(newValue, mutateValue);
                    }
                }
            } else {
                newValue = mutateValue;
            }
            setValue(newValue);
            onChange?.(newValue);
            if (!multiple) {
                setIsOpenedFalse();
            }
        },
        [multiple, value, setIsOpenedFalse, onChange]
    );

    const ref = useClickOutside(setIsOpenedFalse);

    const list = useMemo(
        () => propList?.map(item => ('string' === typeof item ? {value: item, label: item} : item)) ?? [],
        [propList]
    );
    const isListEmpty = useMemo(() => list.length === 0, [list]);

    const findLabelByValue = useCallback((v: SelectValueType) => list.find(item => item.value === v)?.label ?? '', [
        list
    ]);
    const label = useMemo(
        () =>
            isSelected
                ? multiple
                    ? (value as SelectValueType[]).map(findLabelByValue).join(' / ')
                    : findLabelByValue(value as SelectValueType)
                : placeholder || t('select'),
        [multiple, value, findLabelByValue, isSelected, placeholder, t]
    );

    return (
        <Wrapper ref={ref} opened={isOpened} className={className}>
            <Trigger onClick={toggleOpened} selected={isSelected} title={isSelected && label ? String(label) : ''}>
                <Label>{label}</Label>
                <TriggerIcon opened={isOpened} type="chevron-down" />
            </Trigger>
            <List opened={isOpened} empty={isListEmpty}>
                {isListEmpty
                    ? t('empty')
                    : list.map((item, index) => {
                          if (multiple) {
                              return (
                                  <MultipleListItem
                                      value={(value as SelectValueType[]).includes(item.value)}
                                      key={index}
                                      title={item.label}
                                      size="small"
                                      onChange={checked => changeValue(item.value, checked)}
                                  >
                                      {item.label}
                                  </MultipleListItem>
                              );
                          }
                          return (
                              <ListItem
                                  selected={item.value === value}
                                  key={index}
                                  title={item.label}
                                  onClick={() => changeValue(item.value)}
                              >
                                  {item.label}
                              </ListItem>
                          );
                      })}
            </List>
        </Wrapper>
    );
};

export default Select;
