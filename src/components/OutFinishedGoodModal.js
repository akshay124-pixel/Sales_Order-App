import React, { useState, useEffect, useCallback } from "react";
import { getDirtyValues } from "../utils/formUtils"; // Import Diff Utility
import { Modal, Button, Input, Select, Collapse } from "antd";
import axios from "axios";
import { toast } from "react-toastify";

const { Option } = Select;
const { Panel } = Collapse;

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
    stamp: "",
    deliveredDate: "",
    docketNo: "",
    actualFreight: "",
    dispatchStatus: "Not Dispatched",
    dispatchStatus: "Not Dispatched",
    products: [],
  });
  const [originalFormData, setOriginalFormData] = useState({}); // Capture original state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    console.log("entryToEdit:", JSON.stringify(entryToEdit, null, 2));
    console.log("billStatus:", entryToEdit?.billStatus);
    console.log("initialData:", JSON.stringify(initialData, null, 2));
    if (initialData && entryToEdit) {
      const billStatus = (entryToEdit?.billStatus || "Pending")
        .trim()
        .toLowerCase();
      const isBillingComplete = billStatus === "billing complete";
      const dispatchStatus = initialData.dispatchStatus || "Not Dispatched";
      const validDispatchStatus = isBillingComplete
        ? dispatchStatus
        : ["Dispatched", "Delivered"].includes(dispatchStatus)
          ? "Not Dispatched"
          : dispatchStatus;

      // Initialize products with all fields
      const products =
        entryToEdit.products?.map((product) => ({
          productType: product.productType || "",
          serialNos: product.serialNos || [],
          modelNos: product.modelNos || [],
          unitPrice: product.unitPrice || "",
          size: product.size || "N/A",
          spec: product.spec || "N/A",
        })) || [];

      const deliveredDateValue =
        initialData?.deliveredDate ?? entryToEdit?.deliveredDate ?? "";

      const initializedData = {
        dispatchFrom: initialData.dispatchFrom || "",
        transporter: initialData.transporter || "",
        transporterDetails: initialData.transporterDetails || "",
        billNumber: initialData.billNumber || "",
        dispatchDate: initialData.dispatchDate
          ? new Date(initialData.dispatchDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],

        deliveredDate: deliveredDateValue
          ? new Date(deliveredDateValue).toISOString().split("T")[0]
          : "",
        stamp: initialData.stamp || "Not Received",
        docketNo: initialData.docketNo || "",
        actualFreight:
          initialData.actualFreight ??
          entryToEdit.actualFreight ??
          "",
        dispatchStatus: validDispatchStatus,
        products,
      };

      setFormData(initializedData);

      // PATCH FIX: Ensure originalFormData reflects the TRUE database state (empty date)
      // so that the default "Today" in formData counts as a change.
      setOriginalFormData({
        ...initializedData,
        dispatchDate: initialData.dispatchDate
          ? new Date(initialData.dispatchDate).toISOString().split("T")[0]
          : "",
      });


    }
  }, [initialData, entryToEdit]);

  // PERFORMANCE: Stable callback references prevent unnecessary re-renders
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === "actualFreight") {
      if (value === "" || (!isNaN(value) && Number(value) >= 0)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleProductChange = useCallback((index, field, value) => {
    setFormData((prev) => {
      const updatedProducts = [...prev.products];
      if (["serialNos", "modelNos"].includes(field)) {
        updatedProducts[index] = {
          ...updatedProducts[index],
          [field]: value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        };
      } else {
        updatedProducts[index] = {
          ...updatedProducts[index],
          [field]: value,
        };
      }
      return { ...prev, products: updatedProducts };
    });
  }, []);

  const handleDispatchFromChange = useCallback((value) => {
    setFormData((prev) => ({ ...prev, dispatchFrom: value }));
  }, []);

  const handleTransporterChange = useCallback((value) => {
    setFormData((prev) => ({ ...prev, transporter: value }));
  }, []);

  const handleDispatchStatusChange = useCallback((value) => {
    setFormData((prev) => ({ ...prev, dispatchStatus: value }));
  }, []);

  const handleSubmit = async () => {
    if (!showConfirm) {
      if (
        (formData.dispatchStatus === "Dispatched" ||
          formData.dispatchStatus === "Delivered") &&
        entryToEdit?.billStatus !== "Billing Complete"
      ) {
        setError(
          "Cannot set Dispatch Status to Dispatched or Delivered until Billing Status is Billing Complete!"
        );
        toast.error("Billing Status must be Billing Complete!");
        return;
      }
      setShowConfirm(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const submissionData = {
        dispatchFrom: formData.dispatchFrom || undefined,
        transporter: formData.transporter || undefined,
        transporterDetails: formData.transporterDetails || undefined,
        billNumber: formData.billNumber || undefined,
        dispatchDate: formData.dispatchDate
          ? new Date(formData.dispatchDate).toISOString()
          : undefined,
        deliveredDate: formData.deliveredDate
          ? new Date(formData.deliveredDate).toISOString()
          : undefined,
        docketNo: formData.docketNo || undefined,
        actualFreight:
          formData.actualFreight !== ""
            ? Number(formData.actualFreight)
            : undefined,
        dispatchStatus: formData.dispatchStatus || undefined,
        stamp: formData.stamp,
        products: formData.products.map((product) => ({
          productType: product.productType || undefined,
          serialNos: product.serialNos.length ? product.serialNos : undefined,
          modelNos: product.modelNos.length ? product.modelNos : undefined,
          unitPrice:
            product.unitPrice !== "" ? Number(product.unitPrice) : undefined,
          size: product.size !== "N/A" ? product.size : undefined,
          spec: product.spec !== "N/A" ? product.spec : undefined,
        })),
      };

      // ---------------------------------------------------------
      // PATCH REFACTOR: Only send changed fields
      // ---------------------------------------------------------
      const dirtyValues = getDirtyValues(originalFormData, formData);

      // SAFEGUARD: Force include dispatchDate if it was auto-populated (Today) vs empty DB
      if (formData.dispatchDate && !originalFormData.dispatchDate) {
        dirtyValues.dispatchDate = formData.dispatchDate;
      }

      if (Object.keys(dirtyValues).length === 0) {
        toast.info("No changes to save.");
        setLoading(false);
        setShowConfirm(false);
        return;
      }

      // Filter submissionData to only include dirty fields
      const finalPayload = {};
      Object.keys(dirtyValues).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(submissionData, key)) {
          finalPayload[key] = submissionData[key];
        }
      });

      const response = await axios.patch(
        `${process.env.REACT_APP_URL}/api/edit/${entryToEdit._id}`,
        finalPayload,
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

      onSubmit(updatedEntry);
      onClose();
    } catch (err) {
      console.error("Dispatch submission error:", err);

      let userFriendlyMessage =
        "Failed to update dispatch. Please try again later.";

      if (err.response) {
        if (err.response.status === 400) {
          userFriendlyMessage =
            "Invalid data provided. Please check and try again.";
        } else if (err.response.status === 401) {
          userFriendlyMessage = "Your session expired. Please log in again.";
        } else if (err.response.status === 403) {
          userFriendlyMessage =
            "You do not have permission to update this dispatch.";
        } else if (err.response.status === 404) {
          userFriendlyMessage = "Dispatch entry not found.";
        } else if (err.response.status >= 500) {
          userFriendlyMessage = "Server error. Please try again later.";
        } else if (err.response.data?.message) {
          userFriendlyMessage = err.response.data.message;
        }
      } else if (err.request) {
        userFriendlyMessage =
          "No response from server. Check your internet connection.";
      }

      setError(userFriendlyMessage);
      toast.error(userFriendlyMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const isBillingComplete = entryToEdit?.billStatus === "Billing Complete";
  const showProductFields =
    formData.dispatchFrom && formData.dispatchFrom !== "Morinda";

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
            Dispatch From
          </label>
          <Select
            value={formData.dispatchFrom || undefined}
            onChange={handleDispatchFromChange}
            placeholder="Select dispatch location"
            style={{ width: "100%", borderRadius: "8px" }}
            disabled={loading}
            allowClear
          >
            <Option value="Patna">Patna</Option>
            <Option value="Bareilly">Bareilly</Option>
            <Option value="Ranchi">Ranchi</Option>
            <Option value="Morinda">Morinda</Option>
            <Option value="Lucknow">Lucknow</Option>
            <Option value="Delhi">Delhi</Option>
          </Select>
        </div>
        {[
          { key: "dispatchDate", label: "Dispatch Date", type: "date" },
          { key: "deliveredDate", label: "Delivery Date", type: "date" },
          { key: "docketNo", label: "Docket No", type: "text" },
          { key: "actualFreight", label: "Actual Freight", type: "text" },
          {
            key: "transporterDetails",
            label: "Transporter Remarks",
            type: "text",
          },
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
              {field.label}
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
            Transporter
          </label>
          <Select
            value={formData.transporter || undefined}
            onChange={handleTransporterChange}
            placeholder="Select transporter"
            style={{ width: "100%", borderRadius: "8px" }}
            disabled={loading}
            allowClear
          >
            <Option value="BlueDart">BlueDart</Option>
            <Option value="Om Logistics">Om Logistics</Option>
            <Option value="Rivigo">Rivigo</Option>
            <Option value="Safex">Safex</Option>
            <Option value="Delhivery">Delhivery</Option>
            <Option value="Maruti">Maruti</Option>
            <Option value="Self-Pickup">Self-Pickup</Option>
            <Option value="By-Dedicated-Transport">
              By-Dedicated-Transport
            </Option>
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
            Dispatch Status<div style={{ marginTop: "0px", paddingLeft: "0px" }}>
              <small
                style={{
                  color: "#888",
                  fontSize: "0.85rem",
                }}
              >
                Delivered available after Signed Stamp received.
              </small>
            </div>
          </label>
          <Select
            key={
              (entryToEdit?.billStatus || "Pending") + formData.dispatchStatus
            }
            value={formData.dispatchStatus || "Not Dispatched"}
            onChange={handleDispatchStatusChange}
            style={{ width: "100%", borderRadius: "8px" }}
            disabled={loading}
          >
            <Option value="Not Dispatched">Not Dispatched</Option>
            <Option value="Docket Awaited Dispatched">
              Docket-Awaited-Dispatched
            </Option>
            <Option value="Hold by Salesperson">Hold by Salesperson</Option>
            <Option value="Hold by Customer">Hold by Customer</Option>
            <Option value="Order Cancelled">Order Cancelled</Option>
            {(entryToEdit?.billStatus || "Pending").trim().toLowerCase() ===
              "billing complete" && (
                <>
                  <Option value="Dispatched">Dispatched</Option>

                  {formData.stamp === "Received" && (
                    <Option value="Delivered">Delivered</Option>
                  )}
                </>
              )}

          </Select>
        </div>

        {(entryToEdit?.billStatus || "Pending").trim().toLowerCase() ===
          "billing complete" && (
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
                Signed Stamp Receiving
              </label>
              <Select
                key={(entryToEdit?.stamp || "Not Received") + formData.stamp}
                value={formData.stamp || "Not Received"}
                onChange={(value) => setFormData({ ...formData, stamp: value })}
                style={{ width: "100%", borderRadius: "8px" }}
                disabled={loading}
              >
                <Option value="Not Received">Not Received</Option>
                <Option value="Received">Received</Option>

              </Select>
            </div>
          )}
        {showProductFields && (
          <div>
            <Collapse
              accordion
              style={{ background: "#f9f9f9", borderRadius: "8px" }}
            >
              <Panel
                header="Product Details"
                key="1"
                style={{ fontWeight: "600", fontSize: "1rem" }}
              >
                {formData.products.map((product, index) => (
                  <div
                    key={index}
                    style={{
                      border: "1px solid #e8e8e8",
                      padding: "15px",
                      borderRadius: "8px",
                      marginBottom: "15px",
                    }}
                  >
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
                        Product Type
                      </label>
                      <Input
                        placeholder="Enter product type"
                        value={product.productType}
                        onChange={(e) =>
                          handleProductChange(
                            index,
                            "productType",
                            e.target.value
                          )
                        }
                        style={{
                          borderRadius: "8px",
                          padding: "10px",
                          fontSize: "1rem",
                        }}
                        disabled={loading}
                      />
                    </div>
                    <div style={{ marginTop: "10px" }}>
                      <label
                        style={{
                          fontSize: "1rem",
                          fontWeight: "600",
                          color: "#333",
                          marginBottom: "5px",
                          display: "block",
                        }}
                      >
                        Serial Numbers
                      </label>
                      <Input
                        placeholder="Enter serial numbers (comma-separated)"
                        value={product.serialNos.join(", ")}
                        onChange={(e) =>
                          handleProductChange(
                            index,
                            "serialNos",
                            e.target.value
                          )
                        }
                        style={{
                          borderRadius: "8px",
                          padding: "10px",
                          fontSize: "1rem",
                        }}
                        disabled={loading}
                      />
                    </div>
                    <div style={{ marginTop: "10px" }}>
                      <label
                        style={{
                          fontSize: "1rem",
                          fontWeight: "600",
                          color: "#333",
                          marginBottom: "5px",
                          display: "block",
                        }}
                      >
                        Model Numbers
                      </label>
                      <Input
                        placeholder="Enter model numbers (comma-separated)"
                        value={product.modelNos.join(", ")}
                        onChange={(e) =>
                          handleProductChange(index, "modelNos", e.target.value)
                        }
                        style={{
                          borderRadius: "8px",
                          padding: "10px",
                          fontSize: "1rem",
                        }}
                        disabled={loading}
                      />
                    </div>
                    <div style={{ marginTop: "10px" }}>
                      <label
                        style={{
                          fontSize: "1rem",
                          fontWeight: "600",
                          color: "#333",
                          marginBottom: "5px",
                          display: "block",
                        }}
                      >
                        Unit Price
                      </label>
                      <Input
                        placeholder="Enter unit price"
                        type="number"
                        value={product.unitPrice}
                        onChange={(e) =>
                          handleProductChange(
                            index,
                            "unitPrice",
                            e.target.value
                          )
                        }
                        style={{
                          borderRadius: "8px",
                          padding: "10px",
                          fontSize: "1rem",
                        }}
                        disabled={loading}
                      />
                    </div>
                    <div style={{ marginTop: "10px" }}>
                      <label
                        style={{
                          fontSize: "1rem",
                          fontWeight: "600",
                          color: "#333",
                          marginBottom: "5px",
                          display: "block",
                        }}
                      >
                        Size
                      </label>
                      <Input
                        placeholder="Enter size"
                        value={product.size}
                        onChange={(e) =>
                          handleProductChange(index, "size", e.target.value)
                        }
                        style={{
                          borderRadius: "8px",
                          padding: "10px",
                          fontSize: "1rem",
                        }}
                        disabled={loading}
                      />
                    </div>
                    <div style={{ marginTop: "10px" }}>
                      <label
                        style={{
                          fontSize: "1rem",
                          fontWeight: "600",
                          color: "#333",
                          marginBottom: "5px",
                          display: "block",
                        }}
                      >
                        Specification
                      </label>
                      <Input
                        placeholder="Enter specification"
                        value={product.spec}
                        onChange={(e) =>
                          handleProductChange(index, "spec", e.target.value)
                        }
                        style={{
                          borderRadius: "8px",
                          padding: "10px",
                          fontSize: "1rem",
                        }}
                        disabled={loading}
                      />
                    </div>
                  </div>
                ))}
              </Panel>
            </Collapse>
          </div>
        )}
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
