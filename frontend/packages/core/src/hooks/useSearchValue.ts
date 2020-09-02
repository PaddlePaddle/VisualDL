import useDebounce from '~/hooks/useDebounce';

const isEmptyValue = (value: unknown): boolean =>
    (Array.isArray(value) && !value.length) || ('string' === typeof value && value === '');

const useSearchValue = <T>(value: T, delay = 275): T => {
    const debounced = useDebounce(value, delay);
    // return empty value immediately
    if (isEmptyValue(value)) {
        return value;
    }
    // if debounced value is empty, return non-empty value immediately
    if (isEmptyValue(debounced)) {
        return value;
    }
    return debounced;
};

export default useSearchValue;
