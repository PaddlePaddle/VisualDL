import {useState, useRef, useEffect} from 'react';

const useWebsocket = ({url: string, verify: any}) => {
    const ws = useRef<WebSocket | null>(null);
    // socket 数据
    const [wsData, setMessage] = useState({});
    //  socket 状态
    const [readyState, setReadyState] = useState<any>({key: 0, value: '正在连接中'});

    const creatWebSocket = (url: string) => {
        const stateArr = [
            {key: 0, value: '正在连接中'},
            {key: 1, value: '已经连接并且可以通讯'},
            {key: 2, value: '连接正在关闭'},
            {key: 3, value: '连接已关闭或者没有连接成功'}
        ];
        try {
            ws.current = new WebSocket(url);
            ws.current.onopen = () => {
                setReadyState(stateArr[ws.current?.readyState ?? 0]);
            };
            ws.current.onclose = () => {
                setReadyState(stateArr[ws.current?.readyState ?? 0]);
            };
            ws.current.onerror = () => {
                setReadyState(stateArr[ws.current?.readyState ?? 0]);
            };
            ws.current.onmessage = e => {
                setMessage({...JSON.parse(e.data)});
            };
        } catch (error) {
            console.log(error);
        }
    };

    const webSocketInit = (url: string) => {
        if (!ws.current || ws.current.readyState === 3) {
            creatWebSocket(url);
        }
    };

    //  关闭 WebSocket
    const closeWebSocket = () => {
        ws.current?.close();
    };

    // 发送数据
    const sendMessage = (str: string) => {
        ws.current?.send(str);
    };

    //重连
    const reconnect = (url: string) => {
        try {
            closeWebSocket();
            ws.current = null;
            creatWebSocket(url);
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        verify && webSocketInit(url);
        return () => {
            ws.current?.close();
        };
    }, [ws, verify]);

    return {
        wsData,
        readyState,
        closeWebSocket,
        reconnect,
        sendMessage
    };
};
export default useWebsocket;
