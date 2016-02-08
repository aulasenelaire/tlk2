chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type == "request_info") {
    sendResponse({
      info: {
        token: localStorage.token,
      }
    });
  }
});
