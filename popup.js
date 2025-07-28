document.addEventListener('DOMContentLoaded', () => {
  let currentDomain = '';

  const $ = id => document.getElementById(id);

  function normalizeDomain(input) {
    if (!input) return '';
    const str = input.trim().toLowerCase();
    try {
      const url = new URL(str.includes('://') ? str : `http://${str}`);
      return url.hostname;
    } catch {
      return str;
    }
  }

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
          chrome.storage.local.get({ whitelist: [] }, ({ whitelist: list }) => {
            const next = list.filter(d => d !== domain);
            chrome.storage.local.set({ whitelist: next });
          });
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
    currentDomain = normalizeDomain(new URL(tabs[0].url).hostname);
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
    const domain = normalizeDomain($('domain').value);
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
