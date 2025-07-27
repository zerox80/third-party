let currentDomain = '';

function updateList() {
  chrome.storage.local.get({whitelist: []}, data => {
    const listEl = document.getElementById('list');
    listEl.innerHTML = '';
    data.whitelist.forEach(domain => {
      const li = document.createElement('li');
      li.textContent = domain;
      const btn = document.createElement('button');
      btn.textContent = 'Entfernen';
      btn.addEventListener('click', () => {
        chrome.storage.local.set({whitelist: data.whitelist.filter(d => d !== domain)}, () => {
          updateList();
          updateToggle();
        });
      });
      li.appendChild(btn);
      listEl.appendChild(li);
    });
  });
}

function updateToggle() {
  chrome.storage.local.get({whitelist: []}, data => {
    const btn = document.getElementById('toggle');
    const isWhite = data.whitelist.includes(currentDomain);
    btn.textContent = isWhite ? 'Von Whitelist entfernen' : 'Zur Whitelist hinzufügen';
  });
}

chrome.tabs.query({active: true, currentWindow: true}, tabs => {
  const url = new URL(tabs[0].url);
  currentDomain = url.hostname;
  document.getElementById('currentDomain').textContent = 'Aktuelle Domain: ' + currentDomain;
  updateToggle();
});

document.getElementById('toggle').addEventListener('click', () => {
  chrome.storage.local.get({whitelist: []}, data => {
    let list = data.whitelist;
    if (list.includes(currentDomain)) {
      list = list.filter(d => d !== currentDomain);
    } else {
      list.push(currentDomain);
    }
    chrome.storage.local.set({whitelist: list}, () => {
      updateList();
      updateToggle();
    });
  });
});

document.getElementById('add').addEventListener('click', () => {
  const domain = document.getElementById('domain').value.trim();
  if (domain) {
    chrome.storage.local.get({whitelist: []}, data => {
      if (!data.whitelist.includes(domain)) {
        data.whitelist.push(domain);
        chrome.storage.local.set({whitelist: data.whitelist}, () => {
          document.getElementById('domain').value = '';
          updateList();
          updateToggle();
        });
      }
    });
  }
});

updateList();
