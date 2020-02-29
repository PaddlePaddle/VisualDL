import React, {FunctionComponent} from 'react';
import styled from 'styled-components';
import {
    WithStyled,
    em,
    primaryColor,
    backgroundColor,
    borderColor,
    textInvertColor,
    textColor,
    borderRadius,
    borderFocusedColor,
    duration,
    easing,
    transitions,
    size
} from '~/utils/style';

const height = em(36);

const Wrapper = styled.nav`
    display: flex;
    user-select: none;
`;

const Ul = styled.ul`
    display: inline-flex;
    list-style: none;
    margin: 0;
    padding: 0;
`;

const Li = styled.li`
    list-style: none;
    margin-left: ${em(10)};

    &:first-child {
        margin-left: 0;
    }
`;

const A = styled.a<{current?: boolean}>`
    cursor: pointer;
    display: block;
    background-color: ${props => (props.current ? primaryColor : backgroundColor)};
    color: ${props => (props.current ? textInvertColor : textColor)};
    height: ${height};
    line-height: calc(${height} - 2px);
    min-width: ${height};
    padding: 0 ${em(10)};
    text-align: center;
    border: 1px solid ${props => (props.current ? primaryColor : borderColor)};
    border-radius: ${borderRadius};
    ${transitions(['color', 'border-color', 'background-color'], `${duration} ${easing}`)}

    &:hover {
        border-color: ${props => (props.current ? primaryColor : borderFocusedColor)};
    }
`;

const Span = styled.span`
    display: block;
    ${size(height)}
    line-height: ${height};
    text-align: center;
`;

type PaginationProps = {
    page: number;
    total: number;
    onChange?: (page: number) => unknown;
};

const Pagination: FunctionComponent<PaginationProps & WithStyled> = ({page, total, className, onChange}) => {
    const padding = 2;
    const around = 2;

    const startEllipsis = page - padding - around - 1 > 0;
    const endEllipsis = page + padding + around < total;
    const start =
        page - around - 1 <= 0 ? [] : Array.from(new Array(Math.min(padding, page - around - 1)), (_v, i) => i + 1);
    const end =
        page + around >= total
            ? []
            : Array.from(
                  new Array(Math.min(padding, total - page - around)),
                  (_v, i) => total - padding + i + 1 + Math.max(padding - total + page + around, 0)
              );
    const before =
        page - 1 <= 0
            ? []
            : Array.from(
                  new Array(Math.min(around, page - 1)),
                  (_v, i) => page - around + i + Math.max(around - page + 1, 0)
              );
    const after = page >= total ? [] : Array.from(new Array(Math.min(around, total - page)), (_v, i) => page + i + 1);

    const genLink = (arr: number[]) =>
        arr.map(i => (
            <Li key={i}>
                <A onClick={() => onChange?.(i)}>{i}</A>
            </Li>
        ));
    const hellip = (
        <Li>
            <Span>&hellip;</Span>
        </Li>
    );

    return (
        <Wrapper className={className}>
            <Ul>
                {genLink(start)}
                {startEllipsis && hellip}
                {genLink(before)}
                <Li>
                    <A current>{page}</A>
                </Li>
                {genLink(after)}
                {endEllipsis && hellip}
                {genLink(end)}
            </Ul>
        </Wrapper>
    );
};

export default Pagination;
