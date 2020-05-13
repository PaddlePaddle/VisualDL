// cSpell:words hellip

import React, {FunctionComponent, useCallback, useEffect, useState} from 'react';
import {WithStyled, em} from '~/utils/style';

import Button from '~/components/Button';
import Input from '~/components/Input';
import styled from 'styled-components';
import {useTranslation} from '~/utils/i18n';

const Wrapper = styled.nav`
    display: flex;
    justify-content: space-between;
    align-items: center;

    > div {
        > a:not(:last-child),
        > span {
            margin-right: ${em(15)};
        }
        > input {
            width: ${em(80)};
            margin-right: ${em(6)};
        }
    }
`;

type PaginationProps = {
    page?: number;
    total: number;
    onChange?: (page: number) => unknown;
};

const Pagination: FunctionComponent<PaginationProps & WithStyled> = ({page, total, className, onChange}) => {
    const {t} = useTranslation('common');

    const [currentPage, setCurrentPage] = useState(page ?? 1);
    const [jumpPage, setJumpPage] = useState('');

    useEffect(() => setCurrentPage(page ?? 1), [page]);

    const setPage = useCallback(
        (value: unknown) => {
            const p = 'number' === typeof value ? value : Number.parseInt(value + '');
            if (Number.isNaN(p) || p > total || p < 1 || p === currentPage) {
                return;
            }
            setCurrentPage(p);
            setJumpPage('');
            onChange?.(p);
        },
        [currentPage, onChange, total]
    );

    return (
        <Wrapper className={className}>
            <div>
                <Button disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>
                    {t('common:previous-page')}
                </Button>
                <Button disabled={currentPage >= total} onClick={() => setPage(currentPage + 1)}>
                    {t('common:next-page')}
                </Button>
            </div>
            <div>
                <span>{t('common:total-page', {count: total})}</span>
                <Input
                    value={jumpPage}
                    onChange={value => setJumpPage(value)}
                    onKeyDown={e => e.key === 'Enter' && setPage(jumpPage)}
                />
                <Button onClick={() => setPage(jumpPage)} type="primary">
                    {t('common:confirm')}
                </Button>
            </div>
        </Wrapper>
    );
};

export default Pagination;
