import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { Button, Modal, Badge, Form, Spinner } from "react-bootstrap";
import { FaEye, FaTimes, FaDownload } from "react-icons/fa";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import "../App.css";
import io from "socket.io-client";
import InstallationEditModal from "./InstallationEditModal";
import InstallationRow from "./InstallationRow";
import debounce from "lodash/debounce";

function Installation() {
  const [orders, setOrders] = useState([]);
  // Optimization: specific state for input vs filtering
  const [localSearch, setLocalSearch] = useState("");
  // const [filteredOrders, setFilteredOrders] = useState([]); // Removed: derived via useMemo
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [mailingInProgress, setMailingInProgress] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [salesPersonFilter, setSalesPersonFilter] = useState("All");
  const [InstallationFilter, setInstallationFilter] = useState("All");
  const [orderTypeFilter, setOrderTypeFilter] = useState("");
  const fetchInstallationOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_URL}/api/installation-orders`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.success) {
        const filteredData = response.data.data.filter(
          (doc) =>
            doc.dispatchStatus === "Delivered" &&
            doc.installchargesstatus !== "Not in Scope" &&
            doc.installationReport !== "Yes"
        );

        setOrders(filteredData);
      }
      else {
        throw new Error(
          response.data.message || "Could not load installation orders"
        );
      }
    } catch (error) {
      console.error("Error fetching installation orders:", error);

      // Non-technical, user-friendly message
      let friendlyMessage = "Sorry! We couldn't load your installation orders.";
      if (error.code === "ECONNABORTED" || !navigator.onLine) {
        friendlyMessage =
          "Please check your internet connection and try again.";
      } else if (error.response?.status >= 500) {
        friendlyMessage = "Server is currently unavailable. Please try later.";
      } else if (error.response?.status === 404) {
        friendlyMessage = "No installation orders found.";
      }

      setError(friendlyMessage);
      toast.error(friendlyMessage, { position: "top-right", autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchInstallationOrders().then(() => {
      if (!isMounted) setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [fetchInstallationOrders]);

  // Real-time updates via Socket.IO
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("role");
    const baseOrigin = (() => {
      try {
        const url = new URL(
          process.env.REACT_APP_URL || window.location.origin
        );
        return `${url.protocol}//${url.host}`;
      } catch (_) {
        return window.location.origin;
      }
    })();

    const socket = io(baseOrigin, {
      path: "/sales/socket.io",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true,
    });

    const meetsInstallation = (doc) =>
      doc?.dispatchStatus === "Delivered" &&
      doc?.installchargesstatus !== "Not in Scope" &&
      doc?.installationReport !== "Yes"; // FIX: Only hide if Installation Report is Yes

    socket.on("connect", () => {
      socket.emit("join", { userId, role: userRole });
    });

    socket.on("orderUpdate", ({ operationType, fullDocument, documentId }) => {
      // Normalize createdBy when backend sends only an id (change stream)
      try {
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const currentUserId = String(localStorage.getItem("userId") || "");
        if (
          fullDocument &&
          fullDocument.createdBy &&
          typeof fullDocument.createdBy !== "object" &&
          String(fullDocument.createdBy) === currentUserId
        ) {
          fullDocument = {
            ...fullDocument,
            createdBy: { _id: currentUserId, username: currentUser.username || currentUser.name || "You" },
          };
        }
      } catch (e) {
        // ignore
      }

      setOrders((prev) => {
        const id = String(documentId || fullDocument?._id || "");
        if (!id) return prev;
        const include = fullDocument && meetsInstallation(fullDocument);
        if (operationType === "delete" || !include) {
          return prev.filter((o) => String(o._id) !== id);
        }
        const idx = prev.findIndex((o) => String(o._id) === id);
        if (idx === -1) return [fullDocument, ...prev];
        const next = prev.slice();
        next[idx] = fullDocument;
        return next;
      });
    });

    return () => {
      socket.off("connect");
      socket.off("orderUpdate");
      socket.disconnect();
    };
  }, []);



  // Optimization: Debounced search updater
  const updateSearchQuery = useMemo(
    () => debounce((val) => setSearchQuery(val), 300),
    []
  );

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setLocalSearch(val);
    updateSearchQuery(val);
  };

  const uniqueSalesPersons = useMemo(() => [
    "All",
    ...new Set(orders.map((order) => order.salesPerson).filter(Boolean)),
  ], [orders]);

  // Optimization: Pre-calculate sorting and searching fields
  const processedOrders = useMemo(() => {
    return orders.map((order) => {
      const soDateTs = order.soDate ? new Date(order.soDate).getTime() : 0;
      // Pre-build search string for faster filtering
      const searchStr = [
        order.orderId || "",
        order.name || "",
        order.contactNo || "",
        order.shippingAddress || "",
        order.installation || "",
        order.installationStatus || "",
        Array.isArray(order.products)
          ? order.products
            .map(
              (p) =>
                `${p.productType || ""} ${p.qty || ""} ${p.size || ""} ${p.spec || ""
                } ${p.serialNos?.join("") || ""} ${p.modelNos?.join("") || ""}`
            )
            .join(" ")
          : "",
      ]
        .join(" ")
        .toLowerCase();

      return {
        ...order,
        _soDateTs: soDateTs,
        _searchStr: searchStr,
        _normalizedInstallation: String(order.installation || "")
          .trim()
          .toLowerCase(),
      };
    });
  }, [orders]);

  // Optimization: Filter logic via useMemo using processed orders
  const filteredOrders = useMemo(() => {
    let filtered = processedOrders;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((order) => order._searchStr.includes(query));
    }
    if (statusFilter !== "All") {
      filtered = filtered.filter(
        (order) => order.installationStatus === statusFilter
      );
    }
    if (orderTypeFilter) {
      filtered = filtered.filter(
        (order) => order.orderType === orderTypeFilter
      );
    }

    if (InstallationFilter !== "All") {
      filtered = filtered.filter((order) => {
        if (InstallationFilter === "Not Available") {
          const installation = order._normalizedInstallation;
          return (
            !installation ||
            installation === "0" ||
            installation === "n/a" ||
            installation === "null" ||
            installation === ""
          );
        }
        return order.installchargesstatus === InstallationFilter;
      });
    }

    if (salesPersonFilter !== "All") {
      filtered = filtered.filter(
        (order) => order.salesPerson === salesPersonFilter
      );
    }
    if (startDate) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.dispatchDate);
        return orderDate >= new Date(startDate);
      });
    }
    if (endDate) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.dispatchDate);
        return orderDate <= new Date(endDate);
      });
    }
    return filtered;
  }, [
    processedOrders,
    searchQuery,
    statusFilter,
    orderTypeFilter,
    InstallationFilter,
    salesPersonFilter,
    startDate,
    endDate,
  ]);

  // Optimization: Separate sorting from filtering and rendering
  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      // Use pre-calculated timestamps
      if (a._soDateTs === b._soDateTs) {
        return (b._id || "").localeCompare(a._id || "");
      }
      return b._soDateTs - a._soDateTs;
    });
  }, [filteredOrders]);

  /* 
  // Removed old useEffect for filtering
  useEffect(() => { ... }, [...]); 
  */

  const isDispatchOverdue = useCallback((dispatchDate) => {
    if (!dispatchDate) return false;
    const dispatch = new Date(dispatchDate);
    const now = new Date();
    const diffInDays = (now - dispatch) / (1000 * 60 * 60 * 24);
    return diffInDays >= 15;
  }, []);

  // Calculate total pending orders (billStatus === "Pending")
  const totalPending = useMemo(() => filteredOrders.filter(
    (order) => order.installationStatus === "Pending"
  ).length, [filteredOrders]);

  // Get unique statuses for filter dropdown
  const uniqueStatuses = useMemo(() => [
    "All",
    "Pending",
    "In Progress",
    "Completed",
    ...new Set(
      orders
        .map((order) => order.installationStatus || "Pending")
        .filter(
          (status) => !["Pending", "In Progress", "Completed"].includes(status)
        )
    ),
  ], [orders]);

  const handleOrderUpdate = useCallback((updatedOrder) => {
    setOrders((prevOrders) => {
      // Agar Installation Report = Yes ho gaya, turant list se hata do
      if (updatedOrder.installationReport === "Yes") {
        return prevOrders.filter((o) => o._id !== updatedOrder._id);
      }

      // Warna normal update
      return prevOrders.map((o) =>
        o._id === updatedOrder._id ? updatedOrder : o
      );
    });
  }, []);


  const handleView = useCallback((order) => {
    setViewOrder(order);
    setShowViewModal(true);
    setCopied(false);
  }, []);

  const handleDownload = async (filePath) => {
    if (!filePath || typeof filePath !== "string") {
      toast.error("Invalid file path!");
      return;
    }

    try {
      const fileUrl = `${process.env.REACT_APP_URL}${filePath.startsWith("/") ? "" : "/"
        }${filePath}`;

      const response = await fetch(fileUrl, {
        method: "GET",
        headers: {
          Accept:
            "application/pdf,image/png,image/jpeg,image/jpg,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch file");
      }

      const blob = await response.blob();
      const contentType = response.headers.get("content-type") || "application/octet-stream";
      const extension = contentType.split("/")[1] || "file";
      const fileName = filePath.split("/").pop() || `download.${extension}`;

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);

      toast.success("Download started!");
    } catch (err) {
      console.error(err);
      toast.error("Download failed. Check server.");
    }
  };

  const uniqueOrderTypes = [
    "",
    ...new Set(orders.map((order) => order.orderType || "N/A")),
  ];
  const handleCopy = useCallback(() => {
    if (!viewOrder) return;
    const productsText = Array.isArray(viewOrder.products)
      ? viewOrder.products
        .map(
          (p, i) =>
            `Product ${i + 1}: ${p.productType || "N/A"} (Qty: ${p.qty || "N/A"
            }, Size: ${p.size || "N/A"}, Spec: ${p.spec || "N/A"
            }, Serial Nos: ${p.serialNos?.join(", ") || "N/A"}, Model Nos: ${p.modelNos?.join(", ") || "N/A"
            })`
        )
        .join("\n")
      : "N/A";
    const orderText = `
      Order ID: ${viewOrder.orderId || "N/A"}
      Contact Person: ${viewOrder.name || "N/A"}
      Contact No: ${viewOrder.contactNo || "N/A"}
      Shipping Address: ${viewOrder.shippingAddress || "N/A"}
      Charges Status: ${viewOrder.installchargesstatus || "N/A"}
      Installation Status: ${viewOrder.installationStatus || "Pending"}
     
      Remarks: ${viewOrder.remarksByInstallation || "N/A"}
      Products:\n${productsText}
    `.trim();
    navigator.clipboard
      .writeText(orderText)
      .then(() => {
        setCopied(true);
        toast.success("Details copied to clipboard!", {
          position: "top-right",
          autoClose: 2000,
        });
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        toast.error("Failed to copy details!");
        console.error("Copy error:", err);
      });
  }, [viewOrder]);

  const handleEdit = useCallback((order) => {
    setEditOrder(order);
    setShowEditModal(true);
  }, []);

  const handleSendMail = useCallback(async (order) => {
    setMailingInProgress(order._id);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_URL}/api/send-completion-mail`,
        { orderId: order._id },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        toast.success(`Mail sent for Order #${order.orderId || order._id}`);
      } else {
        toast.error(response.data.message || "Failed to send mail");
      }
    } catch (error) {
      console.error("Mail Error:", error);
      toast.error("Error sending mail");
    } finally {
      setMailingInProgress("");
    }
  }, []);
  const handleClearFilters = () => {
    setLocalSearch(""); // Clear local input
    updateSearchQuery(""); // Clear debounce immediately
    setOrderTypeFilter("");
    setOrderTypeFilter("");
    setStatusFilter("All");
    setSalesPersonFilter("All");
    setInstallationFilter("All");
    setStartDate("");
    setEndDate("");
  };

  const exportToExcel = () => {
    const exportData = filteredOrders.map((order) => {
      const productDetails = Array.isArray(order.products)
        ? order.products
          .map((p) => `${p.productType || "N/A"} (${p.qty || "N/A"})`)
          .join(", ")
        : "N/A";

      // 👇 Calculate total quantity from products array
      const totalProductQty = Array.isArray(order.products)
        ? order.products.reduce((sum, p) => sum + (Number(p.qty) || 0), 0)
        : 0;

      return {
        "Order ID": order.orderId || "N/A",
        "Order Type": order.orderType || "N/A",
        "Product Details": productDetails,
        "Total Quantity": totalProductQty,
        "Contact Person": order.name || "N/A",
        "Contact No": order.contactNo || "N/A",
        "Shipping Address": order.shippingAddress || "N/A",
        "Charges Status": order.installchargesstatus || "N/A",
        Charges: order.installation || "N/A",
        "Installation Status": order.installationStatus || "Pending",
        "Sales Person": order.salesPerson || "N/A",
        City: order.city || "N/A",
        State: order.state || "N/A",
        deliveredDate: order.deliveredDate
          ? new Date(order.deliveredDate).toLocaleDateString("en-GB")
          : "N/A",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Installation Orders");
    XLSX.writeFile(
      workbook,
      `Installation_Orders_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // Optimization: Memoize the table to prevent re-renders on typing
  const tableContent = useMemo(() => (
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
              "SO Date",
              "Dispatch Date",
              "Product Details",
              "Contact Person",
              "Contact No",
              "Shipping Address",
              "Charges Status",
              "Installation Status",
              "Sales Person",
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
          {sortedOrders.map((order, index) => (
            <InstallationRow
              key={order._id}
              order={order}
              index={index}
              isDispatchOverdue={isDispatchOverdue}
              handleView={handleView}
              handleEdit={handleEdit}
              handleSendMail={handleSendMail}
              mailingInProgress={mailingInProgress}
            />
          ))}
        </tbody>
      </table>
    </div>
  ), [sortedOrders, isDispatchOverdue, handleView, handleEdit]);

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
          Loading Installation Orders...
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
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
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
            Installation Dashboard
          </h1>
        </header>{" "}
        <div
          style={{

            padding: "15px",
            borderRadius: "15px",

            marginBottom: "20px",
            marginTop: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              alignItems: "flex-end",
            }}
          >
            {/* Search Filter */}
            <div style={{ flex: "1 1 200px" }}>
              <label
                style={{
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  color: "#495057",
                  marginBottom: "4px",
                  marginLeft: "10px",
                  display: "block",
                }}
              >
                Search Orders
              </label>
              <div style={{ position: "relative" }}>
                <Form.Control
                  type="text"
                  placeholder="Order ID, Name, etc."
                  value={localSearch}
                  onChange={handleSearchChange}
                  style={{
                    borderRadius: "15px",
                    padding: "5px 30px 5px 10px",
                    border: "1px solid #ced4da",
                    fontSize: "0.9rem",
                    height: "38px",
                  }}
                />
                {searchQuery && (
                  <FaTimes
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      color: "#adb5bd",
                    }}
                    onClick={() => handleSearchChange({ target: { value: "" } })}
                  />
                )}
              </div>
            </div>

            {/* Start Date */}
            <div style={{ flex: "0 1 140px" }}>
              <label
                style={{
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  color: "#495057",
                  marginBottom: "4px",
                  display: "block",
                }}
              >
                Start Date
              </label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  borderRadius: "15px",
                  padding: "5px 10px",
                  border: "1px solid #ced4da",
                  fontSize: "0.9rem",
                  height: "38px",
                }}
              />
            </div>

            {/* End Date */}
            <div style={{ flex: "0 1 140px" }}>
              <label
                style={{
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  color: "#495057",
                  marginBottom: "4px",
                  display: "block",
                }}
              >
                End Date
              </label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  borderRadius: "15px",
                  padding: "5px 10px",
                  border: "1px solid #ced4da",
                  fontSize: "0.9rem",
                  height: "38px",
                }}
              />
            </div>

            {/* Status Filter */}
            <div style={{ flex: "0 1 160px" }}>
              <label
                style={{
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  color: "#495057",
                  marginBottom: "4px",
                  display: "block",
                }}
              >
                Status
              </label>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  borderRadius: "15px",
                  padding: "5px 10px",
                  border: "1px solid #ced4da",
                  fontSize: "0.9rem",
                  height: "38px",
                  cursor: "pointer",
                }}
              >
                {uniqueStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Form.Select>
            </div>

            {/* Charges Filter */}
            <div style={{ flex: "0 1 140px" }}>
              <label
                style={{
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  color: "#495057",
                  marginBottom: "4px",
                  display: "block",
                }}
              >
                Charges
              </label>
              <Form.Select
                value={InstallationFilter}
                onChange={(e) => setInstallationFilter(e.target.value)}
                style={{
                  borderRadius: "15px",
                  padding: "5px 10px",
                  border: "1px solid #ced4da",
                  fontSize: "0.9rem",
                  height: "38px",
                  cursor: "pointer",
                }}
              >
                <option>All</option>
                <option>To Pay</option>
                <option>Including</option>
                <option>Extra</option>
                <option>Not Available</option>
              </Form.Select>
            </div>

            {/* Order Type Filter */}
            <div style={{ flex: "0 1 140px" }}>
              <label
                style={{
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  color: "#495057",
                  marginBottom: "4px",
                  display: "block",
                }}
              >
                Order Type
              </label>
              <Form.Select
                value={orderTypeFilter}
                onChange={(e) => setOrderTypeFilter(e.target.value)}
                style={{
                  borderRadius: "15px",
                  padding: "5px 10px",
                  border: "1px solid #ced4da",
                  fontSize: "0.9rem",
                  height: "38px",
                  cursor: "pointer",
                }}
              >
                {uniqueOrderTypes.map((orderType) => (
                  <option key={orderType} value={orderType}>
                    {orderType || "All"}
                  </option>
                ))}
              </Form.Select>
            </div>

            {/* Sales Person Filter */}
            <div style={{ flex: "0 1 160px" }}>
              <label
                style={{
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  color: "#495057",
                  marginBottom: "4px",
                  display: "block",
                }}
              >
                Sales Person
              </label>
              <Form.Select
                value={salesPersonFilter}
                onChange={(e) => setSalesPersonFilter(e.target.value)}
                style={{
                  borderRadius: "15px",
                  padding: "5px 10px",
                  border: "1px solid #ced4da",
                  fontSize: "0.9rem",
                  height: "38px",
                  cursor: "pointer",
                }}
              >
                <option value="All">All</option>
                {uniqueSalesPersons
                  .filter((salesPerson) => salesPerson !== "All")
                  .map((salesPerson) => (
                    <option key={salesPerson} value={salesPerson}>
                      {salesPerson}
                    </option>
                  ))}
              </Form.Select>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "10px", marginLeft: "auto" }}>
              <Button
                onClick={handleClearFilters}
                style={{
                  background: "#f8f9fa",
                  border: "1px solid #dee2e6",
                  color: "#495057",
                  padding: "0 15px",
                  height: "38px",
                  borderRadius: "20px",
                  fontWeight: "600",
                  fontSize: "0.85rem",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#e9ecef";
                  e.target.style.borderColor = "#ced4da";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#f8f9fa";
                  e.target.style.borderColor = "#dee2e6";
                }}
              >
                <FaTimes style={{ fontSize: "0.8rem" }} /> Clear
              </Button>

              <Button
                onClick={exportToExcel}
                style={{
                  background: "linear-gradient(135deg, #28a745, #20c997)",
                  border: "none",
                  padding: "0 20px",
                  height: "38px",
                  borderRadius: "20px",
                  color: "#fff",
                  fontWeight: "600",
                  fontSize: "0.85rem",
                  boxShadow: "0 4px 10px rgba(40, 167, 69, 0.2)",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.transform = "translateY(-2px)")
                }
                onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
              >
                Export Excel
              </Button>
            </div>
          </div>
        </div>
        <div className="total-results my-3">
          <span>Total Orders: {filteredOrders.length}</span>
          <span>Total Pending: {totalPending}</span>
        </div>
        <div style={{ padding: "20px", flex: 1 }}>
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
                onClick={fetchInstallationOrders}
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
                onMouseLeave={(e) => (e.target.style.background = "transparent")}
              >
                Retry
              </Button>
            </div>
          )}

          {filteredOrders.length === 0 && !error ? (
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
              No installation orders available at this time.
            </div>
          ) : (

            tableContent
          )}
        </div>

        {/* View Modal */}
        <Modal
          show={showViewModal}
          onHide={() => setShowViewModal(false)}
          backdrop="static"
          keyboard={false}
          size="lg"
        >
          <style>
            {`
      @keyframes fadeIn {
        0% { opacity: 0; transform: translateY(10px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      .serial-nos-container {
        max-height: 100px;
        overflow-y: auto;
        padding: 5px 10px;
        background: #fff;
        border-radius: 5px;
        border: 1px solid #eee;
      }
      .serial-nos-container ul {
        margin: 0;
        padding-left: 20px;
      }
      .serial-nos-container li {
        font-size: 0.95rem;
        color: #555;
        line-height: 1.4;
      }
    `}
          </style>
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
              Installation Order Details
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
              animation: "fadeIn 0.5s ease-in-out",
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
                    animation: "fadeIn 0.5s ease-in-out",
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
                    Installation Info
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
                      <strong>Contact Person:</strong> {viewOrder.name || "N/A"}
                    </span>
                    <span style={{ fontSize: "1rem", color: "#555" }}>
                      <strong>Customer Email:</strong> {viewOrder.customerEmail || "N/A"}
                    </span>
                    <span style={{ fontSize: "1rem", color: "#555" }}>
                      <strong>Installation Report:</strong>{" "}
                      {viewOrder.installationFile ? (
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            marginTop: "5px",
                          }}
                        >
                          <Button
                            size="sm"
                            onClick={() => handleDownload(viewOrder.installationFile)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "6px 14px",
                              borderRadius: "20px",
                              background: "linear-gradient(135deg, #2575fc, #6a11cb)",
                              color: "#fff",
                              fontWeight: "600",
                              fontSize: "0.85rem",
                              border: "none",
                              boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
                              transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = "translateY(-1px) scale(1.02)";
                              e.target.style.boxShadow = "0 5px 12px rgba(0,0,0,0.3)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = "translateY(0) scale(1)";
                              e.target.style.boxShadow = "0 3px 8px rgba(0,0,0,0.2)";
                            }}
                          >
                            <FaDownload size={12} />
                            Download Report
                          </Button>
                        </div>
                      ) : (
                        "N/A"
                      )}

                    </span>
                    <span style={{ fontSize: "1rem", color: "#555" }}>
                      <strong>Contact No:</strong> {viewOrder.contactNo || "N/A"}
                    </span>
                    <span style={{ fontSize: "1rem", color: "#555" }}>
                      <strong>Shipping Address:</strong>{" "}
                      {viewOrder.shippingAddress || "N/A"}
                    </span>
                    <span style={{ fontSize: "1rem", color: "#555" }}>
                      <strong>Installation Charges:</strong>{" "}
                      {viewOrder.installation || "N/A"}
                    </span>
                    <span style={{ fontSize: "1rem", color: "#555" }}>
                      <strong>Installation Status:</strong>{" "}
                      <Badge
                        style={{
                          background:
                            viewOrder.installationStatus === "Pending"
                              ? "linear-gradient(135deg, #ff6b6b, #ff8787)" // Red for Pending
                              : viewOrder.installationStatus === "In Progress"
                                ? "linear-gradient(135deg, #f39c12, #f7c200)" // Orange/Yellow for In Progress
                                : viewOrder.installationStatus === "Completed"
                                  ? "linear-gradient(135deg, #28a745, #4cd964)" // Green for Completed
                                  : viewOrder.installationStatus === "Failed"
                                    ? "linear-gradient(135deg, #6c757d, #5a6268)" // Gray for Failed
                                    : viewOrder.installationStatus === "Hold"
                                      ? "linear-gradient(135deg, #007bff, #4dabf7)" // Blue for Hold by Salesperson
                                      : viewOrder.installationStatus === "Site Not Ready"
                                        ? "linear-gradient(135deg, #e84393, #ff6b9b)" // Pink/Magenta for Site Not Ready
                                        : "linear-gradient(135deg, #6c757d, #a9a9a9)", // Default gray
                          color: "#fff",
                          padding: "5px 10px",
                          borderRadius: "12px",
                        }}
                      >
                        {viewOrder.installationStatus || "Pending"}
                      </Badge>
                    </span>

                    {viewOrder.installationStatusDate && (
                      <span style={{ fontSize: "1rem", color: "#555" }}>
                        <strong>Installation Completion Date:</strong>{" "}
                        {
                          new Date(viewOrder.installationStatusDate)
                            .toISOString()
                            .split("T")[0]
                        }
                      </span>
                    )}

                    {viewOrder.installationeng && (
                      <span style={{ fontSize: "1rem", color: "#555" }}>
                        <strong>Engineer Name:</strong>{" "}
                        {viewOrder.installationeng}
                      </span>
                    )}

                    <span style={{ fontSize: "1rem", color: "#555" }}>
                      <strong>Remarks By Installation:</strong>{" "}
                      {viewOrder.remarksByInstallation || "N/A"}
                    </span>
                    <span style={{ fontSize: "1rem", color: "#555" }}>
                      <strong>Dispatch Status:</strong>{" "}
                      {viewOrder.dispatchStatus || "N/A"}
                    </span>

                    {viewOrder.deliveredDate && (
                      <span style={{ fontSize: "1rem", color: "#555" }}>
                        <strong>Delivered Date:</strong>{" "}
                        {new Date(viewOrder.deliveredDate).toLocaleDateString(
                          "en-GB"
                        ) || "N/A"}
                      </span>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    background: "#f8f9fa",
                    borderRadius: "10px",
                    padding: "20px",
                    boxShadow: "0 3px 10px rgba(0, 0, 0, 0.05)",
                    animation: "fadeIn 0.5s ease-in-out",
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
                  {Array.isArray(viewOrder.products) &&
                    viewOrder.products.length > 0 ? (
                    viewOrder.products.map((product, index) => (
                      <div
                        key={index}
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(200px, 1fr))",
                          gap: "10px",
                          padding: "10px 0",
                          borderBottom:
                            index < viewOrder.products.length - 1
                              ? "1px solid #eee"
                              : "none",
                          alignItems: "start",
                        }}
                      >
                        <span style={{ fontSize: "1rem", color: "#555" }}>
                          <strong>Product {index + 1} Type:</strong>{" "}
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
                          <strong>Serial Nos:</strong>
                          <div className="serial-nos-container">
                            {product.serialNos && product.serialNos.length > 0 ? (
                              <ul>
                                {product.serialNos.map((serial, idx) => (
                                  <li key={idx}>{serial}</li>
                                ))}
                              </ul>
                            ) : (
                              "N/A"
                            )}
                          </div>
                        </span>
                        <span style={{ fontSize: "1rem", color: "#555" }}>
                          <strong>Model Nos:</strong>{" "}
                          {product.modelNos?.[0] || "N/A"}
                        </span>
                        <span style={{ fontSize: "1rem", color: "#555" }}>
                          <strong>Product Code:</strong>{" "}
                          {product.productCode?.[0] || "N/A"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span style={{ fontSize: "1rem", color: "#555" }}>
                      <strong>Products:</strong> N/A
                    </span>
                  )}
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
                    alignSelf: "flex-end",
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
        <InstallationEditModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          order={editOrder}
          onUpdate={handleOrderUpdate}
        />
      </div> <footer
        style={{
          padding: "15px",
          textAlign: "center",
          background: "linear-gradient(135deg, #2575fc, #6a11cb)",
          color: "white",
          marginTop: "auto",
          boxShadow: "0 -2px 5px rgba(0, 0, 0, 0.1)",
        }}
      >
        <p style={{ margin: 0, fontSize: "0.9rem" }}>
          © 2025 Sales Order Management. All rights reserved.
        </p>
      </footer></>
  );
}

const keyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

document.head.insertAdjacentHTML("beforeend", `<style>${keyframes}</style>`);

export default Installation;
