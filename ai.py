import torch
import torch.nn as nn
from transformers import AutoModel, BertTokenizerFast

def comprehend(str):
    class BERT_Arch(nn.Module):

        def __init__(self, bert):
            super(BERT_Arch, self).__init__()
            self.bert = bert
            # dropout layer
            self.dropout = nn.Dropout(0.1)
            # relu activation function
            self.relu =  nn.ReLU()
            # dense layer 1
            self.fc1 = nn.Linear(768,512)
            # dense layer 2 (Output layer)
            self.fc2 = nn.Linear(512,2)
            #softmax activation function
            self.softmax = nn.LogSoftmax(dim=1)
            #define the forward pass
        def forward(self, sent_id, mask):
            #pass the inputs to the model
            _, cls_hs = self.bert(sent_id, attention_mask=mask, return_dict=False)
            x = self.fc1(cls_hs)
            x = self.relu(x)
            x = self.dropout(x)
            # output layer
            x = self.fc2(x)
            # apply softmax activation
            x = self.softmax(x)
            return x
    bert = AutoModel.from_pretrained('bert-base-uncased')
    tokenizer = BertTokenizerFast.from_pretrained('bert-base-uncased')
    model = BERT_Arch(bert)
    device = 'cpu'

    path = 'saved_weights.pt'
    model.load_state_dict(torch.load(path, map_location=torch.device('cpu')))

    x = tokenizer.batch_encode_plus(str.split('\n'), truncation=True, return_token_type_ids=False)
    x_seq = torch.tensor(x['input_ids'])
    x_mask = torch.tensor(x['attention_mask'])
    with torch.no_grad():
        preds = torch.softmax(model(x_seq.to(device), x_mask.to(device)), dim=1).detach().cpu().numpy()
        # preds = np.argmax(preds, axis = 1)
        # print(preds[0])
        if preds[0][0] > 0.55:
            return True
        return False


# print(comprehend(input("Enter:")))