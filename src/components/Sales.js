import React, { useState, useEffect } from "react";
import { FaEye } from "react-icons/fa";
import { Button, Form, Dropdown } from "react-bootstrap";
import ViewEntry from "./ViewEntry";
import DeleteModal from "./Delete";
import EditEntry from "./EditEntry";
import AddEntry from "./AddEntry";
import axios from "axios";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import moment from "moment";
import { Badge } from "react-bootstrap";
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
  const [statusFilter, setStatusFilter] = useState("All");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, approvalFilter, statusFilter, startDate, endDate]);

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
      filtered = filtered.filter((order) =>
        Object.values(order).some(
          (value) =>
            value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    if (approvalFilter !== "All") {
      filtered = filtered.filter((order) => order.sostatus === approvalFilter);
    }
    if (statusFilter !== "All") {
      filtered = filtered.filter((order) => order.status === statusFilter);
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
    setStatusFilter("All");
    setApprovalFilter("All");
    setSearchTerm("");
    setStartDate(null);
    setEndDate(null);
    toast.info("Filters reset!");
  };

  const handleAddEntry = async (newEntry) => {
    try {
      const response = await axios.post(
        "https://sales-order-server.onrender.com/api/add-order",
        newEntry
      );
      setOrders((prevOrders) => [...prevOrders, response.data]);
      setIsAddModalOpen(false);
      toast.success("Order added successfully!");
    } catch (error) {
      console.error("Error adding order:", error);
      toast.error("Failed to add order!");
    }
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

  const handleEntryUpdated = async (updatedEntry) => {
    try {
      const response = await axios.put(
        `https://sales-order-server.onrender.com/api/update-order/${updatedEntry._id}`,
        updatedEntry
      );
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedEntry._id ? response.data : order
        )
      );
      setIsEditModalOpen(false);
      toast.success("Order updated successfully!");
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order!");
    }
  };

  const handleDelete = async (deletedIds) => {
    try {
      await axios.delete(
        "https://sales-order-server.onrender.com/api/delete-orders",
        {
          data: { ids: deletedIds },
        }
      );
      setOrders((prevOrders) =>
        prevOrders.filter((order) => !deletedIds.includes(order._id))
      );
      setIsDeleteModalOpen(false);
      toast.success("Order deleted successfully!");
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order!");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          raw: false,
        });

        const headers = parsedData[0];
        const rows = parsedData.slice(1);

        const parseDate = (dateValue) => {
          if (!dateValue) return null;
          if (!isNaN(dateValue) && typeof dateValue === "number") {
            const date = XLSX.SSF.parse_date_code(dateValue);
            return moment({
              year: date.y,
              month: date.m - 1,
              day: date.d,
            }).format("YYYY-MM-DD");
          }
          const formats = [
            "YYYY-MM-DD",
            "DD/MM/YYYY",
            "MM/DD/YYYY",
            "DD/M/YYYY",
            "M/D/YYYY",
          ];
          const parsed = moment(dateValue, formats, true);
          return parsed.isValid() ? parsed.format("YYYY-MM-DD") : null;
        };

        const newEntries = rows.map((row) => {
          const entry = {};
          headers.forEach((header, index) => {
            entry[header.toLowerCase().replace(/\s+/g, "")] = row[index];
          });

          const soDate = parseDate(entry.sodate);
          return {
            soDate,
            serialno: String(entry.serialno || "").trim(),
            committedDate: parseDate(entry.committeddate),
            dispatchFrom: String(entry.dispatchfrom || "").trim(),
            status: String(entry.status || "Pending").trim(),
            dispatchDate: parseDate(entry.dispatchdate),
            partyAndAddress: String(entry.partyandaddress || "").trim(),
            city: String(entry.city || "").trim(),
            state: String(entry.state || "").trim(),
            pinCode: String(entry.pincode || "").trim(),
            name: String(entry.name || "").trim(),
            contactNo: String(entry.contactno || "").trim(),
            customerEmail: String(entry.customeremail || "").trim(),
            modelNo: String(entry.modelno || "").trim(),
            productType: String(entry.producttype || "").trim(),
            size: String(entry.size || "").trim(),
            spec: String(entry.spec || "").trim(),
            productDetails: String(entry.productdetails || "").trim(),
            qty: Number(entry.qty) || 0,
            unitPrice: Number(entry.unitprice) || 0,
            gst: Number(entry.gst) || 0,
            total: Number(entry.total) || 0,
            paymentTerms: String(entry.paymentterms || "").trim(),
            amount2: Number(entry.amount2) || 0,
            freightcs: String(entry.freightcs || "").trim(),
            installation: String(entry.installation || "").trim(),
            salesPerson: String(entry.salesperson || "").trim(),
            shippingAddress: String(entry.shippingaddress || "").trim(),
            billingAddress: String(entry.billingaddress || "").trim(),
            company: String(entry.company || "").trim(),
            transporter: String(entry.transporter || "").trim(),
            transporterDetails: String(entry.transporterdetails || "").trim(),
            docketNo: String(entry.docketno || "").trim(),
            receiptDate: parseDate(entry.receiptdate),
            sostatus: String(entry.sostatus || "Pending for Approval").trim(),
            invoiceNo: String(entry.invoiceno || ""),
            invoiceDate: parseDate(entry.invoicedate),
            remarks: String(entry.remarks || "").trim(),
            fulfillingStatus: String(entry.fulfillingstatus || "").trim(),
            remarksByProduction: String(entry.remarksbyproduction || "").trim(),
            billNumber: String(entry.billnumber || "").trim(),
            completionStatus: String(entry.completionstatus || "").trim(),
            fulfillmentDate: parseDate(entry.fulfillmentdate),
            remarksByAccounts: String(entry.remarksbyaccounts || "").trim(),
            paymentReceived: String(entry.paymentreceived || "").trim(),
          };
        });

        const validEntries = newEntries.filter(
          (entry) => entry.soDate && !isNaN(entry.qty)
        );
        if (validEntries.length === 0) {
          toast.error(
            "No valid entries found with required fields (soDate, qty)."
          );
          return;
        }

        const response = await axios.post(
          "https://sales-order-server.onrender.com/api/bulk-orders",
          validEntries,
          { headers: { "Content-Type": "application/json" } }
        );

        setOrders((prevOrders) => [...prevOrders, ...response.data.data]);
        toast.success("Bulk orders uploaded successfully!");
      } catch (error) {
        console.error("Error uploading entries:", error);
        toast.error(
          `${error.response?.data?.message || "Failed to upload entries"}: ${
            error.response?.data?.error || error.message
          }`
        );
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
    const allFields = Object.keys(order).filter(
      (key) => key !== "_id" && key !== "__v"
    );
    return allFields.every((field) => {
      const value = order[field];
      return (
        value !== undefined &&
        value !== null &&
        (value !== "" || value === 0 || value === "-")
      );
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e6f0fa, #f3e8ff)",
        padding: "30px",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* Header Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #2575fc, #6a11cb)",
          padding: "25px 40px",
          borderRadius: "20px",
          marginBottom: "40px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
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
              {["All", "Approved", "Pending for Approval"].map((option) => (
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
              {statusFilter === "All" ? "Order Status" : statusFilter}
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
                "Pending",
                "Delivered",
                "Hold",
                "Order Canceled",
                "Dispatched",
                "In Transit",
              ].map((status) => (
                <Dropdown.Item
                  key={status}
                  onClick={() => setStatusFilter(status)}
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
                  {status}
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
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          maxHeight: "500px",
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
                "Contact Person Name",
                "Product Details",
                "Unit Price",
                "Qty",
                "Freight Charges & Status",
                "GST",
                "Total",
                "Party & Address",
                "Order ID",
                "SO Date",
                "Committed Date",
                "Status",
                "Approvel Status",
                "City",
                "State",
                "Pin Code",
                "Contact No",
                "Customer Email",
                "Model No",
                "Serial No",
                "Product Type",
                "Size",
                "Spec",
                "Payment Terms",
                "Amount2",
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
                    <td style={{ padding: "15px" }}>{order.name || "-"}</td>
                    <td style={{ padding: "15px" }}>
                      {order.productDetails || "-"}
                    </td>
                    <td style={{ padding: "15px" }}>
                      ₹{order.unitPrice?.toFixed(2) || "0.00"}
                    </td>
                    <td style={{ padding: "15px" }}>
                      {order.qty !== undefined ? order.qty : "-"}
                    </td>
                    <td style={{ padding: "15px" }}>
                      {order.freightcs || "-"}
                    </td>
                    <td style={{ padding: "15px" }}>
                      {order.gst ? `${order.gst}%` : "-"}
                    </td>
                    <td style={{ padding: "15px" }}>
                      ₹{order.total?.toFixed(2) || "0.00"}
                    </td>
                    <td style={{ padding: "15px" }}>
                      {order.partyAndAddress || "-"}
                    </td>
                    <td style={{ padding: "15px" }}>{order.orderId || "-"}</td>
                    <td style={{ padding: "15px" }}>
                      {order.soDate
                        ? new Date(order.soDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td style={{ padding: "15px" }}>
                      {order.committedDate
                        ? new Date(order.committedDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td style={{ padding: "15px" }}>
                      <Badge
                        bg={
                          order.status === "Pending"
                            ? "warning"
                            : order.status === "Delivered"
                            ? "success"
                            : order.status === "Hold"
                            ? "dark"
                            : order.status === "Order Canceled"
                            ? "danger"
                            : order.status === "Dispatched"
                            ? "primary"
                            : order.status === "In Transit"
                            ? "info"
                            : "secondary"
                        }
                        style={{ padding: "6px 12px", fontSize: "0.9rem" }}
                      >
                        {order.status || "-"}
                      </Badge>
                    </td>
                    <td style={{ padding: "15px" }}>
                      <Badge
                        bg={
                          order.sostatus === "Pending for Approval"
                            ? "warning"
                            : order.sostatus === "Approved"
                            ? "success"
                            : "secondary"
                        }
                        style={{ padding: "6px 12px", fontSize: "0.9rem" }}
                      >
                        {order.sostatus || "-"}
                      </Badge>
                    </td>
                    <td style={{ padding: "15px" }}>{order.city || "-"}</td>
                    <td style={{ padding: "15px" }}>{order.state || "-"}</td>
                    <td style={{ padding: "15px" }}>{order.pinCode || "-"}</td>
                    <td style={{ padding: "15px" }}>
                      {order.contactNo || "-"}
                    </td>
                    <td style={{ padding: "15px" }}>
                      {order.customerEmail || "-"}
                    </td>
                    <td style={{ padding: "15px" }}>{order.modelNo || "-"}</td>
                    <td style={{ padding: "15px" }}>{order.serialno || "-"}</td>
                    <td style={{ padding: "15px" }}>
                      {order.productType || "-"}
                    </td>
                    <td style={{ padding: "15px" }}>{order.size || "-"}</td>
                    <td style={{ padding: "15px" }}>{order.spec || "-"}</td>
                    <td style={{ padding: "15px" }}>
                      {order.paymentTerms || "-"}
                    </td>
                    <td style={{ padding: "15px" }}>
                      ₹{order.amount2?.toFixed(2) || "0.00"}
                    </td>
                    <td style={{ padding: "15px" }}>
                      {order.installation || "-"}
                    </td>
                    <td style={{ padding: "15px" }}>
                      {order.salesPerson || "-"}
                    </td>
                    <td style={{ padding: "15px" }}>{order.company || "-"}</td>
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
                    <td style={{ padding: "15px" }}>{order.docketNo || "-"}</td>
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
                    <td style={{ padding: "15px" }}>{order.remarks || "-"}</td>
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
                  colSpan="43"
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

      {/* Footer */}
      <footer
        style={{
          marginTop: "40px",
          textAlign: "center",
          color: "white",
          padding: "20px",
          background: "linear-gradient(135deg, #2575fc, #6a11cb)",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          fontSize: "1rem",
          fontWeight: "500",
        }}
      >
        © 2025 DataManagement. All rights reserved.
      </footer>

      {/* Custom Scrollbar Styling */}
      <style jsx>{`
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        ::-webkit-scrollbar-track {
          background: #e6f0fa;
          border-radius: 5px;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #2575fc, #6a11cb);
          border-radius: 5px;
          transition: all 0.3s ease;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #6a11cb, #2575fc);
        }
      `}</style>
    </div>
  );
};

export default Sales;
