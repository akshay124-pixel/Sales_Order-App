import React, { useState, useEffect } from "react";
import { Modal, Button, Input, Select } from "antd";
import axios from "axios";
import { toast } from "react-toastify";

const { Option } = Select;

const OutFinishedGoodModal = ({
  visible,
  onClose,
  onSubmit,
  initialData,
  entryToEdit,
}) => {
  const [formData, setFormData] = useState({
    dispatchFrom: "",
    transporter: "",
    transporterDetails: "",
    billNumber: "",
    dispatchDate: new Date().toISOString().split("T")[0],
    docketNo: "",
    receiptDate: "",
    dispatchStatus: "Not Dispatched",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (initialData && entryToEdit) {
      setFormData({
        dispatchFrom: initialData.dispatchFrom || "",
        transporter: initialData.transporter || "",
        transporterDetails: initialData.transporterDetails || "",
        billNumber: initialData.billNumber || "",
        dispatchDate: initialData.dispatchDate
          ? new Date(initialData.dispatchDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        docketNo: initialData.docketNo || "",
        receiptDate: initialData.receiptDate
          ? new Date(initialData.receiptDate).toISOString().split("T")[0]
          : "",
        dispatchStatus: initialData.dispatchStatus || "Not Dispatched",
      });
    }
  }, [initialData, entryToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDispatchFromChange = (value) => {
    setFormData((prev) => ({ ...prev, dispatchFrom: value }));
  };

  const handleTransporterChange = (value) => {
    setFormData((prev) => ({ ...prev, transporter: value }));
  };

  const handleDispatchStatusChange = (value) => {
    setFormData((prev) => ({ ...prev, dispatchStatus: value }));
  };

  const handleSubmit = async () => {
    if (!showConfirm) {
      if (
        !formData.dispatchFrom ||
        !formData.transporter ||
        !formData.dispatchDate
      ) {
        setError(
          "Please fill all required fields: Dispatch From, Transporter, and Dispatch Date!"
        );
        toast.error("Missing required fields!");
        return;
      }
      // Additional validation for "Delivered" status
      if (
        formData.dispatchStatus === "Delivered" &&
        (!formData.receiptDate || !formData.docketNo)
      ) {
        setError(
          "Receipt Date and Docket Number are required when setting status to Delivered!"
        );
        toast.error("Missing required fields for Delivered status!");
        return;
      }
      setShowConfirm(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const submissionData = {
        dispatchFrom: formData.dispatchFrom,
        transporter: formData.transporter,
        transporterDetails: formData.transporterDetails || undefined,
        billNumber: formData.billNumber || undefined,
        dispatchDate: new Date(formData.dispatchDate).toISOString(),
        docketNo: formData.docketNo || undefined,
        receiptDate: formData.receiptDate
          ? new Date(formData.receiptDate).toISOString()
          : undefined,
        dispatchStatus: formData.dispatchStatus,
      };

      const response = await axios.put(
        `https://sales-order-server.onrender.com/api/edit/${entryToEdit._id}`,
        submissionData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update dispatch");
      }

      const updatedEntry = response.data.data;
      toast.success(
        `Dispatch updated successfully! Status: ${updatedEntry.dispatchStatus}`,
        { position: "top-right", autoClose: 3000 }
      );
      onSubmit(updatedEntry);
      onClose();
    } catch (err) {
      console.error("Dispatch submission error:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to update dispatch.";
      const errorDetails = err.response?.data?.errors
        ? err.response.data.errors.join(", ")
        : err.response?.data?.error || err.message;
      setError(
        errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage
      );
      toast.error(errorMessage, { position: "top-right", autoClose: 5000 });
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <Modal
      title={
        <h2
          style={{
            textAlign: "center",
            fontWeight: "800",
            fontSize: "2.2rem",
            background: "linear-gradient(135deg, #2575fc, #6a11cb)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "1.5px",
            textShadow: "1px 1px 3px rgba(0, 0, 0, 0.05)",
            marginBottom: "1.5rem",
          }}
        >
          🚚 Dispatch
        </h2>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      style={{ borderRadius: "15px", overflow: "hidden" }}
      bodyStyle={{
        padding: "30px",
        background: "#fff",
        borderRadius: "0 0 15px 15px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {error && (
          <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
        )}
        <div>
          <label
            style={{
              fontSize: "1rem",
              fontWeight: "600",
              color: "#333",
              marginBottom: "5px",
              display: "block",
            }}
          >
            Dispatch From *
          </label>
          <Select
            value={formData.dispatchFrom || undefined}
            onChange={handleDispatchFromChange}
            placeholder="Select dispatch location"
            style={{ width: "100%", borderRadius: "8px" }}
            disabled={loading}
          >
            <Option value="">Select Dispatch From</Option>
            <Option value="Patna">Patna</Option>
            <Option value="Bareilly">Bareilly</Option>
            <Option value="Ranchi">Ranchi</Option>
            <Option value="Morinda">Morinda</Option>
            <Option value="Lucknow">Lucknow</Option>
            <Option value="Delhi">Delhi</Option>
          </Select>
        </div>
        {[
          { key: "billNumber", label: "Bill No", type: "text" },
          {
            key: "transporterDetails",
            label: "Transporter Details",
            type: "text",
          },
          { key: "dispatchDate", label: "Dispatch Date", type: "date" },
          { key: "docketNo", label: "Docket No", type: "text" },
          { key: "receiptDate", label: "Receipt Date", type: "date" },
        ].map((field) => (
          <div key={field.key}>
            <label
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                color: "#333",
                display: "block",
                marginBottom: "5px",
              }}
            >
              {field.label}{" "}
              {field.key === "receiptDate" &&
                formData.dispatchStatus === "Delivered" &&
                "*"}
              {field.key === "docketNo" &&
                formData.dispatchStatus === "Delivered" &&
                "*"}
              {["dispatchFrom", "transporter", "dispatchDate"].includes(
                field.key
              ) && "*"}
            </label>
            <Input
              placeholder={`Enter ${field.label.toLowerCase()}`}
              type={field.type}
              name={field.key}
              value={formData[field.key] || ""}
              onChange={handleChange}
              style={{ borderRadius: "8px", padding: "10px", fontSize: "1rem" }}
              disabled={loading}
            />
          </div>
        ))}
        <div>
          <label
            style={{
              fontSize: "1rem",
              fontWeight: "600",
              color: "#333",
              marginBottom: "5px",
              display: "block",
            }}
          >
            Transporter *
          </label>
          <Select
            value={formData.transporter || undefined}
            onChange={handleTransporterChange}
            placeholder="Select transporter"
            style={{ width: "100%", borderRadius: "8px" }}
            disabled={loading}
          >
            <Option value="">Select Transporter</Option>
            <Option value="BlueDart">BlueDart</Option>
            <Option value="Om Logistics">Om Logistics</Option>
            <Option value="Rivigo">Rivigo</Option>
            <Option value="Safex">Safex</Option>
            <Option value="Delhivery">Delhivery</Option>
            <Option value="Maruti">Maruti</Option>
            <Option value="Self-Pickup">Self-Pickup</Option>
            <Option value="Others">Others</Option>
          </Select>
        </div>
        <div>
          <label
            style={{
              fontSize: "1rem",
              fontWeight: "600",
              color: "#333",
              marginBottom: "5px",
              display: "block",
            }}
          >
            Dispatch Status
          </label>
          <Select
            value={formData.dispatchStatus || "Not Dispatched"}
            onChange={handleDispatchStatusChange}
            style={{ width: "100%", borderRadius: "8px" }}
            disabled={loading}
          >
            <Option value="Not Dispatched">Not Dispatched</Option>
            <Option value="Docket Awaited Dispatched">
              Docket-Awaited-Dispatched
            </Option>
            <Option value="Dispatched">Dispatched</Option>
            <Option value="Delivered">Delivered</Option>
          </Select>
        </div>
        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <Button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "14px 24px",
              borderRadius: "30px",
              color: "#fff",
              fontWeight: "600",
              fontSize: "1.1rem",
              textTransform: "uppercase",
              background: "#dc3545",
              border: "none",
            }}
          >
            Cancel
          </Button>
          {showConfirm ? (
            <>
              <Button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                style={{
                  padding: "14px 24px",
                  borderRadius: "30px",
                  color: "#fff",
                  fontWeight: "600",
                  fontSize: "1.1rem",
                  textTransform: "uppercase",
                  background: "#ffc107",
                  border: "none",
                }}
              >
                Back
              </Button>
              <Button
                type="primary"
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  background: "linear-gradient(135deg, #2575fc, #6a11cb)",
                  border: "none",
                  padding: "14px 24px",
                  borderRadius: "30px",
                  color: "#fff",
                  fontWeight: "600",
                  fontSize: "1.1rem",
                  textTransform: "uppercase",
                  transition: "box-shadow 0.2s ease-in-out",
                  boxShadow: "0 4px 8px rgba(37, 117, 252, 0.2)",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.boxShadow =
                    "0 6px 12px rgba(37, 117, 252, 0.3)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.boxShadow =
                    "0 4px 8px rgba(37, 117, 252, 0.2)")
                }
              >
                {loading ? "Saving..." : "Confirm"}
              </Button>
            </>
          ) : (
            <Button
              type="primary"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                background: "linear-gradient(135deg, #2575fc, #6a11cb)",
                border: "none",
                padding: "14px 24px",
                borderRadius: "30px",
                color: "#fff",
                fontWeight: "600",
                fontSize: "1.1rem",
                textTransform: "uppercase",
                transition: "box-shadow 0.2s ease-in-out",
                boxShadow: "0 4px 8px rgba(37, 117, 252, 0.2)",
              }}
              onMouseEnter={(e) =>
                (e.target.style.boxShadow =
                  "0 6px 12px rgba(37, 117, 252, 0.3)")
              }
              onMouseLeave={(e) =>
                (e.target.style.boxShadow = "0 4px 8px rgba(37, 117, 252, 0.2)")
              }
            >
              {loading ? "Submitting..." : "Save Changes"}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default OutFinishedGoodModal;
