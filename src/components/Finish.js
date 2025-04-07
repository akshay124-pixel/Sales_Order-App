import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Modal, Badge } from "react-bootstrap"; // Added Badge import
import { FaEye } from "react-icons/fa";
import { toast } from "react-toastify";
import OutFinishedGoodModal from "./OutFinishedGoodModal";

function Finish() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    const fetchFinishedGoods = async () => {
      try {
        const response = await axios.get(
          "https://sales-order-server.onrender.com/api/finished-goods",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (response.data.success) {
          setOrders(response.data.data); // Includes "Partial Dispatch" and "Complete" orders, excludes "Dispatched"
        } else {
          throw new Error(
            response.data.message || "Failed to fetch finished goods data"
          );
        }
      } catch (error) {
        console.error("Error fetching finished goods:", error);
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to fetch finished goods",
          {
            position: "top-right",
            autoClose: 5000,
          }
        );
      } finally {
        setLoading(false);
      }
    };
    fetchFinishedGoods();
  }, []);

  const handleEditClick = (order) => {
    setEditData({
      dispatchFrom: order.dispatchFrom || "",
      transporter: order.transporter || "",
      billNumber: order.billNumber || "",
      transporterDetails: order.transporterDetails || "",
      dispatchDate: order.fulfillmentDate
        ? new Date(order.fulfillmentDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      docketNo: order.docketNo || "",
      receiptDate: order.receiptDate || "",
      _id: order._id,
    });
    setIsModalOpen(true);
  };

  const handleModalSubmit = (updatedEntry) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === updatedEntry._id ? updatedEntry : order
      )
    );
    setIsModalOpen(false);
    toast.success("Order updated successfully!", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const handleView = (order) => {
    setViewOrder(order);
    setShowViewModal(true);
    setCopied(false);
  };

  const handleCopy = () => {
    if (!viewOrder) return;
    const orderText = `
      Order ID: ${viewOrder.orderId || "N/A"}
      Serial No: ${viewOrder.serialno || "N/A"}
      Model No: ${viewOrder.modelNo || "N/A"}
        Bill No: ${viewOrder.billNumber || "N/A"}
      Product: ${viewOrder.productDetails || "N/A"}
      Quantity: ${viewOrder.qty || "N/A"}
      Fulfillment Date: ${
        viewOrder.fulfillmentDate
          ? new Date(viewOrder.fulfillmentDate).toLocaleDateString()
          : "N/A"
      }
      Customer: ${viewOrder.name || viewOrder.partyAndAddress || "N/A"}
      Address: ${
        viewOrder.shippingAddress ||
        `${viewOrder.city || ""}, ${viewOrder.state || ""}` ||
        "N/A"
      }
      Status: ${
        viewOrder.fulfillingStatus === "Partial Dispatch"
          ? "Partial Dispatch"
          : "Complete"
      }
    `.trim();
    navigator.clipboard.writeText(orderText);
    setCopied(true);
    toast.success("Details copied to clipboard!", {
      position: "top-right",
      autoClose: 2000,
    });
    setTimeout(() => setCopied(false), 2000);
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
        <div
          style={{
            width: "50px",
            height: "50px",
            border: "5px solid #2575fc",
            borderTop: "5px solid transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
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
          Loading Finished Goods...
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
            Finished Goods Dashboard
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
              No finished goods available at this time.
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
                      "Order ID",
                      "Product Name",
                      "Quantity",
                      "Production Date",
                      "Customer Name",
                      "Delivery Address",
                      "Status",
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
                        {order.orderId || "N/A"}
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
                        {order.productDetails || "N/A"}
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
                        {order.qty || "N/A"}
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
                        {order.fulfillmentDate
                          ? new Date(order.fulfillmentDate).toLocaleDateString()
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
                        {order.name || "N/A"}
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
                        {order.shippingAddress || "N/A"}
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
                              order.fulfillingStatus === "Partial Dispatch"
                                ? "linear-gradient(135deg, #00c6ff, #0072ff)"
                                : "linear-gradient(135deg, #28a745, #4cd964)",
                            color: "#fff",
                            padding: "5px 10px",
                            borderRadius: "12px",
                          }}
                        >
                          {order.fulfillingStatus === "Partial Dispatch"
                            ? "Partial Dispatch"
                            : "Complete"}
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
                          >
                            <FaEye style={{ marginBottom: "3px" }} />
                          </Button>
                          <button
                            className="editBtn"
                            onClick={() => handleEditClick(order)}
                            style={{
                              minWidth: "40px",
                              width: "40px",
                              height: "40px",
                              padding: "0",
                              border: "none",
                              background:
                                "linear-gradient(135deg, #6c757d, #5a6268)",
                              borderRadius: "22px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <svg height="1em" viewBox="0 0 512 512" fill="#fff">
                              <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z" />
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
      </div>

      <footer className="footer-container">
        <p style={{ marginTop: "10px", color: "white", height: "20px" }}>
          © 2025 DataManagement. All rights reserved.
        </p>
      </footer>

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
            Order Details
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
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "15px",
                  }}
                >
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>Order ID:</strong> {viewOrder.orderId || "N/A"}
                  </span>
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>Serial No:</strong> {viewOrder.serialno || "N/A"}
                  </span>
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>Model No:</strong> {viewOrder.modelNo || "N/A"}
                  </span>
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>Product:</strong>{" "}
                    {viewOrder.productDetails || "N/A"}
                  </span>
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>Quantity:</strong> {viewOrder.qty || "N/A"}
                  </span>
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>Production Date:</strong>{" "}
                    {viewOrder.fulfillmentDate
                      ? new Date(viewOrder.fulfillmentDate).toLocaleDateString()
                      : "N/A"}
                  </span>
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>Customer:</strong> {viewOrder.name || "N/A"}
                  </span>
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>Address:</strong>{" "}
                    {viewOrder.shippingAddress || "N/A"}
                  </span>
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>Status:</strong>{" "}
                    {viewOrder.fulfillingStatus === "Partial Dispatch"
                      ? "Partial Dispatch"
                      : "Complete"}
                  </span>
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>Remarks By Production:</strong>{" "}
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

      <OutFinishedGoodModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editData}
        entryToEdit={editData}
      />
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

export default Finish;
