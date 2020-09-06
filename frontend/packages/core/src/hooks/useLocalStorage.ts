import {useCallback, useMemo} from 'react';

const useLocalStorage = (key: string) => {
    const value = useMemo(() => window.localStorage.getItem(key), [key]);
    const setter = useCallback((value: string) => window.localStorage.setItem(key, value), [key]);
    const remover = useCallback(() => window.localStorage.removeItem(key), [key]);
    return [value, setter, remover] as const;
};

export default useLocalStorage;
