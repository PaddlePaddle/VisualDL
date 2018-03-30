import {makeService} from './common/util/http';

export const getPluginScalarsTags = makeService('/data/plugin/scalars/tags');

export const getRuns = makeService('/data/runs');

export const getPluginScalarsScalars = makeService('/data/plugin/scalars/scalars');

export const getPluginImagesTags = makeService('/data/plugin/images/tags');

export const getPluginImagesImages = makeService('/data/plugin/images/images');

export const getPluginHistogramsTags = makeService('/data/plugin/histograms/tags');

export const getPluginHistogramsHistograms = makeService('/data/plugin/histograms/histograms');

export const getPluginGraphsGraph = makeService('/data/plugin/graphs/graph');

export const getPluginTextsTags = makeService('/data/plugin/texts/tags');

export const getPluginTextsTexts = makeService('/data/plugin/texts/texts');

export const getPluginAudioTags = makeService('/data/plugin/audio/tags');

export const getPluginAudioAudio = makeService('/data/plugin/audio/audio');

export const getHighDimensionalDatasets = makeService('/data/plugin/embeddings/embeddings');
