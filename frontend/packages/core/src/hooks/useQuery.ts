import type {ParseOptions} from 'query-string';
import queryString from 'query-string';
import {useLocation} from 'react-router-dom';
import {useMemo} from 'react';

const useQuery = (options?: ParseOptions) => {
    const location = useLocation();
    const query = useMemo(() => queryString.parse(location.search, options), [location.search, options]);
    return query;
};

export default useQuery;
