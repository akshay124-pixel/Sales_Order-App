import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Button, Modal, Form, Spinner } from "react-bootstrap";
import { FaEye } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { Badge } from "react-bootstrap";

const Production = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [formData, setFormData] = useState({
    fulfillingStatus: "Pending",
    remarksByProduction: "",
    modelNo: "", // Added to match form fields
    serialno: "", // Added to match form fields
  });
  const [errors, setErrors] = useState({}); // Added for validation
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        "http://localhost:5000/api/production-orders",
        {
          headers: {
            role: localStorage.getItem("role"),
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch production orders. Please check your network or server.";
      setError(errorMessage);
      toast.error(errorMessage, { position: "top-right", autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (order) => {
    setEditOrder(order);
    setFormData({
      fulfillingStatus: order.fulfillingStatus || "Pending",
      remarksByProduction: order.remarksByProduction || "",
      modelNo: order.modelNo || "",
      serialno: order.serialno || "",
    });
    setErrors({}); // Reset errors when opening modal
    setShowEditModal(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (
      !formData.remarksByProduction ||
      formData.remarksByProduction.trim() === ""
    ) {
      newErrors.remarksByProduction = "Remarks by Production is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // True if no errors
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; // Stop if validation fails

    try {
      const response = await axios.put(
        `http://localhost:5000/api/edit/${editOrder._id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (response.data.success) {
        setOrders(
          orders.map((order) =>
            order._id === editOrder._id ? response.data.data : order
          )
        );
        setShowEditModal(false);
        toast.success("Order updated successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
        await fetchOrders(); // Re-fetch to ensure consistency
      } else {
        throw new Error(response.data.message || "Failed to update order");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update order.", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  const handleView = (order) => {
    setViewOrder(order);
    setShowViewModal(true);
    setCopied(false);
  };

  const handleCopy = useCallback(() => {
    if (!viewOrder) return;

    const textToCopy = `
    Model No: ${viewOrder.modelNo || "N/A"}
    Serial No: ${viewOrder.serialno || "N/A"}
    Order ID: ${viewOrder.orderId || "N/A"}
    Product Type: ${viewOrder.productType || "N/A"}
    Size: ${viewOrder.size || "N/A"}
    Spec: ${viewOrder.spec || "N/A"}
    Product Details: ${viewOrder.productDetails || "N/A"}
    Quantity: ${viewOrder.qty || "N/A"}
    Fulfilling Status: ${viewOrder.fulfillingStatus || "Pending"}
    Remarks by Production: ${viewOrder.remarksByProduction || "N/A"}
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
  }, [viewOrder]);

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
            Production Team Dashboard
          </h1>
        </header>

        <div style={{ padding: "20px" }}>
          {error && (
            <div
              style={{
                background: "linear-gradient(135deg, #ff6b6b, #ff8787)",
                color: "#fff",
                padding: "15px",
                borderRadius: "10px",
                marginBottom: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
              }}
            >
              <span>
                <strong>Error:</strong> {error}
              </span>
              <Button
                onClick={fetchOrders}
                style={{
                  background: "transparent",
                  border: "1px solid #fff",
                  color: "#fff",
                  padding: "5px 15px",
                  borderRadius: "20px",
                  fontWeight: "500",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#ffffff30")}
                onMouseLeave={(e) =>
                  (e.target.style.background = "transparent")
                }
              >
                Retry
              </Button>
            </div>
          )}

          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "50px 0",
                background: "#fff",
                borderRadius: "10px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Spinner
                animation="border"
                style={{
                  color: "#2575fc",
                  width: "40px",
                  height: "40px",
                }}
              />
              <p
                style={{
                  marginTop: "10px",
                  color: "#333",
                  fontSize: "1.1rem",
                  fontWeight: "500",
                }}
              >
                Loading orders...
              </p>
            </div>
          ) : orders.length === 0 ? (
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
              No approved orders available for production.
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
                  marginBottom: "0",
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
                      "Order ID",
                      "Serial No",
                      "Model No",
                      "Product Type",
                      "Size",
                      "Spec",
                      "Product Details",
                      "Production Status",
                      "Quantity",
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
                      <td style={{ padding: "15px", textAlign: "center" }}>
                        {order.orderId}
                      </td>
                      <td style={{ padding: "15px", textAlign: "center" }}>
                        {order.serialno}
                      </td>
                      <td style={{ padding: "15px", textAlign: "center" }}>
                        {order.modelNo || "N/A"}
                      </td>
                      <td style={{ padding: "15px", textAlign: "center" }}>
                        {order.productType || "N/A"}
                      </td>
                      <td style={{ padding: "15px", textAlign: "center" }}>
                        {order.size || "N/A"}
                      </td>
                      <td style={{ padding: "15px", textAlign: "center" }}>
                        {order.spec || "N/A"}
                      </td>
                      <td style={{ padding: "15px", textAlign: "center" }}>
                        {order.productDetails || "N/A"}
                      </td>
                      <td style={{ padding: "15px", textAlign: "center" }}>
                        <Badge
                          style={{
                            background:
                              order.fulfillingStatus === "Under Process"
                                ? "linear-gradient(135deg, #f39c12, #f7c200)"
                                : order.fulfillingStatus === "Pending"
                                ? "linear-gradient(135deg, #ff6b6b, #ff8787)"
                                : order.fulfillingStatus === "Fulfilled"
                                ? "linear-gradient(135deg, #28a745, #4cd964)"
                                : "linear-gradient(135deg, #6c757d, #a9a9a9)",
                            color: "#fff",
                            padding: "5px 10px",
                            borderRadius: "12px",
                            fontWeight: "500",
                          }}
                        >
                          {order.fulfillingStatus || "Pending"}
                        </Badge>
                      </td>
                      <td style={{ padding: "15px", textAlign: "center" }}>
                        {order.qty}
                      </td>
                      <td style={{ padding: "15px", textAlign: "center" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            justifyContent: "center",
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

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
              Edit Production Order
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
                <Form.Label
                  style={{
                    fontWeight: "600",
                    color: "#333",
                    marginBottom: "8px",
                  }}
                >
                  Production Status
                </Form.Label>
                <Form.Select
                  value={formData.fulfillingStatus}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fulfillingStatus: e.target.value,
                    })
                  }
                  style={{
                    borderRadius: "10px",
                    border: "1px solid #ced4da",
                    padding: "12px",
                    fontSize: "1rem",
                    transition: "all 0.3s ease",
                  }}
                  onFocus={(e) =>
                    (e.target.style.boxShadow =
                      "0 0 10px rgba(37, 117, 252, 0.5)")
                  }
                  onBlur={(e) => (e.target.style.boxShadow = "none")}
                >
                  <option value="Under Process">Under Process</option>
                  <option value="Pending">Pending</option>
                  <option value="Fulfilled">Completed</option>
                </Form.Select>
              </Form.Group>
              <Form.Group style={{ marginBottom: "20px" }} controlId="modelNo">
                <Form.Label
                  style={{
                    fontWeight: "600",
                    color: "#333",
                    marginBottom: "8px",
                  }}
                >
                  Model No
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.modelNo || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      modelNo: e.target.value,
                    })
                  }
                  placeholder="Enter model number"
                  style={{
                    borderRadius: "10px",
                    border: "1px solid #ced4da",
                    padding: "12px",
                    fontSize: "1rem",
                    transition: "all 0.3s ease",
                  }}
                  onFocus={(e) =>
                    (e.target.style.boxShadow =
                      "0 0 10px rgba(37, 117, 252, 0.5)")
                  }
                  onBlur={(e) => (e.target.style.boxShadow = "none")}
                />
              </Form.Group>
              <Form.Group style={{ marginBottom: "20px" }} controlId="serialno">
                <Form.Label
                  style={{
                    fontWeight: "600",
                    color: "#333",
                    marginBottom: "8px",
                  }}
                >
                  Serial Number
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.serialno || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      serialno: e.target.value,
                    })
                  }
                  placeholder="Enter serial number"
                  style={{
                    borderRadius: "10px",
                    border: "1px solid #ced4da",
                    padding: "12px",
                    fontSize: "1rem",
                    transition: "all 0.3s ease",
                  }}
                  onFocus={(e) =>
                    (e.target.style.boxShadow =
                      "0 0 10px rgba(37, 117, 252, 0.5)")
                  }
                  onBlur={(e) => (e.target.style.boxShadow = "none")}
                />
              </Form.Group>
              <Form.Group style={{ marginBottom: "20px" }}>
                <Form.Label
                  style={{
                    fontWeight: "600",
                    color: "#333",
                    marginBottom: "8px",
                  }}
                >
                  Remarks by Production <span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.remarksByProduction || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      remarksByProduction: e.target.value,
                    })
                  }
                  placeholder="Enter production remarks"
                  style={{
                    borderRadius: "10px",
                    border: errors.remarksByProduction
                      ? "1px solid red"
                      : "1px solid #ced4da",
                    padding: "12px",
                    fontSize: "1rem",
                    transition: "all 0.3s ease",
                  }}
                  onFocus={(e) =>
                    (e.target.style.boxShadow =
                      "0 0 10px rgba(37, 117, 252, 0.5)")
                  }
                  onBlur={(e) => (e.target.style.boxShadow = "none")}
                  required
                />
                {errors.remarksByProduction && (
                  <Form.Text style={{ color: "red", fontSize: "0.875rem" }}>
                    {errors.remarksByProduction}
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
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.transform = "translateY(-2px)")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.transform = "translateY(0)")
                  }
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
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.transform = "translateY(-2px)")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.transform = "translateY(0)")
                  }
                >
                  Save Changes
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

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
              <span style={{ marginRight: "10px", fontSize: "1.5rem" }}>
                📋
              </span>
              Production Order Details
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
                    Product Info
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "15px",
                    }}
                  >
                    <span style={{ fontSize: "1rem", color: "#555" }}>
                      <strong>Model No:</strong> {viewOrder.modelNo || ""}
                    </span>
                    <span style={{ fontSize: "1rem", color: "#555" }}>
                      <strong>Serial No:</strong> {viewOrder.serialno || ""}
                    </span>
                    <span style={{ fontSize: "1rem", color: "#555" }}>
                      <strong>Order ID:</strong> {viewOrder.orderId || ""}
                    </span>
                    <span style={{ fontSize: "1rem", color: "#555" }}>
                      <strong>Product Type:</strong>{" "}
                      {viewOrder.productType || ""}
                    </span>
                    <span style={{ fontSize: "1rem", color: "#555" }}>
                      <strong>Size:</strong> {viewOrder.size || ""}
                    </span>
                    <span style={{ fontSize: "1rem", color: "#555" }}>
                      <strong>Spec:</strong> {viewOrder.spec || ""}
                    </span>
                    <span style={{ fontSize: "1rem", color: "#555" }}>
                      <strong>Details:</strong> {viewOrder.productDetails || ""}
                    </span>
                    <span style={{ fontSize: "1rem", color: "#555" }}>
                      <strong>Qty:</strong> {viewOrder.qty || ""}
                    </span>
                  </div>
                </div>
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
                    Production Info
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "15px",
                    }}
                  >
                    <span style={{ fontSize: "1rem", color: "#555" }}>
                      <strong>Fulfilling Status:</strong>{" "}
                      {viewOrder.fulfillingStatus || "Pending"}
                    </span>
                    <span style={{ fontSize: "1rem", color: "#555" }}>
                      <strong>Remarks:</strong>{" "}
                      {viewOrder.remarksByProduction || "N/A"}
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
      </div>
      <footer className="footer-container">
        <p style={{ marginTop: "10px", color: "white", height: "20px" }}>
          © 2025 DataManagement. All rights reserved.
        </p>
      </footer>
    </>
  );
};

export default Production;
