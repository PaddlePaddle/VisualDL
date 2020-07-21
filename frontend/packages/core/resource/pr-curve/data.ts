export const nearestPoint = (data: number[][][], recall: number): number[][][] => {
    return data.map(series => {
        let delta = Number.POSITIVE_INFINITY;
        let nearestRecall = 0;
        for (let i = 0; i < series.length; i++) {
            const d = Math.abs(series[i][1] - recall);
            if (d < Number.EPSILON) {
                nearestRecall = series[i][1];
                break;
            }
            if (d < delta) {
                delta = d;
                nearestRecall = series[i][1];
            }
        }
        return series.filter(s => s[1] === nearestRecall);
    });
};
