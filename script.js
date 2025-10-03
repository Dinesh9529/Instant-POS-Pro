let items = [];
let totalAmount = 0;
let grandTotal = 0;

// On load, check localStorage
window.onload = function(){
    let savedKey = localStorage.getItem("licenseKey");
    if(savedKey) validateLicense(savedKey);
}

function validateLicense(providedKey=null){
    let key = providedKey || document.getElementById("licenseKey").value;
    fetch(" https://instant-pos-pro.onrender.com/validate-key?key=" + key)
    .then(res=>res.json())
    .then(data=>{
        if(data.valid){
            document.getElementById("license-section").style.display="none";
            document.getElementById("pos-section").style.display="block";
            localStorage.setItem("licenseKey", key);
        } else {
            document.getElementById("license-msg").innerText="Invalid Key!";
        }
    }).catch(err=>{
        document.getElementById("license-msg").innerText="Server error!";
    });
}

function addItem(){
    let name = document.getElementById("itemName").value || "-";
    let qty = parseFloat(document.getElementById("quantity").value) || 0;
    let price = parseFloat(document.getElementById("price").value) || 0;
    let gst = parseFloat(document.getElementById("gst").value) || 0;
    let unit = document.getElementById("unit").value || "-";
    let shop = document.getElementById("shopType").value || "-";

    let total = price * qty;
    let totalWithGST = total + (total * gst / 100);

    totalAmount += total;
    grandTotal += totalWithGST;

    items.push({name, qty, price, gst, totalWithGST, unit, shop});

    updateTable();
    clearInputs();
}

function updateTable(){
    let tbody = document.getElementById("invoiceTable").getElementsByTagName('tbody')[0];
    tbody.innerHTML="";
    items.forEach(item=>{
        let row = tbody.insertRow();
        row.insertCell(0).innerText=item.name;
        row.insertCell(1).innerText=item.qty;
        row.insertCell(2).innerText=item.price.toFixed(2);
        row.insertCell(3).innerText=item.gst.toFixed(2);
        row.insertCell(4).innerText=item.totalWithGST.toFixed(2);
        row.insertCell(5).innerText=item.shop;
        row.insertCell(6).innerText=item.unit;
    });

    document.getElementById("total").innerText=totalAmount.toFixed(2);
    document.getElementById("grandTotal").innerText=grandTotal.toFixed(2);
}

function clearInputs(){
    document.getElementById("itemName").value="";
    document.getElementById("quantity").value="";
    document.getElementById("price").value="";
    document.getElementById("gst").value="";
    document.getElementById("unit").value="";
    document.getElementById("shopType").value="";
    document.getElementById("qrUpload").value="";
}

function downloadInvoice(){
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Instant POS Pro Invoice", 10, 10);
    let y = 20;
    items.forEach(item=>{
        doc.text(`${item.name} | ${item.qty} | ₹${item.price.toFixed(2)} | GST: ${item.gst.toFixed(2)} | Total: ₹${item.totalWithGST.toFixed(2)} | ${item.unit} | ${item.shop}`, 10, y);
        y+=10;
    });
    doc.text(`Grand Total: ₹${grandTotal.toFixed(2)}`, 10, y+10);
    doc.save("Invoice.pdf");
}

