import networkJoinData from './data/network/join.json';
import networkUpdateData from './data/network/update.json';

export default request => {
    const {stage} = request.query;
    switch(stage) {
        case 'join':
            return {
                "status": 0,
                "msg": "",
                "data": networkJoinData
            };
        case 'update':
            return {
                "status": 0,
                "msg": "",
                "data": networkUpdateData
            };
        default:
            return {
                "status": 0,
                "msg": "",
                "data": []
            }
    }
};
