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
      console.log("Fetched orders:", JSON.stringify(data, null, 2));
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

          // Handle Excel serial numbers
          if (!isNaN(dateValue) && typeof dateValue === "number") {
            const date = XLSX.SSF.parse_date_code(dateValue);
            return moment({
              year: date.y,
              month: date.m - 1,
              day: date.d,
            }).format("YYYY-MM-DD");
          }

          // Handle various string formats
          const formats = [
            "YYYY-MM-DD",
            "DD/MM/YYYY",
            "MM/DD/YYYY",
            "DD/M/YYYY",
            "M/D/YYYY",
          ];
          const parsed = moment(dateValue, formats, true);
          if (parsed.isValid()) return parsed.format("YYYY-MM-DD");

          console.warn("Unparseable date:", dateValue);
          return null;
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
            invoiceNo: Number(entry.invoiceNo) || 0,
            invoiceDate: parseDate(entry.invoicedate),
            remarks: String(entry.remarks || "").trim(),
            fulfillingStatus: String(entry.fulfillingstatus || "").trim(),
            remarksByProduction: String(entry.remarksbyproduction || "").trim(),
          };
        });

        const validEntries = newEntries.filter(
          (entry) => entry.soDate && !isNaN(entry.qty)
        );
        console.log("Valid Entries:", validEntries);
        if (validEntries.length === 0) {
          toast.error(
            "No valid entries found with required fields (soDate, qty)."
          );
          return;
        }

        const response = await axios.post(
          "https://sales-order-server.onrender.com/api/bulk-orders",
          validEntries,
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        setOrders((prevOrders) => [...prevOrders, ...response.data.data]);
        toast.success("Orders uploaded successfully!");
      } catch (error) {
        console.error("Error uploading entries:", error);
        const errorMessage =
          error.response?.data?.message || "Failed to upload entries";
        const errorDetails = error.response?.data?.error || error.message;
        toast.error(`${errorMessage}: ${errorDetails}`);
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
    console.log("Checking order:", JSON.stringify(order, null, 2));
    const allFields = Object.keys(order).filter((key) => key !== "_id");
    const isComplete = allFields.every((field) => {
      const value = order[field];
      const isFilled =
        value !== undefined &&
        value !== null &&
        (value !== "" || value === 0 || value === "-");
      console.log(`Field: ${field}, Value: ${value}, Filled: ${isFilled}`);
      return isFilled;
    });
    console.log("Order complete:", isComplete);
    return isComplete;
  };

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
        <div
          style={{
            width: "100vw",
            position: "relative",
            left: "50%",
            right: "50%",
            marginLeft: "-50vw",
            marginTop: "-1.6%",
            marginRight: "-50vw",
            padding: "25px 40px",
            marginBottom: "25px",
            background: " linear-gradient(135deg, #2575fc, #6a11cb)",
            display: "flex",
            flexWrap: "wrap",

            alignItems: "center",
            justifyContent: "space-evenly",
            minHeight: "80px",
            zIndex: 1,
          }}
        >
          <Form.Control
            type="text"
            placeholder="Search Orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "550px",
              padding: "12px 20px",
              border: "none",
              borderRadius: "30px",
              backgroundColor: "rgba(255, 255, 255, 0.98)",
              boxShadow: "0 3px 10px rgba(0, 0, 0, 0.15)",
              fontSize: "1.1rem",
              fontWeight: "500",
              color: "#333",
              transition: "all 0.3s ease-in-out",
            }}
            onFocus={(e) => {
              e.target.style.boxShadow = "0 0 12px rgba(255, 255, 255, 0.9)";
              e.target.style.transform = "scale(1.02)";
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = "0 3px 10px rgba(0, 0, 0, 0.15)";
              e.target.style.transform = "scale(1)";
            }}
          />

          <Dropdown>
            <Dropdown.Toggle
              variant="outline-dark"
              style={{
                padding: "12px 25px",
                borderRadius: "30px",
                background: "linear-gradient(135deg, #2575fc, #6a11cb)",
                border: "none",
                color: "white",
                fontWeight: "600",
                fontSize: "1.1rem",
                boxShadow: "0 3px 10px rgba(0, 0, 0, 0.15)",
                transition: "all 0.3s ease-in-out",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#ffffff";
                e.target.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.98)";
                e.target.style.transform = "scale(1)";
              }}
            >
              {approvalFilter === "All" ? "Approval Status" : approvalFilter}
            </Dropdown.Toggle>
            <Dropdown.Menu
              style={{
                borderRadius: "12px",
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.2)",
                backgroundColor: "#ffffff",
                border: "none",
                padding: "10px 0",
              }}
            >
              <Dropdown.Item
                onClick={() => setApprovalFilter("All")}
                style={{
                  padding: "10px 25px",
                  color: "#2c3e50",
                  fontWeight: "500",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#f0f2f5")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "transparent")
                }
              >
                All
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => setApprovalFilter("Approved")}
                style={{
                  padding: "10px 25px",
                  color: "#2c3e50",
                  fontWeight: "500",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#f0f2f5")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "transparent")
                }
              >
                Approved
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => setApprovalFilter("Pending for Approval")}
                style={{
                  padding: "10px 25px",
                  color: "#2c3e50",
                  fontWeight: "500",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#f0f2f5")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "transparent")
                }
              >
                Not Approved
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown>
            <Dropdown.Toggle
              variant="outline-dark"
              style={{
                padding: "12px 25px",
                borderRadius: "30px",
                background: "linear-gradient(135deg, #2575fc, #6a11cb)",
                border: "none",
                color: "white",
                border: "none",

                fontWeight: "600",
                fontSize: "1.1rem",
                boxShadow: "0 3px 10px rgba(0, 0, 0, 0.15)",
                transition: "all 0.3s ease-in-out",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#ffffff";
                e.target.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.98)";
                e.target.style.transform = "scale(1)";
              }}
            >
              {statusFilter === "All" ? "Order Status" : statusFilter}
            </Dropdown.Toggle>
            <Dropdown.Menu
              style={{
                borderRadius: "12px",
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.2)",
                backgroundColor: "#ffffff",
                border: "none",
                padding: "10px 0",
              }}
            >
              <Dropdown.Item
                onClick={() => setStatusFilter("All")}
                style={{
                  padding: "10px 25px",
                  color: "#2c3e50",
                  fontWeight: "500",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#f0f2f5")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "transparent")
                }
              >
                All
              </Dropdown.Item>
              {[
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
                    padding: "10px 25px",
                    color: "#2c3e50",
                    fontWeight: "500",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#f0f2f5")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "transparent")
                  }
                >
                  {status}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <Button
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-full transition-all transform hover:scale-105 hover:shadow-lg"
            style={{
              borderRadius: "50px",
              background: "linear-gradient(135deg, #ff4e50, #fc913a)", // Redish gradient
              transition: "all 0.3s ease-in-out",
              fontWeight: "bold",
            }}
            onClick={handlereset}
          >
            Reset <ArrowRight size={16} />
          </Button>

          {/* <DatePicker
            selected={startDate} // Using startDate as the single date state
            onChange={(date) => setStartDate(date)} // Updates the single date
            placeholderText="Select Date" // Generic placeholder
            className="form-control"
            wrapperClassName="date-picker-wrapper"
            style={{
              width: "220px",
              padding: "12px 20px",
              border: "none",
              borderRadius: "30px",
              backgroundColor: "rgba(255, 255, 255, 0.98)",
              boxShadow: "0 3px 10px rgba(0, 0, 0, 0.15)",
              fontSize: "1.1rem",
              fontWeight: "500",
              color: "#333",
              transition: "all 0.3s ease-in-out",
            }}
            onFocus={(e) => {
              e.target.style.boxShadow = "0 0 12px rgba(255, 255, 255, 0.9)";
              e.target.style.transform = "scale(1.02)";
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = "0 3px 10px rgba(0, 0, 0, 0.15)";
              e.target.style.transform = "scale(1)";
            }}
          /> */}
        </div>
        <div className="container">
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginLeft: "215px",
            }}
          >
            <div
              className="my-5"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "12px",
                justifyContent: "center",
                marginTop: "10px",
              }}
            >
              <label
                style={{
                  background: "linear-gradient(135deg, #6a11cb, #2575fc)",
                  color: "#fff",
                  padding: "12px 24px",
                  border: "none",
                  borderRadius: "30px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  minWidth: "150px",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-3px)";
                  e.target.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.25)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)";
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>⬅</span> Bulk Upload
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
              </label>

              <button
                onClick={() => setIsAddModalOpen(true)}
                style={{
                  background: "linear-gradient(135deg, #6a11cb, #2575fc)",
                  color: "#fff",
                  padding: "12px 24px",
                  border: "none",
                  borderRadius: "30px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  minWidth: "150px",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-3px)";
                  e.target.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.25)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)";
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>+</span> Add Entry
              </button>

              <button
                onClick={handleExport}
                style={{
                  background: "linear-gradient(135deg, #6a11cb, #2575fc)",
                  color: "#fff",
                  padding: "12px 24px",
                  border: "none",
                  borderRadius: "30px",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  minWidth: "150px",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-3px)";
                  e.target.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.25)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)";
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>Export Orders</span> ➔
              </button>
            </div>
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
            className="table-wrapper"
            style={{
              overflowX: "auto",
              marginLeft: "-100px",
              marginRight: "-100px",
            }}
          >
            <table
              className="sales-table"
              style={{ width: "90%", borderCollapse: "collapse" }}
            >
              <thead
                style={{
                  background: "linear-gradient(135deg, #2575fc, #6a11cb)",
                  color: "white",
                  fontSize: "1.1rem",
                  padding: "15px 20px",
                  textAlign: "center",
                  position: "sticky",
                  top: 0,
                  zIndex: 2,
                }}
              >
                <tr>
                  {[
                    "Seq No",
                    "Order ID",
                    "SO Date",
                    "Committed Date",
                    "Status",
                    "Approvel Status",
                    "Party & Address",
                    "City",
                    "State",
                    "Pin Code",
                    "Contact Person Name",
                    "Contact No",
                    "Customer Email",
                    "Model No",
                    "Serial No",
                    "Product Type",
                    "Size",
                    "Spec",
                    "Product Details",
                    "Qty",
                    "Unit Price",
                    "GST",
                    "Total",
                    "Payment Terms",
                    "Amount2",
                    "Freight Charges & Status",

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
                    <th key={header} style={{ padding: "15px" }}>
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
                          backgroundColor: complete ? "#ffffff" : "#fff3cd",
                          transition: "background-color 0.3s ease",
                          borderBottom: "1px solid #dee2e6",
                        }}
                      >
                        <td style={{ padding: "10px" }}>{index + 1}</td>
                        <td style={{ padding: "10px" }}>
                          {order.orderId || "-"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          {order.soDate
                            ? new Date(order.soDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          {order.committedDate
                            ? new Date(order.committedDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td style={{ padding: "10px", listStyle: "none" }}>
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
                        <td style={{ padding: "10px" }}>
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
                        <td style={{ padding: "10px" }}>
                          {order.partyAndAddress || "-"}
                        </td>
                        <td style={{ padding: "10px" }}>{order.city || "-"}</td>
                        <td style={{ padding: "10px" }}>
                          {order.state || "-"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          {order.pinCode || "-"}
                        </td>
                        <td style={{ padding: "10px" }}>{order.name || "-"}</td>
                        <td style={{ padding: "10px" }}>
                          {order.contactNo || "-"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          {order.customerEmail || "-"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          {order.modelNo || "-"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          {order.serialno || "-"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          {order.productType || "-"}
                        </td>
                        <td style={{ padding: "10px" }}>{order.size || "-"}</td>
                        <td style={{ padding: "10px" }}>{order.spec || "-"}</td>
                        <td style={{ padding: "10px" }}>
                          {order.productDetails || "-"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          {order.qty !== undefined ? order.qty : "-"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          ₹{order.unitPrice?.toFixed(2) || "0.00"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          {order.gst ? `${order.gst}%` : "-"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          ₹{order.total?.toFixed(2) || "0.00"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          {order.paymentTerms || "-"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          ₹{order.amount2?.toFixed(2) || "0.00"}
                        </td>

                        <td style={{ padding: "10px" }}>
                          {order.freightcs || "-"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          {order.installation ? "Yes" : "No"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          {order.salesPerson || "-"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          {order.company || "-"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          {order.transporter || "-"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          {order.transporterDetails || "-"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          {order.shippingAddress || "-"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          {order.billingAddress || "-"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          {order.docketNo || "-"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          {order.dispatchFrom || "-"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          {order.dispatchDate
                            ? new Date(order.dispatchDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          {order.receiptDate
                            ? new Date(order.receiptDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          {order.invoiceNo || "-"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          {order.invoiceDate
                            ? new Date(order.invoiceDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          {order.remarks || "-"}
                        </td>
                        <td style={{ padding: "10px" }}>
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <Button
                              variant="primary"
                              onClick={() => handleViewClick(order)}
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
                              onClick={() => handleEditClick(order)}
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
                            <button
                              className="bin-button"
                              variant="danger"
                              onClick={() => handleDeleteClick(order)}
                              style={{
                                minWidth: "40 -px",
                                width: "40px",
                                padding: "0",
                              }}
                            >
                              <svg
                                className="bin-top"
                                viewBox="0 0 39 7"
                                fill="none"
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
                        textAlign: "left",
                        paddingLeft: "15%",
                        padding: "20px",
                        height: "460px",
                      }}
                    >
                      No Data Available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <footer className="footer-container">
        <p style={{ marginTop: "10px", color: "white", height: "20px" }}>
          © 2025 DataManagement. All rights reserved.
        </p>
      </footer>
    </>
  );
};

export default Sales;
