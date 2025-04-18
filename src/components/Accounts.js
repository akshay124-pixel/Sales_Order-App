import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Button, Modal, Badge, Form, Spinner } from "react-bootstrap";
import { FaEye } from "react-icons/fa";
import { toast } from "react-toastify";

function Accounts() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [formData, setFormData] = useState({
    billNumber: "",
    dispatchDate: "",
    paymentReceived: "Not Received",
    remarksByAccounts: "",
    invoiceNo: "",
    invoiceDate: "",
    paymentCollected: "",
    paymentMethod: "",
    paymentDue: "",
    neftTransactionId: "",
    chequeId: "",
  });
  const [errors, setErrors] = useState({});

  const fetchAccountsOrders = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://sales-order-server.onrender.com/api/accounts-orders",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        throw new Error("Failed to fetch accounts orders");
      }
    } catch (error) {
      console.error("Error fetching accounts orders:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch accounts orders",
        { position: "top-right", autoClose: 5000 }
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchAccountsOrders().then(() => {
      if (isMounted) setLoading(false);
    });
    return () => {
      isMounted = false; // Cleanup to prevent memory leak
    };
  }, [fetchAccountsOrders]);

  const handleView = (order) => {
    setViewOrder(order);
    setShowViewModal(true);
    setCopied(false);
  };

  const handleCopy = () => {
    if (!viewOrder) return;
    const productsText = viewOrder.products
      ? viewOrder.products
          .map(
            (p, i) =>
              `Product ${i + 1}: ${p.productType || "N/A"} (Qty: ${
                p.qty || "N/A"
              }, Serial Nos: ${p.serialNos?.join(", ") || "N/A"}, Model Nos: ${
                p.modelNos?.join(", ") || "N/A"
              }, GST: ${p.gst || "0"})`
          )
          .join("\n")
      : "N/A";
    const orderText = `
      Bill Number: ${viewOrder.billNumber || "N/A"}
      Date: ${
        viewOrder.dispatchDate
          ? new Date(viewOrder.dispatchDate).toLocaleDateString()
          : "N/A"
      }
      Party & Address: ${viewOrder.partyAndAddress || "N/A"}
      Email: ${viewOrder.customerEmail || "N/A"}
      Mobile: ${viewOrder.contactNo || "N/A"}
      Total: ${viewOrder.total || "N/A"}
     
      Payment Collected: ${viewOrder.paymentCollected || "N/A"}
      Payment Method: ${viewOrder.paymentMethod || "N/A"}
      Payment Due: ${viewOrder.paymentDue || "N/A"}
      NEFT Transaction ID: ${viewOrder.neftTransactionId || "N/A"}
      Cheque ID: ${viewOrder.chequeId || "N/A"}
      Payment Received: ${viewOrder.paymentReceived || "Not Received"}
      Remarks: ${viewOrder.remarksByAccounts || "N/A"}
      Invoice Number: ${viewOrder.invoiceNo || "N/A"}
      Invoice Date: ${
        viewOrder.invoiceDate
          ? new Date(viewOrder.invoiceDate).toLocaleDateString()
          : "N/A"
      }
      Products:\n${productsText}
    `.trim();
    navigator.clipboard.writeText(orderText);
    setCopied(true);
    toast.success("Details copied to clipboard!", {
      position: "top-right",
      autoClose: 2000,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = (order) => {
    setEditOrder(order);
    setFormData({
      billNumber: order.billNumber || "",
      dispatchDate: order.dispatchDate
        ? new Date(order.dispatchDate).toISOString().split("T")[0]
        : "",
      paymentReceived: order.paymentReceived || "Not Received",
      remarksByAccounts: order.remarksByAccounts || "",
      invoiceNo: order.invoiceNo || "",
      invoiceDate: order.invoiceDate
        ? new Date(order.invoiceDate).toISOString().split("T")[0]
        : "",
      paymentCollected: order.paymentCollected || "",
      paymentMethod: order.paymentMethod || "",
      paymentDue: order.paymentDue || "",
      neftTransactionId: order.neftTransactionId || "",
      chequeId: order.chequeId || "",
    });
    setErrors({});
    setShowEditModal(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.billNumber || formData.billNumber.trim() === "") {
      newErrors.billNumber = "Bill Number is required";
    }
    if (!formData.dispatchDate || formData.dispatchDate.trim() === "") {
      newErrors.dispatchDate = "Date is required";
    }
    if (
      !formData.remarksByAccounts ||
      formData.remarksByAccounts.trim() === ""
    ) {
      newErrors.remarksByAccounts = "Remarks are required";
    }
    if (
      formData.paymentMethod &&
      !["Cash", "NEFT", "RTGS", "Cheque", ""].includes(formData.paymentMethod)
    ) {
      newErrors.paymentMethod = "Invalid Payment Method";
    }
    if (
      formData.paymentMethod === "NEFT" &&
      (!formData.neftTransactionId || formData.neftTransactionId.trim() === "")
    ) {
      newErrors.neftTransactionId =
        "NEFT Transaction ID is required for NEFT payments";
    }
    if (
      formData.paymentMethod === "Cheque" &&
      (!formData.chequeId || formData.chequeId.trim() === "")
    ) {
      newErrors.chequeId = "Cheque ID is required for Cheque payments";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const submissionData = {
        billNumber: formData.billNumber,
        dispatchDate: new Date(formData.dispatchDate).toISOString(),
        paymentReceived: formData.paymentReceived,
        remarksByAccounts: formData.remarksByAccounts,
        invoiceNo: formData.invoiceNo || undefined,
        invoiceDate: formData.invoiceDate
          ? new Date(formData.invoiceDate).toISOString()
          : undefined,
        paymentCollected: formData.paymentCollected || undefined,
        paymentMethod: formData.paymentMethod || undefined,
        paymentDue: formData.paymentDue || undefined,
        neftTransactionId: formData.neftTransactionId || undefined,
        chequeId: formData.chequeId || undefined,
      };

      const response = await axios.put(
        `https://sales-order-server.onrender.com/api/edit/${editOrder?._id}`,
        submissionData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.success) {
        const updatedOrder = response.data.data;
        setOrders((prevOrders) =>
          prevOrders
            .map((order) =>
              order._id === editOrder._id ? updatedOrder : order
            )
            .filter((order) => order.paymentReceived !== "Received")
        );
        setShowEditModal(false);
        toast.success("Order updated successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
        await fetchAccountsOrders(); // Refresh the list
      } else {
        throw new Error(response.data.message || "Failed to update order");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update order", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        }}
      >
        <Spinner
          animation="border"
          style={{
            width: "50px",
            height: "50px",
            color: "#2575fc",
            marginBottom: "15px",
          }}
        />
        <p
          style={{
            fontSize: "1.3rem",
            color: "#333",
            fontWeight: "500",
            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.1)",
          }}
        >
          Loading Payment Collection Orders...
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          width: "100%",
          margin: "0",
          padding: "20px",
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          borderRadius: "0",
          boxShadow: "none",
          minHeight: "100vh",
          height: "100%",
        }}
      >
        <header
          style={{
            padding: "20px",
            textAlign: "center",
            background: "linear-gradient(135deg, #2575fc, #6a11cb)",
            color: "#fff",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
          }}
        >
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "2px",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
            }}
          >
            Payment Collection Dashboard
          </h1>
        </header>

        <div style={{ padding: "20px" }}>
          {orders.length === 0 ? (
            <div
              style={{
                background: "linear-gradient(135deg, #ff6b6b, #ff8787)",
                color: "#fff",
                padding: "20px",
                borderRadius: "10px",
                textAlign: "center",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                fontSize: "1.3rem",
                fontWeight: "500",
              }}
            >
              No Payment Collection available at this time.
            </div>
          ) : (
            <div
              style={{
                overflowX: "auto",
                maxHeight: "550px",
                border: "1px solid rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                backdropFilter: "blur(10px)",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: "0",
                }}
              >
                <thead
                  style={{
                    background: "linear-gradient(135deg, #2575fc, #6a11cb)",
                    color: "#fff",
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                  }}
                >
                  <tr>
                    {[
                      "Bill Number",
                      "Date",
                      "Party & Address",
                      "Email",
                      "Mobile",
                      "Total",

                      "Products",
                      "Payment Received",
                      "Actions",
                    ].map((header, index) => (
                      <th
                        key={index}
                        style={{
                          padding: "15px",
                          textAlign: "center",
                          fontWeight: "700",
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                          borderBottom: "2px solid rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => {
                    const productDetails = order.products
                      ? order.products
                          .map((p) => `${p.productType} (${p.qty})`)
                          .join(", ")
                      : "N/A";

                    return (
                      <tr
                        key={order._id}
                        style={{
                          background: index % 2 === 0 ? "#f8f9fa" : "#fff",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#e9ecef")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            index % 2 === 0 ? "#f8f9fa" : "#fff")
                        }
                      >
                        <td
                          style={{
                            padding: "15px",
                            textAlign: "center",
                            color: "#2c3e50",
                            fontSize: "1rem",
                            borderBottom: "1px solid #eee",
                          }}
                        >
                          {order.billNumber || "N/A"}
                        </td>
                        <td
                          style={{
                            padding: "15px",
                            textAlign: "center",
                            color: "#2c3e50",
                            fontSize: "1rem",
                            borderBottom: "1px solid #eee",
                          }}
                        >
                          {order.dispatchDate
                            ? new Date(order.dispatchDate).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td
                          style={{
                            padding: "15px",
                            textAlign: "center",
                            color: "#2c3e50",
                            fontSize: "1rem",
                            borderBottom: "1px solid #eee",
                          }}
                        >
                          {order.partyAndAddress || "N/A"}
                        </td>
                        <td
                          style={{
                            padding: "15px",
                            textAlign: "center",
                            color: "#2c3e50",
                            fontSize: "1rem",
                            borderBottom: "1px solid #eee",
                          }}
                        >
                          {order.customerEmail || "N/A"}
                        </td>
                        <td
                          style={{
                            padding: "15px",
                            textAlign: "center",
                            color: "#2c3e50",
                            fontSize: "1rem",
                            borderBottom: "1px solid #eee",
                          }}
                        >
                          {order.contactNo || "N/A"}
                        </td>
                        <td
                          style={{
                            padding: "15px",
                            textAlign: "center",
                            color: "#2c3e50",
                            fontSize: "1rem",
                            borderBottom: "1px solid #eee",
                          }}
                        >
                          {order.total || "N/A"}
                        </td>

                        <td
                          style={{
                            padding: "15px",
                            textAlign: "center",
                            color: "#2c3e50",
                            fontSize: "1rem",
                            borderBottom: "1px solid #eee",
                          }}
                        >
                          {productDetails}
                        </td>
                        <td
                          style={{
                            padding: "15px",
                            textAlign: "center",
                            color: "#2c3e50",
                            fontSize: "1rem",
                            borderBottom: "1px solid #eee",
                          }}
                        >
                          <Badge
                            style={{
                              background:
                                order.paymentReceived === "Received"
                                  ? "linear-gradient(135deg, #28a745, #4cd964)"
                                  : "linear-gradient(135deg, #ff6b6b, #ff8787)",
                              color: "#fff",
                              padding: "5px 10px",
                              borderRadius: "12px",
                            }}
                          >
                            {order.paymentReceived || "Not Received"}
                          </Badge>
                        </td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <div
                            style={{
                              display: "flex",
                              gap: "10px",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <Button
                              variant="primary"
                              onClick={() => handleView(order)}
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "22px",
                                padding: "0",
                              }}
                              aria-label="View order details"
                            >
                              <FaEye style={{ marginBottom: "3px" }} />
                            </Button>
                            <button
                              className="editBtn"
                              variant="secondary"
                              onClick={() => handleEdit(order)}
                              style={{
                                minWidth: "40px",
                                width: "40px",
                                padding: "0",
                              }}
                            >
                              <svg height="1em" viewBox="0 0 512 512">
                                <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"></path>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <footer className="footer-container">
        <p style={{ marginTop: "10px", color: "white", height: "20px" }}>
          © 2025 DataManagement. All rights reserved.
        </p>
      </footer>

      {/* View Modal */}
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        backdrop="static"
        keyboard={false}
        size="lg"
      >
        <Modal.Header
          closeButton
          style={{
            background: "linear-gradient(135deg, #2575fc, #6a11cb)",
            color: "#fff",
            padding: "20px",
            borderBottom: "none",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
          }}
        >
          <Modal.Title
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
            Accounts Order Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            padding: "30px",
            background: "#fff",
            borderRadius: "0 0 15px 15px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {viewOrder && (
            <>
              <div
                style={{
                  background: "#f8f9fa",
                  borderRadius: "10px",
                  padding: "20px",
                  boxShadow: "0 3px 10px rgba(0, 0, 0, 0.05)",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: "600",
                    color: "#333",
                    marginBottom: "15px",
                    textTransform: "uppercase",
                  }}
                >
                  Accounts Info
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "15px",
                  }}
                >
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>Bill Number:</strong>{" "}
                    {viewOrder.billNumber || "N/A"}
                  </span>
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>Date:</strong>{" "}
                    {viewOrder.dispatchDate
                      ? new Date(viewOrder.dispatchDate).toLocaleDateString()
                      : "N/A"}
                  </span>
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>Party & Address:</strong>{" "}
                    {viewOrder.partyAndAddress || "N/A"}
                  </span>
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>Email:</strong> {viewOrder.customerEmail || "N/A"}
                  </span>
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>Mobile:</strong> {viewOrder.contactNo || "N/A"}
                  </span>
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>Total:</strong> {viewOrder.total || "N/A"}
                  </span>

                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>Payment Collected:</strong>{" "}
                    {viewOrder.paymentCollected || "N/A"}
                  </span>
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>Payment Method:</strong>{" "}
                    {viewOrder.paymentMethod || "N/A"}
                  </span>
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>Payment Due:</strong>{" "}
                    {viewOrder.paymentDue || "N/A"}
                  </span>
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>NEFT Transaction ID:</strong>{" "}
                    {viewOrder.neftTransactionId || "N/A"}
                  </span>
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>Cheque ID:</strong> {viewOrder.chequeId || "N/A"}
                  </span>
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>Payment Received:</strong>{" "}
                    {viewOrder.paymentReceived || "Not Received"}
                  </span>
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>Remarks:</strong>{" "}
                    {viewOrder.remarksByAccounts || "N/A"}
                  </span>
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>Invoice Number:</strong>{" "}
                    {viewOrder.invoiceNo || "N/A"}
                  </span>
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>Invoice Date:</strong>{" "}
                    {viewOrder.invoiceDate
                      ? new Date(viewOrder.invoiceDate).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <hr />
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
                    Products
                  </h3>
                  {viewOrder.products && viewOrder.products.length > 0 ? (
                    viewOrder.products.map((product, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1.5rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <span style={{ fontSize: "1rem", color: "#555" }}>
                          <strong>Product {index + 1}:</strong>{" "}
                          {product.productType || "N/A"}
                        </span>
                        <span style={{ fontSize: "1rem", color: "#555" }}>
                          <strong>Quantity:</strong> {product.qty || "N/A"}
                        </span>
                        <span style={{ fontSize: "1rem", color: "#555" }}>
                          <strong>GST:</strong> {product.gst || "0"}
                        </span>
                        <span style={{ fontSize: "1rem", color: "#555" }}>
                          <strong>Serial Nos:</strong>{" "}
                          {product.serialNos?.join(", ") || "N/A"}
                        </span>
                        <span style={{ fontSize: "1rem", color: "#555" }}>
                          <strong>Model Nos:</strong>{" "}
                          {product.modelNos?.join(", ") || "N/A"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span style={{ fontSize: "1rem", color: "#555" }}>
                      <strong>Products:</strong> N/A
                    </span>
                  )}
                </div>
              </div>
              <Button
                onClick={handleCopy}
                style={{
                  background: "linear-gradient(135deg, #2575fc, #6a11cb)",
                  border: "none",
                  padding: "12px",
                  borderRadius: "25px",
                  color: "#fff",
                  fontWeight: "600",
                  fontSize: "1.1rem",
                  textTransform: "uppercase",
                  transition: "all 0.3s ease",
                  boxShadow: "0 6px 15px rgba(0, 0, 0, 0.2)",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.transform = "translateY(-3px)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.transform = "translateY(0)")
                }
              >
                {copied ? "✅ Copied!" : "📑 Copy Details"}
              </Button>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* Edit Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header
          closeButton
          style={{
            background: "linear-gradient(135deg, #2575fc, #6a11cb)",
            color: "#fff",
            borderBottom: "none",
            padding: "20px",
          }}
        >
          <Modal.Title
            style={{
              fontWeight: "700",
              fontSize: "1.5rem",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Edit Payment Collection
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            padding: "30px",
            background: "#fff",
            borderRadius: "0 0 15px 15px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Form onSubmit={handleEditSubmit}>
            <Form.Group style={{ marginBottom: "20px" }}>
              <Form.Label style={{ fontWeight: "600", color: "#333" }}>
                Bill Number <span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={formData.billNumber}
                onChange={(e) =>
                  setFormData({ ...formData, billNumber: e.target.value })
                }
                placeholder="Enter bill number"
                style={{
                  borderRadius: "10px",
                  border: errors.billNumber
                    ? "1px solid red"
                    : "1px solid #ced4da",
                  padding: "12px",
                  fontSize: "1rem",
                }}
                required
              />
              {errors.billNumber && (
                <Form.Text style={{ color: "red", fontSize: "0.875rem" }}>
                  {errors.billNumber}
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group style={{ marginBottom: "20px" }}>
              <Form.Label style={{ fontWeight: "600", color: "#333" }}>
                Dispatch Date <span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Form.Control
                type="date"
                value={formData.dispatchDate}
                onChange={(e) =>
                  setFormData({ ...formData, dispatchDate: e.target.value })
                }
                style={{
                  borderRadius: "10px",
                  border: errors.dispatchDate
                    ? "1px solid red"
                    : "1px solid #ced4da",
                  padding: "12px",
                  fontSize: "1rem",
                }}
                required
              />
              {errors.dispatchDate && (
                <Form.Text style={{ color: "red", fontSize: "0.875rem" }}>
                  {errors.dispatchDate}
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group style={{ marginBottom: "20px" }}>
              <Form.Label style={{ fontWeight: "600", color: "#333" }}>
                Payment Collected
              </Form.Label>
              <Form.Control
                type="text"
                value={formData.paymentCollected}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentCollected: e.target.value,
                  })
                }
                placeholder="Enter payment collected"
                style={{
                  borderRadius: "10px",
                  border: errors.paymentCollected
                    ? "1px solid red"
                    : "1px solid #ced4da",
                  padding: "12px",
                  fontSize: "1rem",
                }}
              />
              {errors.paymentCollected && (
                <Form.Text style={{ color: "red", fontSize: "0.875rem" }}>
                  {errors.paymentCollected}
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group style={{ marginBottom: "20px" }}>
              <Form.Label style={{ fontWeight: "600", color: "#333" }}>
                Payment Method
              </Form.Label>
              <Form.Select
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentMethod: e.target.value,
                  })
                }
                style={{
                  borderRadius: "10px",
                  border: errors.paymentMethod
                    ? "1px solid red"
                    : "1px solid #ced4da",
                  padding: "12px",
                  fontSize: "1rem",
                }}
              >
                <option value="">-- Select Payment Method --</option>
                <option value="Cash">Cash</option>
                <option value="NEFT">NEFT</option>
                <option value="RTGS">RTGS</option>
                <option value="Cheque">Cheque</option>
              </Form.Select>
              {errors.paymentMethod && (
                <Form.Text style={{ color: "red", fontSize: "0.875rem" }}>
                  {errors.paymentMethod}
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group style={{ marginBottom: "20px" }}>
              <Form.Label style={{ fontWeight: "600", color: "#333" }}>
                Payment Due
              </Form.Label>
              <Form.Control
                type="text"
                value={formData.paymentDue}
                onChange={(e) =>
                  setFormData({ ...formData, paymentDue: e.target.value })
                }
                placeholder="Enter payment due"
                style={{
                  borderRadius: "10px",
                  border: errors.paymentDue
                    ? "1px solid red"
                    : "1px solid #ced4da",
                  padding: "12px",
                  fontSize: "1rem",
                }}
              />
              {errors.paymentDue && (
                <Form.Text style={{ color: "red", fontSize: "0.875rem" }}>
                  {errors.paymentDue}
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group style={{ marginBottom: "20px" }}>
              <Form.Label style={{ fontWeight: "600", color: "#333" }}>
                NEFT Transaction ID
              </Form.Label>
              <Form.Control
                type="text"
                value={formData.neftTransactionId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    neftTransactionId: e.target.value,
                  })
                }
                placeholder="Enter NEFT transaction ID"
                style={{
                  borderRadius: "10px",
                  border: errors.neftTransactionId
                    ? "1px solid red"
                    : "1px solid #ced4da",
                  padding: "12px",
                  fontSize: "1rem",
                }}
                disabled={formData.paymentMethod !== "NEFT"}
              />
              {errors.neftTransactionId && (
                <Form.Text style={{ color: "red", fontSize: "0.875rem" }}>
                  {errors.neftTransactionId}
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group style={{ marginBottom: "20px" }}>
              <Form.Label style={{ fontWeight: "600", color: "#333" }}>
                Cheque ID
              </Form.Label>
              <Form.Control
                type="text"
                value={formData.chequeId}
                onChange={(e) =>
                  setFormData({ ...formData, chequeId: e.target.value })
                }
                placeholder="Enter cheque ID"
                style={{
                  borderRadius: "10px",
                  border: errors.chequeId
                    ? "1px solid red"
                    : "1px solid #ced4da",
                  padding: "12px",
                  fontSize: "1rem",
                }}
                disabled={formData.paymentMethod !== "Cheque"}
              />
              {errors.chequeId && (
                <Form.Text style={{ color: "red", fontSize: "0.875rem" }}>
                  {errors.chequeId}
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group style={{ marginBottom: "20px" }}>
              <Form.Label style={{ fontWeight: "600", color: "#333" }}>
                Payment Received
              </Form.Label>
              <Form.Select
                value={formData.paymentReceived}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentReceived: e.target.value,
                  })
                }
                style={{
                  borderRadius: "10px",
                  border: "1px solid #ced4da",
                  padding: "12px",
                  fontSize: "1rem",
                }}
              >
                <option value="Not Received">Not Received</option>
                <option value="Received">Received</option>
              </Form.Select>
            </Form.Group>

            <Form.Group style={{ marginBottom: "20px" }}>
              <Form.Label style={{ fontWeight: "600", color: "#333" }}>
                Invoice Number
              </Form.Label>
              <Form.Control
                type="text"
                value={formData.invoiceNo}
                onChange={(e) =>
                  setFormData({ ...formData, invoiceNo: e.target.value })
                }
                placeholder="Enter invoice number"
                style={{
                  borderRadius: "10px",
                  border: "1px solid #ced4da",
                  padding: "12px",
                  fontSize: "1rem",
                }}
              />
            </Form.Group>

            <Form.Group style={{ marginBottom: "20px" }}>
              <Form.Label style={{ fontWeight: "600", color: "#333" }}>
                Invoice Date
              </Form.Label>
              <Form.Control
                type="date"
                value={formData.invoiceDate}
                onChange={(e) =>
                  setFormData({ ...formData, invoiceDate: e.target.value })
                }
                style={{
                  borderRadius: "10px",
                  border: "1px solid #ced4da",
                  padding: "12px",
                  fontSize: "1rem",
                }}
              />
            </Form.Group>

            <Form.Group style={{ marginBottom: "20px" }}>
              <Form.Label style={{ fontWeight: "600", color: "#333" }}>
                Remarks by Accounts <span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.remarksByAccounts}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    remarksByAccounts: e.target.value,
                  })
                }
                placeholder="Enter remarks"
                style={{
                  borderRadius: "10px",
                  border: errors.remarksByAccounts
                    ? "1px solid red"
                    : "1px solid #ced4da",
                  padding: "12px",
                  fontSize: "1rem",
                }}
                required
              />
              {errors.remarksByAccounts && (
                <Form.Text style={{ color: "red", fontSize: "0.875rem" }}>
                  {errors.remarksByAccounts}
                </Form.Text>
              )}
            </Form.Group>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "15px",
              }}
            >
              <Button
                onClick={() => setShowEditModal(false)}
                style={{
                  background: "linear-gradient(135deg, #6c757d, #5a6268)",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "20px",
                  color: "#fff",
                  fontWeight: "600",
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                style={{
                  background: "linear-gradient(135deg, #2575fc, #6a11cb)",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "20px",
                  color: "#fff",
                  fontWeight: "600",
                }}
              >
                Save Changes
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

const keyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

document.head.insertAdjacentHTML("beforeend", `<style>${keyframes}</style>`);

export default Accounts;
