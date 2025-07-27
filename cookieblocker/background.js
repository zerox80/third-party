let whitelist = [];

chrome.storage.local.get({whitelist: []}, data => {
  whitelist = data.whitelist;
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.whitelist) {
    whitelist = changes.whitelist.newValue;
  }
});

function hostname(url) {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return '';
  }
}

function isThirdParty(details) {
  if (!details.initiator) return false;
  const initiatorHost = hostname(details.initiator);
  const requestHost = hostname(details.url);
  return initiatorHost && requestHost && initiatorHost !== requestHost;
}

function inWhitelist(host) {
  return whitelist.some(domain => host === domain || host.endsWith('.' + domain));
}

chrome.webRequest.onBeforeSendHeaders.addListener(
  details => {
    if (isThirdParty(details)) {
      const host = hostname(details.url);
      if (!inWhitelist(host)) {
        const headers = details.requestHeaders.filter(h => h.name.toLowerCase() !== 'cookie');
        return {requestHeaders: headers};
      }
    }
  },
  {urls: ['<all_urls>']},
  ['blocking', 'requestHeaders', 'extraHeaders']
);

chrome.webRequest.onHeadersReceived.addListener(
  details => {
    if (isThirdParty(details)) {
      const host = hostname(details.url);
      if (!inWhitelist(host)) {
        const headers = details.responseHeaders.filter(h => h.name.toLowerCase() !== 'set-cookie');
        return {responseHeaders: headers};
      }
    }
  },
  {urls: ['<all_urls>']},
  ['blocking', 'responseHeaders', 'extraHeaders']
);
