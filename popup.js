document.addEventListener('DOMContentLoaded', () => {
  let currentDomain = '';

  const $ = id => document.getElementById(id);

  function refreshWhitelistUI() {
    chrome.storage.local.get({ whitelist: [] }, ({ whitelist }) => {
      const ul = $('list');
      ul.innerHTML = '';
      whitelist.forEach(domain => {
        const li  = document.createElement('li');
        li.textContent = domain;

        const btn = document.createElement('button');
        btn.textContent = 'Entfernen';
        btn.addEventListener('click', () => {
          chrome.storage.local.set({ whitelist: whitelist.filter(d => d !== domain) });
        });

        li.appendChild(btn);
        ul.appendChild(li);
      });

      $('toggle').textContent =
        whitelist.includes(currentDomain)
          ? 'Von Whitelist entfernen'
          : 'Zur Whitelist hinzufügen';
    });
  }

  /** Aktuelle Tab-Domain ermitteln */
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (!tabs[0]?.url) return;
    currentDomain = new URL(tabs[0].url).hostname;
    $('currentDomain').textContent = `Aktuelle Domain: ${currentDomain}`;
    refreshWhitelistUI();
  });

  /** Umschalter für die gerade offene Domain */
  $('toggle').addEventListener('click', () => {
    chrome.storage.local.get({ whitelist: [] }, ({ whitelist }) => {
      const next = whitelist.includes(currentDomain)
        ? whitelist.filter(d => d !== currentDomain)
        : [...whitelist, currentDomain];

      chrome.storage.local.set({ whitelist: next });
    });
  });

  /** Manuelle Eingabe */
  $('add').addEventListener('click', () => {
    const domain = $('domain').value.trim();
    if (!domain) return;

    chrome.storage.local.get({ whitelist: [] }, ({ whitelist }) => {
      if (!whitelist.includes(domain)) {
        chrome.storage.local.set({ whitelist: [...whitelist, domain] }, () => {
          $('domain').value = '';
        });
      }
    });
  });

  /** Änderungen in storage → UI updaten */
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.whitelist) {
      refreshWhitelistUI();
    }
  });
});
