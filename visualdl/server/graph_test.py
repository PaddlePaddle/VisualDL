from __future__ import absolute_import
import unittest

from . import graph


class GraphTest(unittest.TestCase):
    def setUp(self):
        self.mock_dir = "./visualdl/server/mock"

    def test_graph_edges_squeezenet(self):
        json_obj = graph.to_IR_json(self.mock_dir + '/squeezenet_model.pb')
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
        self.assertEqual(json_obj['edges'][100]['source'],
                         'fire6/squeeze1x1_1')
        self.assertEqual(json_obj['edges'][100]['target'], 'node_34')
        self.assertEqual(json_obj['edges'][100]['label'], 'label_100')

        # label_111: (out-edge)
        # {u'source': u'node_37', u'target': u'fire6/expand3x3_1', u'label': u'label_111'}
        self.assertEqual(json_obj['edges'][111]['source'], 'node_37')
        self.assertEqual(json_obj['edges'][111]['target'], 'fire6/expand3x3_1')
        self.assertEqual(json_obj['edges'][111]['label'], 'label_111')


if __name__ == '__main__':
    unittest.main()
