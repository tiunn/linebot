function sendMessage(sendType, destination, text) {
  var url = baseURL + sendType;
  var payload = {
    'messages': [{
      'type': 'text',
      }],
  };
  
  if (text === undefined && sendType === 'broadcast') {
    text = destination;
  } else {
    payload.to = destination;
  }
  payload.messages[0].text = text;
  
  if (sendType == 'reply') {
    payload.replyToken = destination;
    delete payload.to;
  }

  var response = UrlFetchApp.fetch(url, {
      'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
     },
    'method': 'post',
    'payload': JSON.stringify(payload),
  });

  return response;
}
