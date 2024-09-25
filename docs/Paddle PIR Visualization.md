## 项目信息
### 项目名称
飞桨PaddlePaddle-PIR适配VisualDL模型可视化

### 方案描述
目前的VisualDL的计算图可视化思路为：根据静态图获取全部变量和算子信息，构建特定格式的vdlgraph.log文件，后利用自定义的Model类读取数据并支持前端进行可视化。其中需要重点关注的是计算图算子和变量之间的输入输出关系，即算子中的`input_vars`和`output_vars`信息和变量中的`from_node`和`to_nodes`信息，这些输入输出信息决定了可视化的计算图结构。

现有PIR计算图可视化初步实现为：从PIR的program中获取可视化所需的变量和算子信息，构建结构相同的vdlgraph.log文件，目前实现的不足主要有以下四点：

1. 现有方法没有考虑PIR的新特性，只提取顶层block的变量和算子，无法可视化含有多层block的控制流结构的计算图。
2.  现有方法不支持layer的展开收缩，并且没有在vdlgraph.log文件中存储计算图边信息
3.  现有方法只支持静态图（paddle.base.libpaddle.pir.Program）输入，不支持动态图输入
4. 现有方法不支持可视化PIR json格式存储的模型

针对以上四点不足，分别设计对应解决方案：

1. 重写PIR的program分析部分，按照深度优先搜索策略，从顶层block逐层获取每层的算子和变量，重点关注跨block的变量输入输出关系。
2. 将控制流结构构建为layer结构（可收缩、展开），收缩时隐藏内部子block，重点体现整体模型结构和数据流向，展开时虚线框标记控制流内部block。重点体现内部算子关系和数据流向；仿照paddle2.x的program分析部分，增加模型边信息分析功能。
3. 基于paddle3.x的动转静、save_load功能，修改生成vdlgraph文件的功能的输入接口，支持静态图和动态图的输入。
4. 修改前端动态图更换模型接口，支持*.json文件输入，修改后端所有相关接口和功能代码，分别处理*.pdmodel和*.json两类文件。

### 时间规划
#### 7月1日 - 7月25日
+ 进一步熟悉VisualDL项目源码及其现有功能。理解项目的需求和范围。（5天）
+ 阅读PIR设计文档，总结PIR新特性，设计可视化方案。（20天）

#### 7月26日 - 8月25日
+ 基于PIR新特性开发PIR解析功能，获取可视化所需的全部模型数据。（10天）
+ 对接内部接口，修改前端设计，根据可视化方案实现前端对于PIR新特性的可视化。（10天）
+ 开发PIR下控制流的可视化。（10天）

#### 8月26日 – 9月15日
+ 对于选定的两个模型进行可视化，验证功能可用性。（10天）
+ 对于所有实现的功能进行测试和调试，并尝试复杂模型结构，验证可靠性。（10天）

#### 9月16日 – 9月30日
+ 优化和完善模型可视化实现。
+ 准备文档和代码示例。
+ 提交 PR/MR 和项目结项报告。

## 项目总结
### 已完成工作
下面按照时间线进行总结

#### 7月1日-7月14日
项目预热、和导师沟通、制定实现方案和工作计划

#### 7月15日-7月28日
**1. 配置开发环境，熟悉Paddle和VisualDL**

+ 本地源码编译安装Paddle和VisualDL的develop分支

**2. 熟悉VisualDL进行计算图可视化的设计**

+ 阅读visualdl#Model()类存储计算图的设计逻辑
+ 阅读visualdl#analyse_model()函数从**.pdmodel*文件获取计算图数据的逻辑
+ 阅读visualdl#analyse_pir()函数从PIR表示的模型获取计算图数据的逻辑

**3. 熟悉PIR进行计算图存储的设计**

+ 阅读pir#program.cc, operation.cc, block.cc, region.cc等文件，熟悉PIR进行模型存储的设计
+ 阅读fluid#pir.cc中和获取Program数据有关接口API

**4. 完成Visual现有PIR计算图可视化方法适配Paddle3.0版本**

+ 修改visualdl#analyse_pir()等函数，并成功可视化原有测试demo#pir_translate.py

**5. 尝试可视化具有分支结构模型**

+ 实现了具有if分支结构的简单模型并进行可视化

#### 7月29日-8月11日（解决不足1）
**1. 测试目前 Visualdl 对于控制结构可视化的支持能力**

+ 静态方式组建六种包含控制结构的网络，包含循环结构和分支结构，以及多层嵌套控制等
+ 利用现有 pir 可视化方法进行可视化发现不支持包含多层 Block 网络的可视化

**2. 开发 Visualdl 多层 Block 解析功能**

+ 修改 visualdl#analyse_pir()，支持获取子 Block 中的全部变量
+ 修改 visualdl#analyse_pir()，支持获取子 Block 中的全部算子
+ 增加控制流算子识别功能
+ 完善模型分析代码，实现 visualdl 对 pir 中 yield 等新算子的表示
+ 完善模型分析代码，实现多层 Block 嵌套模型的全部变量和算子解析
+ 完善模型分析代码，实现 Block 内外算子参数传递关系的正确表示

**3. 完善 visualdl 对控制流算子的可视化**

+ 将控制流算子构建为 visualdl 中的 layer，可以收缩或展开表示

#### 8月12日-8月25日（解决不足2、3）
**1. 完成 visualdl 可视化控制流算子的功能开发**

+ 针对 ifop 和 whileop 算子开发特定的解析方法，在前端表现为 layer
+ 完善对控制流算子传入变量和传出变量的可视化处理，控制流算子内部所有算子接收外部传入的变量均传入控制流算子，控制流算子传出的变量在内部构建一个抽象 output 算子接收 yield 算子的输出，并将 output 作为展开控制流算子后代表控制流算子的输出
+ 提升控制流算子 layer 的可视化美观程度

**2. 初步实现 json 格式存储的 paddle 模型的计算图可视化**

+ 利用 save load 实现提取 json 格式模型的计算图
+ 对接接口，初步实现 json 格式模型的计算图的可视化，目前只能全部展开

**3. 完成获取PIR program边信息功能**

**4. 修复已知 Bug**

#### 8月26日-9月8日
**1. 继续完善 visualdl 算子可视化功能**

+ 修改 visualdl 后端，提供每个算子的具体类型以优化前端可视化效果

**2. 编写功能文档**

+ 编写项目功能文档，并记录开发遇到的问题以及目前的解决方案

**3. 编写测试用例**

+ 编写静态图、动态图、控制流结构，多层控制流结构等多个测试用例和测试脚本，并记录测试结果

#### 9月9日-9月30日（解决不足4）
**1. 修改动态图更换模型接口支持json格式模型**

+ 修改 visualdl 前端，支持网页上传json格式模型
+ 修改 visualdl 后端，支持json格式模型的输入和数据解析

**2. 完成结项报告**

**3. 提交PR**

### 核心功能描述
#### VisualDL支持PIR 控制流算子可视化
在PIR中，控制流算子都拥有子block，在子block中存放分支或者循环体包含的算子信息，下面为一个简单的包含ifop的模型IR

```plain
{
    (%0) = "pd_op.data" () {dtype:(pd_op.DataType)float32,name:"i",place:(pd_op.Place)Place(undefined:0),shape:(pd_op.IntArray)[1],stop_gradient:[false]} : () -> builtin.tensor<1xf32>
    (%1) = "pd_op.full" () {dtype:(pd_op.DataType)float32,place:(pd_op.Place)Place(cpu),shape:(pd_op.IntArray)[1],stop_gradient:[true],value:(Double)2} : () -> builtin.tensor<1xf32>
    (%2) = "pd_op.scale" (%0, %1) {bias:(Float)0,bias_after_scale:true,stop_gradient:[false]} : (builtin.tensor<1xf32>, builtin.tensor<1xf32>) -> builtin.tensor<1xf32>
    (%3) = "pd_op.full" () {dtype:(pd_op.DataType)float32,place:(pd_op.Place)Place(undefined:0),shape:(pd_op.IntArray)[],stop_gradient:[true],value:(Double)5} : () -> builtin.tensor<f32>
    (%4) = "pd_op.less_than" (%0, %3) {stop_gradient:[true]} : (builtin.tensor<1xf32>, builtin.tensor<f32>) -> builtin.tensor<1xb>
    (%5) = "pd_op.if" (%4) {stop_gradient:[false]} -> builtin.tensor<1xf32> {
        (%6) = "pd_op.add" (%2, %2) {stop_gradient:[false]} : (builtin.tensor<1xf32>, builtin.tensor<1xf32>) -> builtin.tensor<1xf32>
        () = "cf.yield" (%6) {} : (builtin.tensor<1xf32>) -> 
    } else {
        (%7) = "pd_op.subtract" (%2, %2) {stop_gradient:[false]} : (builtin.tensor<1xf32>, builtin.tensor<1xf32>) -> builtin.tensor<1xf32>
        () = "cf.yield" (%7) {} : (builtin.tensor<1xf32>) -> 
    }
    (%8) = "pd_op.mean" (%5) {axis:(pd_op.IntArray)[],keepdim:false,stop_gradient:[false]} : (builtin.tensor<1xf32>) -> builtin.tensor<f32>
}
```

其中line8-12中的四个算子在子block中，由于现有方法只遍历顶层block的算子，忽略了子block，所以不支持控制流算子可视化。为了解决这个问题，我们首先从子block中获取算子和变量信息，增加`get_sub_var`和`get_sub_ops`函数用于提取子block内的算子和变量，二者均为递归函数进而处理多层block嵌套情况。在遍历顶层block时遇到控制流算子会调用这两个函数，在这个需求中要重点关注跨block的变量输入输出关系，相关判断代码为：

```plain
def is_same_block_op(from_node, to_node, all_ops):
    if all_ops[to_node]["parent_node"] == '/':
        return False
    from_ancestors = set()
    while all_ops[from_node]["parent_node"] != '/':
        from_ancestors.add(all_ops[from_node]["parent_node"])
        from_node = all_ops[from_node]["parent_node"]
    if all_ops[to_node]["parent_node"] in from_ancestors:
        return False
    else:
        return True
```

为了计算图可视化的直观和美观，我们在visualdl中将控制流算子表示成一个可收缩可展开的layer，效果如下：

![](https://cdn.nlark.com/yuque/0/2024/png/32921027/1725995876633-33d068ea-96ac-4c81-b637-0a242e22838a.png)

展开后效果如下：

![](https://cdn.nlark.com/yuque/0/2024/png/32921027/1725995789430-d99ae3bd-b4b8-45a8-9dd1-42d13cefd871.png)

其中展开后由layer上方的名称标识为这是一个控制流算子，这里需要注意的是，在此途中pd_op.less_than_0算子计算了ifop的条件值，应该有一条线连接pd_op.less_than_0和pd_op.if_0展开后的layer，但由于前端时基于netron的，目前不支持算子连线到一个layer。

#### VisualDL支持获取PIR program边信息
实现逻辑和旧IR中一致，核心代码如下：

```plain
# edge info
for var_name in all_vars.keys():
    construct_edges(var_name, all_ops, all_vars, all_edges)

for src_node, to_node in all_edges.keys():
    all_ops[src_node]['edge_output_nodes'].append(to_node)
    all_ops[to_node]['edge_input_nodes'].append(src_node)
    all_edges[(src_node,
               to_node)]['vars'] = list(all_edges[(src_node,
                                                   to_node)]['vars'])
    if len(all_edges[(src_node, to_node)]['vars']) > 1:
        all_edges[(src_node, to_node)]['label'] = str(
            len(all_edges[(src_node, to_node)]['vars'])) + ' tensors'
    elif len(all_edges[(src_node, to_node)]['vars']) == 1:
        all_edges[(src_node, to_node)]['label'] = str(
            all_vars[all_edges[(src_node, to_node)]['vars'][0]]['shape'])
```

#### 支持输入静态计算图和动态计算图
目前的PIR分析是针对于静态计算图的，对于动态计算图将进行动转静和save load得到静态图进行分析，核心代码如下：

```plain
if isinstance(model, paddle.base.libpaddle.pir.Program):
    result = analyse_pir(model)
else:
    model = paddle.jit.to_static(model, input_spec)
    paddle.jit.save(model, os.path.join(tmp, 'temp'))
    model_data = paddle.jit.load(os.path.join(tmp, 'temp'))
    result = analyse_pir(model_data.program())
```

#### 支持输入json格式模型
PIR下模型动转静后存储为json文件，再前端需要能导入json文件进行可视化，目前只能实现在动态图界面导入json文件，核心后端代码为：

```plain
def set_input_graph(self, content, file_type='pdmodel'):
        if isinstance(content, str):
            if not is_VDLGraph_file(content):
                return
            if 'pdmodel' in content:
                file_type = 'pdmodel'
            elif 'json' in content:
                file_type = 'json'
            else:
                file_type = 'vdlgraph'
            content = bfile.BFile(content, 'rb').read()

        if file_type == 'pdmodel':
            data = analyse_model(content)
            self.graph_buffer['manual_input_model'] = Model(data)

        elif file_type == 'json':
            json_object = json.loads(content)
            with tempfile.TemporaryDirectory() as tmp:
                with open(os.path.join(tmp, 'temp.json'), 'w') as json_file:
                    json.dump(json_object, json_file, indent=4)
                model_data = load(os.path.join(tmp, 'temp'))
            data = analyse_pir(model_data.program())
            self.graph_buffer['manual_input_model'] = Model(data)

        elif file_type == 'vdlgraph':
            self.graph_buffer['manual_input_model'] = Model(
                json.loads(content.decode()))

        else:
            return
```

### 遇到的问题及解决方案
1. 为了使计算图数据流可视化效果更加直观，我们在控制流子block中添加了一个output算子，这是因为在PIR中，控制流子block以辅助算子cf.yield作为结束，这使得展开后控制流的layer没有参数传出，因此我们添加了一个output算子，输入为控制流所有cf.yield，输出为未展开前控制流算子的输出，具体实现代码如下：

```plain
def create_control_output_node(all_ops, all_vars, control_node_name):
    op_name = control_node_name + '/' + "output"
    all_ops[op_name] = {}
    all_ops[op_name]['name'] = op_name
    all_ops[op_name]['show_name'] = op_name

    all_ops[op_name]['type'] = "control_op.output"
    all_ops[op_name]['dtype'] = all_ops[control_node_name]['dtype']
    all_ops[op_name]['input_vars'] = {}
    all_ops[op_name]['output_vars'] = all_ops[control_node_name]['output_vars']

    all_ops[op_name]['is_leaf_node'] = True
    for var in all_vars:
        if all_vars[var]['from_node'] == control_node_name:
            all_ops[op_name]['output_vars'][var] = [var]
            all_vars[var]['from_node'] = op_name

    all_ops[op_name]['attrs'] = all_ops[control_node_name]['attrs']
    all_ops[op_name]['attr_types'] = all_ops[control_node_name]['attr_types']
    all_ops[op_name]['children_node'] = []
    all_ops[op_name]['input_nodes'] = []
    all_ops[op_name]['output_nodes'] = []
    all_ops[op_name]['edge_input_nodes'] = []
    all_ops[op_name]['edge_output_nodes'] = []
    all_ops[op_name]['parent_node'] = control_node_name
    all_ops[control_node_name]['children_node'].append(op_name)
    return all_ops, all_vars
```

2. 对于循环控制流算子（whileop），根据中间表示可视化会体现不出循环的那条线 ，不利于数据流的展示，因此我们对于pd_op.increment算子我们增加一条边指向上游算子，代表循环结构的数据流向，效果如下：![](https://cdn.nlark.com/yuque/0/2024/png/32921027/1725975662978-9479a84a-6a1d-418c-b97e-d6c35d92677d.png?x-oss-process=image%2Fformat%2Cwebp%2Fresize%2Cw_937%2Climit_0)代码如下:

```plain
if op.name() == "pd_op.increment_":
  all_vars[now_var]['to_nodes'].append(all_vars[input_name]['from_node'])
  all_ops[all_vars[input_name]['from_node']]['input_vars'][now_var] = [now_var]
```

3. 对于builtin.parameter算子，默认的persistable属性为True，这会导致前端可视化后这个算子没有输出，因此我们将此类算子persistable属性均设置为False，代码如下：

```plain
if op.name() == "builtin.parameter":
    all_vars[var_name]['persistable'] = False
```

4. visualdl的前端基于netron实现，其对于一些算子类型类如conv2d等会有不同颜色标识，前端根据vdlgraph.log中算子的type字段判断类型，在旧IR中，可以通过op.type()获取正确的算子类型，但是PIR的算子没有type()接口，因此我们从算子名中获取算子类型，后续Paddle更新后可以考虑修改，目前实现代码为：`all_ops[op_name]['type'] = op.name().replace("pd_op.", "")`

5. 目前前端静态页面的上传模型和终端visualdl --model命令不支持可视化json格式的模型，这是因为静态模型可视化是基于netron实现的，在visualdl中，静态模型解析是在前端进行的，利用netron的模型解析实现，目前netron不支持json格式paddle模型的解析，自行实现也十分复杂，这个需求列入TODO。

### 测试用例
目前实现了五个测试用例，分别为pir_program_test，pir_graph_test，cond_test，while_test，cond_inside_cond_test，分别测试静态图输入，动态图输入，分支结构模型，循环结构模型，分支嵌套结构模型

#### 测试脚本
1. cd VisualDL
2. export FLAGS_enable_pir_api=1
3. python demo/components/pir_program_test.py （pir_graph_test，cond_test，while_test，cond_inside_cond_test）输出文件将在VisualDL/log/cond_test路径下
4. visualdl --logdir ./log/program_test/ --host 0.0.0.0 注意此时在VisualDL目录下

#### 测试效果
运行测例后在[http://0.0.0.0:8040/](http://0.0.0.0:8040/)查看可视化计算图

##### pir_program_test（PIR静态计算图可视化）
![](https://cdn.nlark.com/yuque/0/2024/png/32921027/1725996090463-249b4ade-ad21-47fc-8017-dee9ad30f979.png)

##### pir_graph_test（输入PIR动态图可视化）
![](https://cdn.nlark.com/yuque/0/2024/png/32921027/1725996125143-5c21f177-6fa3-4203-84ea-d1d276323163.png)

##### cond_test（ifop可视化）
![](https://cdn.nlark.com/yuque/0/2024/png/32921027/1725996043233-fbf7b462-7436-41b4-8d8e-55febb4d10fe.png)

全展开后

![](https://cdn.nlark.com/yuque/0/2024/png/32921027/1725996056427-ca87bc8e-78aa-4bbd-8abb-d9c6669780e9.png)

##### while_test（whileop可视化）
![](https://cdn.nlark.com/yuque/0/2024/png/32921027/1725996156062-275278ea-900a-44d9-a477-55dac6494456.png)

全展开后

![](https://cdn.nlark.com/yuque/0/2024/png/32921027/1725996166186-f5f350af-90fc-4192-835c-4d7847a9fa43.png)

##### cond_inside_cond_test（双层ifop嵌套结构可视化）
![](https://cdn.nlark.com/yuque/0/2024/png/32921027/1725996206268-4586af9c-7f68-4b4f-9790-f26db4f1dd58.png)

展开一层ifop

![](https://cdn.nlark.com/yuque/0/2024/png/32921027/1725996221339-32a802b7-bad3-4369-9505-9b5b5e08e863.png)

全展开后

![](https://cdn.nlark.com/yuque/0/2024/png/32921027/1725996236240-5b6252b6-acb3-4f4b-9bfa-7aab74ce4b35.png)

### 后续工作安排
+ 探索如何从json格式模型中获取layer数据
+ 优化完善代码

