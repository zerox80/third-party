/* Service-Worker: baut zur Laufzeit zwei DNR-Regeln auf
   –  ID 1: löscht „Cookie“-Header in Anfragen
   –  ID 2: löscht „Set-Cookie“-Header in Antworten      */
const REQUEST_RULE_ID  = 1;
const RESPONSE_RULE_ID = 2;

/** Erzeugt die beiden Kernregeln */
function buildRules(whitelist = []) {
  const excluded = whitelist.map(d => d.toLowerCase()); // Domains, die wir durchlassen
  const baseCond = {
    domainType: 'thirdParty',
    excludedDomains: excluded,
    resourceTypes: [
      'sub_frame', 'script', 'xmlhttprequest',
      'image', 'font', 'media', 'object',
      'ping', 'other'
    ]
  };

  return [
    {
      id: REQUEST_RULE_ID,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [{ header: 'cookie', operation: 'remove' }]
      },
      condition: baseCond
    },
    {
      id: RESPONSE_RULE_ID,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        responseHeaders: [{ header: 'set-cookie', operation: 'remove' }]
      },
      condition: baseCond
    }
  ];
}

/** Setzt (bzw. ersetzt) die dynamischen Regeln */
async function applyRules(whitelist) {
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [REQUEST_RULE_ID, RESPONSE_RULE_ID],
    addRules:      buildRules(whitelist)
  });
}

/** Initialisieren */
async function init() {
  const { whitelist = [] } = await chrome.storage.local.get({ whitelist: [] });
  await applyRules(whitelist);
}
init();

/** Auf Änderungen der Whitelist reagieren */
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.whitelist) {
    applyRules(changes.whitelist.newValue);
  }
});
