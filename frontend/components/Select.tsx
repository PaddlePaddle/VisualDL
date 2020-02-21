import React, {FunctionComponent, useState, useCallback, useEffect, useRef} from 'react';
import capitalize from 'lodash/capitalize';
import {useTranslation} from '~/utils/i18n';
import {
    styled,
    WithStyled,
    em,
    backgroundColor,
    backgroundFocusedColor,
    textLightColor,
    selectedColor,
    borderColor,
    borderFocusedColor,
    borderRadius,
    duration,
    easing,
    ellipsis,
    transitions
} from '~/utils/style';

export const padding = em(10);
export const height = em(36);

// prettier-ignore
const Wrapper = styled.div<{opened?: boolean}>`
    width: 100%;
    height: ${height};
    line-height: calc(${height} - 2px);
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
    ${props => (props.selected ? '' : `color: ${textLightColor}`)}
`;

const Icon = styled.i<{opened?: boolean}>`
    width: ${em(20)};
    height: ${em(10)};
    display: block;
    background-image: url('/images/chevron-down.svg');
    background-size: 100% 100%;
    background-position: center center;
    background-repeat: no-repeat;
    flex-shrink: 0;
    transform: rotate(${props => (props.opened ? '180' : '0')}deg);
    transition: transform ${duration} ${easing};
`;

const Label = styled.span`
    flex-grow: 1;
`;

const List = styled.div<{opened?: boolean; empty?: boolean}>`
    position: absolute;
    top: 100%;
    width: calc(100% + 2px);
    left: -1px;
    padding: ${padding} 0;
    border: inherit;
    border-top-color: ${borderColor};
    border-radius: 0 0 ${borderRadius} ${borderRadius};
    display: ${props => (props.opened ? 'block' : 'none')};
    z-index: 9999;
    line-height: 1;
    background-color: inherit;
    ${props =>
        props.empty
            ? `
                color: ${textLightColor};
                text-align: center;
            `
            : ''}
`;

const ListItem = styled.div<{selected?: boolean}>`
    padding: 0 ${padding};
    height: ${height};
    line-height: ${height};
    cursor: pointer;
    width: 100%;
    ${ellipsis()}
    display: block;
    ${props => (props.selected ? `color: ${selectedColor};` : '')}
    ${transitions(['color', 'background-color'], `${duration} ${easing}`)}

    &:hover {
        background-color: ${backgroundFocusedColor};
    }
`;

type SelectValueType = string | number | symbol;

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
    const toggleOpened = () => setIsOpened(!isOpened);

    const [value, setValue] = useState(propValue);
    const isSelected = !!(multiple ? value && (value as SelectValueType[]).length !== 0 : (value as SelectValueType));
    const changeValue = (value: NonNullable<typeof propValue>) => {
        setValue(value);
        onChange?.(value);
        if (!multiple) {
            setIsOpened(false);
        }
    };

    const ref = useRef(null);
    const escapeListener = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsOpened(false);
        }
    }, []);
    const clickListener = useCallback(
        (e: MouseEvent) => {
            if (!(ref.current! as any).contains(e.target)) {
                setIsOpened(false);
            }
        },
        [ref.current]
    );
    if (process.browser) {
        useEffect(() => {
            document.addEventListener('click', clickListener);
            document.addEventListener('keyup', escapeListener);
            return () => {
                document.removeEventListener('click', clickListener);
                document.removeEventListener('keyup', escapeListener);
            };
        }, []);
    }

    const label = value || placeholder || t('select');

    const list = propList?.map(item => ('string' === typeof item ? {value: item, label: item} : item)) ?? [];
    const isListEmpty = list.length === 0;

    return (
        <Wrapper ref={ref} opened={isOpened} className={className}>
            <Trigger onClick={toggleOpened} selected={isSelected}>
                <Label>{label}</Label>
                <Icon opened={isOpened} />
            </Trigger>
            <List opened={isOpened} empty={isListEmpty}>
                {isListEmpty
                    ? capitalize(t('empty'))
                    : list.map((item, index) => (
                          <ListItem selected={item.value === value} key={index} onClick={() => changeValue(item.value)}>
                              {item.label}
                          </ListItem>
                      ))}
            </List>
        </Wrapper>
    );
};

export default Select;
