import {selectors} from '~/store';
import {useSelector} from 'react-redux';

const useTheme = () => useSelector(selectors.theme.theme);

export default useTheme;
