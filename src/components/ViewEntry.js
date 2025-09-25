import React, { useState, useCallback } from "react";
import { Modal, Button, Badge, Accordion, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-toastify";
import { Copy, Download } from "lucide-react";

function ViewEntry({ isOpen, onClose, entry }) {
  const [copied, setCopied] = useState(false);

  // Utility function to check if a field is valid (not null, undefined, empty, or "N/A")
  const isValidField = (value) => {
    if (value === null || value === undefined || value === "") return false;
    if (typeof value === "string" && value.trim() === "N/A") return false;
    if (Array.isArray(value) && value.length === 0) return false;
    if (
      typeof value === "object" &&
      value !== null &&
      Object.keys(value).length === 0
    )
      return false;
    return true;
  };

  // Utility function to check if an object (e.g., createdBy) has valid content
  const isValidObjectField = (obj, key) => {
    if (!isValidField(obj)) return false;
    if (typeof obj === "object" && key) {
      return isValidField(obj[key]);
    }
    return true;
  };

  // Utility function to format date fields
  const formatDate = (dateStr) => {
    if (!isValidField(dateStr)) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString("en-GB");
  };

  // Utility function to format date and time for soDate
  const formatDateTime = (dateStr) => {
    if (!isValidField(dateStr)) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const datePart = date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    if (hours < 5 || (hours === 5 && minutes <= 30)) {
      return datePart;
    }
    const timePart = date.toLocaleString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${datePart} ${timePart}`;
  };

  const isValidPoFilePath = (filePath) => {
    return (
      filePath &&
      typeof filePath === "string" &&
      filePath.trim() !== "" &&
      filePath !== "N/A" &&
      filePath !== "/" &&
      filePath.includes("/Uploads/")
    );
  };
  const handleDownload = useCallback(async () => {
    if (!isValidPoFilePath(entry?.poFilePath)) {
      toast.error("No valid PO file available to download!");
      return;
    }

    try {
      const fileUrl = `${process.env.REACT_APP_URL}${
        entry.poFilePath.startsWith("/") ? "" : "/"
      }${entry.poFilePath}`;

      // Validate file URL
      if (!fileUrl || fileUrl === process.env.REACT_APP_URL + "/") {
        toast.error("Invalid file path provided!");
        return;
      }

      const response = await fetch(fileUrl, {
        method: "GET",
        headers: {
          Accept:
            "application/pdf,image/png,image/jpeg,image/jpg,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Server error: ${response.status} ${response.statusText}`
        );
      }

      const contentType = response.headers.get("content-type");
      const validTypes = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];

      if (!contentType || !validTypes.includes(contentType)) {
        throw new Error("Invalid file type returned from server!");
      }

      const blob = await response.blob();

      // ✅ FileName fix
      const extension = contentType.split("/")[1] || "file";
      const fileName =
        entry.poFilePath.split("/").pop() ||
        `order_${entry.orderId || "unknown"}.${extension}`;

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);

      toast.success("File download started!");
    } catch (err) {
      toast.error("Failed to download file! Check server or file path.");
      console.error("Download error:", err);
    }
  }, [entry]);

  const handleCopy = useCallback(() => {
    if (!entry) return;

    const productsText = isValidField(entry.products)
      ? entry.products
          .map(
            (p, i) =>
              `Product ${i + 1}: ${p.productType || "N/A"} (Qty: ${
                p.qty || "N/A"
              }, Size: ${p.size || "N/A"}, Spec: ${
                p.spec || "N/A"
              }, Unit Price: ₹${p.unitPrice?.toFixed(2) || "0.00"}, GST: ${
                p.gst || "N/A"
              }, Serial Nos: ${
                isValidField(p.serialNos) && p.serialNos.length > 0
                  ? p.serialNos.join(", ")
                  : "N/A"
              }, Model Nos: ${
                isValidField(p.modelNos) && p.modelNos.length > 0
                  ? p.modelNos.join(", ")
                  : "N/A"
              }, Brand: ${p.brand || "N/A"}, Warranty: ${p.warranty || "N/A"})`
          )
          .join("\n")
      : "N/A";

    const totalUnitPrice = isValidField(entry.products)
      ? entry.products.reduce(
          (sum, p) => sum + (p.unitPrice || 0) * (p.qty || 0),
          0
        )
      : null;

    const gstText = isValidField(entry.products)
      ? entry.products
          .map((p) => p.gst)
          .filter(Boolean)
          .join(", ")
      : null;

    // Define all fields for copying
    const fieldsToCopy = [
      { key: "orderId", label: "Order ID" },
      { key: "soDate", label: "SO Date", formatter: formatDateTime },
      { key: "customername", label: "Customer Name" },
      { key: "name", label: "Contact Person Name" },
      { key: "contactNo", label: "Contact No" },
      { key: "alterno", label: "Alternate No" },
      { key: "customerEmail", label: "Customer Email" },
      { key: "city", label: "City" },
      { key: "state", label: "State" },
      { key: "pinCode", label: "Pin Code" },
      { key: "gstno", label: "GST No" },
      {
        key: "products",
        label: "Products",
        value: productsText,
        condition: isValidField(entry.products),
      },
      {
        key: "totalUnitPrice",
        label: "Total Unit Price",
        value: isValidField(totalUnitPrice)
          ? `₹${totalUnitPrice.toFixed(2)}`
          : null,
        condition: isValidField(entry.products),
      },
      {
        key: "gstText",
        label: "GST",
        value: gstText,
        condition: isValidField(entry.products),
      },
      { key: "freightcs", label: "Freight Charges" },
      { key: "freightstatus", label: "Freight Status" },
      {
        key: "actualFreight",
        label: "Actual Freight",
        formatter: (v) => (isValidField(v) ? `₹${v.toFixed(2)}` : null),
      },
      { key: "installchargesstatus", label: "Install Charges Status" },
      { key: "installation", label: "Installation" },
      {
        key: "total",
        label: "Total",
        formatter: (v) => (isValidField(v) ? `₹${v.toFixed(2)}` : null),
      },
      { key: "paymentCollected", label: "Payment Collected" },
      { key: "paymentMethod", label: "Payment Method" },
      { key: "paymentDue", label: "Payment Due" },
      { key: "neftTransactionId", label: "NEFT Transaction ID" },
      { key: "chequeId", label: "Cheque ID" },
      { key: "paymentTerms", label: "Payment Terms" },
      { key: "creditDays", label: "Credit Days" },
      { key: "orderType", label: "Order Type" },
      { key: "gemOrderNumber", label: "GEM Order Number" },
      { key: "report", label: "Reporting Person" },
      { key: "transporter", label: "Transporter" },
      { key: "transporterDetails", label: "Transporter Details" },
      { key: "shippingAddress", label: "Shipping Address" },
      { key: "billingAddress", label: "Billing Address" },
      { key: "dispatchFrom", label: "Dispatch From" },
      { key: "dispatchDate", label: "Dispatch Date", formatter: formatDate },
      { key: "docketNo", label: "Docket No" },
      { key: "deliveryDate", label: "Delivery Date", formatter: formatDate },
      { key: "receiptDate", label: "Receipt Date", formatter: formatDate },
      { key: "invoiceNo", label: "Invoice No" },
      { key: "invoiceDate", label: "Invoice Date", formatter: formatDate },
      { key: "billNumber", label: "Bill Number" },
      { key: "piNumber", label: "PI Number" },
      { key: "billStatus", label: "Bill Status" },
      { key: "paymentReceived", label: "Payment Received" },
      { key: "fulfillingStatus", label: "Production Fulfilling Status" },
      { key: "sostatus", label: "SO Status" },
      { key: "dispatchStatus", label: "Dispatch Status" },
      { key: "installationStatus", label: "Installation Status" },
      { key: "completionStatus", label: "Production Status" },
      { key: "stockStatus", label: "Stock Status" },
      { key: "demoDate", label: "Demo Date", formatter: formatDate },
      { key: "demostatus", label: "Demo Status" },
      {
        key: "demoRecivedDate",
        label: "Demo Received Date",
        formatter: formatDate,
      },
      { key: "demoBillno", label: "Demo Bill Number" },
      {
        key: "fulfillmentDate",
        label: "Fulfillment Date",
        formatter: formatDate,
      },
      { key: "remarks", label: "Remarks" },
      { key: "remarksByProduction", label: "Remarks By Production" },
      { key: "remarksByAccounts", label: "Remarks By Accounts" },
      { key: "remarksByBilling", label: "Remarks By Billing" },
      { key: "remarksByInstallation", label: "Remarks By Installation" },
      { key: "verificationRemarks", label: "Verification Remarks" },
      { key: "salesPerson", label: "Sales Person" },
      { key: "company", label: "Company" },
      {
        key: "createdBy",
        label: "Created By",
        formatter: (v) =>
          isValidObjectField(v, "username") ? v.username || v : null,
      },
      { key: "poFilePath", label: "Attachments" },
    ];

    const textToCopy = fieldsToCopy
      .filter(
        ({ key, condition, value }) =>
          (condition !== undefined
            ? condition
            : isValidField(value || entry[key])) &&
          (value !== undefined ||
            (entry[key] !== null && entry[key] !== undefined))
      )
      .map(({ label, key, value, formatter }) => {
        const val =
          value !== undefined
            ? value
            : formatter
            ? formatter(entry[key])
            : entry[key];
        return isValidField(val) ? `${label}: ${val}` : null;
      })
      .filter(Boolean)
      .join("\n")
      .trim();

    if (!textToCopy) {
      toast.error("No valid data to copy!");
      return;
    }

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

  const totalUnitPrice = isValidField(entry.products)
    ? entry.products.reduce(
        (sum, p) => sum + (p.unitPrice || 0) * (p.qty || 0),
        0
      )
    : null;

  const gstText = isValidField(entry.products)
    ? entry.products
        .map((p) => p.gst)
        .filter(Boolean)
        .join(", ")
    : null;

  // Define fields that should use badges
  const badgeFields = {
    orderType: {
      Demo: "warning",
      B2C: "success",
      B2B: "info",
      B2G: "primary",
      default: "secondary",
    },
    sostatus: {
      "Pending for Approval": "warning",
      "Accounts Approved": "info",
      Approved: "success",
      "On Hold Due to Low Price": "danger",
      default: "secondary",
    },
    dispatchStatus: {
      "Not Dispatched": "warning",
      Dispatched: "info",
      Delivered: "success",
      "Docket Awaited Dispatched": "primary",
      default: "secondary",
    },
    completionStatus: {
      Complete: "success",
      default: "warning",
    },
    stockStatus: {
      "In Stock": "success",
      default: "danger",
    },
    demostatus: {
      Recived: "success",
      "Not Recived": "warning",
      default: "secondary",
    },
    freightstatus: {
      Including: "success",
      "To Pay": "warning",
      "Self-Pickup": "info",
      default: "primary",
    },
    installchargesstatus: {
      Including: "success",
      "To Pay": "warning",
      default: "primary",
    },
    paymentMethod: {
      Cash: "success",
      NEFT: "info",
      RTGS: "primary",
      Cheque: "warning",
      default: "secondary",
    },
    paymentTerms: {
      "100% Advance": "success",
      "Partial Advance": "info",
      Credit: "warning",
      default: "secondary",
    },
    paymentReceived: {
      Received: "success",
      default: "warning",
    },
    billStatus: {
      Pending: "warning",
      "Under Billing": "info",
      "Billing Complete": "success",
      default: "secondary",
    },
    fulfillingStatus: {
      "Under Process": {
        bg: "linear-gradient(135deg, #f39c12, #f7c200)",
        color: "#fff",
      },
      Pending: {
        bg: "linear-gradient(135deg, #ff6b6b, #ff8787)",
        color: "#fff",
      },
      "Partial Dispatch": {
        bg: "linear-gradient(135deg, #00c6ff, #0072ff)",
        color: "#fff",
      },
      Fulfilled: {
        bg: "linear-gradient(135deg, #28a745, #4cd964)",
        color: "#fff",
      },
      default: {
        bg: "linear-gradient(135deg, #6c757d, #a9a9a9)",
        color: "#fff",
      },
    },
    installationStatus: {
      Pending: "warning",
      "In Progress": "info",
      Completed: "success",
      Failed: "danger",
      default: "secondary",
    },
    company: {
      Promark: "success",
      Foxmate: "info",
      Promine: "warning",
      default: "primary",
    },
  };

  // Define fields for each accordion section
  const orderInfoFields = [
    { key: "orderId", label: "Order ID" },
    { key: "soDate", label: "SO Date & Time", formatter: formatDateTime },
    { key: "orderType", label: "Order Type" },
    { key: "gemOrderNumber", label: "GEM Order Number" },
    { key: "dispatchDate", label: "Dispatch Date", formatter: formatDate },
    { key: "deliveryDate", label: "Delivery Date", formatter: formatDate },
    { key: "receiptDate", label: "Receipt Date", formatter: formatDate },
    { key: "docketNo", label: "Docket No" },
    { key: "sostatus", label: "SO Status" },
    { key: "dispatchStatus", label: "Dispatch Status" },
    { key: "completionStatus", label: "Completion Status" },
    { key: "stockStatus", label: "Stock Status" },
    { key: "demoDate", label: "Demo Date", formatter: formatDate },
    { key: "demostatus", label: "Demo Status" },
    {
      key: "demoRecivedDate",
      label: "Demo Received Date",
      formatter: formatDate,
    },
    { key: "demoBillno", label: "Demo Bill Number" },
    {
      key: "fulfillmentDate",
      label: "Fulfillment Date",
      formatter: formatDate,
    },
    {
      key: "createdBy",
      label: "Created By",
      formatter: (v) =>
        isValidObjectField(v, "username") ? v.username || v : null,
    },
    { key: "salesPerson", label: "Sales Person" },
    { key: "report", label: "Reporting Person" },
    {
      key: "poFilePath",
      label: "Attachments",
      renderer: () =>
        isValidPoFilePath(entry.poFilePath) ? (
          <Button
            variant="outline-primary"
            size="sm"
            onClick={handleDownload}
            style={{
              background: "linear-gradient(135deg, #2575fc, #6a11cb)",
              padding: "6px 12px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.85rem",
              fontWeight: "600",
              color: "#ffffff",
              border: "1px solid #ffffff22",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
              transition:
                "transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.05)";
              e.target.style.boxShadow = "0 4px 12px rgba(106, 17, 203, 0.4)";
              e.target.style.background =
                "linear-gradient(135deg, #3b82f6, #7e22ce)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.15)";
              e.target.style.background =
                "linear-gradient(135deg, #2575fc, #6a11cb)";
            }}
            onMouseDown={(e) => {
              e.target.style.transform = "scale(0.95)";
            }}
            onMouseUp={(e) => {
              e.target.style.transform = "scale(1.05)";
            }}
          >
            <Download size={14} />
            Download
          </Button>
        ) : (
          <span>No file attached</span>
        ),
    },
  ];
  const customerInfoFields = [
    { key: "customername", label: "Customer Name" },
    { key: "name", label: "Contact Person" },
    { key: "contactNo", label: "Contact No" },
    { key: "alterno", label: "Alternate No" },
    { key: "customerEmail", label: "Email" },
    { key: "gstno", label: "GST No" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "pinCode", label: "Pin Code" },
    { key: "shippingAddress", label: "Shipping Address" },
    { key: "billingAddress", label: "Billing Address" },
  ];

  const financialInfoFields = [
    {
      key: "totalUnitPrice",
      label: "Total Unit Price",
      value: isValidField(totalUnitPrice)
        ? `₹${totalUnitPrice.toFixed(2)}`
        : null,
      condition: isValidField(entry.products),
    },
    {
      key: "gstText",
      label: "GST",
      value: gstText,
      condition: isValidField(entry.products),
    },
    { key: "freightcs", label: "Freight Charges" },
    { key: "freightstatus", label: "Freight Status" },
    {
      key: "actualFreight",
      label: "Actual Freight",
      formatter: (v) => (isValidField(v) ? `₹${v.toFixed(2)}` : null),
    },
    { key: "installchargesstatus", label: "Install Charges Status" },
    { key: "installation", label: "Installation" },
    {
      key: "total",
      label: "Total",
      formatter: (v) => (isValidField(v) ? `₹${v.toFixed(2)}` : null),
    },
    { key: "paymentCollected", label: "Payment Collected" },
    { key: "paymentMethod", label: "Payment Method" },
    { key: "paymentDue", label: "Payment Due" },
    { key: "neftTransactionId", label: "NEFT Transaction ID" },
    { key: "chequeId", label: "Cheque ID" },
    { key: "paymentTerms", label: "Payment Terms" },
    { key: "creditDays", label: "Credit Days" },
    { key: "paymentReceived", label: "Payment Received" },
    { key: "invoiceNo", label: "Invoice No" },
    { key: "invoiceDate", label: "Invoice Date", formatter: formatDate },
    { key: "billNumber", label: "Bill Number" },
    { key: "piNumber", label: "PI Number" },
    { key: "billStatus", label: "Bill Status" },
    { key: "remarksByAccounts", label: "Remarks (Accounts)" },
    { key: "remarksByBilling", label: "Remarks (Billing)" },
    { key: "verificationRemarks", label: "Verification Remarks" },
  ];

  const productionInfoFields = [
    { key: "fulfillingStatus", label: "Production Status" },
    { key: "remarksByProduction", label: "Remarks (Production)" },
    { key: "remarks", label: "Remarks" },
  ];

  const logisticsInfoFields = [
    { key: "installationStatus", label: "Installation Status" },
    { key: "remarksByInstallation", label: "Remarks (Installation)" },
    { key: "company", label: "Company" },
    { key: "dispatchFrom", label: "Dispatch From" },
    { key: "transporter", label: "Transporter" },
    { key: "transporterDetails", label: "Transporter Details" },
    { key: "docketNo", label: "Docket Number" },
  ];

  // Filter sections to only show those with at least one valid field
  const sections = [
    {
      eventKey: "0",
      title: "📅 Order Information",
      fields: orderInfoFields,
    },
    {
      eventKey: "1",
      title: "👤 Customer Information",
      fields: customerInfoFields,
    },
    {
      eventKey: "2",
      title: "📦 Product Information",
      condition: isValidField(entry.products),
    },
    {
      eventKey: "3",
      title: "💰 Financial Information",
      fields: financialInfoFields,
    },
    {
      eventKey: "4",
      title: "🛠️ Production Information",
      fields: productionInfoFields,
    },
    {
      eventKey: "5",
      title: "🚚 Logistics & Installation",
      fields: logisticsInfoFields,
    },
  ].filter((section) => {
    if (section.condition !== undefined) return section.condition;
    return section.fields?.some(
      ({ key, condition, value, formatter, renderer }) =>
        condition !== undefined
          ? condition
          : renderer
          ? renderer()
          : isValidField(
              value || (formatter ? formatter(entry[key]) : entry[key])
            )
    );
  });

  return (
    <Modal
      show={isOpen}
      onHide={onClose}
      backdrop="static"
      keyboard={false}
      size="xl"
      aria-labelledby="view-entry-modal-title"
      centered
      style={{ backdropFilter: "blur(5px)" }}
    >
      <Modal.Header
        style={{
          background: "linear-gradient(135deg, #2575fc, #6a11cb)",
          color: "#fff",
          padding: "1.5rem 2rem",
          border: "none",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Modal.Title
          id="view-entry-modal-title"
          style={{
            fontWeight: "700",
            fontSize: "1.8rem",
            letterSpacing: "1.2px",
            textTransform: "uppercase",
            fontFamily: "'Poppins', sans-serif",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span role="img" aria-label="clipboard">
            📋
          </span>
          Sales Order #{entry.orderId || "N/A"}
        </Modal.Title>
        <Button
          variant="light"
          onClick={onClose}
          style={{
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
          }}
        >
          ✕
        </Button>
      </Modal.Header>

      <Modal.Body
        style={{
          padding: "2rem",
          background: "linear-gradient(180deg, #f8fafc, #e2e8f0)",
          borderRadius: "0 0 15px 15px",
          minHeight: "600px",
          maxHeight: "80vh",
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "#2575fc #e6f0fa",
        }}
      >
        {sections.length === 0 ? (
          <p style={{ color: "#555", textAlign: "center" }}>
            No valid data available to display.
          </p>
        ) : (
          <Accordion
            defaultActiveKey={sections.map((s) => s.eventKey)}
            alwaysOpen
          >
            {sections.map((section) => (
              <Accordion.Item
                key={section.eventKey}
                eventKey={section.eventKey}
              >
                <Accordion.Header
                  style={{
                    color: "#fff",
                    borderRadius: "10px",
                    padding: "1rem",
                    fontWeight: "600",
                    fontFamily: "'Poppins', sans-serif",
                    border: "none",
                  }}
                >
                  {section.title}
                </Accordion.Header>
                <Accordion.Body
                  style={{
                    background: "#fff",
                    borderRadius: "10px",
                    padding: "1.5rem",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {section.eventKey === "2" ? (
                    isValidField(entry.products) ? (
                      entry.products.map((product, index) => (
                        <Card
                          key={index}
                          style={{
                            marginBottom: "1rem",
                            border: "none",
                            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                            borderRadius: "10px",
                            transition: "transform 0.2s ease",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.transform = "scale(1.02)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.transform = "scale(1)")
                          }
                        >
                          <Card.Body>
                            <Card.Title
                              style={{
                                fontSize: "1.1rem",
                                fontWeight: "600",
                                color: "#1e293b",
                              }}
                            >
                              Product {index + 1}:{" "}
                              {product.productType || "N/A"}
                            </Card.Title>
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  "repeat(auto-fit, minmax(200px, 1fr))",
                                gap: "0.5rem",
                              }}
                            >
                              {[
                                { key: "qty", label: "Quantity" },
                                { key: "size", label: "Size" },
                                { key: "spec", label: "Spec" },
                                {
                                  key: "unitPrice",
                                  label: "Unit Price",
                                  formatter: (v) =>
                                    isValidField(v) ? `₹${v.toFixed(2)}` : null,
                                },
                                { key: "gst", label: "GST" },
                                { key: "brand", label: "Brand" },
                                { key: "warranty", label: "Warranty" },
                                {
                                  key: "serialNos",
                                  label: "Serial Nos",
                                  formatter: (v) =>
                                    isValidField(v) && v.length > 0
                                      ? v.join(", ")
                                      : null,
                                },
                                {
                                  key: "modelNos",
                                  label: "Model Nos",
                                  formatter: (v) =>
                                    isValidField(v) && v.length > 0
                                      ? v.join(", ")
                                      : null,
                                },
                                {
                                  key: "productCode",
                                  label: "Product Code",
                                  formatter: (v) =>
                                    product.productType ===
                                      "Fujifilm-Printer" &&
                                    isValidField(v) &&
                                    v.length > 0
                                      ? v.join(", ")
                                      : null,
                                },
                              ]
                                .filter(({ key, formatter }) =>
                                  isValidField(
                                    formatter
                                      ? formatter(product[key])
                                      : product[key]
                                  )
                                )
                                .map(({ key, label, formatter }) => (
                                  <div key={key}>
                                    <strong>{label}:</strong>{" "}
                                    {formatter
                                      ? formatter(product[key])
                                      : product[key]}
                                  </div>
                                ))}
                            </div>
                          </Card.Body>
                        </Card>
                      ))
                    ) : null
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: "1rem",
                      }}
                    >
                      {section.fields
                        .filter(
                          ({ key, condition, value, formatter, renderer }) =>
                            condition !== undefined
                              ? condition
                              : renderer
                              ? renderer()
                              : isValidField(
                                  value ||
                                    (formatter
                                      ? formatter(entry[key])
                                      : entry[key])
                                )
                        )
                        .map(({ key, label, value, formatter, renderer }) => {
                          const displayValue =
                            value ||
                            (formatter ? formatter(entry[key]) : entry[key]);
                          const badgeStyle = badgeFields[key];
                          return (
                            <div
                              key={key}
                              style={{
                                display: renderer ? "flex" : "block",
                                alignItems: renderer ? "center" : "initial",
                                gap: renderer ? "10px" : "0",
                              }}
                            >
                              {renderer ? (
                                <>
                                  <strong>{label}:</strong> {renderer()}
                                </>
                              ) : badgeStyle && isValidField(displayValue) ? (
                                <div>
                                  <strong>{label}:</strong>{" "}
                                  <Badge
                                    bg={
                                      typeof badgeStyle[displayValue] ===
                                      "string"
                                        ? badgeStyle[displayValue] ||
                                          badgeStyle.default
                                        : undefined
                                    }
                                    style={
                                      typeof badgeStyle[displayValue] ===
                                      "object"
                                        ? {
                                            background:
                                              badgeStyle[displayValue].bg,
                                            color:
                                              badgeStyle[displayValue].color,
                                            padding: "5px 10px",
                                            borderRadius: "12px",
                                            fontWeight: "500",
                                          }
                                        : key === "fulfillingStatus"
                                        ? {
                                            background:
                                              badgeStyle[displayValue]?.bg ||
                                              badgeStyle.default.bg,
                                            color:
                                              badgeStyle[displayValue]?.color ||
                                              badgeStyle.default.color,
                                            padding: "5px 10px",
                                            borderRadius: "12px",
                                            fontWeight: "500",
                                          }
                                        : {}
                                    }
                                  >
                                    {displayValue}
                                  </Badge>
                                </div>
                              ) : (
                                <div>
                                  <strong>{label}:</strong> {displayValue}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        )}

        <Button
          onClick={handleCopy}
          style={{
            marginTop: "2rem",
            background: "linear-gradient(135deg, #2563eb, #7e22ce)",
            border: "none",
            borderRadius: "50px",
            padding: "12px 24px",
            fontSize: "1.1rem",
            fontWeight: "600",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            width: "100%",
            justifyContent: "center",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.2)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-3px)";
            e.target.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.2)";
          }}
        >
          <Copy size={20} />
          {copied ? "Copied to Clipboard!" : "Copy Details"}
        </Button>
      </Modal.Body>
    </Modal>
  );
}

export default ViewEntry;
