import {useCallback, useEffect, useRef} from 'react';

const useClickOutside = <T extends HTMLElement>(callback: () => void) => {
    const ref = useRef<T | null>(null);

    const escapeListener = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                callback();
            }
        },
        [callback]
    );
    const clickListener = useCallback(
        (e: MouseEvent | TouchEvent) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            if (ref.current && !(ref.current! as Node).contains(e.target as Node)) {
                callback();
            }
        },
        [callback]
    );

    useEffect(() => {
        document.addEventListener('mousedown', clickListener);
        document.addEventListener('touchstart', clickListener);
        document.addEventListener('keyup', escapeListener);
        return () => {
            document.removeEventListener('mousedown', clickListener);
            document.removeEventListener('touchstart', clickListener);
            document.removeEventListener('keyup', escapeListener);
        };
    }, [clickListener, escapeListener]);

    return ref;
};

export default useClickOutside;
