document.addEventListener('DOMContentLoaded', function() {
  // Ermittlung der bevorzugten Sprache des Nutzers; Fallback ist "de"
  const userLanguage = navigator.language || 'de';
  
  // Elemente aus dem DOM abrufen:
  // Lokale Navigation
  const localNav = document.getElementById('localNav');
  // Übergeordneter Container, der lokale Navigation und Content enthält
  const mainContainer = document.querySelector('.main-container');

  // Anpassung der lokalen Navigation je nach Sprache:
  // Bei hebräisch oder arabisch soll die Navigation rechts angezeigt werden (Desktop)
  if (userLanguage.startsWith('he') || userLanguage.startsWith('ar')) {
    localNav.style.textAlign = 'right';
    if (window.innerWidth >= 992) {
      mainContainer.style.flexDirection = 'row-reverse';
    }
  } else {
    localNav.style.textAlign = 'left';
    if (window.innerWidth >= 992) {
      mainContainer.style.flexDirection = 'row';
    }
  }

  // Header-Verkleinerung beim Scrollen:
  window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.pageYOffset > 50) {
      header.classList.add('header-small');
    } else {
      header.classList.remove('header-small');
    }
  });

  // Lade YAML-Daten und befülle die Tabelle:
  loadYAMLData();

  // Filter-Funktion: Bei Eingabe im Filterfeld wird die Tabelle gefiltert.
  const filterInput = document.getElementById('filterInput');
  filterInput.addEventListener('input', function() {
    filterTable();
    // Aktualisiere nach dem Filtern den Gesamtausstoß
    updateTotalCO2();
  });

  // Sortier-Funktionalität:
  const sortState = {
    land: true,
    unternehmen: true,
    emissionen: true
  };

  // Click-EventListener für die Tabellenköpfe, um die Sortierung zu toggeln.
  const headers = document.querySelectorAll('#co2Table thead th');
  headers.forEach(header => {
    header.addEventListener('click', function() {
      const sortKey = header.getAttribute('data-sort');
      sortState[sortKey] = !sortState[sortKey]; // Toggle des Sortierzustands
      sortTable(sortKey, sortState[sortKey]);
      // Nach dem Sortieren wird der Gesamtausstoß aktualisiert
      updateTotalCO2();
    });
  });
});

// ============================================================================================
// Funktion: loadYAMLData()
// ============================================================================================
// Lädt asynchron die YAML-Daten aus "data/data.yaml" mithilfe der Fetch API,
// wandelt die Antwort in Text um, parst diesen mit js-yaml in ein Objekt
// und ruft populateTable() auf, um die Tabelle zu befüllen.
function loadYAMLData() {
  fetch('data/data.yaml')
    .then(response => response.text())
    .then(yamlText => {
      const data = jsyaml.load(yamlText);
      populateTable(data.entries);
      // Nach dem Befüllen der Tabelle wird auch der Gesamtausstoß berechnet
      updateTotalCO2();
    })
    .catch(error => console.error('Fehler beim Laden der YAML-Daten:', error));
}

// ============================================================================================
// Funktion: populateTable(entries)
// Parameter: entries – Array von Objekten mit CO₂-Emissionsdaten
// ============================================================================================
// Befüllt den Tabellenkörper (<tbody>) mit Datenzeilen, die Land, Unternehmen und Emissionen darstellen.
function populateTable(entries) {
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = ''; // Leert den Tabellenkörper
  
  entries.forEach(entry => {
    const tr = document.createElement('tr');
    
    const tdLand = document.createElement('td');
    tdLand.textContent = entry.land;
    tr.appendChild(tdLand);
    
    const tdUnternehmen = document.createElement('td');
    tdUnternehmen.textContent = entry.unternehmen;
    tr.appendChild(tdUnternehmen);
    
    const tdEmissionen = document.createElement('td');
    tdEmissionen.textContent = entry.emissionen;
    tr.appendChild(tdEmissionen);
    
    tbody.appendChild(tr);
  });
}

// ============================================================================================
// Funktion: filterTable()
// ============================================================================================
// Filtert die Tabellenzeilen basierend auf dem Suchbegriff im Eingabefeld "filterInput".
// Es werden nur Zeilen angezeigt, deren kombinierter Text den Suchbegriff enthält.
function filterTable() {
  const filterValue = sanitizeInput(document.getElementById('filterInput').value.toLowerCase());
  const table = document.getElementById('co2Table');
  const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
  
  Array.from(rows).forEach(row => {
    const cells = row.getElementsByTagName('td');
    const rowText = Array.from(cells).map(cell => cell.textContent.toLowerCase()).join(" ");
    row.style.display = rowText.indexOf(filterValue) > -1 ? "" : "none";
  });
}

// ============================================================================================
// Funktion: updateTotalCO2()
// ============================================================================================
// Diese Funktion berechnet den Gesamtausstoß an CO₂, indem sie über alle sichtbaren 
// Tabellenzeilen iteriert und die Emissionswerte (aus der dritten Spalte) summiert.
// Das Ergebnis wird dann im Element mit der ID "co2Total" angezeigt.
function updateTotalCO2() {
  let total = 0;
  const rows = document.querySelectorAll('#co2Table tbody tr');
  rows.forEach(row => {
    // Nur Zeilen, die sichtbar sind, werden berücksichtigt
    if (row.style.display !== "none") {
      const emissionCell = row.getElementsByTagName('td')[2];
      const value = parseFloat(emissionCell.textContent) || 0;
      total += value;
    }
  });
  // Aktualisiere den Inhalt des Elements mit der ID "co2Total" und formatiere den Wert
  document.getElementById('co2Total').textContent = "Gesamtausstoß: " + total.toLocaleString("de-DE") + " Tonnen";
}

// ============================================================================================
// Funktion: sortTable(sortKey, sortAscending)
// Parameter:
//   sortKey – Schlüssel, z. B. "land", "unternehmen", "emissionen"
//   sortAscending – Boolean, true für aufsteigend, false für absteigend
// ============================================================================================
// Sortiert die Tabellenzeilen anhand des angegebenen Schlüssels. Numerische Werte werden als Zahlen
// verglichen, bei Textspalten erfolgt ein lexikographischer Vergleich.
function sortTable(sortKey, sortAscending) {
  const table = document.getElementById('co2Table');
  const tbody = table.getElementsByTagName('tbody')[0];
  const rows = Array.from(tbody.getElementsByTagName('tr'));
  let columnIndex;
  
  switch (sortKey) {
    case 'land':
      columnIndex = 0;
      break;
    case 'unternehmen':
      columnIndex = 1;
      break;
    case 'emissionen':
      columnIndex = 2;
      break;
    default:
      return;
  }
  
  rows.sort((a, b) => {
    let cellA = a.getElementsByTagName('td')[columnIndex].textContent.trim();
    let cellB = b.getElementsByTagName('td')[columnIndex].textContent.trim();
    
    if (sortKey === 'emissionen') {
      return sortAscending ? parseFloat(cellA) - parseFloat(cellB) : parseFloat(cellB) - parseFloat(cellA);
    }
    return sortAscending ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA);
  });
  
  rows.forEach(row => tbody.appendChild(row));
}

// ============================================================================================
// Funktion: sanitizeInput(input)
// ============================================================================================
// Ersetzt potenziell gefährliche Zeichen im Eingabestring durch sichere HTML-Entitäten,
// um das Risiko von Code-Injektionen zu minimieren.
function sanitizeInput(input) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  return input.replace(/[&<>"'/]/g, match => map[match]);
}
