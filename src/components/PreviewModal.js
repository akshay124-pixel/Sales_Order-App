import React from "react";
import { Modal, Table, Badge, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const PreviewModal = ({ isOpen, onClose, entry }) => {
  if (!entry) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? "N/A"
      : date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalGST = 0;
    if (entry.products && entry.products.length > 0) {
      entry.products.forEach((product) => {
        const qty = product.qty || 0;
        const unitPrice = product.unitPrice || 0;
        const gstRate = parseFloat(product.gst) || 0;
        subtotal += qty * unitPrice;
        totalGST += (qty * unitPrice * gstRate) / 100;
      });
    }
    return {
      subtotal: subtotal.toFixed(2),
      totalGST: totalGST.toFixed(2),
      total: (subtotal + totalGST).toFixed(2),
    };
  };

  const { subtotal, totalGST, total } = calculateTotals();

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice #${entry.orderId || "N/A"}</title>
          <style>
            @page { size: A4; margin: 10mm; }
            body { 
              font-family: 'Arial', sans-serif; 
              margin: 0; 
              color: #333; 
              font-size: 0.9rem; 
            }
            .invoice-container { 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 15px; 
              border: 1px solid #e5e7eb; 
              box-sizing: border-box;
              page-break-inside: avoid; 
            }
            .invoice-header { 
              background: linear-gradient(135deg, #1e3a8a, #6d28d9); 
              color: white; 
              padding: 15px; 
              border-radius: 6px 6px 0 0; 
              display: flex; 
              justify-content: space-between; 
              align-items: center; 
            }
            .invoice-header h2 { 
              font-size: 1.75rem; 
              font-weight: 700; 
              text-shadow: 1px 1px 2px rgba(0,0,0,0.3); 
              margin: 0; 
            }
            .invoice-section { 
              margin-bottom: 15px; 
              padding: 10px; 
              background: #f9fafb; 
              border-radius: 6px; 
              max-height: 200px; 
              overflow: hidden; 
            }
            .invoice-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 15px; 
            }
            .invoice-table { 
              width: 100%; 
              border-collapse: collapse; 
            }
            .invoice-table th, .invoice-table td { 
              padding: 5px; 
              border-bottom: 1px solid #e5e7eb; 
              text-align: left; 
            }
            .invoice-table th { 
              background: #d1d5db; 
              font-weight: 600; 
              text-transform: uppercase; 
              font-size: 0.7rem; 
              letter-spacing: 0.05em; 
              color: #1f2937; 
            }
            .totals-section { 
              background: #f3f4f6; 
              padding: 10px; 
              border-radius: 6px; 
              text-align: right; 
            }
            .company-logo { 
              width: 110px; 
              height: auto; 
            }
            .badge { 
              display: inline-block; 
              padding: 4px 8px; 
              border-radius: 4px; 
              color: white; 
              font-size: 0.8rem; 
            }
            .footer-branding { 
              color: #4b5563; 
              font-size: 0.7rem; 
              text-align: center; 
              margin-top: 15px; 
            }
            .saffron { color: #ff9933; }
            .green { color: #138808; }
            h4, h5 { 
              text-transform: uppercase; 
              font-weight: 700; 
              color: #1f2937; 
              border-bottom: 1px solid #e5e7eb; 
              padding-bottom: 4px; 
            }
            @media print { 
              .no-print { display: none; } 
              .invoice-container { border: none; } 
              .invoice-section { box-shadow: none; } 
            }
            @media (max-width: 768px) { 
              .invoice-grid { grid-template-columns: 1fr; } 
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="invoice-header">
              <div>
                <img src="logo.png" alt="Promark Logo" class="company-logo" />
               
                <p>Order #${entry.orderId || "N/A"}</p>
              </div>
              <div>
                <p>Issue Date: ${formatDate(entry.invoiceDate)}</p>
                <p>Order Date: ${formatDate(entry.soDate)}</p>
              </div>
            </div>
            <div class="invoice-section">
              <div class="invoice-grid">
                <div>
                  <h4>From</h4>
                  <p>Promark Techsolutions Pvt Ltd<br />Plot No E-250, Industrial Area 8-B, Mohali, Punjab, India-160071<br />GSTIN: XXAAAAA0000A1Z5<br />Email: info@promark.co.in<br />Phone: 1800 103 8878</p>
                </div>
                <div>
                  <h4>To</h4>
                  <p><strong>${
                    entry.customername || "N/A"
                  }</strong><br />GST No: ${
      entry.gstno || "N/A"
    }<br />Contact: ${entry.contactNo || "N/A"}<br />Email: ${
      entry.customerEmail || "N/A"
    }</p>
                </div>
              </div>
            </div>
            <div class="invoice-section">
              <div class="invoice-grid">
                <div>
                  <h4>Invoice Details</h4>
                  <div style="display: grid; grid-template-columns: 1fr; gap: 8px;">
                    <div><strong>Invoice Date:</strong> ${formatDate(
                      entry.invoiceDate
                    )}</div>
                    <div><strong>Order Date:</strong> ${formatDate(
                      entry.soDate
                    )}</div>
                    <div><strong>Bill Number:</strong> ${
                      entry.billNumber || "N/A"
                    }</div>
                    <div><strong>PI Number:</strong> ${
                      entry.piNumber || "N/A"
                    }</div>
                    <div><strong>Payment Terms:</strong> <span class="badge" style="background: ${
                      entry.paymentTerms === "100% Advance"
                        ? "#22c55e"
                        : entry.paymentTerms === "Partial Advance"
                        ? "#3b82f6"
                        : entry.paymentTerms === "Credit"
                        ? "#eab308"
                        : "#6b7280"
                    };">${entry.paymentTerms || "N/A"}</span></div>
                    <div><strong>Payment Method:</strong> <span class="badge" style="background: ${
                      entry.paymentMethod === "Cash"
                        ? "#22c55e"
                        : entry.paymentMethod === "NEFT"
                        ? "#3b82f6"
                        : entry.paymentMethod === "RTGS"
                        ? "#9333ea"
                        : entry.paymentMethod === "Cheque"
                        ? "#eab308"
                        : "#6b7280"
                    };">${entry.paymentMethod || "N/A"}</span></div>
                    <div><strong>Credit Days:</strong> ${
                      entry.creditDays || "N/A"
                    }</div>
                  </div>
                </div>
                <div>
                  <h4>Billing Details</h4>
                  <div style="display: grid; grid-template-columns: 1fr; gap: 8px;">
                    <div><strong>Transporter:</strong> ${
                      entry.transporter || "N/A"
                    }</div>
                    <div><strong>Transporter Details:</strong> ${
                      entry.transporterRemarks || "N/A"
                    }</div>
                    <div><strong>Sales Person:</strong> ${
                      entry.salesPerson || "N/A"
                    }</div>
                    <div><strong>Reporting Manager:</strong> ${
                      entry.report || "N/A"
                    }</div>
                    <div><strong>Remarks By SalesPerson:</strong> ${
                      entry.remarks || "N/A"
                    }</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="invoice-section">
              <h4>Addresses</h4>
              <div class="invoice-grid">
                <div>
                  <h5>Billing Address</h5>
                  <p>${entry.billingAddress || "N/A"}</p>
                </div>
                <div>
                  <h5>Shipping Address</h5>
                  <p>${entry.shippingAddress || "N/A"}</p>
                </div>
              </div>
            </div>
            <div class="invoice-section">
              <h4>Product Details</h4>
              <table class="invoice-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>GST (%)</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    entry.products && entry.products.length > 0
                      ? entry.products
                          .map((product, index) => {
                            const qty = product.qty || 0;
                            const unitPrice = product.unitPrice || 0;
                            const gstRate = parseFloat(product.gst) || 0;
                            const lineTotal =
                              (qty * unitPrice * (100 + gstRate)) / 100;
                            return `
                      <tr>
                        <td>${index + 1}</td>
                        <td>${product.productType || "N/A"}<br /><small>Size: ${
                              product.size || "N/A"
                            }, Spec: ${product.spec || "N/A"}, Brand: ${
                              product.brand || "N/A"
                            }, Warranty: ${product.warranty || "N/A"}${
                              product.serialNos?.length > 0
                                ? `, Serial: ${product.serialNos.join(", ")}`
                                : ""
                            }${
                              product.modelNos?.length > 0
                                ? `, Model: ${product.modelNos.join(", ")}`
                                : ""
                            }</small></td>
                        <td>${qty}</td>
                        <td>₹${unitPrice.toFixed(2)}</td>
                        <td>${gstRate.toFixed(2)}%</td>
                        <td>₹${lineTotal.toFixed(2)}</td>
                      </tr>
                    `;
                          })
                          .join("")
                      : '<tr><td colspan="6" style="text-align: center; font-style: italic;">No products available.</td></tr>'
                  }
                </tbody>
              </table>
            </div>
            <div class="totals-section">
              <p><strong>Subtotal:</strong> ₹${subtotal}</p>
              <p><strong>Total GST:</strong> ₹${totalGST}</p>
              <p style="font-size: 1rem; font-weight: bold;"><strong>Total Amount:</strong> ₹${total}</p>
            </div>
            <div class="footer-branding">
              <p>Thank you for your business!</p>
              <p>Terms & Conditions: Payment due within ${
                entry.creditDays || "N/A"
              } days. Late payments may incur interest at 1.5% per month.</p>
              <p>Promark Techsolutions Pvt Ltd | Plot No E-250, Industrial Area 8-B, Mohali, Punjab, India-160071 | Phone: 1800 103 8878 | Email: info@promark.co.in</p>
              <p><span class="saffron">Proudly</span> Made <span class="green">in India</span></p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <Modal
      show={isOpen}
      onHide={onClose}
      size="xl"
      centered
      backdrop="static"
      keyboard={true}
      aria-labelledby="preview-modal-title"
      className="font-sans"
    >
      <style>
        {`
          .invoice-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            padding: 1.5rem;
            margin: 1rem;
          }
          .invoice-header {
            background:  linear-gradient(135deg, #2575fc, #6a11cb);
            color: white;
            height: 80px;
            padding: 1.25rem;
            border-radius: 8px 8px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .invoice-section {
            margin-bottom: 1.25rem;
            padding: 1rem;
            background: #f9fafb;
            border-radius: 8px;
          }
          .invoice-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
          }
          .invoice-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
          }
          .invoice-table th, .invoice-table td {
            padding: 0.5rem;
            vertical-align: middle;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }
          .invoice-table th {
            background: #d1d5db;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.75rem;
            color: #1f2937;
            letter-spacing: 0.05em;
          }
          .invoice-table tbody tr:nth-child(even) {
            background: #f9fafb;
          }
          .invoice-table tbody tr:hover {
            background: #f3f4f6;
            transition: background 0.2s ease;
          }
          .totals-section {
            background: #f3f4f6;
            padding: 1rem;
            border-radius: 8px;
            text-align: right;
            font-size: 0.95rem;
          }
          .badge-custom {
            font-size: 0.85rem;
            padding: 0.4rem 0.8rem;
            border-radius: 0.375rem;
          }
          .modal-body {
            max-height: 85vh;
            overflow-y: auto;
            background: #f1f5f9;
            padding: 0;
          }
          .close-btn, .print-btn {
            transition: transform 0.2s ease, background 0.2s ease;
          }
          .close-btn:hover, .print-btn:hover {
            transform: scale(1.1);
            background: rgba(255, 255, 255, 0.2);
          }
          .logo-image {
            width: 110px;
            height: auto;
            margin-left: 15px;
            margin-top: 17px;
            filter: brightness(0) invert(1);
          }
          .print-btn {
            background: linear-gradient(135deg, #10b981, #34d399);
            border: none;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            margin-right: 15px;
          }
          .footer-branding {
            color: #4b5563;
            font-size: 0.75rem;
            text-align: center;
            margin-top: 1.5rem;
          }
          .saffron { color: #ff9933; }
          .green { color: #138808; }
          h4, h5 {
            text-transform: uppercase;
            font-weight: 700;
            color: #1f2937;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 4px;
          }
          @media (max-width: 768px) {
            .invoice-grid {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>
      <Modal.Header className="p-0 border-0">
        <div className="invoice-header w-100">
          <div className="flex items-center gap-4">
            <img src="logo.png" alt="Promark Logo" className="logo-image" />
            <div style={{ marginLeft: "15px" }}>
              <p className="text-sm opacity-80">
                Order #{entry.orderId || "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              className="print-btn"
              onClick={handlePrint}
              aria-label="Print invoice"
            >
              Print
            </Button>
            <button
              onClick={onClose}
              className="close-btn text-white bg-transparent border-0 text-xl w-10 h-10 rounded-full flex items-center justify-center"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="modal-body">
        <div className="invoice-container">
          {/* From and To Side by Side */}
          <div className="invoice-section">
            <div className="invoice-grid">
              <div>
                <h4 className="text-lg mb-2">From</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Promark Techsolutions Pvt Ltd
                  <br />
                  Plot No E-250, Industrial Area 8-B, Mohali, Punjab,
                  India-160071
                  <br />
                  GSTIN: XXAAAAA0000A1Z5
                  <br />
                  Email: info@promark.co.in
                  <br />
                  Phone: 1800 103 8878
                </p>
              </div>
              <div>
                <h4 className="text-lg mb-2">To</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  <strong>{entry.customername || "N/A"}</strong>
                  <br />
                  GST No: {entry.gstno || "N/A"}
                  <br />
                  Contact: {entry.contactNo || "N/A"}
                  <br />
                  Email: {entry.customerEmail || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Invoice and Billing Details Side by Side */}
          <div className="invoice-section">
            <div className="invoice-grid">
              <div>
                <h4 className="text-lg mb-3">Invoice Details</h4>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="mb-2">
                    <strong className="text-gray-700">Invoice Date:</strong>{" "}
                    <span className="text-gray-900">
                      {formatDate(entry.invoiceDate)}
                    </span>
                  </div>
                  <div className="mb-2">
                    <strong className="text-gray-700">Order Date:</strong>{" "}
                    <span className="text-gray-900">
                      {formatDate(entry.soDate)}
                    </span>
                  </div>
                  <div className="mb-2">
                    <strong className="text-gray-700">Bill Number:</strong>{" "}
                    <span className="text-gray-900">
                      {entry.billNumber || "N/A"}
                    </span>
                  </div>
                  <div className="mb-2">
                    <strong className="text-gray-700">PI Number:</strong>{" "}
                    <span className="text-gray-900">
                      {entry.piNumber || "N/A"}
                    </span>
                  </div>
                  <div className="mb-2">
                    <strong className="text-gray-700">Payment Terms:</strong>{" "}
                    <Badge
                      className={`badge-custom ${
                        entry.paymentTerms === "100% Advance"
                          ? "bg-green-400"
                          : entry.paymentTerms === "Partial Advance"
                          ? "bg-blue-400"
                          : entry.paymentTerms === "Credit"
                          ? "bg-yellow-400"
                          : "bg-gray-400"
                      } text-white`}
                    >
                      {entry.paymentTerms || "N/A"}
                    </Badge>
                  </div>
                  <div className="mb-2">
                    <strong className="text-gray-700">Payment Method:</strong>{" "}
                    <Badge
                      className={`badge-custom ${
                        entry.paymentMethod === "Cash"
                          ? "bg-green-400"
                          : entry.paymentMethod === "NEFT"
                          ? "bg-blue-400"
                          : entry.paymentMethod === "RTGS"
                          ? "bg-purple-400"
                          : entry.paymentMethod === "Cheque"
                          ? "bg-yellow-400"
                          : "bg-gray-400"
                      } text-white`}
                    >
                      {entry.paymentMethod || "N/A"}
                    </Badge>
                  </div>
                  <div className="mb-2">
                    <strong className="text-gray-700">Credit Days:</strong>{" "}
                    <span className="text-gray-900">
                      {entry.creditDays || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-lg mb-3">Billing Details</h4>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="mb-2">
                    <strong className="text-gray-700">Transporter:</strong>{" "}
                    <span className="text-gray-900">
                      {entry.transporter || "N/A"}
                    </span>
                  </div>
                  <div className="mb-2">
                    <strong className="text-gray-700">
                      Transporter Details:
                    </strong>{" "}
                    <span className="text-gray-900">
                      {entry.transporterRemarks || "N/A"}
                    </span>
                  </div>
                  <div className="mb-2">
                    <strong className="text-gray-700">Sales Person:</strong>{" "}
                    <span className="text-gray-900">
                      {entry.salesPerson || "N/A"}
                    </span>
                  </div>
                  <div className="mb-2">
                    <strong className="text-gray-700">
                      Reporting Manager:
                    </strong>{" "}
                    <span className="text-gray-900">
                      {entry.report || "N/A"}
                    </span>
                  </div>
                  <div className="mb-2">
                    <strong className="text-gray-700">
                      Remarks By SalesPerson:
                    </strong>{" "}
                    <span className="text-gray-900">
                      {entry.remarks || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Billing and Shipping Addresses */}
          <div className="invoice-section">
            <h4 className="text-lg mb-3">Addresses</h4>
            <div className="invoice-grid">
              <div>
                <h5 className="text-md mb-2">Billing Address</h5>
                <p className="text-gray-600 text-sm">
                  {entry.billingAddress || "N/A"}
                </p>
              </div>
              <div>
                <h5 className="text-md mb-2">Shipping Address</h5>
                <p className="text-gray-600 text-sm">
                  {entry.shippingAddress || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="invoice-section">
            <h4 className="text-lg mb-3">Product Details</h4>
            {entry.products && entry.products.length > 0 ? (
              <Table className="invoice-table" responsive>
                <thead>
                  <tr>
                    <th style={{ width: "5%" }}>#</th>
                    <th style={{ width: "40%" }}>Description</th>
                    <th style={{ width: "10%" }}>Qty</th>
                    <th style={{ width: "15%" }}>Unit Price</th>
                    <th style={{ width: "15%" }}>GST (%)</th>
                    <th style={{ width: "15%" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {entry.products.map((product, index) => {
                    const qty = product.qty || 0;
                    const unitPrice = product.unitPrice || 0;
                    const gstRate = parseFloat(product.gst) || 0;
                    const lineTotal = (qty * unitPrice * (100 + gstRate)) / 100;
                    return (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          <strong>{product.productType || "N/A"}</strong>
                          <br />
                          <small className="text-gray-600">
                            Size: {product.size || "N/A"}, Spec:{" "}
                            {product.spec || "N/A"}, Brand:{" "}
                            {product.brand || "N/A"}, Warranty:{" "}
                            {product.warranty || "N/A"}
                            {product.serialNos?.length > 0 &&
                              `, Serial: ${product.serialNos.join(", ")}`}
                            {product.modelNos?.length > 0 &&
                              `, Model: ${product.modelNos.join(", ")}`}
                          </small>
                        </td>
                        <td>{qty}</td>
                        <td>₹{unitPrice.toFixed(2)}</td>
                        <td>{gstRate.toFixed(2)}%</td>
                        <td>₹{lineTotal.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            ) : (
              <p className="text-gray-600 italic text-center">
                No products available.
              </p>
            )}
          </div>

          {/* Totals */}
          <div className="totals-section">
            <div className="text-gray-700 space-y-1">
              <p>
                <strong>Subtotal:</strong> ₹{subtotal}
              </p>
              <p>
                <strong>Total GST:</strong> ₹{totalGST}
              </p>
              <p className="text-lg font-semibold text-gray-800">
                <strong>Total Amount:</strong> ₹{total}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="footer-branding">
            <p className="font-semibold">Thank you for your business!</p>
            <p>
              Terms & Conditions: Payment due within {entry.creditDays || "N/A"}{" "}
              days. Late payments may incur interest at 1.5% per month.
            </p>
            <p>
              Promark Techsolutions Pvt Ltd | Plot No E-250, Industrial Area
              8-B, Mohali, Punjab, India-160071 | Phone: 1800 103 8878 | Email:
              info@promark.co.in
            </p>
            <p>
              <span className="saffron">Proudly</span> Made{" "}
              <span className="green">in India</span>
            </p>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default PreviewModal;
