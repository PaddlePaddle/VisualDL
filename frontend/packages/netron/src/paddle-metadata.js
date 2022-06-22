/**
 * Copyright 2020 Baidu Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export default {
    leaf_nodes: [
        {
            name: 'layer',
            schema: {
                category: 'container'
            }
        },
        {
            name: 'layerlist',
            schema: {
                category: 'container'
            }
        },
        {
            name: 'parameterlist',
            schema: {
                category: 'container'
            }
        },
        {
            name: 'layerdict',
            schema: {
                category: 'container'
            }
        },
        {
            name: 'conv1d',
            schema: {
                category: 'conv'
            }
        },
        {
            name: 'conv1dtranspose',
            schema: {
                category: 'conv'
            }
        },
        {
            name: 'conv2d',
            schema: {
                category: 'conv'
            }
        },
        {
            name: 'conv2dtranspose',
            schema: {
                category: 'conv'
            }
        },
        {
            name: 'conv3d',
            schema: {
                category: 'conv'
            }
        },
        {
            name: 'conv3dtranspose',
            schema: {
                category: 'conv'
            }
        },
        {
            name: 'adaptiveavgpool1d',
            schema: {
                category: 'pool'
            }
        },
        {
            name: 'adaptiveavgpool2d',
            schema: {
                category: 'pool'
            }
        },
        {
            name: 'adaptiveavgpool3d',
            schema: {
                category: 'pool'
            }
        },
        {
            name: 'adaptivemaxpool1d',
            schema: {
                category: 'pool'
            }
        },
        {
            name: 'adaptivemaxpool2d',
            schema: {
                category: 'pool'
            }
        },
        {
            name: 'adaptivemaxpool3d',
            schema: {
                category: 'pool'
            }
        },
        {
            name: 'avgpool1d',
            schema: {
                category: 'pool'
            }
        },
        {
            name: 'avgpool2d',
            schema: {
                category: 'pool'
            }
        },
        {
            name: 'avgpool3d',
            schema: {
                category: 'pool'
            }
        },
        {
            name: 'maxpool1d',
            schema: {
                category: 'pool'
            }
        },
        {
            name: 'maxpool2d',
            schema: {
                category: 'pool'
            }
        },
        {
            name: 'maxpool3d',
            schema: {
                category: 'pool'
            }
        },
        {
            name: 'maxunpool1d',
            schema: {
                category: 'pool'
            }
        },
        {
            name: 'maxunpool2d',
            schema: {
                category: 'pool'
            }
        },
        {
            name: 'maxunpool3d',
            schema: {
                category: 'pool'
            }
        },
        {
            name: 'pad1d',
            schema: {
                category: 'pad'
            }
        },
        {
            name: 'pad2d',
            schema: {
                category: 'pad'
            }
        },
        {
            name: 'pad3d',
            schema: {
                category: 'pad'
            }
        },
        {
            name: 'zeropad2d',
            schema: {
                category: 'pad'
            }
        },
        {
            name: 'celu',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'elu',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'gelu',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'hardshrink',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'hardsigmoid',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'hardswish',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'hardtanh',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'leakyrelu',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'logsigmoid',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'logsoftmax',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'maxout',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'prelu',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'relu',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'relu6',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'selu',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'sigmoid',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'silu',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'softmax',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'softplus',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'softshrink',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'softsign',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'swish',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'mish',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'tanh',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'tanhshrink',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'thresholdedrelu',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'batchnorm',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'batchnorm1d',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'batchnorm2d',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'batchnorm3d',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'groupnorm',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'instancenorm1d',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'instancenorm2d',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'instancenorm3d',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'layernorm',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'localresponsenorm',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'spectralnorm',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'syncbatchnorm',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'alphadropout',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'dropout',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'dropout2d',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'dropout3d',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'birnn',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'gru',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'grucell',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'lstm',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'lstmcell',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'rnn',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'rnncellbase',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'simplernn',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'simplernncell',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'multiheadattention',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'transformer',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'transformerdecoder',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'transformerdecoderlayer',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'transformerencoder',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'transformerencoderlayer',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'linear',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'embedding',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'bceloss',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'bcewithlogitsloss',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'crossentropyloss',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'ctcloss',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'hsigmoidloss',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'kldivloss',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'l1loss',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'marginrankingloss',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'mseloss',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'nllloss',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'smoothl1loss',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'pixelshuffle',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'upsample',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'upsamplingbilinear2d',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'upsamplingnearest2d',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'clipgradbyglobalnorm',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'clipgradbynorm',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'clipgradbyvalue',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'beamsearchdecoder',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'cosinesimilarity',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'dynamic_decode',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'flatten',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'pairwisedistance',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'identity',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'unfold',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'fold',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'conv2d_grad',
            schema: {
                category: 'conv'
            }
        },
        {
            name: 'conv2d_transpose_grad',
            schema: {
                category: 'conv'
            }
        },
        {
            name: 'depthwise_conv2d_transpose',
            schema: {
                category: 'conv'
            }
        },
        {
            name: 'depthwise_conv2d_transpose_grad',
            schema: {
                category: 'conv'
            }
        },
        {
            name: 'deformable_conv_grad',
            schema: {
                category: 'conv'
            }
        },
        {
            name: 'depthwise_conv2d',
            schema: {
                category: 'conv'
            }
        },
        {
            name: 'deformable_conv',
            schema: {
                category: 'conv'
            }
        },
        {
            name: 'conv2d_transpose',
            schema: {
                category: 'conv'
            }
        },
        {
            name: 'depthwise_conv2d_grad',
            schema: {
                category: 'conv'
            }
        },
        {
            name: 'pool2d',
            schema: {
                category: 'pool'
            }
        },
        {
            name: 'pool2d_grad',
            schema: {
                category: 'pool'
            }
        },
        {
            name: 'max_pool2d_with_index',
            schema: {
                category: 'pool'
            }
        },
        {
            name: 'max_pool2d_with_index_grad',
            schema: {
                category: 'pool'
            }
        },
        {
            name: 'pad3d_grad',
            schema: {
                category: 'pad'
            }
        },
        {
            name: 'relu6_grad',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'leaky_relu',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'leaky_relu_grad',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'hard_sigmoid',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'hard_sigmoid_grad',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'sigmoid_grad',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'batch_norm',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'batch_norm_grad',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'sync_batch_norm',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'sync_batch_norm_grad',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'norm_grad',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'p_norm',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'p_norm_grad',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'group_norm_grad',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'squared_l2_norm',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'squared_l2_norm_grad',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'group_norm',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'norm',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'rnn_grad',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'sequence_mask',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'one_hot',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'one_hot_v2',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'bce_loss',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'bce_loss_grad',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'huber_loss',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'huber_loss_grad',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'log_loss',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'log_loss_grad',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'smooth_l1_loss',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'smooth_l1_loss_grad',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'elementwise_add',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'elementwise_add_grad',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'cumsum',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'clip',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'clip_grad',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'greater_equal',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'greater_than',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'less_equal',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'logical_and',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'logical_or',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'momentum',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'reduce_max',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'reduce_mean',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'reduce_prod',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'seed',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'sigmoid_cross_entropy_with_logits',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'label_smooth',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'where_index',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'is_empty',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'sigmoid_cross_entropy_with_logits_grad',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'target_assign',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'gradient_accumulator',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'size',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'where',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'elementwise_pow_grad',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'argsort',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'argsort_grad',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'rmsprop',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'atan',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'atan_grad',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'flatten_contiguous_range',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'crop',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'eye',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'matmul',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'set_value',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'exp',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'exp_grad',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'square_grad',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'log_softmax',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'log_softmax_grad',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'matmul_grad',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'assign_value',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'top_k_v2',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'arg_max',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'cos',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'sin',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'index_sample',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'squeeze_grad',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'squeeze2_grad',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'stack_grad',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'tril_triu',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'unstack',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'unstack_grad',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'bilinear_interp_v2',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'bilinear_interp_v2_grad',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'nearest_interp_v2',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'nearest_interp_v2_grad',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'randperm',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'sampling_id',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'bipartite_match',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'box_coder',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'density_prior_box',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'distribute_fpn_proposals',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'generate_proposals_v2',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'meshgrid',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'mine_hard_examples',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'yolo_box',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'warpctc',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'warpctc_grad',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'iou_similarity',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'split',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'flatten2',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'flatten2_grad',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'masked_select_grad',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'strided_slice',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'prior_box',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'elementwise_max_grad',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'not_equal',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'strided_slice_grad',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'fill_any_like',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'hard_swish',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'hard_swish_grad',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'expand_v2',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'expand_v2_grad',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'flatten_contiguous_range_grad',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'gather_nd',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'gather_nd_grad',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'reciprocal',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'reciprocal_grad',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'index_select',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'roi_align',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'roi_align_grad',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'reduce_mean_grad',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'masked_select',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'index_select_grad',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'elementwise_min_grad',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'fill_constant_batch_size_like',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'unsqueeze2_grad',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'unique',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'expand_as_v2',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'tile',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'nearest_interp_grad',
            schema: {
                category: 'shape'
            }
        }
    ],
    non_leaf_nodes: [
        {
            name: 'Layer',
            schema: {
                category: 'container'
            }
        },
        {
            name: 'LayerList',
            schema: {
                category: 'container'
            }
        },
        {
            name: 'ParameterList',
            schema: {
                category: 'container'
            }
        },
        {
            name: 'LayerDict',
            schema: {
                category: 'container'
            }
        },
        {
            name: 'Conv1D',
            schema: {
                category: 'conv'
            }
        },
        {
            name: 'Conv1DTranspose',
            schema: {
                category: 'conv'
            }
        },
        {
            name: 'Conv2D',
            schema: {
                category: 'conv'
            }
        },
        {
            name: 'Conv2DTranspose',
            schema: {
                category: 'conv'
            }
        },
        {
            name: 'Conv3D',
            schema: {
                category: 'conv'
            }
        },
        {
            name: 'Conv3DTranspose',
            schema: {
                category: 'conv'
            }
        },
        {
            name: 'AdaptiveAvgPool1D',
            schema: {
                category: 'pool'
            }
        },
        {
            name: 'AdaptiveAvgPool2D',
            schema: {
                category: 'pool'
            }
        },
        {
            name: 'AdaptiveAvgPool3D',
            schema: {
                category: 'pool'
            }
        },
        {
            name: 'AdaptiveMaxPool1D',
            schema: {
                category: 'pool'
            }
        },
        {
            name: 'AdaptiveMaxPool2D',
            schema: {
                category: 'pool'
            }
        },
        {
            name: 'AdaptiveMaxPool3D',
            schema: {
                category: 'pool'
            }
        },
        {
            name: 'AvgPool1D',
            schema: {
                category: 'pool'
            }
        },
        {
            name: 'AvgPool2D',
            schema: {
                category: 'pool'
            }
        },
        {
            name: 'AvgPool3D',
            schema: {
                category: 'pool'
            }
        },
        {
            name: 'MaxPool1D',
            schema: {
                category: 'pool'
            }
        },
        {
            name: 'MaxPool2D',
            schema: {
                category: 'pool'
            }
        },
        {
            name: 'MaxPool3D',
            schema: {
                category: 'pool'
            }
        },
        {
            name: 'MaxUnPool1D',
            schema: {
                category: 'pool'
            }
        },
        {
            name: 'MaxUnPool2D',
            schema: {
                category: 'pool'
            }
        },
        {
            name: 'MaxUnPool3D',
            schema: {
                category: 'pool'
            }
        },
        {
            name: 'Pad1D',
            schema: {
                category: 'pad'
            }
        },
        {
            name: 'Pad2D',
            schema: {
                category: 'pad'
            }
        },
        {
            name: 'Pad3D',
            schema: {
                category: 'pad'
            }
        },
        {
            name: 'ZeroPad2D',
            schema: {
                category: 'pad'
            }
        },
        {
            name: 'CELU',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'ELU',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'GELU',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'Hardshrink',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'Hardsigmoid',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'Hardswish',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'Hardtanh',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'LeakyReLU',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'LogSigmoid',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'LogSoftmax',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'Maxout',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'PReLU',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'ReLU',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'ReLU6',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'SELU',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'Sigmoid',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'Silu',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'Softmax',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'Softplus',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'Softshrink',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'Softsign',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'Swish',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'Mish',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'Tanh',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'Tanhshrink',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'ThresholdedReLU',
            schema: {
                category: 'activation'
            }
        },
        {
            name: 'BatchNorm',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'BatchNorm1D',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'BatchNorm2D',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'BatchNorm3D',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'GroupNorm',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'InstanceNorm1D',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'InstanceNorm2D',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'InstanceNorm3D',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'LayerNorm',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'LocalResponseNorm',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'SpectralNorm',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'SyncBatchNorm',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'AlphaDropout',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'Dropout',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'Dropout2D',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'Dropout3D',
            schema: {
                category: 'normalization'
            }
        },
        {
            name: 'BiRNN',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'GRU',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'GRUCell',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'LSTM',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'LSTMCell',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'RNN',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'RNNCellBase',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'SimpleRNN',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'SimpleRNNCell',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'MultiHeadAttention',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'Transformer',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'TransformerDecoder',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'TransformerDecoderLayer',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'TransformerEncoder',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'TransformerEncoderLayer',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'Linear',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'Embedding',
            schema: {
                category: 'sequence'
            }
        },
        {
            name: 'BCELoss',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'BCEWithLogitsLoss',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'CrossEntropyLoss',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'CTCLoss',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'HSigmoidLoss',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'KLDivLoss',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'L1Loss',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'MarginRankingLoss',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'MSELoss',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'NLLLoss',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'SmoothL1Loss',
            schema: {
                category: 'tensor'
            }
        },
        {
            name: 'PixelShuffle',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'Upsample',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'UpsamplingBilinear2D',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'UpsamplingNearest2D',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'ClipGradByGlobalNorm',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'ClipGradByNorm',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'ClipGradByValue',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'BeamSearchDecoder',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'CosineSimilarity',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'dynamic_decode',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'Flatten',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'PairwiseDistance',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'Identity',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'Unfold',
            schema: {
                category: 'shape'
            }
        },
        {
            name: 'Fold',
            schema: {
                category: 'shape'
            }
        }
    ]
};
