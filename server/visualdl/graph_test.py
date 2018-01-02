import unittest
import graph
import json


class GraphTest(unittest.TestCase):
    def setUp(self):
        self.mock_dir = "./mock"

    def test_graph_edges_squeezenet(self):
        json_str = graph.load_model(self.mock_dir + '/squeezenet_model.pb')
        json_obj = json.loads(json_str)
        # 126 edges + 66 nodes (out-edge of each node is counted twice)
        self.assertEqual(len(json_obj['edges']), 126 + 66)
    #
    # def test_graph_edges_inception_v1(self):
    #     json_str = graph.load_model(self.mock_dir + '/inception_v1_model.pb')
    #     json_obj = json.loads(json_str)
    #     # 286 edges + 143 nodes (out-edge of each node is counted twice)
    #     self.assertEqual(len(json_obj['edges']), 286 + 143)


if __name__ == '__main__':
    unittest.main()
