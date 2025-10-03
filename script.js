// --- CONFIGURATION ---
// Render server URL for license validation
const RENDER_URL = "https://instant-pos-pro.onrender.com";

// --- GLOBAL STATE ---
// This array will hold all the items added to the invoice.
let items = [];
// This will store the base64 data of the uploaded QR code image.
let qrCodeImage = '';

// --- INITIALIZATION & LICENSE VALIDATION ---
window.onload = function() {
    // Check for a saved license key in local storage
    let savedKey = localStorage.getItem("licenseKey");
    if (savedKey) {
        validateLicense(savedKey);
    }
    // Render the initial empty invoice template on page load
    updateInvoicePreview(); 
};

/**
 * Validates the license key against the Render backend.
 * @param {string} [inputKey] - The license key to validate. If not provided, it's taken from the input field.
 */
async function validateLicense(inputKey) {
    const key = inputKey || document.getElementById("licenseKey").value;
    if (!key) {
        document.getElementById("license-msg").innerText = "Please enter a key.";
        return;
    }
    
    try {
        const response = await fetch(`${RENDER_URL}/validate-key?key=${encodeURIComponent(key)}`);
        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }
        const data = await response.json();
        
        if (data.valid) {
            document.getElementById("license-section").style.display = "none";
            document.getElementById("pos-section").style.display = "block";
            localStorage.setItem("licenseKey", key);
        } else {
            document.getElementById("license-msg").innerText = "Invalid or expired License Key!";
            localStorage.removeItem("licenseKey"); // Clear invalid key
        }
    } catch (err) {
        console.error("License validation error:", err);
        document.getElementById("license-msg").innerText = "Server error! Check your connection and try again.";
    }
}


// --- EVENT LISTENERS ---
// Listen for changes in the QR code file input.
document.getElementById('qrUpload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            qrCodeImage = e.target.result; // Store image data
            updateInvoicePreview(); // Re-render the invoice with the QR code
        }
        reader.readAsDataURL(file);
    }
});


// --- CORE INVOICE FUNCTIONS ---

/**
 * Adds a new item to the 'items' array and updates the invoice preview.
 */
function addItem() {
    // Get values from the item form
    const itemName = document.getElementById("itemName").value;
    const quantity = parseFloat(document.getElementById("quantity").value) || 0;
    const price = parseFloat(document.getElementById("price").value) || 0;
    const gst = parseFloat(document.getElementById("gst").value) || 0;

    // Basic validation
    if (!itemName || quantity <= 0 || price <= 0) {
        alert("Please enter a valid Item Name, Quantity, and Price.");
        return;
    }

    // Calculate amounts for the item
    const amount = price * quantity;
    const gstAmount = amount * (gst / 100);
    const total = amount + gstAmount;

    // Add the new item object to our global 'items' array
    items.push({ itemName, quantity, price, gst, amount, gstAmount, total });
    
    // Update the invoice display
    updateInvoicePreview();
    
    // Clear input fields for the next item
    document.getElementById("itemName").value = '';
    document.getElementById("quantity").value = '';
    document.getElementById("price").value = '';
    document.getElementById("gst").value = '';
    document.getElementById("itemName").focus(); // Set focus back to item name
}

/**
 * Removes an item from the 'items' array by its index.
 * @param {number} index - The index of the item to delete.
 */
function deleteItem(index) {
    items.splice(index, 1); // Remove the item from the array
    updateInvoicePreview(); // Re-render the invoice
}

/**
 * This is the main rendering function. It generates the entire invoice HTML
 * based on the current state (shop details, customer details, and items array).
 */
function updateInvoicePreview() {
    const invoicePreview = document.getElementById('invoice-preview');
    
    // Get all shop and customer details from input fields
    const shopName = document.getElementById('shopName').value || 'Your Shop Name';
    const shopAddress = document.getElementById('shopAddress').value || 'Your Shop Address';
    const shopContact = document.getElementById('shopContact').value || 'Contact: +91 00000 00000';
    const shopGstin = document.getElementById('shopGstin').value || 'GSTIN: Not Available';
    
    const customerName = document.getElementById('customerName').value || 'Walk-in Customer';
    const customerAddress = document.getElementById('customerAddress').value || 'N/A';
    const customerContact = document.getElementById('customerContact').value || '';

    // --- CALCULATIONS ---
    let subTotal = 0;
    let totalCgst = 0;
    let totalSgst = 0;

    items.forEach(item => {
        subTotal += item.amount;
        // GST is assumed to be divided equally into CGST and SGST
        totalCgst += (item.amount * (item.gst / 2 / 100));
        totalSgst += (item.amount * (item.gst / 2 / 100));
    });
    const grandTotal = subTotal + totalCgst + totalSgst;

    // --- DYNAMIC HTML GENERATION ---
    // Generate table rows for each item in the 'items' array
    let itemsHtml = items.map((item, index) => `
        <tr>
            <td>${index + 1}. ${item.itemName}</td>
            <td>${item.quantity}</td>
            <td>₹${item.price.toFixed(2)}</td>
            <td>${item.gst}%</td>
            <td>₹${item.total.toFixed(2)}</td>
            <td class="no-print"><button class="btn btn-danger btn-sm" onclick="deleteItem(${index})">X</button></td>
        </tr>
    `).join('');

    // The complete HTML structure for the invoice preview
    invoicePreview.innerHTML = `
        <div class="invoice-header">
            <div class="shop-details">
                <h3>${shopName}</h3>
                <p>${shopAddress}<br>${shopContact}<br>${shopGstin}</p>
            </div>
            <div id="qr-preview">
                ${qrCodeImage ? `<img src="${qrCodeImage}" alt="QR Code">` : '<span>Upload QR</span>'}
            </div>
        </div>
        
        <h4 class="text-center bg-light p-2 mb-3">TAX INVOICE</h4>

        <div class="row customer-details">
            <div class="col-6">
                <strong>Bill To:</strong><br>
                ${customerName}<br>
                ${customerAddress}<br>
                ${customerContact}
            </div>
            <div class="col-6 text-end">
                <strong>Invoice No:</strong> INV-${Date.now().toString().slice(-6)}<br>
                <strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}
            </div>
        </div>

        <table class="table invoice-table">
            <thead>
                <tr>
                    <th style="width:40%;">Item Description</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>GST%</th>
                    <th>Total</th>
                    <th class="no-print">Action</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml || '<tr><td colspan="6" class="text-center">No items added yet.</td></tr>'}
            </tbody>
        </table>

        <div class="invoice-footer">
            <div class="terms">
                <strong>Terms & Conditions:</strong>
                <p>1. Goods once sold will not be taken back.<br>2. Thank you for your business!</p>
            </div>
            <table class="totals-table">
                <tr>
                    <td>Sub Total:</td>
                    <td>₹${subTotal.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>CGST:</td>
                    <td>₹${totalCgst.toFixed(2)}</td>
                </tr>
                 <tr>
                    <td>SGST:</td>
                    <td>₹${totalSgst.toFixed(2)}</td>
                </tr>
                <tr>
                    <td><strong>Grand Total:</strong></td>
                    <td><strong>₹${grandTotal.toFixed(2)}</strong></td>
                </tr>
            </table>
        </div>
    `;
}


// --- ACTION BUTTON FUNCTIONS ---

/**
 * Downloads the invoice as a high-quality PDF using html2canvas and jsPDF.
 */
function downloadInvoicePDF() {
    const invoiceElement = document.getElementById('invoice-preview');
    
    // Use html2canvas to capture the styled invoice element as an image
    html2canvas(invoiceElement, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasHeight / canvasWidth;
        const imgHeight = (pdfWidth - 20) * ratio; // Calculate height based on A4 width ratio

        // Add the captured image to the PDF
        pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth - 20, imgHeight);
        pdf.save(`invoice-${Date.now()}.pdf`);
    });
}

/**
 * Opens the browser's print dialog to print the invoice.
 * The @media print CSS styles will ensure only the invoice is printed.
 */
function printInvoice() {
    window.print();
}

/**
 * Clears all input fields and the items array to start a new bill.
 */
function clearBill() {
    if (confirm("Are you sure you want to clear the entire bill?")) {
        // Reset state
        items = [];
        qrCodeImage = '';

        // Clear all input fields
        document.getElementById('shopName').value = '';
        document.getElementById('shopAddress').value = '';
        document.getElementById('shopContact').value = '';
        document.getElementById('shopGstin').value = '';
        document.getElementById('customerName').value = '';
        document.getElementById('customerAddress').value = '';
        document.getElementById('customerContact').value = '';
        document.getElementById('qrUpload').value = '';
        
        // Re-render the empty invoice
        updateInvoicePreview();
    }
}
