import unittest
import graph
import json
import os


class GraphTest(unittest.TestCase):
    def setUp(self):
        self.mock_dir = "./mock"
        self.model_pb_path = os.path.join(self.mock_dir, 'squeezenet_model.pb')

    def test_graph_edges_squeezenet(self):
        json_obj = graph.to_IR_json(self.model_pb_path)
        json_obj = graph.add_edges(json_obj)

        # 126 edges + 66 nodes (out-edge of each node is counted twice)
        self.assertEqual(len(json_obj['edges']), 126 + 66)

        # label_0: (in-edge)
        # {u'source': u'data_0', u'target': u'node_0', u'label': u'label_0'}
        self.assertEqual(json_obj['edges'][0]['source'], 'data_0')
        self.assertEqual(json_obj['edges'][0]['target'], 'node_0')
        self.assertEqual(json_obj['edges'][0]['label'], 'label_0')

        # label_50: (in-edge)
        # {u'source': u'fire3/concat_1', u'target': u'node_17', u'label': u'label_50'}
        self.assertEqual(json_obj['edges'][50]['source'], 'fire3/concat_1')
        self.assertEqual(json_obj['edges'][50]['target'], 'node_17')
        self.assertEqual(json_obj['edges'][50]['label'], 'label_50')

        # label_100: (in-edge)
        # {u'source': u'fire6/squeeze1x1_1', u'target': u'node_34', u'label': u'label_100'}
        self.assertEqual(json_obj['edges'][100]['source'], 'fire6/squeeze1x1_1')
        self.assertEqual(json_obj['edges'][100]['target'], 'node_34')
        self.assertEqual(json_obj['edges'][100]['label'], 'label_100')

        # label_111: (out-edge)
        # {u'source': u'node_37', u'target': u'fire6/expand3x3_1', u'label': u'label_111'}
        self.assertEqual(json_obj['edges'][111]['source'], 'node_37')
        self.assertEqual(json_obj['edges'][111]['target'], 'fire6/expand3x3_1')
        self.assertEqual(json_obj['edges'][111]['label'], 'label_111')

    def test_graph_edges_inception_v1(self):
        json_obj = graph.to_IR_json(self.model_pb_path)
        json_obj = graph.add_edges(json_obj)

        # 286 edges + 143 nodes (out-edge of each node is counted twice)
        self.assertEqual(len(json_obj['edges']), 286 + 143)

        # label_0: (in-edge)
        # {u'source': u'data_0', u'target': u'node_0', u'label': u'label_0'}
        self.assertEqual(json_obj['edges'][0]['source'], 'data_0')
        self.assertEqual(json_obj['edges'][0]['target'], 'node_0')
        self.assertEqual(json_obj['edges'][0]['label'], 'label_0')

        # label_50: (in-edge)
        # {u'source': u'inception_3a/5x5_reduce_2', u'target': u'node_18', u'label': u'label_50'}
        self.assertEqual(json_obj['edges'][50]['source'], 'inception_3a/5x5_reduce_2')
        self.assertEqual(json_obj['edges'][50]['target'], 'node_18')
        self.assertEqual(json_obj['edges'][50]['label'], 'label_50')

        # label_100: (out-edge)
        # {u'source': u'node_34', u'target': u'inception_3b/pool_1', u'label': u'label_100'}
        self.assertEqual(json_obj['edges'][100]['source'], 'node_34')
        self.assertEqual(json_obj['edges'][100]['target'], 'inception_3b/pool_1')
        self.assertEqual(json_obj['edges'][100]['label'], 'label_100')

        # label_420: (out-edge)
        # {u'source': u'node_139', u'target': u'pool5/7x7_s1_2', u'label': u'label_420'}
        self.assertEqual(json_obj['edges'][420]['source'], 'node_139')
        self.assertEqual(json_obj['edges'][420]['target'], 'pool5/7x7_s1_2')
        self.assertEqual(json_obj['edges'][420]['label'], 'label_420')

    def test_graphviz(self):
        best_image_path = graph.draw_graph(self.model_pb_path, './graph_temp')
        self.assertTrue(best_image_path)


if __name__ == '__main__':
    unittest.main()
