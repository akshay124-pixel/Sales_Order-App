import React, { useState, useEffect } from "react";
import { FaEye } from "react-icons/fa";
import { Button, Form, Dropdown, Badge } from "react-bootstrap";
import ViewEntry from "./ViewEntry";
import DeleteModal from "./Delete";
import EditEntry from "./EditEntry";
import AddEntry from "./AddEntry";
import axios from "axios";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { ArrowRight } from "lucide-react";
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

const Sales = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("All");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [productQuantity, setProductQuantity] = useState(0);
  const userRole = localStorage.getItem("role"); // Get role from localStorage
  const userId = localStorage.getItem("userId"); // Get user ID from localStorage

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, approvalFilter, startDate, endDate]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://sales-order-server.onrender.com/api/get-orders",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Sort orders by soDate in descending order (newest first)
      const sortedOrders = response.data.sort((a, b) => {
        const dateA = a.soDate ? new Date(a.soDate) : new Date(0);
        const dateB = b.soDate ? new Date(b.soDate) : new Date(0);
        return dateB - dateA;
      });
      setOrders(sortedOrders);
      toast.success("Orders fetched successfully!");
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders!");
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];
    let totalProductQuantity = 0;

    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter((order) => {
        const searchableFields = [
          order.name,
          order.orderId,
          order.city,
          order.state,
          order.pinCode,
          order.contactNo,
          order.customerEmail,
          order.customername,
          order.sostatus,
          String(order.paymentCollected || ""),
          order.paymentMethod,
          String(order.paymentDue || ""),
          order.remarks,
          ...(order.products || []).flatMap((p) =>
            (p.serialNos || []).concat(p.modelNos || [])
          ),
          order.freightcs,
          order.orderType,
          order.installation,
          order.salesPerson,
          order.company,
          order.transporter,
          order.transporterDetails,
          order.shippingAddress,
          order.billingAddress,
          order.docketNo,
          order.dispatchFrom,
          order.remarksByProduction,
          order.remarksByAccounts,
          order.billNumber,
          ...(order.products || []).map((p) =>
            `${p.productType} ${p.size} ${p.spec} ${p.qty} ${p.unitPrice} ${p.gst}`.toLowerCase()
          ),
        ];
        const lowerSearch = searchTerm.toLowerCase().trim();
        // Check if search term matches product type for quantity counting
        const matchingProducts = (order.products || []).filter((p) =>
          p.productType?.toLowerCase().includes(lowerSearch)
        );
        if (matchingProducts.length > 0) {
          totalProductQuantity += matchingProducts.reduce(
            (sum, p) => sum + (p.qty || 0),
            0
          );
        }
        return searchableFields.some(
          (value) =>
            value && value.toString().toLowerCase().includes(lowerSearch)
        );
      });
    } else {
      totalProductQuantity = filtered.reduce((sum, order) => {
        return (
          sum +
          (order.products
            ? order.products.reduce((sum, p) => sum + (p.qty || 0), 0)
            : 0)
        );
      }, 0);
    }

    // Apply approval status filter
    if (approvalFilter !== "All") {
      filtered = filtered.filter((order) => order.sostatus === approvalFilter);
    }

    // Apply date range filter
    if (startDate || endDate) {
      filtered = filtered.filter((order) => {
        const orderDate = order.soDate ? new Date(order.soDate) : null;
        const startDateAdjusted = startDate
          ? new Date(startDate.setHours(0, 0, 0, 0))
          : null;
        const endDateAdjusted = endDate
          ? new Date(endDate.setHours(23, 59, 59, 999))
          : null;
        return (
          (!startDateAdjusted ||
            (orderDate && orderDate >= startDateAdjusted)) &&
          (!endDateAdjusted || (orderDate && orderDate <= endDateAdjusted))
        );
      });
    }

    // Sort filtered orders by soDate in descending order (newest first)
    filtered = filtered.sort((a, b) => {
      const dateA = a.soDate ? new Date(a.soDate) : new Date(0);
      const dateB = b.soDate ? new Date(b.soDate) : new Date(0);
      return dateB - dateA;
    });

    setFilteredOrders(filtered);
    setTotalResults(filtered.length);
    setProductQuantity(totalProductQuantity);
  };

  const handleReset = () => {
    setApprovalFilter("All");
    setSearchTerm("");
    setStartDate(null);
    setEndDate(null);
    // Sort orders by soDate in descending order
    const sortedOrders = [...orders].sort((a, b) => {
      const dateA = a.soDate ? new Date(a.soDate) : new Date(0);
      const dateB = b.soDate ? new Date(b.soDate) : new Date(0);
      return dateB - dateA;
    });
    setFilteredOrders(sortedOrders);
    setTotalResults(sortedOrders.length);
    setProductQuantity(
      sortedOrders.reduce((sum, order) => {
        return (
          sum +
          (order.products
            ? order.products.reduce((sum, p) => sum + (p.qty || 0), 0)
            : 0)
        );
      }, 0)
    );
    toast.info("Filters reset!");
  };

  const handleAddEntry = (newEntry) => {
    setOrders((prevOrders) => {
      const updatedOrders = [...prevOrders, newEntry];
      // Sort updated orders by soDate in descending order
      return updatedOrders.sort((a, b) => {
        const dateA = a.soDate ? new Date(a.soDate) : new Date(0);
        const dateB = b.soDate ? new Date(b.soDate) : new Date(0);
        return dateB - dateA;
      });
    });
    setIsAddModalOpen(false);
    toast.success("New order added!");
  };

  const handleViewClick = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (order) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (order) => {
    setSelectedOrder(order);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = (deletedIds) => {
    setOrders((prevOrders) => {
      const updatedOrders = prevOrders.filter(
        (order) => !deletedIds.includes(order._id)
      );
      // Sort updated orders by soDate in descending order
      return updatedOrders.sort((a, b) => {
        const dateA = a.soDate ? new Date(a.soDate) : new Date(0);
        const dateB = b.soDate ? new Date(b.soDate) : new Date(0);
        return dateB - dateA;
      });
    });
    setIsDeleteModalOpen(false);
    toast.success("Order deleted successfully!");
  };

  const handleEntryUpdated = async (updatedEntry) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `https://sales-order-server.onrender.com/api/edit/${updatedEntry._id}`,
        updatedEntry,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedOrder = response.data.data || response.data;
      setOrders((prevOrders) => {
        const updatedOrders = prevOrders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        );
        // Sort updated orders by soDate in descending order
        return updatedOrders.sort((a, b) => {
          const dateA = a.soDate ? new Date(a.soDate) : new Date(0);
          const dateB = b.soDate ? new Date(b.soDate) : new Date(0);
          return dateB - dateA;
        });
      });
      setIsEditModalOpen(false);
      toast.success("Order updated successfully!");
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order!");
    }
  };

  const formatCurrency = (value) => {
    if (!value || value === "") return "₹0.00";
    const numericValue = parseFloat(value.toString().replace(/[^0-9.-]+/g, ""));
    if (isNaN(numericValue)) return "₹0.00";
    return `₹${numericValue.toFixed(2)}`;
  };

  const parseExcelDate = (dateValue) => {
    if (!dateValue) return "";
    if (typeof dateValue === "number") {
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(
        excelEpoch.getTime() + dateValue * 24 * 60 * 60 * 1000
      );
      return isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
    }
    const date = new Date(String(dateValue).trim());
    return isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, {
          type: "array",
          raw: false,
          dateNF: "yyyy-mm-dd",
        });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          raw: false,
          blankrows: false,
        });

        const headers = parsedData[0].map((h) =>
          h
            ? h
                .toLowerCase()
                .replace(/\s+/g, "")
                .replace(/[^a-z0-9]/g, "")
            : ""
        );
        const rows = parsedData
          .slice(1)
          .filter((row) =>
            row.some((cell) => cell !== undefined && cell !== "")
          );

        const newEntries = rows.map((row) => {
          const entry = {};
          headers.forEach((header, index) => {
            entry[header] = row[index] !== undefined ? row[index] : "";
          });

          let products = [];
          if (entry.products) {
            try {
              products = JSON.parse(entry.products);
              if (!Array.isArray(products)) {
                products = [products];
              }
            } catch {
              products = [
                {
                  productType: String(entry.producttype || "Unknown").trim(),
                  size: String(entry.size || "N/A").trim(),
                  spec: String(entry.spec || "N/A").trim(),
                  qty: Number(entry.qty) || 1,
                  unitPrice: Number(entry.unitprice) || 0,
                  serialNos: entry.serialnos
                    ? String(entry.serialnos)
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    : [],
                  modelNos: entry.modelnos
                    ? String(entry.modelnos)
                        .split(",")
                        .map((m) => m.trim())
                        .filter(Boolean)
                    : [],
                  gst: Number(entry.gst) || 0,
                },
              ];
            }
          } else {
            products = [
              {
                productType: String(entry.producttype || "Unknown").trim(),
                size: String(entry.size || "N/A").trim(),
                spec: String(entry.spec || "N/A").trim(),
                qty: Number(entry.qty) || 1,
                unitPrice: Number(entry.unitprice) || 0,
                serialNos: entry.serialnos
                  ? String(entry.serialnos)
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  : [],
                modelNos: entry.modelnos
                  ? String(entry.modelnos)
                      .split(",")
                      .map((m) => m.trim())
                      .filter(Boolean)
                  : [],
                gst: Number(entry.gst) || 0,
              },
            ];
          }

          return {
            soDate:
              parseExcelDate(entry.sodate) ||
              new Date().toISOString().slice(0, 10),
            dispatchFrom: String(entry.dispatchfrom || "").trim(),
            dispatchDate: parseExcelDate(entry.dispatchdate) || "",
            name: String(entry.name || "").trim(),
            city: String(entry.city || "").trim(),
            state: String(entry.state || "").trim(),
            pinCode: String(entry.pincode || "").trim(),
            contactNo: String(entry.contactno || "").trim(),
            customerEmail: String(entry.customeremail || "").trim(),
            customername: String(entry.customername || "").trim(),
            products,
            total: Number(entry.total) || 0,
            paymentCollected: String(entry.paymentcollected || "").trim(),
            paymentMethod: String(entry.paymentmethod || "").trim(),
            paymentDue: String(entry.paymentdue || "").trim(),
            neftTransactionId: String(entry.nefttransactionid || "").trim(),
            chequeId: String(entry.chequeid || "").trim(),
            paymentTerms: String(entry.paymentterms || "").trim(),
            freightcs: String(entry.freightcs || "").trim(),
            orderType: String(entry.ordertype || "Private").trim(),
            installation: String(entry.installation || "N/A").trim(),
            installationStatus: String(
              entry.installationstatus || "Pending"
            ).trim(),
            remarksByInstallation: String(
              entry.remarksbyinstallation || ""
            ).trim(),
            dispatchStatus: String(
              entry.dispatchstatus || "Not Dispatched"
            ).trim(),
            salesPerson: String(entry.salesperson || "").trim(),
            report: String(entry.report || "").trim(),
            company: String(entry.company || "Promark").trim(),
            transporter: String(entry.transporter || "").trim(),
            transporterDetails: String(entry.transporterdetails || "").trim(),
            docketNo: String(entry.docketno || "").trim(),
            receiptDate: parseExcelDate(entry.receiptdate) || "",
            shippingAddress: String(entry.shippingaddress || "").trim(),
            billingAddress: String(entry.billingaddress || "").trim(),
            invoiceNo: String(entry.invoiceno || "").trim(),
            invoiceDate: parseExcelDate(entry.invoicedate) || "",
            fulfillingStatus: String(
              entry.fulfillingstatus || "Pending"
            ).trim(),
            remarksByProduction: String(entry.remarksbyproduction || "").trim(),
            remarksByAccounts: String(entry.remarksbyaccounts || "").trim(),
            paymentReceived: String(
              entry.paymentreceived || "Not Received"
            ).trim(),
            billNumber: String(entry.billnumber || "").trim(),
            completionStatus: String(
              entry.completionstatus || "In Progress"
            ).trim(),
            fulfillmentDate: parseExcelDate(entry.fulfillmentdate) || "",
            remarks: String(entry.remarks || "").trim(),
            sostatus: String(entry.sostatus || "Pending for Approval").trim(),
          };
        });

        const token = localStorage.getItem("token");
        const response = await axios.post(
          "https://sales-order-server.onrender.com/api/bulk-orders",
          newEntries,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setOrders((prevOrders) => {
          const updatedOrders = [...prevOrders, ...response.data.data];
          // Sort updated orders by soDate in descending order
          return updatedOrders.sort((a, b) => {
            const dateA = a.soDate ? new Date(a.soDate) : new Date(0);
            const dateB = b.soDate ? new Date(b.soDate) : new Date(0);
            return dateB - dateA;
          });
        });
        toast.success(
          `Successfully uploaded ${response.data.data.length} orders!`
        );
      } catch (error) {
        console.error("Error uploading entries:", error);
        const message =
          error.response?.data?.details?.join(", ") ||
          error.response?.data?.message ||
          "Failed to upload entries. Please check the data and try again.";
        toast.error(message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExport = () => {
    try {
      // Prepare data for export based on filteredOrders
      const exportData = filteredOrders.map((order, index) => {
        const firstProduct =
          order.products && order.products[0] ? order.products[0] : {};
        const totalUnitPrice = order.products
          ? order.products.reduce(
              (sum, p) => sum + (p.unitPrice || 0) * (p.qty || 0),
              0
            )
          : 0;
        const totalQty = order.products
          ? order.products.reduce((sum, p) => sum + (p.qty || 0), 0)
          : 0;
        const productDetails = order.products
          ? order.products.map((p) => `${p.productType} (${p.qty})`).join(", ")
          : "-";
        const gstValues = order.products
          ? order.products
              .map((p) => `${p.gst}%`)
              .filter(Boolean)
              .join(", ")
          : "-";

        return {
          "Seq No": index + 1,
          "Customer Name": order.customername || "-",
          "Product Details": productDetails,
          "Unit Price": `₹${totalUnitPrice.toFixed(2) || "0.00"}`,
          Qty: totalQty || "-",
          "Freight Charges": order.freightcs || "-",
          "Freight Status": order.freightstatus || "-",
          GST: gstValues,
          Total: `₹${order.total?.toFixed(2) || "0.00"}`,
          "Order ID": order.orderId || "-",
          "SO Date": order.soDate
            ? new Date(order.soDate).toLocaleDateString("en-GB")
            : "-",
          "Approval Status": order.sostatus || "-",
          City: order.city || "-",
          State: order.state || "-",
          "Pin Code": order.pinCode || "-",
          "Contact Person Name": order.name || "-",
          "Contact No": order.contactNo || "-",
          "Customer Email": order.customerEmail || "-",
          "Order Type": order.orderType || "-",
          "Model Nos":
            firstProduct.modelNos?.length > 0
              ? firstProduct.modelNos.join(", ")
              : "-",
          "Serial Nos":
            firstProduct.serialNos?.length > 0
              ? firstProduct.serialNos.join(", ")
              : "-",
          "Product Type": firstProduct.productType || "-",
          Size: firstProduct.size || "-",
          Spec: firstProduct.spec || "-",
          "Payment Collected": formatCurrency(order.paymentCollected) || "-",
          "Payment Method": order.paymentMethod || "-",
          "Payment Due": formatCurrency(order.paymentDue) || "-",
          Installation: order.installation || "-",
          "Sales Person": order.salesPerson || "-",
          "Created By":
            order.createdBy && typeof order.createdBy === "object"
              ? order.createdBy.username || "Unknown"
              : typeof order.createdBy === "string"
              ? order.createdBy
              : "-",
          Company: order.company || "-",
          Transporter: order.transporter || "-",
          "Transporter Details": order.transporterDetails || "-",
          "Shipping Address": order.shippingAddress || "-",
          "Billing Address": order.billingAddress || "-",
          "Docket No": order.docketNo || "-",
          "Dispatch From": order.dispatchFrom || "-",
          "Dispatch Date": order.dispatchDate
            ? new Date(order.dispatchDate).toLocaleDateString("en-GB")
            : "-",
          "Receipt Date": order.receiptDate
            ? new Date(order.receiptDate).toLocaleDateString("en-GB")
            : "-",
          "Invoice No": order.invoiceNo || "-",
          "Invoice Date": order.invoiceDate
            ? new Date(order.invoiceDate).toLocaleDateString("en-GB")
            : "-",
          Remarks: order.remarks || "-",
        };
      });

      // Create worksheet from exportData
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Orders");

      // Auto-size columns (approximate)
      const colWidths = Object.keys(exportData[0] || {}).map((key, i) => {
        const maxLength = Math.max(
          key.length,
          ...exportData.map((row) => String(row[key] || "").length)
        );
        return { wch: Math.min(maxLength + 2, 50) };
      });
      worksheet["!cols"] = colWidths;

      // Generate Excel file and trigger download
      XLSX.writeFile(
        workbook,
        `filtered_orders_${new Date().toISOString().slice(0, 10)}.xlsx`
      );
      toast.success(`Successfully exported ${totalResults} filtered orders!`);
    } catch (error) {
      console.error("Error exporting filtered orders:", error);
      toast.error("Failed to export filtered orders!");
    }
  };

  const isOrderComplete = (order) => {
    const requiredFields = [
      "soDate",
      "dispatchFrom",
      "name",
      "city",
      "state",
      "pinCode",
      "contactNo",
      "customername",
      "customerEmail",
      "total",
      "paymentCollected",
      "paymentMethod",
      "paymentDue",
      "freightcs",
      "orderType",
      "installation",
      "salesPerson",
      "report",
      "shippingAddress",
      "billingAddress",
      "company",
      "transporter",
      "transporterDetails",
      "docketNo",
      "sostatus",
      "invoiceNo",
      "invoiceDate",
      "gstno",
      "freightstatus",
      "remarks",
      "fulfillingStatus",
      "remarksByProduction",
      "remarksByAccounts",
      "billNumber",
      "completionStatus",
      "paymentReceived",
      "installationStatus",
      "dispatchStatus",
    ];

    const areFieldsComplete = requiredFields.every((field) => {
      const value = order[field];
      return (
        value !== undefined &&
        value !== null &&
        (value !== "" || value === 0 || value === "N/A" || value === false)
      );
    });

    const areProductsComplete =
      order.products &&
      order.products.length > 0 &&
      order.products.every((product) => {
        return (
          product.productType &&
          product.productType.trim() !== "" &&
          product.qty !== undefined &&
          product.qty > 0 &&
          product.unitPrice !== undefined &&
          product.unitPrice >= 0 &&
          product.size &&
          product.spec &&
          product.gst !== undefined
        );
      });

    return areFieldsComplete && areProductsComplete;
  };

  return (
    <>
      <div
        style={{
          background: "linear-gradient(135deg, #2575fc, #6a11cb)",
          padding: "25px 40px",
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Form.Control
          type="text"
          placeholder="Search Orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            maxWidth: "450px",
            padding: "14px 25px",
            borderRadius: "30px",
            border: "none",
            background: "rgba(255,255,255,0.95)",
            boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
            fontSize: "1.1rem",
            fontWeight: "500",
            transition: "all 0.4s ease",
          }}
          onFocus={(e) => {
            e.target.style.boxShadow = "0 0 20px rgba(255,255,255,0.8)";
            e.target.style.transform = "scale(1.02)";
          }}
          onBlur={(e) => {
            e.target.style.boxShadow = "0 5px 15px rgba(0,0,0,0.2)";
            e.target.style.transform = "scale(1)";
          }}
        />

        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
          <DatePickerWrapper>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              placeholderText="Start Date"
              dateFormat="dd/MM/yyyy"
              isClearable
            />
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              placeholderText="End Date"
              dateFormat="dd/MM/yyyy"
              isClearable
            />
          </DatePickerWrapper>

          <Dropdown>
            <Dropdown.Toggle
              style={{
                background: "linear-gradient(135deg, #2575fc, #6a11cb)",
                border: "none",
                padding: "12px 25px",
                borderRadius: "30px",
                color: "white",
                fontWeight: "600",
                fontSize: "1rem",
                boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
                transition: "all 0.4s ease",
              }}
              onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
            >
              {approvalFilter === "All" ? "Approval Status" : approvalFilter}
            </Dropdown.Toggle>
            <Dropdown.Menu
              style={{
                borderRadius: "15px",
                boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                background: "white",
                border: "none",
                padding: "10px",
              }}
            >
              {[
                "All",
                "Approved",
                "Accounts Approved",
                "Pending for Approval",
              ].map((option) => (
                <Dropdown.Item
                  key={option}
                  onClick={() => setApprovalFilter(option)}
                  style={{
                    padding: "10px 20px",
                    color: "#1e3a8a",
                    fontWeight: "500",
                    transition: "background 0.3s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.background = "rgba(37,117,252,0.1)")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.background = "transparent")
                  }
                >
                  {option}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>

          <Button
            onClick={handleReset}
            style={{
              background: "linear-gradient(135deg, #2575fc, #6a11cb)",
              border: "none",
              padding: "12px 25px",
              borderRadius: "30px",
              color: "white",
              fontWeight: "600",
              fontSize: "1rem",
              boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.4s ease",
            }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            Reset <ArrowRight size={18} />
          </Button>
        </div>
      </div>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #e6f0fa, #f3e8ff)",
          padding: "30px",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "15px",
            marginBottom: "40px",
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
          {userRole === "Admin" && (
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
              Total Product Quantity: {productQuantity}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "25px",
            marginBottom: "40px",
            flexWrap: "wrap",
          }}
        >
          {userRole === "Admin" && (
            <label
              style={{
                background: "linear-gradient(135deg, #2575fc, #6a11cb)",
                color: "white",
                padding: "15px 30px",
                borderRadius: "35px",
                fontWeight: "600",
                fontSize: "1.1rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
                transition: "all 0.4s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "scale(1.05)";
                e.target.style.boxShadow = "0 12px 30px rgba(0,0,0,0.3)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "scale(1)";
                e.target.style.boxShadow = "0 8px 20px rgba(0,0,0,0.25)";
              }}
            >
              <span style={{ fontSize: "1.3rem" }}>⬅</span> Bulk Upload
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
            </label>
          )}

          <Button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              background: "linear-gradient(135deg, #2575fc, #6a11cb)",
              border: "none",
              padding: "15px 30px",
              borderRadius: "35px",
              color: "white",
              fontWeight: "600",
              fontSize: "1.1rem",
              boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              transition: "all 0.4s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.05)";
              e.target.style.boxShadow = "0 12px 30px rgba(0,0,0,0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "0 8px 20px rgba(0,0,0,0.25)";
            }}
          >
            <span style={{ fontSize: "1.3rem" }}>+</span> Add Entry
          </Button>

          <Button
            onClick={handleExport}
            style={{
              background: "linear-gradient(135deg, #2575fc, #6a11cb)",
              border: "none",
              padding: "15px 30px",
              borderRadius: "35px",
              color: "white",
              fontWeight: "600",
              fontSize: "1.1rem",
              boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              transition: "all 0.4s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.05)";
              e.target.style.boxShadow = "0 12px 30px rgba(0,0,0,0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "0 8px 20px rgba(0,0,0,0.25)";
            }}
          >
            <span style={{ fontSize: "1.3rem" }}>➔</span> Export Orders
          </Button>
        </div>

        {isAddModalOpen && (
          <AddEntry
            onSubmit={handleAddEntry}
            onClose={() => setIsAddModalOpen(false)}
          />
        )}
        {isViewModalOpen && (
          <ViewEntry
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            entry={selectedOrder}
          />
        )}
        {isDeleteModalOpen && (
          <DeleteModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onDelete={handleDelete}
            itemId={selectedOrder?._id}
          />
        )}
        {isEditModalOpen && (
          <EditEntry
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onEntryUpdated={handleEntryUpdated}
            entryToEdit={selectedOrder}
          />
        )}

        <div
          style={{
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            maxHeight: "600px",
            overflowY: "auto",
            overflowX: "auto",
            scrollbarWidth: "thin",
            scrollbarColor: "#2575fc #e6f0fa",
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
                color: "white",
                position: "sticky",
                top: 0,
                zIndex: 2,
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
              }}
            >
              <tr>
                {[
                  "Seq No",
                  "Customer Name",
                  "Product Details",
                  "Unit Price",
                  "Qty",
                  "Freight Charges",
                  "Freight Status",
                  "GST",
                  "Total",
                  "Order ID",
                  "SO Date",
                  "Approval Status",
                  "City",
                  "State",
                  "Pin Code",
                  "Contact Person Name",
                  "Contact No",
                  "Customer Email",
                  "Order Type",
                  "Model Nos",
                  "Serial Nos",
                  "Product Type",
                  "Size",
                  "Spec",
                  "Payment Collected",
                  "Payment Method",
                  "Payment Due",
                  "Installation",
                  "Sales Person",
                  "Created By",
                  "Company",
                  "Transporter",
                  "Transporter Details",
                  "Shipping Address",
                  "Billing Address",
                  "Docket No",
                  "Dispatch From",
                  "Dispatch Date",
                  "Receipt Date",
                  "Invoice No",
                  "Invoice Date",
                  "Remarks",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    style={{
                      padding: "18px 15px",
                      fontSize: "0.95rem",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      borderBottom: "2px solid rgba(255,255,255,0.2)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) => {
                  const complete = isOrderComplete(order);
                  const firstProduct =
                    order.products && order.products[0]
                      ? order.products[0]
                      : {};
                  const productDetails = order.products
                    ? order.products
                        .map((p) => `${p.productType} (${p.qty})`)
                        .join(", ")
                    : "-";
                  const totalUnitPrice = order.products
                    ? order.products.reduce(
                        (sum, p) => sum + (p.unitPrice || 0) * (p.qty || 0),
                        0
                      )
                    : 0;
                  const totalQty = order.products
                    ? order.products.reduce((sum, p) => sum + (p.qty || 0), 0)
                    : 0;
                  const gstValues = order.products
                    ? order.products
                        .map((p) => `${p.gst}%`)
                        .filter(Boolean)
                        .join(", ")
                    : "-";
                  const canEditDelete =
                    userRole === "Admin" ||
                    (userRole === "Sales" && order.createdBy?._id === userId);

                  return (
                    <tr
                      key={order._id || index}
                      style={{
                        backgroundColor: complete ? "#ffffff" : "#f3e8ff",
                        transition: "all 0.3s ease",
                        borderBottom: "1px solid #e6f0fa",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = complete
                          ? "#f0f7ff"
                          : "#ede4ff")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = complete
                          ? "#ffffff"
                          : "#f3e8ff")
                      }
                    >
                      <td
                        style={{
                          padding: "15px",
                          textAlign: "center",
                          fontWeight: "500",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={`${index + 1}`}
                      >
                        {index + 1}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={order.customername || "-"}
                      >
                        {order.customername || "-"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
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
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={`₹${totalUnitPrice.toFixed(2) || "0.00"}`}
                      >
                        ₹{totalUnitPrice.toFixed(2) || "0.00"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={totalQty || "-"}
                      >
                        {totalQty || "-"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={order.freightcs || "-"}
                      >
                        {order.freightcs || "-"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={order.freightstatus || "-"}
                      >
                        {order.freightstatus || "-"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={gstValues}
                      >
                        {gstValues}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={`₹${order.total?.toFixed(2) || "0.00"}`}
                      >
                        ₹{order.total?.toFixed(2) || "0.00"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={order.orderId || "-"}
                      >
                        {order.orderId || "-"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={
                          order.soDate
                            ? new Date(order.soDate).toLocaleDateString("en-GB")
                            : "-"
                        }
                      >
                        {order.soDate
                          ? new Date(order.soDate).toLocaleDateString("en-GB")
                          : "-"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={order.sostatus || "-"}
                      >
                        <Badge
                          bg={
                            order.sostatus === "Pending for Approval"
                              ? "warning"
                              : order.sostatus === "Approved"
                              ? "success"
                              : order.sostatus === "Accounts Approved"
                              ? "info"
                              : "secondary"
                          }
                          style={{
                            padding: "6px 12px",
                            fontSize: "0.9rem",
                            display: "inline-block",
                            width: "100%",
                            textAlign: "center",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {order.sostatus || "-"}
                        </Badge>
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={order.city || "-"}
                      >
                        {order.city || "-"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={order.state || "-"}
                      >
                        {order.state || "-"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={order.pinCode || "-"}
                      >
                        {order.pinCode || "-"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={order.name || "-"}
                      >
                        {order.name || "-"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={order.contactNo || "-"}
                      >
                        {order.contactNo || "-"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={order.customerEmail || "-"}
                      >
                        {order.customerEmail || "-"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={order.orderType || "-"}
                      >
                        {order.orderType || "-"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={
                          firstProduct.modelNos?.length > 0
                            ? firstProduct.modelNos.join(", ")
                            : "-"
                        }
                      >
                        {firstProduct.modelNos?.length > 0
                          ? firstProduct.modelNos.join(", ")
                          : "-"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={
                          firstProduct.serialNos?.length > 0
                            ? firstProduct.serialNos.join(", ")
                            : "-"
                        }
                      >
                        {firstProduct.serialNos?.length > 0
                          ? firstProduct.serialNos.join(", ")
                          : "-"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={firstProduct.productType || "-"}
                      >
                        {firstProduct.productType || "-"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={firstProduct.size || "-"}
                      >
                        {firstProduct.size || "-"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={firstProduct.spec || "-"}
                      >
                        {firstProduct.spec || "-"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={formatCurrency(order.paymentCollected) || "-"}
                      >
                        {formatCurrency(order.paymentCollected) || "-"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={order.paymentMethod || "-"}
                      >
                        {order.paymentMethod || "-"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={formatCurrency(order.paymentDue) || "-"}
                      >
                        {formatCurrency(order.paymentDue) || "-"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={order.installation || "-"}
                      >
                        {order.installation || "-"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={order.salesPerson || "-"}
                      >
                        {order.salesPerson || "-"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={
                          order.createdBy && typeof order.createdBy === "object"
                            ? order.createdBy.username || "Unknown"
                            : typeof order.createdBy === "string"
                            ? order.createdBy
                            : "-"
                        }
                      >
                        {order.createdBy && typeof order.createdBy === "object"
                          ? order.createdBy.username || "Unknown"
                          : typeof order.createdBy === "string"
                          ? order.createdBy
                          : "-"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={order.company || "-"}
                      >
                        {order.company || "-"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={order.transporter || "-"}
                      >
                        {order.transporter || "-"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={order.transporterDetails || "-"}
                      >
                        {order.transporterDetails || "-"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "200px",
                        }}
                        title={order.shippingAddress || "-"}
                      >
                        {order.shippingAddress || "-"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "200px",
                        }}
                        title={order.billingAddress || "-"}
                      >
                        {order.billingAddress || "-"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={order.docketNo || "-"}
                      >
                        {order.docketNo || "-"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={order.dispatchFrom || "-"}
                      >
                        {order.dispatchFrom || "-"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={
                          order.dispatchDate
                            ? new Date(order.dispatchDate).toLocaleDateString()
                            : "-"
                        }
                      >
                        {order.dispatchDate
                          ? new Date(order.dispatchDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={
                          order.receiptDate
                            ? new Date(order.receiptDate).toLocaleDateString()
                            : "-"
                        }
                      >
                        {order.receiptDate
                          ? new Date(order.receiptDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={order.invoiceNo || "-"}
                      >
                        {order.invoiceNo || "-"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={
                          order.invoiceDate
                            ? new Date(order.invoiceDate).toLocaleDateString()
                            : "-"
                        }
                      >
                        {order.invoiceDate
                          ? new Date(order.invoiceDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          height: "40px",
                          lineHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={order.remarks || "-"}
                      >
                        {order.remarks || "-"}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          textAlign: "center",
                          height: "40px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <div style={{ display: "flex", gap: "10px" }}>
                          <Button
                            variant="primary"
                            onClick={() => handleViewClick(order)}
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              padding: "0",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <FaEye />
                          </Button>
                          {canEditDelete && (
                            <>
                              <button
                                className="editBtn"
                                onClick={() => handleEditClick(order)}
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  borderRadius: "50%",
                                  padding: "0",
                                  background: "#6b7280",
                                  border: "none",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  zIndex: "1",
                                }}
                              >
                                <svg
                                  height="1em"
                                  viewBox="0 0 512 512"
                                  fill="#ffffff"
                                >
                                  <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z" />
                                </svg>
                              </button>
                              <button
                                className="bin-button"
                                onClick={() => handleDeleteClick(order)}
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  borderRadius: "50%",
                                  padding: "0",
                                  background: "#ef4444",
                                  border: "none",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <svg
                                  className="bin-top"
                                  viewBox="0 0 39 7"
                                  fill="none"
                                  style={{ width: "20px", height: "5px" }}
                                >
                                  <line
                                    y1="5"
                                    x2="39"
                                    y2="5"
                                    stroke="white"
                                    strokeWidth="4"
                                  />
                                  <line
                                    x1="12"
                                    y1="1.5"
                                    x2="26.0357"
                                    y2="1.5"
                                    stroke="white"
                                    strokeWidth="3"
                                  />
                                </svg>
                                <svg
                                  className="bin-bottom"
                                  viewBox="0 0 33 39"
                                  fill="none"
                                  style={{ width: "20px", height: "20px" }}
                                >
                                  <mask id="path-1-inside-1_8_19" fill="white">
                                    <path d="M0 0H33V35C33 37.2091 31.2091 39 29 39H4C1.79086 39 0 37.2091 0 35V0Z" />
                                  </mask>
                                  <path
                                    d="M0 0H33H0ZM37 35C37 39.4183 33.4183 43 29 43H4C-0.418278 43 -4 39.4183 -4 35H4H29H37ZM4 43C-0.418278 43 -4 39.4183 -4 35V0H4V35V43ZM37 0V35C37 39.4183 33.4183 43 29 43V35V0H37Z"
                                    fill="white"
                                    mask="url(#path-1-inside-1_8_19)"
                                  />
                                  <path
                                    d="M12 6L12 29"
                                    stroke="white"
                                    strokeWidth="4"
                                  />
                                  <path
                                    d="M21 6V29"
                                    stroke="white"
                                    strokeWidth="4"
                                  />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="40"
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      fontStyle: "italic",
                      color: "#6b7280",
                      height: "40px",
                      lineHeight: "40px",
                    }}
                  >
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <footer
        style={{
          margin: 0,
          textAlign: "center",
          color: "white",
          padding: "20px",
          background: "linear-gradient(135deg, #2575fc, #6a11cb)",
          width: "100vw",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          fontSize: "1rem",
          fontWeight: "500",
          bottom: 0,
          left: 0,
          boxSizing: "border-box",
        }}
      >
        © 2025 Sales Order Management. All rights reserved.
      </footer>
    </>
  );
};

export default Sales;
