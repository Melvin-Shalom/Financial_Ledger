// Retrieve stored transactions or initialize an empty array
const ledgerEntries = JSON.parse(localStorage.getItem("ledgerEntries")) || [];

// Configure currency formatter for Indian Rupees
const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

// DOM element references
const entryList = document.getElementById("transactionList");
const entryForm = document.getElementById("transactionForm");
const statusMessage = document.getElementById("statusMessage");
const balanceDisplay = document.getElementById("balance");
const revenueDisplay = document.getElementById("revenue");
const expenditureDisplay = document.getElementById("expenditure");

// Event listener for form submission
entryForm.addEventListener("submit", addEntry);

// Format amount without negative sign
function formatAmount(amount) {
  return currencyFormatter.format(Math.abs(amount));
}

// Update financial summary
function updateFinancialSummary() {
  const totalRevenue = ledgerEntries
    .filter((entry) => entry.type === "revenue")
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalExpenditure = ledgerEntries
    .filter((entry) => entry.type === "expenditure")
    .reduce((sum, entry) => sum + entry.amount, 0);

  const netBalance = totalRevenue - totalExpenditure;

  balanceDisplay.textContent = formatAmount(netBalance);
  revenueDisplay.textContent = formatAmount(totalRevenue);
  expenditureDisplay.textContent = formatAmount(totalExpenditure);
}

// Render transaction list
function renderEntryList() {
  entryList.innerHTML = "";
  statusMessage.textContent = "";

  if (ledgerEntries.length === 0) {
    statusMessage.textContent = "No entries recorded.";
    return;
  }

  ledgerEntries.forEach(({ id, name, amount, date, type }) => {
    const entryElement = document.createElement("li");

    entryElement.innerHTML = `
      <div class="entry-details">
        <h4>${name}</h4>
        <p>${new Date(date).toLocaleDateString()}</p>
      </div>
      <div class="entry-amount ${type}">
        <span>${formatAmount(amount)}</span>
      </div>
      <div class="entry-action">
        <button onclick="removeEntry(${id})">Remove</button>
      </div>
    `;

    entryList.appendChild(entryElement);
  });
}

// Initialize the view
renderEntryList();
updateFinancialSummary();

// Remove an entry
function removeEntry(id) {
  const entryIndex = ledgerEntries.findIndex((entry) => entry.id === id);
  ledgerEntries.splice(entryIndex, 1);

  updateFinancialSummary();
  saveEntries();
  renderEntryList();
}

// Add a new entry
function addEntry(event) {
  event.preventDefault();

  const formData = new FormData(event.target);

  // Use current date if no date is selected
  const entryDate = formData.get("date") ? new Date(formData.get("date")) : new Date();

  ledgerEntries.push({
    id: Date.now(),
    name: formData.get("name"),
    amount: parseFloat(formData.get("amount")),
    date: entryDate,
    type: formData.get("type")
  });

  event.target.reset();

  updateFinancialSummary();
  saveEntries();
  renderEntryList();
}

// Save entries to local storage
function saveEntries() {
  ledgerEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
  localStorage.setItem("ledgerEntries", JSON.stringify(ledgerEntries));
}
