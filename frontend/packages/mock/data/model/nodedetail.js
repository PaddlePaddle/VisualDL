import nodedetailJoinType1Data from './data/nodedetail/join/type1.json';
import nodedetailJoinType2Data from './data/nodedetail/join/type2.json';
import nodedetailUpdateType1Data from './data/nodedetail/update/type1.json';
import nodedetailUpdateType2Data from './data/nodedetail/update/type2.json';

export default request => {
    const {stage, node, type} = request.query;
    switch(stage) {
        case 'join': {
            if (type === '1') {
                return nodedetailJoinType1Data[node];
            }
            else if (type === '2') {
                return nodedetailJoinType2Data[node];
            }
            else {
                return {
                    "status": 0,
                    "msg": "",
                    "data": {
                        "data": []
                    }
                }
            }
        }
        case 'update': {
            if (type === '1') {
                return {
                    "status": 0,
                    "msg": "",
                    "data": nodedetailUpdateType1Data[node]
                };
            }
            else if (type === '2') {
                return {
                    "status": 0,
                    "msg": "",
                    "data": nodedetailUpdateType2Data[node]
                };
            }
            else {
                return {
                    "status": 0,
                    "msg": "",
                    "data": {
                        "data": []
                    }
                }
            }
        }
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