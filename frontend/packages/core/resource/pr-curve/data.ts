export const nearestPoint = (data: number[][][], recall: number): number[][] => {
    return data.map(series => {
        let delta = Number.POSITIVE_INFINITY;
        let index = 0;
        for (let i = 0; i < series.length; i++) {
            if (series[i][1] - recall < Number.EPSILON) {
                return series[i];
            }
            if (Math.abs(series[i][1] - recall) < delta) {
                delta = Math.abs(series[i][1] - recall);
                index = i;
            }
        }
        return series[index];
    });
};
