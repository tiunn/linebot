var rapidAPICVURL = 'https://microsoft-azure-microsoft-computer-vision-v1.p.rapidapi.com/analyze?visualfeatures=Tags%2CDescription&language=zh';

function doPost(e) {
  var msg= JSON.parse(e.postData.contents);
  console.log(msg);
  
  var replyToken = msg.events[0].replyToken;
  var type = msg.events[0].message.type;
  var msgId = msg.events[0].message.id;

  if (type == 'image') {
    var contentType = msg.events[0].message.contentProvider.type;
    var imageBin = getImage(msgId);
    var caption = getCV(imageBin);
    sendMessage('reply', replyToken, caption);
    return;
  }
}

function getImage(msgId) {
  var url = baseURL + msgId + '/content';
  
  var response = UrlFetchApp.fetch(url, {
      'headers': {
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
     },
    'method': 'get',
  });
  
  var image = response.getContent();

  return image;
}

function getCV(img) {
  var url = rapidAPICVURL;
  
  var formData = {
    'image': img,
  };
  
  var response = UrlFetchApp.fetch(url, {
      'headers': {
      'x-rapidapi-host': 'microsoft-azure-microsoft-computer-vision-v1.p.rapidapi.com',
      'x-rapidapi-key': rapidAPIToken,
      'content-type': 'application/octet-stream',
     },
    'method': 'post',
    'payload': img
  });

  var content = response.getContentText();
  var json = JSON.parse(content);
  var desc = json['description']['captions'][0]['text'];
  var confidence = json['description']['captions'][0]['confidence'].toString().substr(0, 10);

  var tags = '';
  json['tags'].forEach(function(r) {
    if (r['confidence'] > 0.9) {
      tags += r['name'] + ', ';
    }
  });
  
  if (tags.length > 2) {
    tags = tags.slice(0, tags.length -2);
  }
  var text = 'Tags: ' + tags + '\nDesc: ' + desc + '\nConf: ' + confidence;
  
  return xlateString('zh-CHS', 'zh-CHT', text);
}
