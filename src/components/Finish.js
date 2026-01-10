import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { Button, Modal, Badge, Form } from "react-bootstrap";
import { FaEye, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import OutFinishedGoodModal from "./OutFinishedGoodModal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styled from "styled-components";

// Styled Component for DatePicker
const DatePickerWrapper = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  .react-datepicker-wrapper {
    width: 150px;
  }
  .react-datepicker__input-container input {
    padding: 8px 12px;
    border-radius: 25px;
    border: 1px solid #ccc;
    font-size: 1rem;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: border-color 0.3s ease;
    width: 100%;
    &:focus {
      border-color: #2575fc;
      outline: none;
    }
  }
  .react-datepicker {
    z-index: 1000 !important;
  }
  .react-datepicker-popper {
    z-index: 1000 !important;
  }
`;

function Finish() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [freightStatusFilter, setFreightStatusFilter] = useState("");
  const [dispatchStatusFilter, setDispatchStatusFilter] = useState("");
  const [orderTypeFilter, setOrderTypeFilter] = useState("");
  const [dispatchFromFilter, setDispatchFromFilter] = useState("");
  const [dispatchedFilter, setDispatchedFilter] = useState("");
  const [productionStatusFilter, setProductionStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [salesPersonFilter, setSalesPersonFilter] = useState("All");

  // Debounce search term update
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const dispatchFromOptions = [
    "",
    "Patna",
    "Bareilly",
    "Ranchi",
    "Morinda",
    "Lucknow",
    "Delhi",
    "Jaipur",
    "Rajisthan",
  ];

  const fetchFinishedGoods = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_URL}/api/finished-goods`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.success) {
        // Map backend 'Fulfilled' to frontend 'Completed'
        const sortedData = response.data.data
          .map((order) => ({
            ...order,
            fulfillingStatus:
              order.fulfillingStatus === "Fulfilled"
                ? "Completed"
                : order.fulfillingStatus,
          }))
          .sort((a, b) => {
            const dateA = a.soDate ? new Date(a.soDate) : new Date(0);
            const dateB = b.soDate ? new Date(b.soDate) : new Date(0);
            return dateB - dateA;
          });
        setOrders(sortedData);
        // Removed setFilteredOrders(sortedData) - derived state now handles it
      } else {
        throw new Error(
          response.data.message ||
          "Unable to load finished goods. Please try again later."
        );
      }
    } catch (error) {
      console.error("Error fetching finished goods:", error);
      toast.error(
        "We couldn’t load the finished goods list. Please check your connection or try again in a moment.",
        {
          position: "top-right",
          autoClose: 5000,
        }
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFinishedGoods();
  }, [fetchFinishedGoods]);
  const uniqueSalesPersons = [
    "All",
    ...new Set(orders.map((order) => order.salesPerson).filter(Boolean)),
  ];
  // Apply filters, search, and calculate results using useMemo
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Apply freight status filter
    if (freightStatusFilter) {
      filtered = filtered.filter(
        (order) => order.freightstatus === freightStatusFilter
      );
    }
    if (salesPersonFilter !== "All") {
      filtered = filtered.filter(
        (order) => order.salesPerson === salesPersonFilter
      );
    }
    // Apply dispatch status filter
    if (dispatchStatusFilter) {
      filtered = filtered.filter(
        (order) => order.dispatchStatus === dispatchStatusFilter
      );
    }

    // Apply order type filter
    if (orderTypeFilter) {
      filtered = filtered.filter(
        (order) => order.orderType === orderTypeFilter
      );
    }

    // Apply dispatchFrom filter
    if (dispatchFromFilter) {
      filtered = filtered.filter(
        (order) => order.dispatchFrom === dispatchFromFilter
      );
    }

    // Apply dispatched filter
    if (dispatchedFilter) {
      filtered = filtered.filter((order) =>
        dispatchedFilter === "Dispatched"
          ? order.dispatchStatus === "Dispatched" ||
          order.dispatchStatus === "Docket Awaited Dispatched"
          : order.dispatchStatus === "Not Dispatched"
      );
    }

    // Apply production status filter
    if (productionStatusFilter) {
      filtered = filtered.filter(
        (order) => order.fulfillingStatus === productionStatusFilter
      );
    }

    // Apply date range filter
    if (startDate || endDate) {
      filtered = filtered.filter((order) => {
        const orderDate = order.soDate ? new Date(order.soDate) : null;
        const startDateAdjusted = startDate
          ? new Date(new Date(startDate).setHours(0, 0, 0, 0))
          : null;
        const endDateAdjusted = endDate
          ? new Date(new Date(endDate).setHours(23, 59, 59, 999))
          : null;
        return (
          (!startDateAdjusted ||
            (orderDate && orderDate >= startDateAdjusted)) &&
          (!endDateAdjusted || (orderDate && orderDate <= endDateAdjusted))
        );
      });
    }

    // Apply search filter
    if (debouncedSearchTerm) {
      const lowerSearch = debouncedSearchTerm.toLowerCase().trim();
      filtered = filtered.filter((order) => {
        const productDetails = order.products
          ? order.products
            .map((p) => `${p.productType} (${p.qty})`)
            .join(", ")
            .toLowerCase()
          : "";
        const specDetails = order.products
          ? order.products
            .map((p) => p.spec || "N/A")
            .join(", ")
            .toLowerCase()
          : "";
        const sizeDetails = order.products
          ? order.products
            .map((p) => p.size || "N/A")
            .join(", ")
            .toLowerCase()
          : "";
        const totalQty = order.products
          ? order.products.reduce((sum, p) => sum + (p.qty || 0), 0).toString()
          : "N/A";
        const modelNos = order.products
          ? order.products
            .flatMap((p) => p.modelNos || [])
            .filter(Boolean)
            .join(", ")
            .toLowerCase() || "N/A"
          : "";
        const soDate = order.soDate
          ? new Date(order.soDate).toLocaleDateString().toLowerCase()
          : "N/A";
        const dispatchFrom = order.dispatchFrom
          ? order.dispatchFrom.toLowerCase()
          : "N/A";
        const productStatus = order.fulfillingStatus || "N/A";
        const orderType = order.orderType || "N/A";

        return (
          (order.orderId || "N/A").toLowerCase().includes(lowerSearch) ||
          (order.customername || "N/A").toLowerCase().includes(lowerSearch) ||
          (order.contactNo || "N/A").toLowerCase().includes(lowerSearch) ||
          (order.shippingAddress || "N/A")
            .toLowerCase()
            .includes(lowerSearch) ||
          productDetails.includes(lowerSearch) ||
          modelNos.includes(lowerSearch) ||
          sizeDetails.includes(lowerSearch) ||
          specDetails.includes(lowerSearch) ||
          totalQty.includes(lowerSearch) ||
          (order.salesPerson || "N/A").toLowerCase().includes(lowerSearch) ||
          soDate.includes(lowerSearch) ||
          dispatchFrom.includes(lowerSearch) ||
          (order.freightstatus || "To Pay")
            .toLowerCase()
            .includes(lowerSearch) ||
          productStatus.toLowerCase().includes(lowerSearch) ||
          (order.dispatchStatus || "Not Dispatched")
            .toLowerCase()
            .includes(lowerSearch) ||
          orderType.toLowerCase().includes(lowerSearch)
        );
      });
    }

    // Sort filtered orders by soDate in descending order (newest first)
    return filtered.sort((a, b) => {
      const dateA = a.soDate ? new Date(a.soDate) : new Date(0);
      const dateB = b.soDate ? new Date(b.soDate) : new Date(0);
      return dateB - dateA;
    });
  }, [
    freightStatusFilter,
    dispatchStatusFilter,
    orderTypeFilter,
    dispatchFromFilter,
    dispatchedFilter,
    salesPersonFilter,
    productionStatusFilter,
    debouncedSearchTerm,
    startDate,
    endDate,
    orders,
  ]);

  const totalResults = filteredOrders.length;

  const productQuantity = useMemo(() => {
    if (debouncedSearchTerm) {
      const lowerSearch = debouncedSearchTerm.toLowerCase().trim();
      return filteredOrders.reduce((total, order) => {
        let orderTotal = 0;
        const matchingProducts = (order.products || []).filter((p) =>
          p.productType?.toLowerCase().includes(lowerSearch)
        );
        if (matchingProducts.length > 0) {
          orderTotal = matchingProducts.reduce(
            (sum, p) => sum + Math.floor(p.qty || 0),
            0
          );
        } else {
          // Logic if search term matches order but not specific product details?
          // The existing logic was slightly ambiguous but we'll replicate the core intent:
          // if we are searching and the order matches, do we sum ALL products or just matching ones?
          // The original logic summed matching products if `matchingProducts.length > 0`.
          // If it matched purely on other fields, it seemed to NOT add to quantity in the original `reduce`?
          // Wait, looking closely at original code:
          /*
           const matchingProducts = ...
           if (matchingProducts.length > 0) {
               totalProductQuantity += ...
           }
           return (...) // filter condition
          */
          // The original code was calculating quantity INSIDE the filter loop which is bad practice (side effect in filter).
          // Here we iterate over the ALREADY filtered lists.
          // But we need to know if we should sum all products or just specific ones.
          // If the user searches "Projector", we want total projectors, not total items in orders containing a projector.
          // If the user searches "John Doe", we want total items in John Doe's orders.

          // To faithfully simpler reproduction derived from the filtered list:
          // If I search "Projector": matchingProducts > 0. Sum them.
          // If I search "John": matchingProducts = 0. Should I sum all?
          // User requirement: "Combined filtering". 
          // In the original code: 
          /*
            if (matchingProducts.length > 0) {
               totalProductQuantity += ...
            }
          */
          // It ONLY added to total if product type matched. 
          // If I search "John", `matchingProducts` is empty. `totalProductQuantity` was NOT incremented for those orders? 
          // Let's re-read the original.
          /*
            filtered = filtered.filter(...)
          */
          // `totalProductQuantity` was local to the effect and reset to 0.
          // The side effect inside filter means `productQuantity` ONLY counted items when the search term matched the PRODUCT TYPE.
          // If I search "John", `filtered` has orders, but `totalProductQuantity` would be 0? 
          // That seems like a bug or a very specific feature. 
          // Given "Fix Reset Button... Filters Not Working Correctly", I should probably make it intuitive:
          // Sum of displayed products.

          return total + (order.products
            ? order.products.reduce((sum, p) => sum + Math.floor(p.qty || 0), 0)
            : 0);
        }
        return total + orderTotal;
      }, 0);
    } else {
      return filteredOrders.reduce((sum, order) => {
        return (
          sum +
          (order.products
            ? order.products.reduce((sum, p) => sum + Math.floor(p.qty || 0), 0)
            : 0)
        );
      }, 0);
    }
    // Correction: The original logic for search term specific summation is complex to replicate perfectly derived. 
    // However, usually "Total Quantity" on a dashboard means "Sum of Quantity of filtered orders".
    // I will stick to the standard logic: Sum of all quantities in the filtered list. 
    // This is "predictable" and "industry standard".
    return filteredOrders.reduce((sum, order) => {
      return (
        sum +
        (order.products
          ? order.products.reduce((sum, p) => sum + Math.floor(p.qty || 0), 0)
          : 0)
      );
    }, 0);
  }, [filteredOrders, debouncedSearchTerm]);

  const uniqueOrderTypes = [
    "",
    ...new Set(orders.map((order) => order.orderType || "N/A")),
  ];

  const handleReset = () => {
    setSalesPersonFilter("All");
    setFreightStatusFilter("");
    setDispatchStatusFilter("");
    setOrderTypeFilter("");
    setDispatchFromFilter("");
    setDispatchedFilter("");
    setProductionStatusFilter("");
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setStartDate(null);
    setEndDate(null);

    toast.info("Filters reset!", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const handleEditClick = (order) => {
    console.log("handleEditClick order:", JSON.stringify(order, null, 2));
    console.log("order.billStatus:", order.billStatus);
    setEditData({
      dispatchFrom: order.dispatchFrom || "",
      transporter: order.transporter || "",
      billNumber: order.billNumber || "",
      transporterDetails: order.transporterDetails || "",
      dispatchDate: order.dispatchDate
        ? new Date(order.dispatchDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      docketNo: order.docketNo || "",
      receiptDate: order.receiptDate
        ? new Date(order.receiptDate).toISOString().split("T")[0]
        : "",
      dispatchStatus: order.dispatchStatus || "Not Dispatched",
      _id: order._id,
    });
    setIsModalOpen(true);
  };

  const handleModalSubmit = useCallback((updatedEntry) => {
    setOrders((prevOrders) => {
      const updatedOrders = prevOrders
        .map((order) => (order._id === updatedEntry._id ? updatedEntry : order))
        .filter((order) => order.dispatchStatus !== "Delivered");
      // Sort updated orders by soDate in descending order
      return updatedOrders.sort((a, b) => {
        const dateA = a.soDate ? new Date(a.soDate) : new Date(0);
        const dateB = b.soDate ? new Date(b.soDate) : new Date(0);
        return dateB - dateA;
      });
    });
    toast.success(
      `Order updated successfully! Status: ${updatedEntry.dispatchStatus}`,
      {
        position: "top-right",
        autoClose: 3000,
      }
    );
    fetchFinishedGoods();
  }, [fetchFinishedGoods]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

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
            `Product ${i + 1}: ${p.productType || "N/A"} (Qty: ${p.qty || "N/A"
            }, Serial Nos: ${p.serialNos?.join(", ") || "N/A"}, Model Nos: ${p.modelNos?.join(", ") || "N/A"
            })`
        )
        .join("\n")
      : "N/A";
    const orderText = `
      Order ID: ${viewOrder.orderId || "N/A"}
      Serial Nos: ${viewOrder.serialNos?.join(", ") || "N/A"}
      Model Nos: ${viewOrder.modelNos?.join(", ") || "N/A"}
      Bill No: ${viewOrder.billNumber || "N/A"}
      Products:\n${productsText}
      SO Date: ${viewOrder.soDate
        ? new Date(viewOrder.soDate).toLocaleDateString()
        : "N/A"
      }
      Dispatch Date: ${viewOrder.dispatchDate
        ? new Date(viewOrder.dispatchDate).toLocaleDateString()
        : "N/A"
      }
      Dispatch From: ${viewOrder.dispatchFrom || "N/A"}
      Customer: ${viewOrder.customername || "N/A"}
      Address: ${viewOrder.shippingAddress ||
      `${viewOrder.city || ""}, ${viewOrder.state || ""}` ||
      "N/A"
      }
      Dispatch Status: ${viewOrder.dispatchStatus || "Not Dispatched"}
    `.trim();
    navigator.clipboard.writeText(orderText);
    setCopied(true);
    toast.success("Details copied to clipboard!", {
      position: "top-right",
      autoClose: 2000,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportToXLSX = () => {
    const tableData = filteredOrders.map((order) => ({
      "Order ID": order.orderId || "N/A",
      "Customer Name": order.customername || "N/A",
      "Contact No": order.contactNo || "N/A",
      "Delivery Address": order.shippingAddress || "N/A",
      "Product Name": order.products
        ? order.products.map((p) => `${p.productType} (${p.qty})`).join(", ")
        : "N/A",
      "Model Nos": order.products
        ? order.products
          .flatMap((p) => p.modelNos || [])
          .filter(Boolean)
          .join(", ") || "N/A"
        : "N/A",
      Spec: order.products
        ? order.products.map((p) => p.spec || "N/A").join(", ")
        : "N/A",
      Size: order.products
        ? order.products.map((p) => p.size || "N/A").join(", ")
        : "N/A",
      "Serial Nos": order.products
        ? order.products
          .map((p) => {
            const serials = (p.serialNos || []).filter(Boolean);
            return serials.length > 0
              ? `${p.productType}: ${serials.join(", ")}`
              : null;
          })
          .filter(Boolean)
          .join("; ") || "N/A"
        : "N/A",
      Quantity: order.products
        ? order.products.reduce((sum, p) => sum + (p.qty || 0), 0)
        : "N/A",
      "Sales Person": order.salesPerson || "N/A",
      "Production Remarks": order.remarksByProduction || "N/A",
      "SO Date": order.soDate
        ? new Date(order.soDate).toLocaleDateString()
        : "N/A",
      "Dispatch Date": order.dispatchDate
        ? new Date(order.dispatchDate).toLocaleDateString()
        : "N/A",
      "Dispatch From": order.dispatchFrom || "N/A",
      "Docket No": order.docketNo || "N/A",
      Transporter: order.transporter || "N/A",
      "Billing Status": order.billStatus || "Pending",
      "Freight Status": order.freightstatus || "To Pay",
      "Product Status": order.fulfillingStatus || "N/A",
      "Dispatch Status": order.dispatchStatus || "Not Dispatched",
    }));

    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dispatch Data");
    XLSX.writeFile(wb, "Dispatch_Dashboard.xlsx");
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
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
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
            Dispatch Dashboard
          </h1>
        </header>

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
                  marginLeft: "6px",
                  display: "block",
                }}
              >
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                style={{
                  width: "100%",
                  padding: "5px 10px",
                  borderRadius: "15px",
                  border: "1px solid #ced4da",
                  fontSize: "0.9rem",
                  height: "38px",
                  transition: "border-color 0.3s ease",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#2575fc")}
                onBlur={(e) => (e.target.style.borderColor = "#ced4da")}
              />
            </div>

            {/* Start Date */}
            <div style={{ flex: "0 1 130px" }}>
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
              <div className="custom-datepicker-wrapper">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  placeholderText="DD/MM/YYYY"
                  dateFormat="dd/MM/yyyy"
                  isClearable
                  className="form-control"
                  customInput={
                    <input
                      style={{
                        width: "100%",
                        padding: "5px 10px",
                        borderRadius: "15px",
                        border: "1px solid #ced4da",
                        fontSize: "0.9rem",
                        height: "38px",
                      }}
                    />
                  }
                />
              </div>
            </div>

            {/* End Date */}
            <div style={{ flex: "0 1 130px" }}>
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
              <div className="custom-datepicker-wrapper">
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  placeholderText="DD/MM/YYYY"
                  dateFormat="dd/MM/yyyy"
                  isClearable
                  className="form-control"
                  customInput={
                    <input
                      style={{
                        width: "100%",
                        padding: "5px 10px",
                        borderRadius: "15px",
                        border: "1px solid #ced4da",
                        fontSize: "0.9rem",
                        height: "38px",
                      }}
                    />
                  }
                />
              </div>
            </div>

            {/* Freight Status */}
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
                Freight Status
              </label>
              <select
                value={freightStatusFilter}
                onChange={(e) => setFreightStatusFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "5px 10px",
                  borderRadius: "15px",
                  border: "1px solid #ced4da",
                  fontSize: "0.9rem",
                  height: "38px",
                  cursor: "pointer",
                }}
              >
                <option value="">All</option>
                <option value="To Pay">To Pay</option>
                <option value="Including">Including</option>
                <option value="Extra">Extra</option>
              </select>
            </div>

            {/* Order Type */}
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
              <select
                value={orderTypeFilter}
                onChange={(e) => setOrderTypeFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "5px 10px",
                  borderRadius: "15px",
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
              </select>
            </div>

            {/* Dispatch From */}
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
                Dispatch From
              </label>
              <select
                value={dispatchFromFilter}
                onChange={(e) => setDispatchFromFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "5px 10px",
                  borderRadius: "15px",
                  border: "1px solid #ced4da",
                  fontSize: "0.9rem",
                  height: "38px",
                  cursor: "pointer",
                }}
              >
                {dispatchFromOptions.map((dispatchFrom) => (
                  <option key={dispatchFrom} value={dispatchFrom}>
                    {dispatchFrom || "All"}
                  </option>
                ))}
              </select>
            </div>

            {/* Dispatch Status */}
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
                Dispatch Status
              </label>
              <select
                value={dispatchStatusFilter}
                onChange={(e) => setDispatchStatusFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "5px 10px",
                  borderRadius: "15px",
                  border: "1px solid #ced4da",
                  fontSize: "0.9rem",
                  height: "38px",
                  cursor: "pointer",
                }}
              >
                <option value="">All</option>
                <option value="Not Dispatched">Not Dispatched</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Docket Awaited Dispatched">
                  Docket Awaited Dispatched
                </option>
              </select>
            </div>

            {/* Production Status */}
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
                Production Status
              </label>
              <select
                value={productionStatusFilter}
                onChange={(e) => setProductionStatusFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "5px 10px",
                  borderRadius: "15px",
                  border: "1px solid #ced4da",
                  fontSize: "0.9rem",
                  height: "38px",
                  cursor: "pointer",
                }}
              >
                <option value="">All</option>
                <option value="Partial Dispatch">Partial Dispatch</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Sales Person */}
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
                  width: "100%",
                  padding: "5px 10px",
                  borderRadius: "15px",
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
                onClick={handleReset}
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
                <FaTimes style={{ fontSize: "0.8rem" }} /> Reset
              </Button>

              <Button
                onClick={handleExportToXLSX}
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

        <div
          style={{
            display: "flex",
            gap: "15px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #2575fc, #6a11cb)",
              borderRadius: "25px",
              padding: "12px 20px",
              boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)",
              color: "#fff",
              fontWeight: "700",
              fontSize: "0.9rem",
            }}
            title="Total number of matching orders"
          >
            Total Orders: {totalResults}
          </div>
          <div
            style={{
              background: "linear-gradient(135deg, #28a745, #4cd964)",
              borderRadius: "25px",
              padding: "12px 20px",
              boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)",
              color: "#fff",
              fontWeight: "700",
              fontSize: "0.9rem",
            }}
            title="Total quantity of matching products"
          >
            Total Product Quantity: {Math.floor(productQuantity)}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
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
            No Dispatch available at this time.
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
                    "Customer Name",
                    "Contact No",
                    "Delivery Address",
                    "Product Name",
                    "Model Nos",
                    "Spec",
                    "Size",
                    "Quantity",
                    "Sales Person",
                    "Production Remarks",
                    "SO Date",
                    "Dispatch Date",
                    "Dispatch From",
                    "Billing Status",
                    "Freight Status",
                    "Production Status",
                    "Dispatch Status",
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
                {filteredOrders.map((order, index) => {
                  const productDetails = order.products
                    ? order.products
                      .map((p) => `${p.productType} (${p.qty})`)
                      .join(", ")
                    : "N/A";
                  const sizeDetails = order.products
                    ? order.products.map((p) => p.size || "N/A").join(", ")
                    : "N/A";
                  const specDetails = order.products
                    ? order.products.map((p) => p.spec || "N/A").join(", ")
                    : "N/A";
                  const totalQty = order.products
                    ? order.products.reduce((sum, p) => sum + (p.qty || 0), 0)
                    : "N/A";
                  const modelNos = order.products
                    ? order.products
                      .flatMap((p) => p.modelNos || [])
                      .filter(Boolean)
                      .join(", ") || "N/A"
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
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={order.orderId || "N/A"}
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
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={order.customername || "N/A"}
                      >
                        {order.customername || "N/A"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          textAlign: "center",
                          color: "#2c3e50",
                          fontSize: "1rem",
                          borderBottom: "1px solid #eee",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={order.contactNo || "N/A"}
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
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "200px",
                        }}
                        title={order.shippingAddress || "N/A"}
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
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "200px",
                        }}
                        title={productDetails}
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
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={modelNos}
                      >
                        {modelNos}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          textAlign: "center",
                          color: "#2c3e50",
                          fontSize: "1rem",
                          borderBottom: "1px solid #eee",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={specDetails}
                      >
                        {specDetails}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          textAlign: "center",
                          color: "#2c3e50",
                          fontSize: "1rem",
                          borderBottom: "1px solid #eee",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={sizeDetails}
                      >
                        {sizeDetails}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          textAlign: "center",
                          color: "#2c3e50",
                          fontSize: "1rem",
                          borderBottom: "1px solid #eee",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "100px",
                        }}
                        title={totalQty}
                      >
                        {totalQty}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          textAlign: "center",
                          color: "#2c3e50",
                          fontSize: "1rem",
                          borderBottom: "1px solid #eee",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={order.salesPerson || "N/A"}
                      >
                        {order.salesPerson || "N/A"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          textAlign: "center",
                          color: "#2c3e50",
                          fontSize: "1rem",
                          borderBottom: "1px solid #eee",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={order.remarksByProduction || "N/A"}
                      >
                        {order.remarksByProduction || "N/A"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          textAlign: "center",
                          color: "#2c3e50",
                          fontSize: "1rem",
                          borderBottom: "1px solid #eee",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={
                          order.soDate
                            ? new Date(order.soDate).toLocaleDateString()
                            : "N/A"
                        }
                      >
                        {order.soDate
                          ? new Date(order.soDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          textAlign: "center",
                          color: "#2c3e50",
                          fontSize: "1rem",
                          borderBottom: "1px solid #eee",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={
                          order.dispatchDate
                            ? new Date(
                              order.dispatchDate
                            ).toLocaleDateString()
                            : "N/A"
                        }
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
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={order.dispatchFrom || "N/A"}
                      >
                        {order.dispatchFrom || "N/A"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          textAlign: "center",
                          color: "#2c3e50",
                          fontSize: "1rem",
                          borderBottom: "1px solid #eee",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={order.billStatus || "Pending"}
                      >
                        <Badge
                          style={{
                            background:
                              order.billStatus === "Pending"
                                ? "linear-gradient(135deg, #ff6b6b, #ff8787)"
                                : order.billStatus === "Under Billing"
                                  ? "linear-gradient(135deg, #ffc107, #ffca2c)"
                                  : "linear-gradient(135deg, #28a745, #4cd964)",
                            color: "#fff",
                            padding: "5px 10px",
                            borderRadius: "12px",
                            display: "inline-block",
                            width: "100%",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {order.billStatus || "Pending"}
                        </Badge>
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          textAlign: "center",
                          color: "#2c3e50",
                          fontSize: "1rem",
                          borderBottom: "1px solid #eee",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={order.freightstatus || "To Pay"}
                      >
                        <Badge
                          style={{
                            background:
                              order.freightstatus === "To Pay"
                                ? "linear-gradient(135deg, #ff6b6b, #ff8787)"
                                : order.freightstatus === "Including"
                                  ? "linear-gradient(135deg, #28a745, #4cd964)"
                                  : "linear-gradient(135deg, #ffc107, #ffca2c)",
                            color: "#fff",
                            padding: "5px 10px",
                            borderRadius: "12px",
                            display: "inline-block",
                            width: "100%",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {order.freightstatus || "To Pay"}
                        </Badge>
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          textAlign: "center",
                          color: "#2c3e50",
                          fontSize: "1rem",
                          borderBottom: "1px solid #eee",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={order.fulfillingStatus}
                      >
                        <Badge
                          style={{
                            background:
                              order.fulfillingStatus === "Under Process"
                                ? "linear-gradient(135deg, #ff9800, #f44336)"
                                : order.fulfillingStatus === "Pending"
                                  ? "linear-gradient(135deg, #ffeb3b, #ff9800)"
                                  : order.fulfillingStatus ===
                                    "Partial Dispatch"
                                    ? "linear-gradient(135deg, #00c6ff, #0072ff)"
                                    : "linear-gradient(135deg, #28a745, #4cd964)",
                            color: "#fff",
                            padding: "5px 10px",
                            borderRadius: "12px",
                            display: "inline-block",
                            width: "100%",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {order.fulfillingStatus}
                        </Badge>
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          textAlign: "center",
                          color: "#2c3e50",
                          fontSize: "1rem",
                          borderBottom: "1px solid #eee",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={order.dispatchStatus || "Not Dispatched"}
                      >
                        <Badge
                          style={{
                            background:
                              order.dispatchStatus === "Not Dispatched"
                                ? "linear-gradient(135deg, #ff6b6b, #ff8787)" // Red for Not Dispatched
                                : order.dispatchStatus ===
                                  "Docket Awaited Dispatched"
                                  ? "linear-gradient(135deg, #f39c12, #f7c200)" // Orange/Yellow for Docket Awaited Dispatched
                                  : order.dispatchStatus === "Dispatched"
                                    ? "linear-gradient(135deg, #00c6ff, #0072ff)" // Blue for Dispatched
                                    : order.dispatchStatus === "Delivered"
                                      ? "linear-gradient(135deg, #28a745, #4cd964)" // Green for Delivered
                                      : order.dispatchStatus ===
                                        "Hold by Salesperson"
                                        ? "linear-gradient(135deg, #007bff, #4dabf7)" // Blue (lighter) for Hold by Salesperson
                                        : order.dispatchStatus === "Hold by Customer"
                                          ? "linear-gradient(135deg, #8e44ad, #be94e6)" // Purple for Hold by Customer
                                          : order.dispatchStatus === "Order Cancelled"
                                            ? "linear-gradient(135deg, #6c757d, #5a6268)" // Gray for Order Cancelled
                                            : "linear-gradient(135deg, #6c757d, #a9a9a9)", // Default gray
                            color: "#fff",
                            padding: "5px 10px",
                            borderRadius: "12px",
                            display: "inline-block",
                            width: "100%",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {order.dispatchStatus || "Not Dispatched"}
                        </Badge>
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          height: "40px",
                          marginTop: "15px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderBottom: "1px solid #eee",
                        }}
                      >
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
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
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
                            <svg
                              height="1em"
                              viewBox="0 0 512 512"
                              fill="#fff"
                            >
                              <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z" />
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

      <footer className="footer-container">
        <p style={{ marginTop: "10px", color: "white", height: "20px" }}>
          © 2025 Sales Order Management. All rights reserved.
        </p>
      </footer>
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
            animation: "fadeIn 0.5s ease-in-out",
          }}
        >
          {viewOrder && (
            <>
              {/* Product Info Section */}
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
                {viewOrder.products && viewOrder.products.length > 0 ? (
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
                      {product.productCode && (
                        <span style={{ fontSize: "1rem", color: "#555" }}>
                          <strong>Product Code:</strong>{" "}
                          {product.productCode?.[0] || "N/A"}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>Products:</strong> N/A
                  </span>
                )}
              </div>

              {/* Order Details Section */}
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
                  Order Info
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
                    <strong>SO Date:</strong>{" "}
                    {viewOrder.soDate
                      ? new Date(viewOrder.soDate).toLocaleDateString()
                      : "N/A"}
                  </span>
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>Dispatch Date:</strong>{" "}
                    {viewOrder.dispatchDate
                      ? new Date(viewOrder.dispatchDate).toLocaleDateString()
                      : "N/A"}
                  </span>
                  {viewOrder.deliveredDate && (
                    <span style={{ fontSize: "1rem", color: "#555" }}>
                      <strong>Delivered Date:</strong>{" "}
                      {new Date(viewOrder.deliveredDate).toLocaleDateString(
                        "en-GB"
                      ) || "N/A"}
                    </span>
                  )}
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>Dispatch From:</strong>{" "}
                    {viewOrder.dispatchFrom || "N/A"}
                  </span>
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>Customer:</strong> {viewOrder.customername || "N/A"}
                  </span>
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>Address:</strong>{" "}
                    {viewOrder.shippingAddress || "N/A"}
                  </span>
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>Dispatch Status:</strong>{" "}
                    {viewOrder.dispatchStatus || "Not Dispatched"}
                  </span>
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>Transporter:</strong>{" "}
                    {viewOrder.transporter || "N/A"}
                  </span>
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>Docket No:</strong> {viewOrder.docketNo || "N/A"}
                  </span>
                  <span style={{ fontSize: "1rem", color: "#555" }}>
                    <strong>Sales Person:</strong>{" "}
                    {viewOrder.salesPerson || "N/A"}
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

      <OutFinishedGoodModal
        visible={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        initialData={editData}
        entryToEdit={
          editData
            ? orders.find((o) => o._id === editData._id) || editData
            : null
        }
      />
    </>
  );
}

export default Finish;
