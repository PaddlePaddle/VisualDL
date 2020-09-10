import useGlobalState from '~/hooks/useGlobalState';
import {useMemo} from 'react';

const useTheme = () => {
    const [globalState] = useGlobalState();
    return useMemo(() => globalState.theme, [globalState.theme]);
};

export default useTheme;
