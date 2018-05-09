# 如何用VisualDL可视化 Embedding

在这里，我们将向您展示如何在 PyTorch 中使用 VisualDL 可视化 Embedding。
Embedding 常用于自然语言处理中，他能将语义使用高维向量来表示。

Embedding 可视化有助于验证训练算法，Embedding 可视化会将高维向量压缩到二维/三维空间，
两个词越接近，它们共享的语义意义就越明显。

我们使用 PyTorch [embedding 示例](http://pytorch.org/tutorials/beginner/nlp/word_embeddings_tutorial.html) 示例作为基础。

以下就是全部的 embedding Python 脚本，
您可以直接在 Python 环境中测试它。

```
import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim

torch.manual_seed(1)

CONTEXT_SIZE = 2
EMBEDDING_DIM = 10
# We will use Shakespeare Sonnet 2
test_sentence = """When forty winters shall besiege thy brow,
And dig deep trenches in thy beauty's field,
Thy youth's proud livery so gazed on now,
Will be a totter'd weed of small worth held:
Then being asked, where all thy beauty lies,
Where all the treasure of thy lusty days;
To say, within thine own deep sunken eyes,
Were an all-eating shame, and thriftless praise.
How much more praise deserv'd thy beauty's use,
If thou couldst answer 'This fair child of mine
Shall sum my count, and make my old excuse,'
Proving his beauty by succession thine!
This were to be new made when thou art old,
And see thy blood warm when thou feel'st it cold.""".split()
# we should tokenize the input, but we will ignore that for now
# build a list of tuples.  Each tuple is ([ word_i-2, word_i-1 ], target word)
trigrams = [([test_sentence[i], test_sentence[i + 1]], test_sentence[i + 2])
            for i in range(len(test_sentence) - 2)]
# print the first 3, just so you can see what they look like
print(trigrams[:3])

vocab = set(test_sentence)
word_to_ix = {word: i for i, word in enumerate(vocab)}


class NGramLanguageModeler(nn.Module):

    def __init__(self, vocab_size, embedding_dim, context_size):
        super(NGramLanguageModeler, self).__init__()
        self.embeddings = nn.Embedding(vocab_size, embedding_dim)
        self.linear1 = nn.Linear(context_size * embedding_dim, 128)
        self.linear2 = nn.Linear(128, vocab_size)

    def forward(self, inputs):
        embeds = self.embeddings(inputs).view((1, -1))
        out = F.relu(self.linear1(embeds))
        out = self.linear2(out)
        log_probs = F.log_softmax(out, dim=1)
        return log_probs


losses = []
loss_function = nn.NLLLoss()
model = NGramLanguageModeler(len(vocab), EMBEDDING_DIM, CONTEXT_SIZE)
optimizer = optim.SGD(model.parameters(), lr=0.001)

for epoch in range(10):
    total_loss = torch.Tensor([0])
    for context, target in trigrams:

        # Step 1. Prepare the inputs to be passed to the model (i.e, turn the words
        # into integer indices and wrap them in variables)
        context_idxs = torch.tensor([word_to_ix[w] for w in context], dtype=torch.long)

        # Step 2. Recall that torch *accumulates* gradients. Before passing in a
        # new instance, you need to zero out the gradients from the old
        # instance
        model.zero_grad()

        # Step 3. Run the forward pass, getting log probabilities over next
        # words
        log_probs = model(context_idxs)

        # Step 4. Compute your loss function. (Again, Torch wants the target
        # word wrapped in a variable)
        loss = loss_function(log_probs, torch.tensor([word_to_ix[target]], dtype=torch.long))

        # Step 5. Do the backward pass and update the gradient
        loss.backward()
        optimizer.step()

        # Get the Python number from a 1-element Tensor by calling tensor.item()
        total_loss += loss.item()
    losses.append(total_loss)
print(losses)  # The loss decreased every iteration over the training data!
```

这是生成第一个 embedding 所需的所有代码。
现在，让我们添加一小段代码来将 embedding 存储到 VisualDL 日志中，之后就能利用 VisualDL 来进行可视化。

```
# Import VisualDL
from visualdl import LogWriter
# VisualDL setup
logw = LogWriter("./embedding_log", sync_cycle=10000)
with logw.mode('train') as logger:
    embedding = logger.embedding()

embeddings_list = model.embeddings.weight.data.numpy()  # convert to numpy array

# VisualDL embedding log writer takes two parameters
# The first parameter is embedding list. The type is list[list[float]]
# The second parameter is word_dict. The type is dictionary<string, int>.
embedding.add_embeddings_with_word_dict(embeddings_list, word_to_ix)
```

将上述代码嵌入到您的embedding训练程序中，
这将 embedding 和 word_dict 保存到 `./embedding_log` 文件夹中。

现在我们可以用 `visualdl --logdir=./embedding_log` 执行VisualDL，
使用浏览器导航到 `localhost:8080`，切换到 `High Dimensional` 。

你可以下载教程代码 [这里](https://github.com/PaddlePaddle/VisualDL/blob/develop/demo/pytorch/pytorch_word2vec.py)。
