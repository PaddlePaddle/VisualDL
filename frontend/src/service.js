import {makeService} from './common/util/http';

export const getPluginScalarsTags = makeService('/data/plugin/scalars/tags');

export const getRuns = makeService('/data/runs');

export const getPluginScalarsScalars = makeService('/data/plugin/scalars/scalars');
