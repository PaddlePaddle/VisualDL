export default {
    runs: ['train', 'test'],
    tags: [
        ['layer2/biases/summaries/mean', 'test/1234', 'another'],
        [
            'layer2/biases/summaries/mean',
            'layer2/biases/summaries/accuracy',
            'layer2/biases/summaries/cost',
            'test/431',
            'others'
        ]
    ]
};
