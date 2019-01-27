# How to visualize embedding with VisualDL

Here we would like to show you how to visualize embeddings with
VisualDL in PyTorch.

Embedding is often used in NLP(Nature Language Processing), it can represent the
sematic meanings with high dimensional vectors.

Embedding visualization is useful to verify the training algorithm,
as visualization can reduce the high dimensional vector to 2D / 3D spaces.
The closer two words are, the more sematic meaning they share.

We use the PyTorch [embedding example](http://pytorch.org/tutorials/beginner/nlp/word_embeddings_tutorial.html) as
the base. Here is the whole embedding program. The following block is a working python script.
Feel free to test it in your python environment.

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

That's all the code you need to generate your first embedding.

Now, let us just add a little bit of code to store the embedding to VisualDL log
so we can visualize it later.

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

Insert the above code snippet into your embedding training program.

This will save the embeddings and the word dictionary to the `./embedding_log` folder.

We can now activate the VisualDL by running `visualdl --logdir=./embedding_log`.
Use your browser to navigate to `localhost:8080`, switch the tab to `High Dimensional`

You can download the tutorial code [here](https://github.com/PaddlePaddle/VisualDL/blob/develop/demo/pytorch/pytorch_word2vec.py).
