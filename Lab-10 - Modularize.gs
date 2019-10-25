function doPost(e) {
  var msg= JSON.parse(e.postData.contents);
  console.log(msg);
  
  var replyToken = msg.events[0].replyToken;
  var userMessage = msg.events[0].message.text;
  var keyword = userMessage.toLowerCase().split(":");
  var help = "gas\t\t\t\t油價預估\nid\t\t\t\t帳號ID\nxlate:{f},{t}:{str}翻譯\nc2e:{string}\t中翻英\ne2c:{string}\t英翻中\nlangs\t\t\t語言代碼\nq:{q}\t\t\t\股價查詢";
  
  switch (keyword[0]) {
    case 'gas':
      userMessage = getGasPrice();
      break;
    case 'id':
      var userID = msg.events[0].source.userId;
      userMessage = userID;
      break;
    case 'help':
      userMessage = help;
      break;
    default:
      return;
  }
  if (typeof replyToken === 'undefined') {
    return;
  }  

  sendMessage('reply', replyToken, userMessage);
}

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

function doPush() {
  var sheet = spreadsheet.getSheetByName('Friends');
  var toID = sheet.getRange("a1").getValue();
  
  sendMessage('push', toID, getGasPrice());
}

function doMulticast() {
  sendMessage('multicast', getFriends(), getGasPrice());
}

function getGasPrice() {
  var sheet = spreadsheet.getSheetByName('Price');
//  var price = sheet.getRange("b5").getValue() + '\n' + sheet.getRange("c5").getValue();
  var price = sheet.getRange("a2").getValue();
  return price;
}

function getFriends() {
  var sheet = spreadsheet.getSheetByName('Friends');
  var numFriends = sheet.getLastRow();
  var toArray = [];
  
  for (var i = 1; i <= numFriends; i++) {
    toArray.push(sheet.getRange(i, 1).getValue());
  }
  return toArray;
}

function gmailToLINE() {
  var toArray = getFriends();
  var label = GmailApp.getUserLabelByName('ToLINE');
  var messages = [];
  var threads = label.getThreads();
  
  if (threads.length == 0) return;
  
  for (var i = 0; i < threads.length; i++) {
    messages = messages.concat(threads[i].getMessages())
  }
  
  var userMessage = '';

  for (var i = 0; i < messages.length; i++) {
    var message = messages[i];
    userMessage += '*New Email*';
    userMessage += '\n*from:* ' + message.getFrom();
    userMessage += '\n*to:* ' + message.getTo();
    userMessage += '\n*cc:* ' + message.getCc();
    userMessage += '\n*date:* ' + message.getDate();
    userMessage += '\n*subject:* ' + message.getSubject() + '\n\n\n';
    //userMessage += '\n*body:* ' + message.getPlainBody();
  }
  var response = sendMessage('multicast', toArray, userMessage);
  if (response.getResponseCode() == 200) {
    label.removeFromThreads(threads);
  }
}
