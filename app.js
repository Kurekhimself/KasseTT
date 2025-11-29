// Prevent default touch events to disable zooming on touch devices
document.addEventListener('touchstart', function(event) {
    if (event.touches.length > 1) { // If more than one finger is used (e.g., pinch-to-zoom)
        event.preventDefault();
    }
}, { passive: false }); // Use passive: false to ensure preventDefault works

// Array to store the selected items in the order
let orderItems = [];

// Constants for DOM elements
const productButtonsContainer = document.getElementById('product-buttons');
const orderList = document.getElementById('order-list');
const emptyListMessage = document.getElementById('empty-list-message');
const currentSumDisplay = document.getElementById('current-sum');
const totalPfandDisplay = document.getElementById('total-pfand');
const returnedPfandDisplay = document.getElementById('returned-pfand');
const finalTotalDisplay = document.getElementById('final-total');
const pfandAddedCounter = document.getElementById('counter-pfand-added'); // New: Reference to the Pfand added counter
const pfandReturnedCounter = document.getElementById('counter-pfand-returned');

// Daily Totals DOM Elements
const dailyRevenueDisplay = document.getElementById('daily-revenue');
const dailyProductsSoldDisplay = document.getElementById('daily-products-sold');
const dailyPfandCollectedDisplay = document.getElementById('daily-pfand-collected');
const dailyPfandReturnedDisplay = document.getElementById('daily-pfand-returned');

// Define available products for a Christmas market mulled wine stand
// Produkte sind nach einem Weihnachtsmarkt Glühweinstand modelliert
const products = [
    // Winzerglühwein (Rot oder Weiß)
    { name: 'Winzerglühwein', price: 4.00, isPfand: true },
    // Glühwein-Schuss
    // NEU: Butterscotch hinzugefügt
    // Heißgetränke
    { name: 'Eierpunsch mit Sahne', price: 5.00, isPfand: true },
    { name: 'Kinderpunsch', price: 3.50, isPfand: true },
    { name: 'Heißer Kakao', price: 3.50, isPfand: true },
    // Kaltgetränke
    { name: 'Bier', price: 3.50, isPfand: false },
    { name: 'Wasser', price: 2.00, isPfand: false },
    { name: '„Harte Haselnuss“', price: 3.00, isPfand: false },
        { name: 'Butterscotch', price: 2.50, isPfand: false }, 
        { name: 'Apfelstrudel mit Sahne', price: 2.00, isPfand: false }, // Laut Liste 2cl, wird als Einzel-Produkt behandelt
        { name: 'Schuss Rum/Amaretto', price: 1.00, isPfand: false }, 
    { name: 'Flasche Glühwein', price: 8.00, isPfand: false },
    { name: 'Flasche Harte Haselnuss', price: 15.00, isPfand: false },
    { name: 'Flasche Apfelstrudel', price: 20.00, isPfand: false },
{ name: 'Flasche Butterscoth', price: 20.00, isPfand: false },



];

// Pfand value - **ANGEPASST auf 3.00 €**
const PFAND_VALUE = 3.00; 
let returnedPfandCount = 0; // Tracks the number of returned Pfand items

/**
 * Initializes the product buttons dynamically from the 'products' array.
 * Each button now includes a counter for the number of times the item is in the cart.
 */
function initializeProductButtons() {
    productButtonsContainer.innerHTML = ''; // Clear existing buttons to prevent duplicates on re-init
    products.forEach(product => {
        const button = document.createElement('button');
        // Use 'primary' color for all buttons as requested
        // Added 'relative' for absolute positioning of the counter
        button.className = `relative p-4 rounded-lg shadow-md text-white font-semibold flex flex-col items-center justify-center text-center transition duration-300 ease-in-out transform hover:scale-105
                             bg-primary hover:bg-gray-700`;
        button.innerHTML = `
                        <span class="text-xl">${product.name}</span>
                        <span class="text-sm mt-1">${product.price.toFixed(2)} €</span>
                        <span id="counter-${product.name.replace(/\s/g, '-')}" class="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center opacity-0 transition-opacity duration-200">0</span>
                    `;
        button.onclick = () => addProductToOrder(product);
        productButtonsContainer.appendChild(button);
    });
    updateProductButtonCounters(); // Set initial counts to 0
    updatePfandAddedCounter(); // Set initial Pfand added count to 0
    updatePfandReturnedCounter();
}

/**
 * Adds a selected product to the order list.
 * @param {Object} product - The product object to add.
 */
function addProductToOrder(product) {
    orderItems.push(product);
    renderOrderList();
    calculateTotals();
    updateProductButtonCounters(); // Update counters after adding an item
}

/**
 * Adds a selected product to the order list by name.
 * @param {string} name - The name of the product to add.
 */
function addProductToOrderByName(name) {
    const product = products.find(p => p.name === name);
    if (product) {
        addProductToOrder(product);
    }
}

/**
 * Adds a Pfand item to the order (simulating a deposit item being purchased).
 * This adds a conceptual 'Pfand' item to ensure the total pfand count increases.
 */
function addPfand() {
    orderItems.push({ name: 'Pfand', price: PFAND_VALUE, isPfand: false });
    renderOrderList();
    calculateTotals();
    updatePfandAddedCounter(); // Update Pfand added counter
}

/**
 * Simulates a Pfand item being returned, allowing for unlimited returns independent of already added Pfand items.
 */
function removePfand() {
    returnedPfandCount++; // Increment returned Pfand count without restrictions
    renderOrderList(); // Update the order list if needed
    calculateTotals(); // Recalculate totals with updated returned Pfand
    updatePfandReturnedCounter();
}

/**
 * Renders (or re-renders) the order list based on the 'orderItems' array.
 */
function renderOrderList() {
    orderList.innerHTML = ''; // Clear existing list items

    if (orderItems.length === 0) {
        emptyListMessage.style.display = 'block'; // Show empty message
        return;
    }

    emptyListMessage.style.display = 'none'; // Hide empty message

    const groupedItems = orderItems.reduce((acc, item) => {
        if (!acc[item.name]) {
            acc[item.name] = { ...item, quantity: 0, totalPrice: 0 };
        }
        acc[item.name].quantity++;
        acc[item.name].totalPrice += item.price;
        return acc;
    }, {});

    Object.values(groupedItems).forEach(item => {
        const listItem = document.createElement('li');
        listItem.className = 'flex justify-between items-center bg-gray-50 p-3 rounded-md shadow-sm text-gray-800';
        listItem.innerHTML = `
                        <div class="flex items-center">
                            <button class="text-red-500 hover:text-red-700 font-bold p-1 rounded-full transition duration-200" onclick="removeSingleItem('${item.name}')">-</button>
                            <span class="mx-2">${item.quantity}x ${item.name}</span>
                            <button class="text-green-500 hover:text-green-700 font-bold p-1 rounded-full transition duration-200" onclick="addProductToOrderByName('${item.name}')">+</button>
                        </div>
                        <span>${item.totalPrice.toFixed(2)} €</span>
                        <button class="ml-2 text-red-500 hover:text-red-700 text-sm font-bold p-1 rounded-full transition duration-200" onclick="removeAllItems('${item.name}')">
                            &times;
                        </button>
                    `;
        orderList.appendChild(listItem);
    });
}

/**
 * Updates the counter displayed on the "Pfand Zurück" button.
 */
function updatePfandReturnedCounter() {
    if (pfandReturnedCounter) {
        pfandReturnedCounter.textContent = returnedPfandCount;
        if (returnedPfandCount > 0) {
            pfandReturnedCounter.classList.remove('opacity-0');
            pfandReturnedCounter.classList.add('opacity-100');
        } else {
            pfandReturnedCounter.classList.remove('opacity-100');
            pfandReturnedCounter.classList.add('opacity-0');
        }
    }
}

/**
 * Removes all items of a given name from the order.
 * @param {string} name - The name of the items to remove.
 */
function removeAllItems(name) {
    orderItems = orderItems.filter(item => item.name !== name);

    renderOrderList();
    calculateTotals();
    updateProductButtonCounters();
    updatePfandAddedCounter();
}

/**
 * Removes one item of a given name from the order.
 * @param {string} name - The name of the item to remove.
 */
function removeSingleItem(name) {
    const itemIndex = orderItems.findIndex(item => item.name === name);
    if (itemIndex > -1) {
        orderItems.splice(itemIndex, 1);
    }
    renderOrderList();
    calculateTotals();
    updateProductButtonCounters();
    updatePfandAddedCounter();
}

/**
 * Calculates and updates all sum displays (current sum, total Pfand, returned Pfand, final total).
 */
function calculateTotals() {
    let baseProductPricesSum = 0; // Sum of all product base prices
    let currentSumNonPfand = 0; // Sum of product prices WITHOUT Pfand (for display purposes)
    let pfandBearingItemsCount = 0; // Counter for items that have Pfand (from products)

    orderItems.forEach((item) => {
        // Add the price of EACH item to the base sum of product prices.
        if (item.name !== 'Pfand') {
            baseProductPricesSum += item.price;
        }

        if (item.isPfand) { // Only count products that bear pfand
            // Count the Pfand items to calculate the total added Pfand later.
            pfandBearingItemsCount++;
            currentSumNonPfand += item.price;
        } else if (item.name !== 'Pfand') {
            // Add the price of NON-Pfand items to the special display for "current sum without Pfand".
            currentSumNonPfand += item.price;
        }
    });

    // Calculate total added Pfand based on the number of Pfand items.
    const totalPfandAdded = pfandBearingItemsCount * PFAND_VALUE + (orderItems.filter(item => item.name === 'Pfand').length * PFAND_VALUE);

    // No restriction: show the full value of returned Pfand, regardless of total added Pfand.
    const totalReturnedPfand = returnedPfandCount * PFAND_VALUE;

    // Final total = sum of base prices of ALL items + total added Pfand - returned Pfand
    const finalTotal = baseProductPricesSum + totalPfandAdded - totalReturnedPfand;

    // Update display elements with the new calculated values
    currentSumDisplay.textContent = currentSumNonPfand.toFixed(2) + ' €';
    totalPfandDisplay.textContent = totalPfandAdded.toFixed(2) + ' €';
    returnedPfandDisplay.textContent = totalReturnedPfand.toFixed(2) + ' €';
    finalTotalDisplay.textContent = finalTotal.toFixed(2) + ' €';
}

/**
 * Clears the entire order and resets all sums.
 */
function finalizeOrder() {
    const finalTotal = parseFloat(finalTotalDisplay.textContent);
    if (finalTotal > 0) {
        dailyTotals.revenue += finalTotal;
    }

    dailyTotals.productsSold += orderItems.filter(item => item.name !== 'Pfand').length;
    dailyTotals.pfandCollected += (orderItems.filter(item => item.isPfand || item.name === 'Pfand').length) * PFAND_VALUE;
    dailyTotals.pfandReturned += returnedPfandCount * PFAND_VALUE;

    updateDailyTotals();
    clearOrder();
}

function clearOrder() {
    orderItems = [];
    returnedPfandCount = 0; // Reset returned pfand count
    renderOrderList();
    calculateTotals();
    updateProductButtonCounters(); // Reset all product counters after clearing the order
    updatePfandAddedCounter(); // Reset Pfand added counter
    updatePfandReturnedCounter();
}

/**
 * Updates the counter displayed on each product button based on the current orderItems.
 */
function updateProductButtonCounters() {
    products.forEach(product => {
        // Count occurrences of the current product in the orderItems array
        const count = orderItems.filter(item => item.name === product.name).length;
        const counterSpan = document.getElementById(`counter-${product.name.replace(/\s/g, '-')}`);

        if (counterSpan) {
            counterSpan.textContent = count;
            // Show counter if count > 0, hide otherwise
            if (count > 0) {
                counterSpan.classList.remove('opacity-0');
                counterSpan.classList.add('opacity-100');
            } else {
                counterSpan.classList.remove('opacity-100');
                counterSpan.classList.add('opacity-0');
            }
        }
    });
}

/**
 * Updates the counter displayed on the "Pfand Hinzufügen" button.
 */
function updatePfandAddedCounter() {
    const count = orderItems.filter(item => item.name === 'Pfand').length;
    if (pfandAddedCounter) {
        pfandAddedCounter.textContent = count;
        if (count > 0) {
            pfandAddedCounter.classList.remove('opacity-0');
            pfandAddedCounter.classList.add('opacity-100');
        } else {
            pfandAddedCounter.classList.remove('opacity-100');
            pfandAddedCounter.classList.add('opacity-0');
        }
    }
}

// Daily Totals Logic
let dailyTotals = {
    revenue: 0,
    productsSold: 0,
    pfandCollected: 0,
    pfandReturned: 0,
};

function updateDailyTotals() {
    localStorage.setItem('dailyTotals', JSON.stringify(dailyTotals));
    dailyRevenueDisplay.textContent = dailyTotals.revenue.toFixed(2) + ' €';
    dailyProductsSoldDisplay.textContent = dailyTotals.productsSold;
    dailyPfandCollectedDisplay.textContent = dailyTotals.pfandCollected.toFixed(2) + ' €';
    dailyPfandReturnedDisplay.textContent = dailyTotals.pfandReturned.toFixed(2) + ' €';
}

function resetDailyTotals() {
    if (confirm('Möchten Sie die Tagesübersicht wirklich zurücksetzen?')) {
        dailyTotals = {
            revenue: 0,
            productsSold: 0,
            pfandCollected: 0,
            pfandReturned: 0,
        };
        updateDailyTotals();
    }
}

function loadDailyTotals() {
    const savedTotals = localStorage.getItem('dailyTotals');
    if (savedTotals) {
        dailyTotals = JSON.parse(savedTotals);
    }
    updateDailyTotals();
}

function toggleVisibility(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.toggle('hidden');
    }
}


// Initialize the application when the window loads
window.onload = function() {
    initializeProductButtons();
    renderOrderList(); // Initial render for empty list message
    calculateTotals(); // Initial calculation to display 0.00 €
    loadDailyTotals();
};
