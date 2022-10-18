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

import React, {FunctionComponent, useCallback, useEffect, useMemo, useState} from 'react';
import {
    WithStyled,
    borderRadius,
    borderRadiusShortHand,
    css,
    ellipsis,
    em,
    math,
    sameBorder,
    size,
    transitionProps,
    zIndexes
} from '~/utils/style';

import Checkbox from '~/components/Checkbox';
import Icon from '~/components/Icon';
import styled from 'styled-components';
import useClickOutside from '~/hooks/useClickOutside';
import {useTranslation} from 'react-i18next';
import without from 'lodash/without';

export const padding = em(8);
export const height = em(36);

const Wrapper = styled.div<{opened?: boolean}>`
    --height: ${height};
    --padding: ${padding};
    height: var(--height);
    line-height: calc(var(--height) - 2px);
    max-width: 100%;
    display: inline-block;
    position: relative;
    background-color: var(--background-color);
    ${sameBorder({radius: true})}
    ${props => (props.opened ? borderRadiusShortHand('bottom', '0') : '')}
    ${transitionProps('border-color', 'background-color')}

    &:hover {
        border-color: var(--border-focused-color);
    }
`;

const Trigger = styled.div<{selected?: boolean}>`
    padding: var(--padding);
    display: inline-flex;
    ${size('100%')}
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    ${props => (props.selected ? '' : 'color: var(--text-lighter-color)')}
    ${transitionProps('color')}
`;

const TriggerIcon = styled(Icon)<{opened?: boolean}>`
    ${size(em(14))}
    text-align: center;
    display: block;
    flex-shrink: 0;
    transform: rotate(${props => (props.opened ? '180' : '0')}deg) scale(${10 / 14});
    ${transitionProps('transform')}
`;

const Label = styled.span`
    height:100%
    flex-grow: 1;
    padding-right: ${em(10)};
    line-height: ${em(18)};
    ${ellipsis()}
`;

const List = styled.div<{opened?: boolean; empty?: boolean; direction?: 'bottom' | 'top'}>`
    position: absolute;
    ${props =>
        props.direction === 'top'
            ? {
                  bottom: '100%',
                  borderBottomColor: 'var(--border-color)',
                  boxShadow: '0 -5px 6px 0 rgba(0, 0, 0, 0.05)',
                  ...borderRadiusShortHand('top', borderRadius)
              }
            : {
                  top: '100%',
                  borderTopColor: 'var(--border-color)',
                  boxShadow: '0 5px 6px 0 rgba(0, 0, 0, 0.05)',
                  ...borderRadiusShortHand('bottom', borderRadius)
              }}
    width: calc(100% + 2px);
    max-height: ${math(`4.35 * ${height} + 2 * ${padding}`)};
    overflow-x: hidden;
    overflow-y: auto;
    left: -1px;
    padding: ${padding} 0;
    border: inherit;
    display: ${props => (props.opened ? 'block' : 'none')};
    z-index: ${zIndexes.component};
    line-height: 1;
    background-color: inherit;
    ${transitionProps(['border-color', 'color'])}
    ${props =>
        props.empty
            ? {
                  color: 'var(--text-lighter-color)',
                  textAlign: 'center'
              }
            : ''}
`;

const listItem = css`
    display: block;
    cursor: pointer;
    padding: 0 ${padding};
    ${size(height, '100%')}
    line-height: ${height};
    ${transitionProps(['color', 'background-color'])}
`;

const hoverListItem = css`
    &:hover {
        background-color: var(--background-focused-color);
    }
`;

const ListItem = styled.div<{selected?: boolean; disabled?: boolean}>`
    ${ellipsis()}
    ${listItem}
    ${props => {
        if (props.disabled) {
            return css`
                cursor: not-allowed;
            `;
        } else {
            return hoverListItem;
        }
    }}
    ${props => {
        if (props.selected) {
            return css`
                color: var(--select-selected-text-color);
            `;
        }
        if (props.disabled) {
            return css`
                color: var(--text-light-color);
            `;
        }
    }}
`;

const MultipleListItem = styled(Checkbox)<{selected?: boolean; disabled?: boolean}>`
    ${listItem}
    display: flex;
    align-items: center;
    ${props => (props.disabled ? '' : hoverListItem)}
`;

type OnSingleChange<T> = (value: T) => unknown;
type OnMultipleChange<T> = (value: T[]) => unknown;

export type SelectListItem<T> = {
    value: T;
    label: string;
    disabled?: boolean;
};

export type SelectProps<T> = {
    list?: (SelectListItem<T> | T)[];
    placeholder?: string;
    direction?: 'bottom' | 'top';
} & (
    | {
          value?: T;
          onChange?: OnSingleChange<T>;
          multiple?: false;
      }
    | {
          value?: T[];
          onChange?: OnMultipleChange<T>;
          multiple: true;
      }
);

const Select = <T extends unknown>({
    list: propList,
    value: propValue,
    placeholder,
    direction,
    multiple,
    className,
    onChange
}: SelectProps<T> & WithStyled): ReturnType<FunctionComponent> => {
    const {t} = useTranslation('common');

    const [isOpened, setIsOpened] = useState(false);
    const toggleOpened = useCallback(() => setIsOpened(!isOpened), [isOpened]);
    const closeDropdown = useCallback(() => setIsOpened(false), []);

    const [value, setValue] = useState(multiple ? (Array.isArray(propValue) ? propValue : []) : propValue);
    useEffect(
        () => setValue(multiple ? (Array.isArray(propValue) ? propValue : []) : propValue),
        [multiple, propValue]
    );

    const changeValue = useCallback(
        ({value: mutateValue, disabled}: SelectListItem<T>) => {
            if (disabled) {
                return;
            }
            setValue(mutateValue);
            (onChange as OnSingleChange<T>)?.(mutateValue);
            closeDropdown();
        },
        [closeDropdown, onChange]
    );
    const changeMultipleValue = useCallback(
        ({value: mutateValue, disabled}: SelectListItem<T>, checked: boolean) => {
            if (disabled) {
                return;
            }
            let newValue = value as T[];
            if (checked) {
                if (!newValue.includes(mutateValue)) {
                    newValue = [...newValue, mutateValue];
                }
            } else {
                if (newValue.includes(mutateValue)) {
                    newValue = without(newValue, mutateValue);
                }
            }
            setValue(newValue);
            (onChange as OnMultipleChange<T>)?.(newValue);
        },
        [value, onChange]
    );

    const ref = useClickOutside<HTMLDivElement>(closeDropdown);

    const list = useMemo<SelectListItem<T>[]>(
        () =>
            propList?.map(item =>
                ['string', 'number'].includes(typeof item)
                    ? {value: item as T, label: item + ''}
                    : (item as SelectListItem<T>)
            ) ?? [],
        [propList]
    );
    const isListEmpty = useMemo(() => list.length === 0, [list]);

    const isSelected = useMemo(
        () =>
            !!(multiple
                ? (value as T[]) && (value as T[]).length !== 0
                : !(value == (null as T) || list.findIndex(i => i.value === value) === -1)),
        [list, multiple, value]
    );

    const findLabelByValue = useCallback((v: T) => list.find(item => item.value === v)?.label ?? '', [list]);
    const label = useMemo(
        () =>
            isSelected
                ? multiple
                    ? (value as T[]).map(findLabelByValue).join(' / ')
                    : findLabelByValue(value as T)
                : placeholder || t('common:select'),
        [multiple, value, findLabelByValue, isSelected, placeholder, t]
    );

    return (
        <Wrapper ref={ref} opened={isOpened} className={className}>
            <Trigger onClick={toggleOpened} selected={isSelected} title={isSelected && label ? String(label) : ''}>
                <Label>{label}</Label>
                <TriggerIcon opened={isOpened} type="chevron-down" />
            </Trigger>
            <List className="list" opened={isOpened} empty={isListEmpty} direction={direction}>
                {isListEmpty
                    ? t('common:empty')
                    : list.map((item, index) => {
                          if (multiple) {
                              return (
                                  <MultipleListItem
                                      checked={(value as T[]).includes(item.value)}
                                      key={index}
                                      title={item.label}
                                      disabled={item.disabled}
                                      size="small"
                                      onChange={checked => changeMultipleValue(item, checked)}
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
                                  disabled={item.disabled}
                                  onClick={() => changeValue(item)}
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
