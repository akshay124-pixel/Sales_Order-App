import React, { useState, useCallback } from "react";
import { Modal, Button, Badge } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-toastify";

function ViewEntry({ isOpen, onClose, entry }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!entry) return;

    const productsText = entry.products
      ? entry.products
          .map(
            (p, i) =>
              `Product ${i + 1}: ${p.productType || "N/A"} (Qty: ${
                p.qty || "N/A"
              }, Size: ${p.size || "N/A"}, Spec: ${
                p.spec || "N/A"
              }, Unit Price: ₹${p.unitPrice?.toFixed(2) || "0.00"}, GST: ${
                p.gst !== undefined ? `${p.gst}%` : "N/A"
              }, Serial Nos: ${
                p.serialNos?.length > 0 ? p.serialNos.join(", ") : "N/A"
              }, Model Nos: ${
                p.modelNos?.length > 0 ? p.modelNos.join(", ") : "N/A"
              })`
          )
          .join("\n")
      : "N/A";

    const totalUnitPrice = entry.products
      ? entry.products.reduce(
          (sum, p) => sum + (p.unitPrice || 0) * (p.qty || 0),
          0
        )
      : 0;

    const gstText = entry.products
      ? entry.products
          .map((p) => `${p.gst}%`)
          .filter(Boolean)
          .join(", ")
      : "N/A";

    const textToCopy = `
      SO Date: ${
        entry.soDate ? new Date(entry.soDate).toLocaleDateString() : "N/A"
      }
      Order ID: ${entry.orderId || "N/A"}
      Committed Date: ${
        entry.committedDate
          ? new Date(entry.committedDate).toLocaleDateString()
          : "N/A"
      }
      Dispatch From: ${entry.dispatchFrom || "N/A"}
      Status: ${entry.status || "N/A"}
      Dispatch Date: ${
        entry.dispatchDate
          ? new Date(entry.dispatchDate).toLocaleDateString()
          : "N/A"
      }
      Party & Address: ${entry.partyAndAddress || "N/A"}
      City: ${entry.city || "N/A"}
      State: ${entry.state || "N/A"}
      Pin Code: ${entry.pinCode || "N/A"}
      Contact Person Name: ${entry.name || "N/A"}
      Contact Person No: ${entry.contactNo || "N/A"}
      Customer Email: ${entry.customerEmail || "N/A"}
      Products:\n${productsText}
      Unit Price: ₹${totalUnitPrice.toFixed(2)}
      GST: ${gstText}
      Total: ₹${entry.total?.toFixed(2) || "0.00"}
      Payment Terms: ${entry.paymentTerms || "N/A"}
      Amount2: ₹${entry.amount2?.toFixed(2) || "0.00"}
      Freight Charges & Status: ${entry.freightcs || "N/A"}
      Installation: ${entry.installation || "N/A"}
      Order Type: ${entry.orderType || "N/A"}
      Installation Status: ${entry.installationStatus || "N/A"}
      Dispatch Status: ${entry.dispatchStatus || "N/A"}
      Sales Person: ${entry.salesPerson || "N/A"}
      Company: ${entry.company || "N/A"}
      Transporter: ${entry.transporter || "N/A"}
      Transporter Details: ${entry.transporterDetails || "N/A"}
      Docket No: ${entry.docketNo || "N/A"}
      Receipt Date: ${
        entry.receiptDate
          ? new Date(entry.receiptDate).toLocaleDateString()
          : "N/A"
      }
      Approval Status: ${entry.sostatus || "N/A"}
      Fulfilling Status: ${entry.fulfillingStatus || "Pending"}
      Shipping Address: ${entry.shippingAddress || "N/A"}
      Billing Address: ${entry.billingAddress || "N/A"}
      Invoice No: ${entry.invoiceNo || "N/A"}
      Invoice Date: ${
        entry.invoiceDate
          ? new Date(entry.invoiceDate).toLocaleDateString()
          : "N/A"
      }
      Payment Received: ${entry.paymentReceived || "N/A"}
      Bill Number: ${entry.billNumber || "N/A"}
      Completion Status: ${entry.completionStatus || "N/A"}
      Fulfillment Date: ${
        entry.fulfillmentDate
          ? new Date(entry.fulfillmentDate).toLocaleDateString()
          : "N/A"
      }
    `.trim();

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setCopied(true);
        toast.success("Details copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        toast.error("Failed to copy details!");
        console.error("Copy error:", err);
      });
  }, [entry]);

  if (!entry) return null;

  const totalUnitPrice = entry.products
    ? entry.products.reduce(
        (sum, p) => sum + (p.unitPrice || 0) * (p.qty || 0),
        0
      )
    : 0;

  const gstText = entry.products
    ? entry.products
        .map((p) => `${p.gst}%`)
        .filter(Boolean)
        .join(", ")
    : "N/A";

  return (
    <Modal
      show={isOpen}
      onHide={onClose}
      backdrop="static"
      keyboard={false}
      size="lg"
      aria-labelledby="view-entry-modal-title"
      dialogClassName="compact-modal"
    >
      <Modal.Header
        closeButton
        style={{
          background: "linear-gradient(135deg, #2575fc, #6a11cb)",
          color: "#fff",
          padding: "1.5rem 2rem",
          borderBottom: "none",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Modal.Title
          id="view-entry-modal-title"
          style={{
            fontWeight: "700",
            fontSize: "1.8rem",
            letterSpacing: "1px",
            textTransform: "uppercase",
            textShadow: "1px 1px 3px rgba(0, 0, 0, 0.2)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span style={{ marginRight: "10px", fontSize: "1.5rem" }}>📋</span>
          Sales Order Details
        </Modal.Title>
      </Modal.Header>

      <Modal.Body
        style={{
          padding: "2rem",
          background: "#ffffff",
          borderRadius: "0 0 15px 15px",
          minHeight: "550px",
          boxShadow: "inset 0 -4px 15px rgba(0, 0, 0, 0.1)",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        {/* Order Info Section */}
        <div
          style={{
            background: "#fafafa",
            borderRadius: "10px",
            padding: "1.2rem",
            boxShadow: "0 3px 10px rgba(0, 0, 0, 0.05)",
            display: "flex",
            flexDirection: "column",
            gap: "0.8rem",
          }}
        >
          <h3
            style={{
              fontSize: "1.3rem",
              fontWeight: "600",
              color: "#333",
              marginBottom: "0.5rem",
            }}
          >
            Order Info: {entry.orderId}
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>SO Date:</strong>{" "}
              {entry.soDate
                ? new Date(entry.soDate).toLocaleDateString()
                : "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Committed Date:</strong>{" "}
              {entry.committedDate
                ? new Date(entry.committedDate).toLocaleDateString()
                : "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Dispatch From:</strong> {entry.dispatchFrom || "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Status:</strong>{" "}
              <Badge
                bg={
                  entry.status === "Pending"
                    ? "warning"
                    : entry.status === "Delivered"
                    ? "success"
                    : entry.status === "Dispatched"
                    ? "info"
                    : entry.status === "In Transit"
                    ? "primary"
                    : "secondary"
                }
              >
                {entry.status || "N/A"}
              </Badge>
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Dispatch Status:</strong>{" "}
              <Badge
                bg={
                  entry.dispatchStatus === "Not Dispatched"
                    ? "warning"
                    : entry.dispatchStatus === "Dispatched"
                    ? "info"
                    : entry.dispatchStatus === "Delivered"
                    ? "success"
                    : "secondary"
                }
              >
                {entry.dispatchStatus || "N/A"}
              </Badge>
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Dispatch Date:</strong>{" "}
              {entry.dispatchDate
                ? new Date(entry.dispatchDate).toLocaleDateString()
                : "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Approval Status:</strong>{" "}
              <Badge
                bg={
                  entry.sostatus === "Pending for Approval"
                    ? "warning"
                    : entry.sostatus === "Approved"
                    ? "success"
                    : "secondary"
                }
              >
                {entry.sostatus || "N/A"}
              </Badge>
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Completion Status:</strong>{" "}
              <Badge
                bg={
                  entry.completionStatus === "In Progress"
                    ? "warning"
                    : entry.completionStatus === "Complete"
                    ? "success"
                    : "secondary"
                }
              >
                {entry.completionStatus || "N/A"}
              </Badge>
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Order Type:</strong> {entry.orderType || "N/A"}
            </span>
          </div>
        </div>

        {/* Customer Info Section */}
        <div
          style={{
            background: "#fafafa",
            borderRadius: "10px",
            padding: "1.2rem",
            boxShadow: "0 3px 10px rgba(0, 0, 0, 0.05)",
            display: "flex",
            flexDirection: "column",
            gap: "0.8rem",
          }}
        >
          <h3
            style={{
              fontSize: "1.3rem",
              fontWeight: "600",
              color: "#333",
              marginBottom: "0.5rem",
            }}
          >
            Customer Info
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Customer Name:</strong> {entry.customername || "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Address:</strong> {entry.partyAndAddress || "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>City:</strong> {entry.city || "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>State:</strong> {entry.state || "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Pin Code:</strong> {entry.pinCode || "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Contact Person:</strong> {entry.name || "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Contact No:</strong> {entry.contactNo || "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Email:</strong> {entry.customerEmail || "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Shipping Address:</strong>{" "}
              {entry.shippingAddress || "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Billing Address:</strong> {entry.billingAddress || "N/A"}
            </span>
          </div>
        </div>

        {/* Product Info Section */}
        <div
          style={{
            background: "#fafafa",
            borderRadius: "10px",
            padding: "1.2rem",
            boxShadow: "0 3px 10px rgba(0, 0, 0, 0.05)",
            display: "flex",
            flexDirection: "column",
            gap: "0.8rem",
          }}
        >
          <h3
            style={{
              fontSize: "1.3rem",
              fontWeight: "600",
              color: "#333",
              marginBottom: "0.5rem",
            }}
          >
            Product Info
          </h3>
          {entry.products && entry.products.length > 0 ? (
            entry.products.map((product, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.5rem",
                  flexWrap: "wrap",
                  padding: "0.5rem 0",
                  borderBottom:
                    index < entry.products.length - 1
                      ? "1px solid #eee"
                      : "none",
                }}
              >
                <span style={{ fontSize: "1rem", color: "#555" }}>
                  <strong>Product {index + 1}:</strong>{" "}
                  {product.productType || "N/A"}
                </span>
                <span style={{ fontSize: "1rem", color: "#555" }}>
                  <strong>Qty:</strong> {product.qty || "N/A"}
                </span>
                <span style={{ fontSize: "1rem", color: "#555" }}>
                  <strong>Size:</strong> {product.size || "N/A"}
                </span>
                <span style={{ fontSize: "1rem", color: "#555" }}>
                  <strong>Spec:</strong> {product.spec || "N/A"}
                </span>
                <span style={{ fontSize: "1rem", color: "#555" }}>
                  <strong>Unit Price:</strong> ₹
                  {product.unitPrice?.toFixed(2) || "0.00"}
                </span>
                <span style={{ fontSize: "1rem", color: "#555" }}>
                  <strong>GST:</strong>{" "}
                  {product.gst !== undefined ? `${product.gst}%` : "N/A"}
                </span>
                <span style={{ fontSize: "1rem", color: "#555" }}>
                  <strong>Serial Nos:</strong>{" "}
                  {product.serialNos?.length > 0
                    ? product.serialNos.join(", ")
                    : "N/A"}
                </span>
                <span style={{ fontSize: "1rem", color: "#555" }}>
                  <strong>Model Nos:</strong>{" "}
                  {product.modelNos?.length > 0
                    ? product.modelNos.join(", ")
                    : "N/A"}
                </span>
              </div>
            ))
          ) : (
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Products:</strong> N/A
            </span>
          )}
        </div>

        {/* Financial Info Section */}
        <div
          style={{
            background: "#fafafa",
            borderRadius: "10px",
            padding: "1.2rem",
            boxShadow: "0 3px 10px rgba(0, 0, 0, 0.05)",
            display: "flex",
            flexDirection: "column",
            gap: "0.8rem",
          }}
        >
          <h3
            style={{
              fontSize: "1.3rem",
              fontWeight: "600",
              color: "#333",
              marginBottom: "0.5rem",
            }}
          >
            Financial Info
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Total Unit Price:</strong> ₹{totalUnitPrice.toFixed(2)}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>GST:</strong> {gstText}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Total:</strong> ₹{entry.total?.toFixed(2) || "0.00"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Payment Terms:</strong> {entry.paymentTerms || "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Amount2:</strong> ₹{entry.amount2?.toFixed(2) || "0.00"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Freight Charges:</strong> {entry.freightcs || "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Invoice No:</strong> {entry.invoiceNo || "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Invoice Date:</strong>{" "}
              {entry.invoiceDate
                ? new Date(entry.invoiceDate).toLocaleDateString()
                : "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Payment Status:</strong>{" "}
              <Badge
                bg={
                  entry.paymentReceived === "Received" ? "success" : "warning"
                }
              >
                {entry.paymentReceived || "N/A"}
              </Badge>
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Bill Number:</strong> {entry.billNumber || "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Remarks (Accounts):</strong>{" "}
              {entry.remarksByAccounts || "N/A"}
            </span>
          </div>
        </div>

        {/* Production Info Section */}
        <div
          style={{
            background: "#fafafa",
            borderRadius: "10px",
            padding: "1.2rem",
            boxShadow: "0 3px 10px rgba(0, 0, 0, 0.05)",
            display: "flex",
            flexDirection: "column",
            gap: "0.8rem",
          }}
        >
          <h3
            style={{
              fontSize: "1.3rem",
              fontWeight: "600",
              color: "#333",
              marginBottom: "0.5rem",
            }}
          >
            Production Info
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Production Status:</strong>{" "}
              <Badge
                style={{
                  background:
                    entry.fulfillingStatus === "Under Process"
                      ? "linear-gradient(135deg, #f39c12, #f7c200)"
                      : entry.fulfillingStatus === "Pending"
                      ? "linear-gradient(135deg, #ff6b6b, #ff8787)"
                      : entry.fulfillingStatus === "Partial Dispatch"
                      ? "linear-gradient(135deg, #00c6ff, #0072ff)"
                      : entry.fulfillingStatus === "Fulfilled"
                      ? "linear-gradient(135deg, #28a745, #4cd964)"
                      : "linear-gradient(135deg, #6c757d, #a9a9a9)",
                  color: "#fff",
                  padding: "5px 10px",
                  borderRadius: "12px",
                  fontWeight: "500",
                }}
              >
                {entry.fulfillingStatus || "Pending"}
              </Badge>
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Production Date:</strong>{" "}
              {entry.fulfillmentDate
                ? new Date(entry.fulfillmentDate).toLocaleDateString()
                : "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Remarks (Production):</strong>{" "}
              {entry.remarksByProduction || "N/A"}
            </span>
          </div>
        </div>

        {/* Logistics & Installation Info Section */}
        <div
          style={{
            background: "#fafafa",
            borderRadius: "10px",
            padding: "1.2rem",
            boxShadow: "0 3px 10px rgba(0, 0, 0, 0.05)",
            display: "flex",
            flexDirection: "column",
            gap: "0.8rem",
          }}
        >
          <h3
            style={{
              fontSize: "1.3rem",
              fontWeight: "600",
              color: "#333",
              marginBottom: "0.5rem",
            }}
          >
            Logistics & Installation Info
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Installation Charges:</strong>{" "}
              {entry.installation || "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Installation Status:</strong>{" "}
              <Badge
                bg={
                  entry.installationStatus === "Pending"
                    ? "warning"
                    : entry.installationStatus === "In Progress"
                    ? "info"
                    : entry.installationStatus === "Completed"
                    ? "success"
                    : entry.installationStatus === "Failed"
                    ? "danger"
                    : "secondary"
                }
              >
                {entry.installationStatus || "N/A"}
              </Badge>
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Installation Remarks:</strong>{" "}
              {entry.remarksByInstallation || "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Sales Person:</strong> {entry.salesPerson || "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Company:</strong> {entry.company || "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Transporter:</strong> {entry.transporter || "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Transporter Details:</strong>{" "}
              {entry.transporterDetails || "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Docket No:</strong> {entry.docketNo || "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Receipt Date:</strong>{" "}
              {entry.receiptDate
                ? new Date(entry.receiptDate).toLocaleDateString()
                : "N/A"}
            </span>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={handleCopy}
          style={{
            marginTop: "1.5rem",
            background: "linear-gradient(135deg, #2575fc, #6a11cb)",
            color: "#fff",
            width: "100%",
            borderRadius: "40px",
            padding: "12px 0",
            fontSize: "1.1rem",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "1px",
            transition: "all 0.3s ease",
            boxShadow: "0 6px 15px rgba(0, 0, 0, 0.2)",
            border: "none",
          }}
          onMouseEnter={(e) => (e.target.style.transform = "translateY(-3px)")}
          onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
        >
          {copied ? "✅ Copied!" : "📑 Copy Details"}
        </Button>
      </Modal.Body>
    </Modal>
  );
}

export default ViewEntry;
