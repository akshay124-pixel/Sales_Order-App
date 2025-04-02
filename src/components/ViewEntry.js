import React, { useState, useCallback } from "react";
import { Modal, Button, Badge } from "react-bootstrap"; // Add Badge to imports
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-toastify";

function ViewEntry({ isOpen, onClose, entry }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!entry) return;

    const textToCopy = `
      SO Date: ${
        entry.soDate ? new Date(entry.soDate).toLocaleDateString() : "N/A"
      }
        Order ID:${entry.oderId || "N/A"}
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
      Model No: ${entry.modelNo || "N/A"}
       Serial No: ${entry.modelNo || "N/A"}
      Product Type: ${entry.productType || "N/A"}
      Size: ${entry.size || "N/A"}
      Spec: ${entry.spec || "N/A"}
      Product Details: ${entry.productDetails || "N/A"}
      Qty: ${entry.qty || "N/A"}
      Unit Price: $${entry.unitPrice?.toFixed(2) || "0.00"}
      GST: ${entry.gst ? `${entry.gst}%` : "N/A"}
      Total: $${entry.total?.toFixed(2) || "0.00"}
      Payment Terms: ${entry.paymentTerms || "N/A"}
      Amount2: $${entry.amount2?.toFixed(2) || "0.00"}
      Freight Charges & Status: $${entry.freightcs || "N/A"}
      Installation: ${entry.installation || "N/A"}
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
                    : entry.status === "Completed"
                    ? "success"
                    : "secondary"
                }
              >
                {entry.status || "N/A"}
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
              <strong>Party & Address:</strong> {entry.partyAndAddress || "N/A"}
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
              <strong>Contact Person Name:</strong> {entry.name || "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Contact Person No:</strong> {entry.contactNo || "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Email:</strong> {entry.customerEmail || "N/A"}
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Model No:</strong> {entry.modelNo || "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Serial No:</strong> {entry.serialno || "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Product Type:</strong> {entry.productType || "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Size:</strong> {entry.size || "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Spec:</strong> {entry.spec || "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Details:</strong> {entry.productDetails || "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Qty:</strong> {entry.qty || "N/A"}
            </span>
          </div>
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
              <strong>Unit Price:</strong> $
              {entry.unitPrice?.toFixed(2) || "0.00"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>GST:</strong> {entry.gst ? `${entry.gst}%` : "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Total:</strong> ${entry.total?.toFixed(2) || "0.00"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Payment Terms:</strong> {entry.paymentTerms || "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Amount2:</strong> ${entry.amount2?.toFixed(2) || "0.00"}
            </span>

            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Freight Charges & Status:</strong>{" "}
              {entry.freightcs || "N/A"}
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
              <strong>Fulfilling Status:</strong>{" "}
              <Badge
                bg={
                  entry.fulfillingStatus === "Pending"
                    ? "danger" // Red
                    : entry.fulfillingStatus === "Fulfilled"
                    ? "success" // Green
                    : "secondary" // Gray for unknown
                }
              >
                {entry.fulfillingStatus || "Pending"}
              </Badge>
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Remarks by Production:</strong>{" "}
              {entry.remarksByProduction || "N/A"}
            </span>
          </div>
        </div>

        {/* Logistics Info Section */}
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
            Logistics Info
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
              <strong>Installation:</strong> {entry.installation || "N/A"}
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
              <strong>Shipping Address:</strong>{" "}
              {entry.shippingAddress || "N/A"}
            </span>
            <span style={{ fontSize: "1rem", color: "#555" }}>
              <strong>Billing Address:</strong> {entry.billingAddress || "N/A"}
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

// Add this CSS to your global stylesheet (e.g., index.css)
const customStyles = `
  .compact-modal {
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    max-width: 900px !important;
    width: 85% !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .compact-modal .modal-content {
    border: none !important;
    border-radius: 15px !important;
    overflow: hidden !important;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25) !important;
  }
`;
