from collections import defaultdict, deque

class Model:
  def __init__(self, graph_data):
    self.name = 'Paddle Graph'
    self.version = graph_data['version']
    self.all_nodes = {node['name']: node for node in graph_data['nodes']}
    self.all_vars = {var['name']:var for var in graph_data['vars']}
    self.all_edges = {(edge['from_node'], edge['to_node']): edge for edge in graph_data['edges']}
    self.visible_maps = {node['name']: (True if not node['children_node'] else False) for node in graph_data['nodes'] }
    self.visible_memory_maps = {node['name']: (True if not node['children_node'] else False) for node in graph_data['nodes']}

  def make_graph(self, refresh=False):
    if refresh == True:
      self.visible_maps = {node['name']: (True if not node['children_node'] else False) for node in self.all_nodes.values() }
      self.visible_memory_maps = {node['name']: (True if not node['children_node'] else False) for node in self.all_nodes.values()}
    self.current_nodes = {node['name']:node  for node in self.all_nodes.values() if self.visible_maps[node['name']] }
    return Graph(self.current_nodes, self.all_vars)

  def adjust_visible(self, node_name, expand=True):
    if(expand):
      visited_map = defaultdict(bool)
      travesal_stack = deque()
      visited_map[node_name] = True
      self.visible_maps[node_name] = False
      self.visible_memory_maps[node_name] = False
      current_node = self.all_nodes[node_name]
      for child_name in current_node['children_node']:
          if visited_map[child_name] == False:
            travesal_stack.append(child_name)
            visited_map[child_name] = True
      while travesal_stack:
        current_name = travesal_stack.pop()
        current_node = self.all_nodes[current_name]
        self.visible_maps[current_name] = self.visible_memory_maps[current_name]
        for child_name in current_node['children_node']:
          if visited_map[child_name] == False:
            travesal_stack.append(child_name)
            visited_map[child_name] = True
    else:
      visited_map = defaultdict(bool)
      travesal_stack = deque()
      visited_map[node_name] = True
      self.visible_maps[node_name] = True
      self.visible_memory_maps[node_name] = True
      current_node = self.all_nodes[node_name]
      for child_name in current_node['children_node']:
          if visited_map[child_name] == False:
            travesal_stack.append(child_name)
            visited_map[child_name] = True
      while travesal_stack:
        current_name = travesal_stack.pop()
        current_node = self.all_nodes[current_name]
        self.visible_memory_maps[current_name] = self.visible_maps[current_name]
        self.visible_maps[current_name] = False
        for child_name in current_node['children_node']:
          if visited_map[child_name] == False:
            travesal_stack.append(child_name)
            visited_map[child_name] = True
  

class Graph(dict):
  def __init__(self, nodes, all_vars):
    self.nodes = []
    self.inputs = []
    self.outputs = []
    self.name = 'Paddle Graph'
    
    for op_node in nodes.values():
      if op_node['type'] == 'feed':
        self.inputs = [Parameter('Input{}'.format(i), [Argument(name, all_vars[name]) for name in value]) for i, (key, value) in enumerate(op_node["output_vars"].items())]
        continue
      if op_node['type'] == 'fetch':
        self.outputs = [Parameter('Output{}'.format(i), [Argument(name, all_vars[name]) for name in value]) for i, (key, value) in enumerate(op_node["input_vars"].items())]
        continue
      self.nodes.append(Node(op_node, all_vars))
      
    super(Graph, self).__init__(name=self.name, nodes=self.nodes, inputs=self.inputs, outputs=self.outputs)
    
class Node(dict):
  def __init__(self, node, all_vars):
    self.name =  node['name']
    self.type = node['type']
    self.attributes = [Attribute(key, value, node['attr_types'][key]) for key, value in node['attrs'].items()]
    self.inputs = [Parameter(key, [Argument(name, all_vars[name]) for name in value]) for key, value in node["input_vars"].items()]
    self.outputs = [Parameter(key, [Argument(name, all_vars[name]) for name in value]) for key, value in node["output_vars"].items()]
    self.chain = []
    self.visible = True 
    self.is_leaf = node['is_leaf_node']
    super(Node, self).__init__(name=self.name, type=self.type, attributes=self.attributes, inputs=self.inputs,
                  outputs=self.outputs, chain=self.chain, visible=self.visible, is_leaf=self.is_leaf)


class Attribute(dict):
  def __init__(self, key, value, attr_type):
    self.name = key
    self.value = value
    self.type = attr_type
    self.visible = True if key not in ['use_mkldnn', 'use_cudnn', 'op_callstack', 'op_role',
    'op_role_var', 'op_namescope', 'is_test'] else False
    super(Attribute, self).__init__(name=self.name, value=self.value, type=self.type, visible=self.visible)

class Parameter(dict):
  def __init__(self, name, args):
    self.name = name
    self.visible = True
    self.arguments = args
    super(Parameter, self).__init__(name=self.name, visible=self.visible, arguments=self.arguments)


class Argument(dict):
  def __init__(self, name, var):
    self.name = name
    self.type = TensorType(var['dtype'], var['shape'])
    self.initializer = None if var['persistable'] == False else self.type
    super(Argument, self).__init__(name=self.name, type=self.type, initializer=self.initializer)


class TensorType(dict):
  def __init__(self, datatype, shape):
    self.dataType = datatype
    self.shape = TensorShape(shape)
    self.denotation = None
    super(TensorType, self).__init__(dataType=self.dataType, shape=self.shape, denotation=self.denotation)

class TensorShape(dict):
  def __init__(self, dimensions):
    self.dimensions = dimensions
    super(TensorShape, self).__init__(dimensions=self.dimensions)

# from graph_component import analyse_model
# import json

# graph_model = Model(analyse_model(open('../../../test_output/model.pdmodel','rb').read()))
# graph_model.adjust_visible('/UNet', expand=False)
# print(json.dumps(graph_model.make_graph(), indent=2))