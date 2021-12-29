import nodebasicJoinData from './data/nodebasic/join.json';
import nodebasicUpdateData from './data/nodebasic/update.json';

export default request => {
    const {stage, node} = request.query;
    switch(stage) {
        case 'join':
            return {
                "status": 0,
                "msg": "",
                "data": nodebasicJoinData[node]
            };
        case 'update':
            return {
                "status": 0,
                "msg": "",
                "data": nodebasicUpdateData[node]
            };
        default:
            return {
                "status": 0,
                "msg": "",
                "data": {
                    [node]: []
                }
            };
    }
};