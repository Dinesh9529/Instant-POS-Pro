let items = [];

async function checkLicense() {
  let key = document.getElementById("licenseKey").value;
  try {
    let response = await fetch("https://YOUR_SERVER_URL/validate-key?key=" + key);
    let data = await response.json();

    if (data.valid) {
      document.getElementById("license-screen").style.display = "none";
      document.getElementById("pos-app").style.display = "block";
      document.getElementById("billDate").value = new Date().toISOString().split('T')[0];
    } else {
      document.getElementById("license-msg").innerText = "? Invalid or Expired License!";
    }
  } catch (err) {
    document.getElementById("license-msg").innerText = "?? Server Error! Check Internet.";
  }
}

function addItem() {
  let product = document.getElementById("productName").value;
  let qty = document.getElementById("quantity").value;
  let unit = document.getElementById("unit").value;
  let price = document.getElementById("price").value;
  let gst = document.getElementById("gst").value;

  if (product && qty && price) {
    let total = qty * price;
    let gstAmount = gst ? (total * gst) / 100 : 0;
    let grandTotal = total + gstAmount;
    items.push({ product, qty, unit, price, gstAmount, grandTotal });
    alert("? Item Added!");
  } else {
    alert("?? Please enter Product, Quantity & Price!");
  }
}

function generateInvoice() {
  let shopName = document.getElementById("shopName").value || "Instant POS Pro";
  let clientName = document.getElementById("clientName").value || "Customer";
  let date = document.getElementById("billDate").value;

  let invoiceHTML = `
    <div style="font-family:Arial; max-width:800px; margin:auto; border:1px solid #ccc; padding:20px;">
      <h2 style="text-align:center;">${shopName}</h2>
      <p><b>Client:</b> ${clientName}</p>
      <p><b>Date:</b> ${date}</p>
      <table border="1" width="100%" style="border-collapse:collapse; text-align:center;">
        <tr style="background:#f0f0f0;"><th>Product</th><th>Qty</th><th>Unit</th><th>Price</th><th>GST</th><th>Total</th></tr>`;

  let finalTotal = 0;
  items.forEach(item => {
    invoiceHTML += `<tr>
      <td>${item.product}</td>
      <td>${item.qty}</td>
      <td>${item.unit}</td>
      <td>?${item.price}</td>
      <td>?${item.gstAmount.toFixed(2)}</td>
      <td>?${item.grandTotal.toFixed(2)}</td>
    </tr>`;
    finalTotal += item.grandTotal;
  });

  invoiceHTML += `</table>
    <h3 style="text-align:right;">Grand Total: ?${finalTotal.toFixed(2)}</h3>
    <p style="text-align:center;">Scan to Pay</p>
    <div style="text-align:center;">
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=merchant@upi&pn=${shopName}&am=${finalTotal.toFixed(2)}" alt="QR Code">
    </div>
    </div>`;

  document.getElementById("invoice").innerHTML = invoiceHTML;
}

function downloadInvoice() {
  let invoiceContent = document.getElementById("invoice").innerHTML;
  let blob = new Blob([invoiceContent], { type: "text/html" });
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Invoice.html";
  link.click();
}
