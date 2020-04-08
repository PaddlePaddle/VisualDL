import {Request} from 'express';

export default (req: Request) => {
    const {dimension, run} = req.query;
    if (dimension === '3') {
        return {
            embedding: [
                [10.0, 8.04, 3],
                [8.0, 6.95, 4],
                [13.0, 7.58, 1],
                [9.0, 8.81, 3],
                [11.0, 8.33, 5],
                [14.0, 9.96, 6],
                [6.0, 7.24, 1],
                [4.0, 4.26, 2],
                [12.0, 10.84, 6],
                [7.0, 4.8, 3],
                [5.0, 5.68, 3]
            ],
            labels: [`${run}-yellow`, 'blue', 'red', 'king', 'queen', 'man', 'women', 'kid', 'adult', 'light', 'dark']
        };
    }
    return {
        embedding: [
            [10.0, 8.04],
            [8.0, 6.95],
            [13.0, 7.58],
            [9.0, 8.81],
            [11.0, 8.33],
            [14.0, 9.96],
            [6.0, 7.24],
            [4.0, 4.26],
            [12.0, 10.84],
            [7.0, 4.8],
            [5.0, 5.68]
        ],
        labels: [`${run}-yellow`, 'blue', 'red', 'king', 'queen', 'man', 'women', 'kid', 'adult', 'light', 'dark']
    };
};
