// Render server URL
const RENDER_URL = "https://instant-pos-pro.onrender.com";

// License validation (hidden prompt version)
window.onload = function() {
    let savedKey = localStorage.getItem("licenseKey");
    if(!savedKey){
        let key = prompt("Enter your license key:");
        if(key){
            localStorage.setItem("licenseKey", key);
            validateLicense(key);
        }
    } else {
        validateLicense(savedKey);
    }
}

async function validateLicense(inputKey){
    const key = inputKey || document.getElementById("licenseKey").value;
    try {
        // Call Render backend to validate key
        const response = await fetch(`${RENDER_URL}/validate-key?key=${encodeURIComponent(key)}`);
        const data = await response.json();
        if(data.valid){
            document.getElementById("license-section").style.display = "none";
            document.getElementById("pos-section").style.display = "block";
            localStorage.setItem("licenseKey", key);
        } else {
            document.getElementById("license-msg").innerText = "Invalid License Key!";
        }
    } catch(err){
        console.error("License validation error:", err);
        document.getElementById("license-msg").innerText = "Server error! Try again.";
    }
}

// Add item to table
function addItem(){
    const itemName = document.getElementById("itemName").value;
    const quantity = parseFloat(document.getElementById("quantity").value) || 0;
    const price = parseFloat(document.getElementById("price").value) || 0;
    const gst = parseFloat(document.getElementById("gst").value) || 0;
    const shopType = document.getElementById("shopType").value;
    const unit = document.getElementById("unit").value;
    const qrFile = document.getElementById("qrUpload").files[0];

    if(!itemName){ alert("Enter Item Name"); return; }

    const total = price * quantity * (1 + gst/100);

    const tbody = document.querySelector("#invoiceTable tbody");
    const tr = document.createElement("tr");

    let qrHTML = qrFile ? `<img src="${URL.createObjectURL(qrFile)}" width="50">` : "";

    tr.innerHTML = `
        <td>${itemName}</td>
        <td>${quantity}</td>
        <td>${price.toFixed(2)}</td>
        <td>${gst}</td>
        <td>${total.toFixed(2)}</td>
        <td>${shopType}</td>
        <td>${unit}</td>
        <td>${qrHTML}</td>
    `;
    tbody.appendChild(tr);

    calculateTotals();
}

// Calculate totals
function calculateTotals(){
    let total = 0;
    document.querySelectorAll("#invoiceTable tbody tr").forEach(tr => {
        const rowTotal = parseFloat(tr.cells[4].innerText) || 0;
        total += rowTotal;
    });
    document.getElementById("total").innerText = total.toFixed(2);
    document.getElementById("grandTotal").innerText = total.toFixed(2); // add extra charges if needed
}

// Download invoice as PDF
function downloadInvoice(){
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.html(document.getElementById("invoiceTable"), {
        callback: function(pdf){
            pdf.save("invoice.pdf");
        },
        x:10,
        y:10
    });
}
