function gmailToLINE() {
  var toArray = getFriends();
  var label = GmailApp.getUserLabelByName('ToLINE');
  var messages = [];
  var threads = label.getThreads();
  
  if (threads.length == 0) return;
  
  for (var i = 0; i < threads.length; i++) {
    messages = messages.concat(threads[i].getMessages())
  }

  for (var i = 0; i < messages.length; i++) {
    var message = messages[i];
    var userMessage = '*New Email*';
    userMessage += '\n*from:* ' + message.getFrom();
    userMessage += '\n*to:* ' + message.getTo();
    userMessage += '\n*cc:* ' + message.getCc();
    userMessage += '\n*date:* ' + message.getDate();
    userMessage += '\n*subject:* ' + message.getSubject();
    //userMessage += '\n*body:* ' + message.getPlainBody();
    var response = sendMessage('multicast', toArray, userMessage);
    if (response.getResponseCode() == 200) {
      label.removeFromThreads(threads);
    }
  }
}
