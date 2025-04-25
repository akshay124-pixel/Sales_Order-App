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
import "react-datepicker/dist/react-datepicker.css";

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

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, approvalFilter, startDate, endDate]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        "https://sales-order-server.onrender.com/api/get-orders"
      );
      setOrders(response.data);
      toast.success("Orders fetched successfully!");
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders!");
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];
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

          String(order.paymentCollected || ""), // Convert to string
          order.paymentMethod,
          String(order.paymentDue || ""), // Convert to string
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
        return searchableFields.some(
          (value) =>
            value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }
    if (approvalFilter !== "All") {
      filtered = filtered.filter((order) => order.sostatus === approvalFilter);
    }

    if (startDate || endDate) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.soDate);
        return (
          (!startDate || orderDate >= startDate) &&
          (!endDate || orderDate <= endDate)
        );
      });
    }
    setFilteredOrders(filtered);
  };

  const handleReset = () => {
    setApprovalFilter("All");
    setSearchTerm("");
    setStartDate(null);
    setEndDate(null);
    toast.info("Filters reset!");
  };

  const handleAddEntry = (newEntry) => {
    setOrders((prevOrders) => [...prevOrders, newEntry]);
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
    setOrders((prevOrders) =>
      prevOrders.filter((order) => !deletedIds.includes(order._id))
    );
    setIsDeleteModalOpen(false);
    toast.success("Order deleted successfully!");
  };

  const handleEntryUpdated = async (updatedEntry) => {
    try {
      const response = await axios.put(
        `https://sales-order-server.onrender.com/api/edit/${updatedEntry._id}`,
        updatedEntry
      );
      const updatedOrder = response.data.data || response.data;
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
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
            orderType: String(entry.ordertype || "Private order").trim(),
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

        console.log("Sending entries:", JSON.stringify(newEntries, null, 2));

        const response = await axios.post(
          "https://sales-order-server.onrender.com/api/bulk-orders",
          newEntries,
          { headers: { "Content-Type": "application/json" } }
        );

        setOrders((prevOrders) => [...prevOrders, ...response.data.data]);
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

  const handleExport = async () => {
    try {
      const response = await axios.get(
        "https://sales-order-server.onrender.com/api/export",
        {
          responseType: "arraybuffer",
        }
      );
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `orders_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast.success("Orders exported successfully!");
    } catch (error) {
      console.error("Error exporting orders:", error);
      toast.error("Failed to export orders!");
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
        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "25px",
            marginBottom: "40px",
            flexWrap: "wrap",
          }}
        >
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

        {/* Modals */}
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

        {/* Table */}
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
                  "Freight Charges ",
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
                        }}
                      >
                        {index + 1}
                      </td>
                      <td style={{ padding: "15px" }}>
                        {order.customername || "-"}
                      </td>
                      <td style={{ padding: "15px" }}>{productDetails}</td>
                      <td style={{ padding: "15px" }}>
                        ₹{totalUnitPrice.toFixed(2) || "0.00"}
                      </td>
                      <td style={{ padding: "15px" }}>{totalQty || "-"}</td>
                      <td style={{ padding: "15px" }}>
                        {order.freightcs || "-"}
                      </td>
                      <td style={{ padding: "15px" }}>{gstValues}</td>
                      <td style={{ padding: "15px" }}>
                        ₹{order.total?.toFixed(2) || "0.00"}
                      </td>

                      <td style={{ padding: "15px" }}>
                        {order.orderId || "-"}
                      </td>
                      <td style={{ padding: "15px" }}>
                        {order.soDate
                          ? new Date(order.soDate).toLocaleDateString()
                          : "-"}
                      </td>

                      <td style={{ padding: "15px" }}>
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
                          style={{ padding: "6px 12px", fontSize: "0.9rem" }}
                        >
                          {order.sostatus || "-"}
                        </Badge>
                      </td>
                      <td style={{ padding: "15px" }}>{order.city || "-"}</td>
                      <td style={{ padding: "15px" }}>{order.state || "-"}</td>
                      <td style={{ padding: "15px" }}>
                        {order.pinCode || "-"}
                      </td>
                      <td style={{ padding: "15px" }}>{order.name || "-"}</td>
                      <td style={{ padding: "15px" }}>
                        {order.contactNo || "-"}
                      </td>
                      <td style={{ padding: "15px" }}>
                        {order.customerEmail || "-"}
                      </td>
                      <td style={{ padding: "15px" }}>
                        {order.orderType || "-"}
                      </td>
                      <td style={{ padding: "15px" }}>
                        {firstProduct.modelNos?.length > 0
                          ? firstProduct.modelNos.join(", ")
                          : "-"}
                      </td>
                      <td style={{ padding: "15px" }}>
                        {firstProduct.serialNos?.length > 0
                          ? firstProduct.serialNos.join(", ")
                          : "-"}
                      </td>
                      <td style={{ padding: "15px" }}>
                        {firstProduct.productType || "-"}
                      </td>
                      <td style={{ padding: "15px" }}>
                        {firstProduct.size || "-"}
                      </td>
                      <td style={{ padding: "15px" }}>
                        {firstProduct.spec || "-"}
                      </td>
                      <td style={{ padding: "15px" }}>
                        {formatCurrency(order.paymentCollected)}
                      </td>
                      <td style={{ padding: "15px" }}>
                        {order.paymentMethod || "-"}
                      </td>
                      <td style={{ padding: "15px" }}>
                        {formatCurrency(order.paymentDue)}
                      </td>

                      <td style={{ padding: "15px" }}>
                        {order.installation || "-"}
                      </td>
                      <td style={{ padding: "15px" }}>
                        {order.salesPerson || "-"}
                      </td>
                      <td style={{ padding: "15px" }}>
                        {order.company || "-"}
                      </td>
                      <td style={{ padding: "15px" }}>
                        {order.transporter || "-"}
                      </td>
                      <td style={{ padding: "15px" }}>
                        {order.transporterDetails || "-"}
                      </td>
                      <td style={{ padding: "15px" }}>
                        {order.shippingAddress || "-"}
                      </td>
                      <td style={{ padding: "15px" }}>
                        {order.billingAddress || "-"}
                      </td>
                      <td style={{ padding: "15px" }}>
                        {order.docketNo || "-"}
                      </td>
                      <td style={{ padding: "15px" }}>
                        {order.dispatchFrom || "-"}
                      </td>
                      <td style={{ padding: "15px" }}>
                        {order.dispatchDate
                          ? new Date(order.dispatchDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td style={{ padding: "15px" }}>
                        {order.receiptDate
                          ? new Date(order.receiptDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td style={{ padding: "15px" }}>
                        {order.invoiceNo || "-"}
                      </td>
                      <td style={{ padding: "15px" }}>
                        {order.invoiceDate
                          ? new Date(order.invoiceDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td style={{ padding: "15px" }}>
                        {order.remarks || "-"}
                      </td>
                      <td style={{ padding: "15px" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            justifyContent: "center",
                          }}
                        >
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
                            <FaEye style={{ marginBottom: "2px" }} />
                          </Button>
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
                              <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"></path>
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
                              ></line>
                              <line
                                x1="12"
                                y1="1.5"
                                x2="26.0357"
                                y2="1.5"
                                stroke="white"
                                strokeWidth="3"
                              ></line>
                            </svg>
                            <svg
                              className="bin-bottom"
                              viewBox="0 0 33 39"
                              fill="none"
                              style={{ width: "20px", height: "20px" }}
                            >
                              <mask id="path-1-inside-1_8_19" fill="white">
                                <path d="M0 0H33V35C33 37.2091 31.2091 39 29 39H4C1.79086 39 0 37.2091 0 35V0Z"></path>
                              </mask>
                              <path
                                d="M0 0H33H0ZM37 35C37 39.4183 33.4183 43 29 43H4C-0.418278 43 -4 39.4183 -4 35H4H29H37ZM4 43C-0.418278 43 -4 39.4183 -4 35V0H4V35V43ZM37 0V35C37 39.4183 33.4183 43 29 43V35V0H37Z"
                                fill="white"
                                mask="url(#path-1-inside-1_8_19)"
                              ></path>
                              <path
                                d="M12 6L12 29"
                                stroke="white"
                                strokeWidth="4"
                              ></path>
                              <path
                                d="M21 6V29"
                                stroke="white"
                                strokeWidth="4"
                              ></path>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="45"
                    style={{
                      padding: "50px",
                      textAlign: "center",
                      color: "#6a11cb",
                      fontSize: "1.3rem",
                      fontWeight: "500",
                    }}
                  >
                    No Data Available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Custom Scrollbar Styling */}
        <style jsx>{`
          ::-webkit-scrollbar {
            width: 10px;
            height: 10px;
          }
          ::-webkit-scrollbar-track {
            background: #e6f0fa;
            borderradius: 5px;
          }
          ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #2575fc, #6a11cb);
            borderradius: 5px;
            transition: all 0.3s ease;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #6a11cb, #2575fc);
          }
        `}</style>
      </div>
      <footer
        style={{
          margin: 0, // Remove all margins to eliminate gaps
          textAlign: "center",
          color: "white",
          padding: "20px",
          background: "linear-gradient(135deg, #2575fc, #6a11cb)",
          width: "100vw", // Full viewport width
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          fontSize: "1rem",
          fontWeight: "500",

          bottom: 0, // Zero gap from bottom
          left: 0, // Align to left edge
          boxSizing: "border-box", // Ensure padding doesn't affect width
        }}
      >
        © 2025 Sales Order Management. All rights reserved.
      </footer>
    </>
  );
};

export default Sales;
