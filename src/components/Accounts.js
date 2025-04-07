import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Button, Modal, Badge, Form, Spinner } from "react-bootstrap";
import { FaEye, FaTrash } from "react-icons/fa";
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
    partyAndAddress: "",
    email: "",
    mobile: "",
    total: "",
    gst: "",
    paymentReceived: "Not Received",
    remarksByAccounts: "",
    invoiceNumber: "",
    invoiceDate: "",
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
    const orderText = `
      Bill Number: ${viewOrder.billNumber || "N/A"}
      Date: ${viewOrder.dispatchDate || "N/A"}
      Party & Address: ${viewOrder.partyAndAddress || "N/A"}
      Email: ${viewOrder.email || "N/A"}
      Mobile: ${viewOrder.mobile || "N/A"}
      Total: ${viewOrder.total || "N/A"}
      GST: ${viewOrder.gst || "N/A"}
      Payment Received: ${viewOrder.paymentReceived || "Not Received"}
      Remarks: ${viewOrder.remarksByAccounts || "N/A"}
      Invoice Number: ${viewOrder.invoiceNumber || "N/A"}
      Invoice Date: ${viewOrder.invoiceDate || "N/A"}
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
      partyAndAddress: order.partyAndAddress || "",
      email: order.email || "",
      mobile: order.mobile || "",
      total: order.total || "",
      gst: order.gst || "",
      paymentReceived: order.paymentReceived || "Not Received",
      remarksByAccounts: order.remarksByAccounts || "",
      invoiceNumber: order.invoiceNumber || "",
      invoiceDate: order.invoiceDate
        ? new Date(order.invoiceDate).toISOString().split("T")[0]
        : "",
    });
    setErrors({});
    setShowEditModal(true);
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      const response = await axios.delete(
        `https://sales-order-server.onrender.com/api/delete/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.success) {
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order._id !== orderId)
        );
        toast.success("Order deleted successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        throw new Error(response.data.message || "Failed to delete order");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete order", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.billNumber || formData.billNumber.trim() === "") {
      newErrors.billNumber = "Bill Number is required";
    }
    if (!formData.dispatchDate || formData.dispatchDate.trim() === "") {
      newErrors.dispatchDate = "Date is required";
    }
    if (!formData.partyAndAddress || formData.partyAndAddress.trim() === "") {
      newErrors.partyAndAddress = "Party & Address is required";
    }
    if (!formData.total || formData.total === "" || isNaN(formData.total)) {
      newErrors.total = "Valid Total is required";
    }
    if (
      !formData.remarksByAccounts ||
      formData.remarksByAccounts.trim() === ""
    ) {
      newErrors.remarksByAccounts = "Remarks are required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const submissionData = {
        ...formData,
        dispatchDate: new Date(formData.dispatchDate).toISOString(),
        invoiceDate: formData.invoiceDate
          ? new Date(formData.invoiceDate).toISOString()
          : undefined,
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
          Loading Accounts Orders...
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
            Accounts Dashboard
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
              No accounts orders available at this time.
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
                      "GST",
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
                  {orders.map((order, index) => (
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
                        {order.email || "N/A"}
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
                        {order.mobile || "N/A"}
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
                        {order.gst || "N/A"}
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
                          <Button
                            variant="secondary"
                            onClick={() => handleEdit(order)}
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "22px",
                              padding: "0",
                              background:
                                "linear-gradient(135deg, #6c757d, #5a6268)",
                              border: "none",
                            }}
                            aria-label="Edit order"
                          >
                            <svg height="1em" viewBox="0 0 512 512" fill="#fff">
                              <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z" />
                            </svg>
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => handleDelete(order._id)}
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "22px",
                              padding: "0",
                            }}
                            aria-label="Delete order"
                          >
                            <FaTrash style={{ marginBottom: "3px" }} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
                    <strong>Email:</strong> {viewOrder.email || "N/A"}
                  </span>
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>Mobile:</strong> {viewOrder.mobile || "N/A"}
                  </span>
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>Total:</strong> {viewOrder.total || "N/A"}
                  </span>
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>GST:</strong> {viewOrder.gst || "N/A"}
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
                    {viewOrder.invoiceNumber || "N/A"}
                  </span>
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>Invoice Date:</strong>{" "}
                    {viewOrder.invoiceDate
                      ? new Date(viewOrder.invoiceDate).toLocaleDateString()
                      : "N/A"}
                  </span>
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
            Edit Accounts Order
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
                Date <span style={{ color: "red" }}>*</span>
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
                Party & Address <span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.partyAndAddress}
                onChange={(e) =>
                  setFormData({ ...formData, partyAndAddress: e.target.value })
                }
                placeholder="Enter party and address"
                style={{
                  borderRadius: "10px",
                  border: errors.partyAndAddress
                    ? "1px solid red"
                    : "1px solid #ced4da",
                  padding: "12px",
                  fontSize: "1rem",
                }}
                required
              />
              {errors.partyAndAddress && (
                <Form.Text style={{ color: "red", fontSize: "0.875rem" }}>
                  {errors.partyAndAddress}
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group style={{ marginBottom: "20px" }}>
              <Form.Label style={{ fontWeight: "600", color: "#333" }}>
                Email
              </Form.Label>
              <Form.Control
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter email"
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
                Mobile
              </Form.Label>
              <Form.Control
                type="text"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({ ...formData, mobile: e.target.value })
                }
                placeholder="Enter mobile number"
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
                Total <span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Form.Control
                type="number"
                value={formData.total}
                onChange={(e) =>
                  setFormData({ ...formData, total: e.target.value })
                }
                placeholder="Enter total amount"
                style={{
                  borderRadius: "10px",
                  border: errors.total ? "1px solid red" : "1px solid #ced4da",
                  padding: "12px",
                  fontSize: "1rem",
                }}
                required
              />
              {errors.total && (
                <Form.Text style={{ color: "red", fontSize: "0.875rem" }}>
                  {errors.total}
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group style={{ marginBottom: "20px" }}>
              <Form.Label style={{ fontWeight: "600", color: "#333" }}>
                GST
              </Form.Label>
              <Form.Control
                type="text"
                value={formData.gst}
                onChange={(e) =>
                  setFormData({ ...formData, gst: e.target.value })
                }
                placeholder="Enter GST"
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
                Payment Received
              </Form.Label>
              <Form.Select
                value={formData.paymentReceived}
                onChange={(e) =>
                  setFormData({ ...formData, paymentReceived: e.target.value })
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

            <Form.Group style={{ marginBottom: "20px" }}>
              <Form.Label style={{ fontWeight: "600", color: "#333" }}>
                Invoice Number
              </Form.Label>
              <Form.Control
                type="text"
                value={formData.invoiceNumber}
                onChange={(e) =>
                  setFormData({ ...formData, invoiceNumber: e.target.value })
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
