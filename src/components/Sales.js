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
      const response = await fetch(
        "https://sales-order-server.onrender.com/api/get-orders"
      );
      const data = await response.json();
      setOrders(data);
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

  const handlereset = () => {
    setStatusFilter("All");
    setApprovalFilter("All");
    setSearchTerm("");
  };

  const handleAddEntry = (newEntry) => {
    setOrders((prevOrders) => [...prevOrders, newEntry]);
    setIsAddModalOpen(false);
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

  const handleEntryUpdated = (updatedEntry) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === updatedEntry._id ? updatedEntry : order
      )
    );
    setIsEditModalOpen(false);
  };

  const handleDelete = (deletedIds) => {
    setOrders((prevOrders) =>
      prevOrders.filter((order) => !deletedIds.includes(order._id))
    );
    setIsDeleteModalOpen(false);
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
            status: String(entry.status || "").trim() || "Pending",
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
            shippingAddress: String(entry.shippingAddress || "").trim(),
            billingAddress: String(entry.billingAddress || "").trim(),
            company: String(entry.company || "").trim(),
            transporter: String(entry.transporter || "").trim(),
            transporterDetails: String(entry.transporterdetails || "").trim(),
            docketNo: String(entry.docketno || "").trim(),
            receiptDate: parseDate(entry.receiptdate),
            sostatus: String(entry.sostatus || "Pending for Approval").trim(),
            invoiceNo: Number(entry.invoiceno || 0),
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
        toast.success("Orders uploaded successfully!");
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
      link.download = "orders.xlsx";
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success("Orders exported successfully!");
    } catch (error) {
      console.error("Error exporting orders:", error);
      toast.error("Failed to export orders!");
    }
  };

  const isOrderComplete = (order) => {
    const allFields = Object.keys(order).filter((key) => key !== "_id");
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
        background: "linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)",
        padding: "20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {/* Header Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #2b2d42 0%, #8d5524 100%)",
          padding: "20px 40px",
          borderRadius: "15px",
          marginBottom: "30px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
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
            maxWidth: "400px",
            padding: "12px 20px",
            borderRadius: "25px",
            border: "none",
            background: "rgba(255,255,255,0.95)",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            transition: "all 0.3s ease",
          }}
          onFocus={(e) =>
            (e.target.style.boxShadow = "0 0 15px rgba(255,255,255,0.7)")
          }
          onBlur={(e) =>
            (e.target.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)")
          }
        />

        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
          <Dropdown>
            <Dropdown.Toggle
              style={{
                background: "linear-gradient(135deg, #6b7280, #4b5563)",
                border: "none",
                padding: "10px 20px",
                borderRadius: "25px",
                color: "white",
                fontWeight: "600",
                transition: "all 0.3s ease",
              }}
            >
              {approvalFilter === "All" ? "Approval Status" : approvalFilter}
            </Dropdown.Toggle>
            <Dropdown.Menu
              style={{
                borderRadius: "10px",
                boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
                background: "#fff",
              }}
            >
              {["All", "Approved", "Pending for Approval"].map((option) => (
                <Dropdown.Item
                  key={option}
                  onClick={() => setApprovalFilter(option)}
                  style={{ padding: "8px 20px", color: "#374151" }}
                >
                  {option}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown>
            <Dropdown.Toggle
              style={{
                background: "linear-gradient(135deg, #6b7280, #4b5563)",
                border: "none",
                padding: "10px 20px",
                borderRadius: "25px",
                color: "white",
                fontWeight: "600",
                transition: "all 0.3s ease",
              }}
            >
              {statusFilter === "All" ? "Order Status" : statusFilter}
            </Dropdown.Toggle>
            <Dropdown.Menu
              style={{
                borderRadius: "10px",
                boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
                background: "#fff",
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
                  style={{ padding: "8px 20px", color: "#374151" }}
                >
                  {status}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>

          <Button
            onClick={handlereset}
            style={{
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              border: "none",
              padding: "10px 20px",
              borderRadius: "25px",
              color: "white",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              transition: "all 0.3s ease",
            }}
          >
            Reset <ArrowRight size={16} />
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginBottom: "30px",
          flexWrap: "wrap",
        }}
      >
        {[
          {
            label: "Bulk Upload",
            icon: "⬅",
            onClick: null,
            input: (
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
            ),
          },
          {
            label: "Add Entry",
            icon: "+",
            onClick: () => setIsAddModalOpen(true),
          },
          { label: "Export Orders", icon: "➔", onClick: handleExport },
        ].map((btn, idx) => (
          <label
            key={idx}
            style={{
              background: "linear-gradient(135deg, #3b82f6, #1e3a8a)",
              color: "white",
              padding: "12px 25px",
              borderRadius: "25px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            <span>{btn.icon}</span> {btn.label}
            {btn.input}
          </label>
        ))}
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
          overflowX: "auto",
          background: "#fff",
          borderRadius: "15px",
          boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
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
              background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
              color: "white",
              position: "sticky",
              top: 0,
              zIndex: 1,
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
                    padding: "15px",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    borderBottom: "2px solid rgba(255,255,255,0.2)",
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
                      backgroundColor: complete ? "#ffffff" : "#fef3c7",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = complete
                        ? "#f9fafb"
                        : "#fef9c3")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = complete
                        ? "#ffffff"
                        : "#fef3c7")
                    }
                  >
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      {index + 1}
                    </td>
                    <td style={{ padding: "12px" }}>{order.name || "-"}</td>
                    <td style={{ padding: "12px" }}>
                      {order.productDetails || "-"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      ₹{order.unitPrice?.toFixed(2) || "0.00"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {order.qty !== undefined ? order.qty : "-"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {order.freightcs || "-"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {order.gst ? `${order.gst}%` : "-"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      ₹{order.total?.toFixed(2) || "0.00"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {order.partyAndAddress || "-"}
                    </td>
                    <td style={{ padding: "12px" }}>{order.orderId || "-"}</td>
                    <td style={{ padding: "12px" }}>
                      {order.soDate
                        ? new Date(order.soDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {order.committedDate
                        ? new Date(order.committedDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td style={{ padding: "12px" }}>
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
                      >
                        {order.status || "-"}
                      </Badge>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <Badge
                        bg={
                          order.sostatus === "Pending for Approval"
                            ? "warning"
                            : order.sostatus === "Approved"
                            ? "success"
                            : "secondary"
                        }
                      >
                        {order.sostatus || "-"}
                      </Badge>
                    </td>
                    <td style={{ padding: "12px" }}>{order.city || "-"}</td>
                    <td style={{ padding: "12px" }}>{order.state || "-"}</td>
                    <td style={{ padding: "12px" }}>{order.pinCode || "-"}</td>
                    <td style={{ padding: "12px" }}>
                      {order.contactNo || "-"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {order.customerEmail || "-"}
                    </td>
                    <td style={{ padding: "12px" }}>{order.modelNo || "-"}</td>
                    <td style={{ padding: "12px" }}>{order.serialno || "-"}</td>
                    <td style={{ padding: "12px" }}>
                      {order.productType || "-"}
                    </td>
                    <td style={{ padding: "12px" }}>{order.size || "-"}</td>
                    <td style={{ padding: "12px" }}>{order.spec || "-"}</td>
                    <td style={{ padding: "12px" }}>
                      {order.paymentTerms || "-"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      ₹{order.amount2?.toFixed(2) || "0.00"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {order.installation || "-"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {order.salesPerson || "-"}
                    </td>
                    <td style={{ padding: "12px" }}>{order.company || "-"}</td>
                    <td style={{ padding: "12px" }}>
                      {order.transporter || "-"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {order.transporterDetails || "-"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {order.shippingAddress || "-"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {order.billingAddress || "-"}
                    </td>
                    <td style={{ padding: "12px" }}>{order.docketNo || "-"}</td>
                    <td style={{ padding: "12px" }}>
                      {order.dispatchFrom || "-"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {order.dispatchDate
                        ? new Date(order.dispatchDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {order.receiptDate
                        ? new Date(order.receiptDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {order.invoiceNo || "-"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {order.invoiceDate
                        ? new Date(order.invoiceDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td style={{ padding: "12px" }}>{order.remarks || "-"}</td>
                    <td style={{ padding: "12px" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          justifyContent: "center",
                        }}
                      >
                        <Button
                          variant="primary"
                          onClick={() => handleViewClick(order)}
                          style={{
                            padding: "8px",
                            borderRadius: "50%",
                            width: "36px",
                            height: "36px",
                          }}
                        >
                          <FaEye />
                        </Button>
                        <Button
                          variant="warning"
                          onClick={() => handleEditClick(order)}
                          style={{
                            padding: "8px",
                            borderRadius: "50%",
                            width: "36px",
                            height: "36px",
                          }}
                        >
                          <svg height="1em" viewBox="0 0 512 512">
                            <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"></path>
                          </svg>
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDeleteClick(order)}
                          style={{
                            padding: "8px",
                            borderRadius: "50%",
                            width: "36px",
                            height: "36px",
                          }}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                            fill="white"
                          >
                            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m-10 5v10a2 2 0 002 2h8a2 2 0 002-2V11M10 11v6M14 11v6" />
                          </svg>
                        </Button>
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
                    padding: "40px",
                    textAlign: "center",
                    color: "#6b7280",
                    fontSize: "1.2rem",
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
          marginTop: "30px",
          textAlign: "center",
          color: "#6b7280",
          padding: "20px",
          background: "#fff",
          borderRadius: "15px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
        }}
      >
        © 2025 DataManagement. All rights reserved.
      </footer>
    </div>
  );
};

export default Sales;
