import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Modal, Form, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { useForm, Controller } from "react-hook-form";
import styled from "styled-components";
import debounce from "lodash/debounce";
import { FaEdit, FaSyncAlt, FaCog } from "react-icons/fa";

// Styled Components
const StyledModal = styled(Modal)`
  .modal-content {
    border-radius: 12px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    max-width: 600px;
    margin: auto;
  }
  .modal-header,
  .modal-footer {
    background: linear-gradient(135deg, #2575fc, #6a11cb);
    color: white;
    border: none;
  }
  .modal-body {
    padding: 2rem;
    background: #f9f9f9;
    max-height: 70vh;
    overflow-y: auto;
  }
`;

const StyledButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${(props) =>
    props.variant === "primary"
      ? "linear-gradient(135deg, #2575fc, #6a11cb)"
      : props.variant === "info"
      ? "linear-gradient(135deg, #2575fc, #6a11cb)"
      : props.variant === "danger"
      ? "#dc3545"
      : props.variant === "success"
      ? "#28a745"
      : "linear-gradient(135deg, rgb(252, 152, 11), rgb(244, 193, 10))"};
  &:hover {
    opacity: 0.9;
    transform: scale(1.05);
  }
`;

const FormSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
`;

const ProductContainer = styled.div`
  border: 1px solid #ced4da;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #fff;
`;

const ProductHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

function EditEntry({ isOpen, onClose, onEntryUpdated, entryToEdit }) {
  const initialFormData = useMemo(
    () => ({
      soDate: "",
      committedDate: "",
      dispatchFrom: "",
      status: "Pending",
      dispatchDate: "",
      name: "",
      partyAndAddress: "",
      city: "",
      state: "",
      pinCode: "",
      contactNo: "",
      customerEmail: "",
      customername: "",
      products: [
        {
          productType: "",
          size: "N/A",
          spec: "N/A",
          qty: "",
          unitPrice: "",
          serialNos: "",
          modelNos: "",
          gst: "0",
        },
      ],
      total: "",
      paymentCollected: "",
      paymentMethod: "",
      paymentDue: "",
      neftTransactionId: "",
      chequeId: "",
      paymentTerms: "",
      amount2: "0",
      freightcs: "",
      orderType: "Private order",
      installation: "N/A",
      installationStatus: "Pending",
      remarksByInstallation: "",
      dispatchStatus: "Not Dispatched",
      salesPerson: "",
      company: "Promark",
      transporter: "",
      transporterDetails: "",
      docketNo: "",
      receiptDate: "",
      shippingAddress: "",
      billingAddress: "",
      invoiceNo: "",
      invoiceDate: "",
      fulfillingStatus: "Pending",
      remarksByProduction: "",
      remarksByAccounts: "",
      paymentReceived: "Not Received",
      billNumber: "",
      completionStatus: "In Progress",
      fulfillmentDate: "",
      remarks: "",
      sostatus: "Pending for Approval",
    }),
    []
  );

  const initialUpdateData = useMemo(
    () => ({
      sostatus: "Pending for Approval",
      remarks: "",
    }),
    []
  );

  const [formData, setFormData] = useState(initialFormData);
  const [updateData, setUpdateData] = useState(initialUpdateData);
  const [view, setView] = useState("options");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    mode: "onChange",
    defaultValues: initialFormData,
  });

  const selectedState = watch("state");
  const products = watch("products") || [];
  const paymentMethod = watch("paymentMethod");

  useEffect(() => {
    if (isOpen && entryToEdit) {
      const newFormData = {
        soDate: entryToEdit.soDate
          ? new Date(entryToEdit.soDate).toISOString().split("T")[0]
          : "",
        committedDate: entryToEdit.committedDate
          ? new Date(entryToEdit.committedDate).toISOString().split("T")[0]
          : "",
        dispatchFrom: entryToEdit.dispatchFrom || "",
        status: entryToEdit.status || "Pending",
        dispatchDate: entryToEdit.dispatchDate
          ? new Date(entryToEdit.dispatchDate).toISOString().split("T")[0]
          : "",
        name: entryToEdit.name || "",
        partyAndAddress: entryToEdit.partyAndAddress || "",
        city: entryToEdit.city || "",
        state: entryToEdit.state || "",
        pinCode: entryToEdit.pinCode || "",
        contactNo: entryToEdit.contactNo || "",
        customerEmail: entryToEdit.customerEmail || "",
        customername: entryToEdit.customername || "",
        products:
          entryToEdit.products && entryToEdit.products.length > 0
            ? entryToEdit.products.map((p) => ({
                productType: p.productType || "",
                size: p.size || "N/A",
                spec: p.spec || "N/A",
                qty: p.qty !== undefined ? String(p.qty) : "",
                unitPrice: p.unitPrice !== undefined ? String(p.unitPrice) : "",
                serialNos:
                  p.serialNos?.length > 0 ? p.serialNos.join(", ") : "",
                modelNos: p.modelNos?.length > 0 ? p.modelNos.join(", ") : "",
                gst: p.gst !== undefined ? String(p.gst) : "0",
              }))
            : [
                {
                  productType: "",
                  size: "N/A",
                  spec: "N/A",
                  qty: "",
                  unitPrice: "",
                  serialNos: "",
                  modelNos: "",
                  gst: "0",
                },
              ],
        total: entryToEdit.total !== undefined ? String(entryToEdit.total) : "",
        paymentCollected:
          entryToEdit.paymentCollected !== undefined
            ? String(entryToEdit.paymentCollected)
            : "",
        paymentMethod: entryToEdit.paymentMethod || "",
        paymentDue:
          entryToEdit.paymentDue !== undefined
            ? String(entryToEdit.paymentDue)
            : "",
        neftTransactionId: entryToEdit.neftTransactionId || "",
        chequeId: entryToEdit.chequeId || "",
        paymentTerms: entryToEdit.paymentTerms || "",
        amount2:
          entryToEdit.amount2 !== undefined ? String(entryToEdit.amount2) : "0",
        freightcs: entryToEdit.freightcs || "",
        orderType: entryToEdit.orderType || "Private order",
        installation: entryToEdit.installation || "N/A",
        installationStatus: entryToEdit.installationStatus || "Pending",
        remarksByInstallation: entryToEdit.remarksByInstallation || "",
        dispatchStatus: entryToEdit.dispatchStatus || "Not Dispatched",
        salesPerson: entryToEdit.salesPerson || "",
        company: entryToEdit.company || "Promark",
        transporter: entryToEdit.transporter || "",
        transporterDetails: entryToEdit.transporterDetails || "",
        docketNo: entryToEdit.docketNo || "",
        receiptDate: entryToEdit.receiptDate
          ? new Date(entryToEdit.receiptDate).toISOString().split("T")[0]
          : "",
        shippingAddress: entryToEdit.shippingAddress || "",
        billingAddress: entryToEdit.billingAddress || "",
        invoiceNo: entryToEdit.invoiceNo || "",
        invoiceDate: entryToEdit.invoiceDate
          ? new Date(entryToEdit.invoiceDate).toISOString().split("T")[0]
          : "",
        fulfillingStatus: entryToEdit.fulfillingStatus || "Pending",
        remarksByProduction: entryToEdit.remarksByProduction || "",
        remarksByAccounts: entryToEdit.remarksByAccounts || "",
        paymentReceived: entryToEdit.paymentReceived || "Not Received",
        billNumber: entryToEdit.billNumber || "",
        completionStatus: entryToEdit.completionStatus || "In Progress",
        fulfillmentDate: entryToEdit.fulfillmentDate
          ? new Date(entryToEdit.fulfillmentDate).toISOString().split("T")[0]
          : "",
        remarks: entryToEdit.remarks || "",
        sostatus: entryToEdit.sostatus || "Pending for Approval",
      };
      setFormData(newFormData);
      setUpdateData({
        sostatus: entryToEdit.sostatus || "Pending for Approval",
        remarks: entryToEdit.remarks || "",
      });
      reset(newFormData);
      setView("options");
      setError(null);
      setShowConfirm(false);
    }
  }, [isOpen, entryToEdit, reset]);

  const debouncedHandleInputChange = useCallback(
    debounce((name, value, index) => {
      if (name.startsWith("products.")) {
        const [_, field, idx] = name.split(".");
        setFormData((prev) => {
          const newProducts = [...prev.products];
          newProducts[idx] = {
            ...newProducts[idx],
            [field]: value,
          };
          return { ...prev, products: newProducts };
        });
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    }, 300),
    []
  );

  const handleUpdateInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setUpdateData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const onEditSubmit = async (data) => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    setLoading(true);
    try {
      const submissionData = {
        soDate: data.soDate ? new Date(data.soDate) : undefined,
        committedDate: data.committedDate ? new Date(data.committedDate) : null,
        dispatchFrom: data.dispatchFrom || null,
        status: data.status || "Pending",
        dispatchDate: data.dispatchDate ? new Date(data.dispatchDate) : null,
        name: data.name || null,
        partyAndAddress: data.partyAndAddress || null,
        city: data.city || null,
        state: data.state || null,
        pinCode: data.pinCode || null,
        contactNo: data.contactNo || null,
        customerEmail: data.customerEmail || null,
        customername: data.customername || null,
        products: data.products.map((p) => ({
          productType: p.productType || undefined,
          size: p.size || "N/A",
          spec: p.spec || "N/A",
          qty: p.qty ? Number(p.qty) : undefined,
          unitPrice: p.unitPrice ? Number(p.unitPrice) : undefined,
          serialNos: p.serialNos
            ? p.serialNos
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
          modelNos: p.modelNos
            ? p.modelNos
                .split(",")
                .map((m) => m.trim())
                .filter(Boolean)
            : [],
          gst: p.gst ? Number(p.gst) : 0,
        })),
        total: data.total ? Number(data.total) : undefined,
        paymentCollected: data.paymentCollected
          ? String(data.paymentCollected)
          : null,
        paymentMethod: data.paymentMethod || null,
        paymentDue: data.paymentDue ? String(data.paymentDue) : null,
        neftTransactionId: data.neftTransactionId || null,
        chequeId: data.chequeId || null,
        paymentTerms: data.paymentTerms || null,
        amount2: data.amount2 ? Number(data.amount2) : 0,
        freightcs: data.freightcs || null,
        orderType: data.orderType || "Private order",
        installation: data.installation || "N/A",
        installationStatus: data.installationStatus || "Pending",
        remarksByInstallation: data.remarksByInstallation || "",
        dispatchStatus: data.dispatchStatus || "Not Dispatched",
        salesPerson: data.salesPerson || null,
        company: data.company || "Promark",
        transporter: data.transporter || null,
        transporterDetails: data.transporterDetails || null,
        docketNo: data.docketNo || null,
        receiptDate: data.receiptDate ? new Date(data.receiptDate) : null,
        shippingAddress: data.shippingAddress || "",
        billingAddress: data.billingAddress || "",
        invoiceNo: data.invoiceNo || null,
        invoiceDate: data.invoiceDate ? new Date(data.invoiceDate) : null,
        fulfillingStatus: data.fulfillingStatus || "Pending",
        remarksByProduction: data.remarksByProduction || null,
        remarksByAccounts: data.remarksByAccounts || null,
        paymentReceived: data.paymentReceived || "Not Received",
        billNumber: data.billNumber || "",
        completionStatus: data.completionStatus || "In Progress",
        fulfillmentDate: data.fulfillmentDate
          ? new Date(data.fulfillmentDate)
          : null,
        remarks: data.remarks || "",
        sostatus: data.sostatus || "Pending for Approval",
      };

      // Validate products
      submissionData.products.forEach((p, index) => {
        if (!p.productType) {
          throw new Error(`Product ${index + 1}: Product Type is required`);
        }
        if (!p.qty || p.qty <= 0) {
          throw new Error(`Product ${index + 1}: Quantity must be positive`);
        }
        if (!p.unitPrice || p.unitPrice < 0) {
          throw new Error(
            `Product ${index + 1}: Unit Price must be non-negative`
          );
        }
      });

      // Validate payment method dependencies
      if (
        submissionData.paymentMethod === "NEFT" &&
        !submissionData.neftTransactionId
      ) {
        throw new Error("NEFT Transaction ID is required for NEFT payments");
      }
      if (
        submissionData.paymentMethod === "RTGS" &&
        !submissionData.neftTransactionId
      ) {
        throw new Error("NEFT Transaction ID is required for RTGS payments");
      }
      if (
        submissionData.paymentMethod === "Cheque" &&
        !submissionData.chequeId
      ) {
        throw new Error("Cheque ID is required for Cheque payments");
      }

      const response = await axios.put(
        `https://sales-order-server.onrender.com/api/edit/${entryToEdit._id}`,
        submissionData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const updatedEntry = response.data.data;
      toast.success("Entry updated successfully!");
      onEntryUpdated(updatedEntry);
      setView("options");
      onClose();
    } catch (err) {
      console.error("Edit submission error:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to update entry.";
      const errorDetails = err.response?.data?.errors
        ? err.response.data.errors.join(", ")
        : err.response?.data?.error || "";
      setError(
        errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage
      );
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const onUpdateSubmit = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    setLoading(true);
    try {
      const submissionData = {
        sostatus: updateData.sostatus || "Pending for Approval",
        remarks: updateData.remarks || null,
      };

      const response = await axios.put(
        `https://sales-order-server.onrender.com/api/edit/${entryToEdit._id}`,
        submissionData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const updatedEntry = response.data.data;
      toast.success("Approvals updated successfully!");
      onEntryUpdated(updatedEntry);
      setView("options");
      onClose();
    } catch (err) {
      console.error("Update submission error:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to update approvals.";
      const errorDetails = err.response?.data?.errors
        ? err.response.data.errors.join(", ")
        : err.response?.data?.error || err.message;
      setError(
        errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage
      );
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const addProduct = () => {
    const newProducts = [
      ...products,
      {
        productType: "",
        size: "N/A",
        spec: "N/A",
        qty: "",
        unitPrice: "",
        serialNos: "",
        modelNos: "",
        gst: "0",
      },
    ];
    setValue("products", newProducts);
    setFormData((prev) => ({ ...prev, products: newProducts }));
  };

  const removeProduct = (index) => {
    const newProducts = products.filter((_, i) => i !== index);
    setValue(
      "products",
      newProducts.length > 0
        ? newProducts
        : [
            {
              productType: "",
              size: "N/A",
              spec: "N/A",
              qty: "",
              unitPrice: "",
              serialNos: "",
              modelNos: "",
              gst: "0",
            },
          ]
    );
    setFormData((prev) => ({
      ...prev,
      products:
        newProducts.length > 0
          ? newProducts
          : [
              {
                productType: "",
                size: "N/A",
                spec: "N/A",
                qty: "",
                unitPrice: "",
                serialNos: "",
                modelNos: "",
                gst: "0",
              },
            ],
    }));
  };

  const states = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
  ];

  const citiesByState = useMemo(
    () => ({
      "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore"],
      "Arunachal Pradesh": ["Itanagar", "Naharlagun"],
      Assam: ["Guwahati", "Silchar", "Dibrugarh"],
      Bihar: ["Patna", "Gaya", "Bhagalpur"],
      Chhattisgarh: ["Raipur", "Bhilai", "Bilaspur"],
      Goa: ["Panaji", "Margao"],
      Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
      Haryana: ["Gurgaon", "Faridabad", "Panipat"],
      "Himachal Pradesh": ["Shimla", "Dharamshala"],
      Jharkhand: ["Ranchi", "Jamshedpur", "Dhanbad"],
      Karnataka: ["Bangalore", "Mysore", "Hubli"],
      Kerala: ["Kochi", "Thiruvananthapuram", "Kozhikode"],
      "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur"],
      Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik"],
      Manipur: ["Imphal"],
      Meghalaya: ["Shillong"],
      Mizoram: ["Aizawl"],
      Nagaland: ["Kohima", "Dimapur"],
      Odisha: ["Bhubaneswar", "Cuttack", "Rourkela"],
      Punjab: ["Ludhiana", "Amritsar", "Jalandhar"],
      Rajasthan: ["Jaipur", "Jodhpur", "Udaipur"],
      Sikkim: ["Gangtok"],
      "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
      Telangana: ["Hyderabad", "Warangal"],
      Tripura: ["Agartala"],
      "Uttar Pradesh": ["Lucknow", "Kanpur", "Noida", "Ghaziabad"],
      Uttarakhand: ["Dehradun", "Haridwar"],
      "West Bengal": ["Kolkata", "Howrah", "Durgapur"],
      "Andaman and Nicobar Islands": ["Port Blair"],
      Chandigarh: ["Chandigarh"],
      "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Silvassa"],
      Delhi: ["New Delhi"],
      "Jammu and Kashmir": ["Srinagar", "Jammu"],
      Ladakh: ["Leh"],
      Lakshadweep: ["Kavaratti"],
      Puducherry: ["Puducherry"],
    }),
    []
  );

  const renderOptions = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        padding: "1rem",
      }}
    >
      <StyledButton variant="primary" onClick={() => setView("edit")}>
        Edit Full Details
      </StyledButton>
      <StyledButton variant="info" onClick={() => setView("update")}>
        Update Approvals
      </StyledButton>
    </div>
  );

  const renderEditForm = () => (
    <Form onSubmit={handleSubmit(onEditSubmit)}>
      <FormSection>
        <Form.Group controlId="soDate">
          <Form.Label>📅 SO Date *</Form.Label>
          <Form.Control
            type="date"
            {...register("soDate", { required: "SO Date is required" })}
            onChange={(e) =>
              debouncedHandleInputChange("soDate", e.target.value)
            }
            isInvalid={!!errors.soDate}
          />
          <Form.Control.Feedback type="invalid">
            {errors.soDate?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="committedDate">
          <Form.Label>📅 Committed Date</Form.Label>
          <Form.Control
            type="date"
            {...register("committedDate")}
            onChange={(e) =>
              debouncedHandleInputChange("committedDate", e.target.value)
            }
            isInvalid={!!errors.committedDate}
          />
        </Form.Group>

        <Form.Group controlId="dispatchFrom">
          <Form.Label>📍 Dispatch From</Form.Label>
          <Form.Control
            {...register("dispatchFrom")}
            onChange={(e) =>
              debouncedHandleInputChange("dispatchFrom", e.target.value)
            }
            isInvalid={!!errors.dispatchFrom}
          />
        </Form.Group>

        <Form.Group controlId="status">
          <Form.Label>📊 Status</Form.Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Form.Select
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  debouncedHandleInputChange("status", e.target.value);
                }}
                isInvalid={!!errors.status}
              >
                <option value="Pending">Pending</option>
                <option value="Delivered">Delivered</option>
                <option value="Hold">Hold</option>
                <option value="Order Canceled">Order Canceled</option>
                <option value="Dispatched">Dispatched</option>
                <option value="In Transit">In Transit</option>
              </Form.Select>
            )}
          />
        </Form.Group>

        <Form.Group controlId="dispatchDate">
          <Form.Label>📅 Dispatch Date</Form.Label>
          <Form.Control
            type="date"
            {...register("dispatchDate")}
            onChange={(e) =>
              debouncedHandleInputChange("dispatchDate", e.target.value)
            }
            isInvalid={!!errors.dispatchDate}
          />
        </Form.Group>

        <Form.Group controlId="name">
          <Form.Label>👤 Name</Form.Label>
          <Form.Control
            {...register("name")}
            onChange={(e) => debouncedHandleInputChange("name", e.target.value)}
            isInvalid={!!errors.name}
          />
        </Form.Group>

        <Form.Group controlId="partyAndAddress">
          <Form.Label>🏠 Party & Address</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            {...register("partyAndAddress")}
            onChange={(e) =>
              debouncedHandleInputChange("partyAndAddress", e.target.value)
            }
            isInvalid={!!errors.partyAndAddress}
          />
        </Form.Group>

        <Form.Group controlId="state">
          <Form.Label>🗺️ State</Form.Label>
          <Controller
            name="state"
            control={control}
            render={({ field }) => (
              <Form.Select
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  debouncedHandleInputChange("state", e.target.value);
                }}
                isInvalid={!!errors.state}
              >
                <option value="">-- Select State --</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </Form.Select>
            )}
          />
        </Form.Group>

        <Form.Group controlId="city">
          <Form.Label>🌆 City</Form.Label>
          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <Form.Select
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  debouncedHandleInputChange("city", e.target.value);
                }}
                isInvalid={!!errors.city}
                disabled={!selectedState}
              >
                <option value="">-- Select City --</option>
                {selectedState &&
                  citiesByState[selectedState]?.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
              </Form.Select>
            )}
          />
        </Form.Group>

        <Form.Group controlId="pinCode">
          <Form.Label>📮 Pin Code</Form.Label>
          <Form.Control
            {...register("pinCode", {
              pattern: {
                value: /^\d{6}$/,
                message: "Pin Code must be 6 digits",
              },
            })}
            onChange={(e) =>
              debouncedHandleInputChange("pinCode", e.target.value)
            }
            isInvalid={!!errors.pinCode}
          />
          <Form.Control.Feedback type="invalid">
            {errors.pinCode?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="contactNo">
          <Form.Label>📱 Contact Number</Form.Label>
          <Form.Control
            {...register("contactNo", {
              pattern: {
                value: /^\d{10}$/,
                message: "Contact number must be 10 digits",
              },
            })}
            onChange={(e) =>
              debouncedHandleInputChange("contactNo", e.target.value)
            }
            isInvalid={!!errors.contactNo}
          />
          <Form.Control.Feedback type="invalid">
            {errors.contactNo?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="customername">
          <Form.Label>👤 Customer Name</Form.Label>
          <Form.Control
            {...register("customername")}
            onChange={(e) =>
              debouncedHandleInputChange("customername", e.target.value)
            }
            isInvalid={!!errors.customername}
          />
        </Form.Group>

        <Form.Group controlId="customerEmail">
          <Form.Label>📧 Customer Email</Form.Label>
          <Form.Control
            type="email"
            {...register("customerEmail", {
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email format",
              },
            })}
            onChange={(e) =>
              debouncedHandleInputChange("customerEmail", e.target.value)
            }
            isInvalid={!!errors.customerEmail}
          />
          <Form.Control.Feedback type="invalid">
            {errors.customerEmail?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="orderType">
          <Form.Label>📦 Order Type</Form.Label>
          <Controller
            name="orderType"
            control={control}
            render={({ field }) => (
              <Form.Select
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  debouncedHandleInputChange("orderType", e.target.value);
                }}
                isInvalid={!!errors.orderType}
              >
                <option value="GEM order">GEM order</option>
                <option value="Govt. order">Govt. order</option>
                <option value="Private order">Private order</option>
                <option value="For Demo">For Demo</option>
                <option value="Replacement">Replacement</option>
                <option value="For repair purpose">For repair purpose</option>
              </Form.Select>
            )}
          />
        </Form.Group>

        {/* Products Section */}
        <div>
          <Form.Label>📦 Products *</Form.Label>
          {products.map((product, index) => (
            <ProductContainer key={index}>
              <ProductHeader>
                <h5>Product {index + 1}</h5>
                {products.length > 1 && (
                  <StyledButton
                    variant="danger"
                    onClick={() => removeProduct(index)}
                    style={{ padding: "5px 10px", fontSize: "0.9rem" }}
                  >
                    Remove
                  </StyledButton>
                )}
              </ProductHeader>
              <Form.Group controlId={`products.${index}.productType`}>
                <Form.Label>📦 Product Type *</Form.Label>
                <Form.Control
                  {...register(`products.${index}.productType`, {
                    required: "Product Type is required",
                  })}
                  onChange={(e) =>
                    debouncedHandleInputChange(
                      `products.${index}.productType`,
                      e.target.value,
                      index
                    )
                  }
                  isInvalid={!!errors.products?.[index]?.productType}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.products?.[index]?.productType?.message}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId={`products.${index}.size`}>
                <Form.Label>📏 Size</Form.Label>
                <Form.Control
                  {...register(`products.${index}.size`)}
                  onChange={(e) =>
                    debouncedHandleInputChange(
                      `products.${index}.size`,
                      e.target.value,
                      index
                    )
                  }
                  isInvalid={!!errors.products?.[index]?.size}
                />
              </Form.Group>
              <Form.Group controlId={`products.${index}.spec`}>
                <Form.Label>📋 Specification</Form.Label>
                <Form.Control
                  {...register(`products.${index}.spec`)}
                  onChange={(e) =>
                    debouncedHandleInputChange(
                      `products.${index}.spec`,
                      e.target.value,
                      index
                    )
                  }
                  isInvalid={!!errors.products?.[index]?.spec}
                />
              </Form.Group>
              <Form.Group controlId={`products.${index}.qty`}>
                <Form.Label>🔢 Quantity *</Form.Label>
                <Form.Control
                  type="number"
                  {...register(`products.${index}.qty`, {
                    required: "Quantity is required",
                    min: { value: 1, message: "Quantity must be at least 1" },
                  })}
                  onChange={(e) =>
                    debouncedHandleInputChange(
                      `products.${index}.qty`,
                      e.target.value,
                      index
                    )
                  }
                  isInvalid={!!errors.products?.[index]?.qty}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.products?.[index]?.qty?.message}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId={`products.${index}.unitPrice`}>
                <Form.Label>💰 Unit Price *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  {...register(`products.${index}.unitPrice`, {
                    required: "Unit Price is required",
                    min: {
                      value: 0,
                      message: "Unit Price cannot be negative",
                    },
                  })}
                  onChange={(e) =>
                    debouncedHandleInputChange(
                      `products.${index}.unitPrice`,
                      e.target.value,
                      index
                    )
                  }
                  isInvalid={!!errors.products?.[index]?.unitPrice}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.products?.[index]?.unitPrice?.message}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId={`products.${index}.serialNos`}>
                <Form.Label>🔢 Serial Nos (comma-separated)</Form.Label>
                <Form.Control
                  {...register(`products.${index}.serialNos`)}
                  onChange={(e) =>
                    debouncedHandleInputChange(
                      `products.${index}.serialNos`,
                      e.target.value,
                      index
                    )
                  }
                  isInvalid={!!errors.products?.[index]?.serialNos}
                  placeholder="e.g., SN1, SN2, SN3"
                />
              </Form.Group>
              <Form.Group controlId={`products.${index}.modelNos`}>
                <Form.Label>🔢 Model Nos (comma-separated)</Form.Label>
                <Form.Control
                  {...register(`products.${index}.modelNos`)}
                  onChange={(e) =>
                    debouncedHandleInputChange(
                      `products.${index}.modelNos`,
                      e.target.value,
                      index
                    )
                  }
                  isInvalid={!!errors.products?.[index]?.modelNos}
                  placeholder="e.g., MN1, MN2, MN3"
                />
              </Form.Group>
              <Form.Group controlId={`products.${index}.gst`}>
                <Form.Label>📊 GST (%)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  {...register(`products.${index}.gst`, {
                    min: { value: 0, message: "GST cannot be negative" },
                    max: { value: 100, message: "GST cannot exceed 100%" },
                  })}
                  onChange={(e) =>
                    debouncedHandleInputChange(
                      `products.${index}.gst`,
                      e.target.value,
                      index
                    )
                  }
                  isInvalid={!!errors.products?.[index]?.gst}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.products?.[index]?.gst?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </ProductContainer>
          ))}
          <StyledButton
            variant="primary"
            onClick={addProduct}
            style={{ marginTop: "10px" }}
          >
            Add Product
          </StyledButton>
        </div>

        <Form.Group controlId="total">
          <Form.Label>💵 Total *</Form.Label>
          <Form.Control
            type="number"
            step="0.01"
            {...register("total", {
              required: "Total is required",
              min: { value: 0, message: "Total cannot be negative" },
            })}
            onChange={(e) =>
              debouncedHandleInputChange("total", e.target.value)
            }
            isInvalid={!!errors.total}
          />
          <Form.Control.Feedback type="invalid">
            {errors.total?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="paymentCollected">
          <Form.Label>💰 Payment Collected</Form.Label>
          <Form.Control
            type="number"
            step="0.01"
            {...register("paymentCollected", {
              min: {
                value: 0,
                message: "Payment Collected cannot be negative",
              },
            })}
            onChange={(e) =>
              debouncedHandleInputChange("paymentCollected", e.target.value)
            }
            isInvalid={!!errors.paymentCollected}
          />
          <Form.Control.Feedback type="invalid">
            {errors.paymentCollected?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="paymentMethod">
          <Form.Label>💳 Payment Method</Form.Label>
          <Controller
            name="paymentMethod"
            control={control}
            render={({ field }) => (
              <Form.Select
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  debouncedHandleInputChange("paymentMethod", e.target.value);
                }}
                isInvalid={!!errors.paymentMethod}
              >
                <option value="">-- Select Payment Method --</option>
                <option value="Cash">Cash</option>
                <option value="NEFT">NEFT</option>
                <option value="RTGS">RTGS</option>
                <option value="Cheque">Cheque</option>
                <option value="UPI">UPI</option>
                <option value="Credit Card">Credit Card</option>
              </Form.Select>
            )}
          />
        </Form.Group>

        <Form.Group controlId="paymentDue">
          <Form.Label>💰 Payment Due</Form.Label>
          <Form.Control
            type="number"
            step="0.01"
            {...register("paymentDue", {
              min: { value: 0, message: "Payment Due cannot be negative" },
            })}
            onChange={(e) =>
              debouncedHandleInputChange("paymentDue", e.target.value)
            }
            isInvalid={!!errors.paymentDue}
          />
          <Form.Control.Feedback type="invalid">
            {errors.paymentDue?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="neftTransactionId">
          <Form.Label>📄 NEFT/RTGS Transaction ID</Form.Label>
          <Form.Control
            {...register("neftTransactionId", {
              required:
                paymentMethod === "NEFT" || paymentMethod === "RTGS"
                  ? "NEFT/RTGS Transaction ID is required"
                  : false,
            })}
            onChange={(e) =>
              debouncedHandleInputChange("neftTransactionId", e.target.value)
            }
            isInvalid={!!errors.neftTransactionId}
            disabled={paymentMethod !== "NEFT" && paymentMethod !== "RTGS"}
          />
          <Form.Control.Feedback type="invalid">
            {errors.neftTransactionId?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="chequeId">
          <Form.Label>📄 Cheque ID</Form.Label>
          <Form.Control
            {...register("chequeId", {
              required:
                paymentMethod === "Cheque" ? "Cheque ID is required" : false,
            })}
            onChange={(e) =>
              debouncedHandleInputChange("chequeId", e.target.value)
            }
            isInvalid={!!errors.chequeId}
            disabled={paymentMethod !== "Cheque"}
          />
          <Form.Control.Feedback type="invalid">
            {errors.chequeId?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="paymentTerms">
          <Form.Label>💳 Payment Terms</Form.Label>
          <Form.Control
            {...register("paymentTerms")}
            onChange={(e) =>
              debouncedHandleInputChange("paymentTerms", e.target.value)
            }
            isInvalid={!!errors.paymentTerms}
          />
        </Form.Group>

        <Form.Group controlId="amount2">
          <Form.Label>💰 Amount 2</Form.Label>
          <Form.Control
            type="number"
            step="0.01"
            {...register("amount2", {
              min: { value: 0, message: "Amount 2 cannot be negative" },
            })}
            onChange={(e) =>
              debouncedHandleInputChange("amount2", e.target.value)
            }
            isInvalid={!!errors.amount2}
          />
          <Form.Control.Feedback type="invalid">
            {errors.amount2?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="freightcs">
          <Form.Label>🚚 Freight Charges & Status</Form.Label>
          <Form.Control
            {...register("freightcs")}
            onChange={(e) =>
              debouncedHandleInputChange("freightcs", e.target.value)
            }
            isInvalid={!!errors.freightcs}
          />
        </Form.Group>

        <Form.Group controlId="installation">
          <Form.Label>🛠️ Installation Charges</Form.Label>
          <Form.Control
            {...register("installation")}
            onChange={(e) =>
              debouncedHandleInputChange("installation", e.target.value)
            }
            isInvalid={!!errors.installation}
          />
        </Form.Group>

        <Form.Group controlId="installationStatus">
          <Form.Label>🛠️ Installation Status</Form.Label>
          <Controller
            name="installationStatus"
            control={control}
            render={({ field }) => (
              <Form.Select
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  debouncedHandleInputChange(
                    "installationStatus",
                    e.target.value
                  );
                }}
                isInvalid={!!errors.installationStatus}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Failed">Failed</option>
              </Form.Select>
            )}
          />
        </Form.Group>

        <Form.Group controlId="remarksByInstallation">
          <Form.Label>✏️ Remarks by Installation</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            {...register("remarksByInstallation")}
            onChange={(e) =>
              debouncedHandleInputChange(
                "remarksByInstallation",
                e.target.value
              )
            }
            isInvalid={!!errors.remarksByInstallation}
          />
        </Form.Group>

        <Form.Group controlId="dispatchStatus">
          <Form.Label>🚚 Dispatch Status</Form.Label>
          <Controller
            name="dispatchStatus"
            control={control}
            render={({ field }) => (
              <Form.Select
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  debouncedHandleInputChange("dispatchStatus", e.target.value);
                }}
                isInvalid={!!errors.dispatchStatus}
              >
                <option value="Not Dispatched">Not Dispatched</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Delivered">Delivered</option>
                <option value="Docket Awaited Dispatched">
                  Docket Awaited Dispatched
                </option>
              </Form.Select>
            )}
          />
        </Form.Group>

        <Form.Group controlId="salesPerson">
          <Form.Label>👤 Sales Person</Form.Label>
          <Form.Control
            {...register("salesPerson")}
            onChange={(e) =>
              debouncedHandleInputChange("salesPerson", e.target.value)
            }
            isInvalid={!!errors.salesPerson}
          />
        </Form.Group>

        <Form.Group controlId="company">
          <Form.Label>🏢 Company</Form.Label>
          <Controller
            name="company"
            control={control}
            render={({ field }) => (
              <Form.Select
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  debouncedHandleInputChange("company", e.target.value);
                }}
                isInvalid={!!errors.company}
              >
                <option value="Promark">Promark</option>
                <option value="Promine">Promine</option>
                <option value="Others">Others</option>
              </Form.Select>
            )}
          />
        </Form.Group>

        <Form.Group controlId="transporter">
          <Form.Label>🚛 Transporter</Form.Label>
          <Form.Control
            {...register("transporter")}
            onChange={(e) =>
              debouncedHandleInputChange("transporter", e.target.value)
            }
            isInvalid={!!errors.transporter}
          />
        </Form.Group>

        <Form.Group controlId="transporterDetails">
          <Form.Label>📋 Transporter Details</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            {...register("transporterDetails")}
            onChange={(e) =>
              debouncedHandleInputChange("transporterDetails", e.target.value)
            }
            isInvalid={!!errors.transporterDetails}
          />
        </Form.Group>

        <Form.Group controlId="docketNo">
          <Form.Label>📄 Docket No</Form.Label>
          <Form.Control
            {...register("docketNo")}
            onChange={(e) =>
              debouncedHandleInputChange("docketNo", e.target.value)
            }
            isInvalid={!!errors.docketNo}
          />
        </Form.Group>

        <Form.Group controlId="receiptDate">
          <Form.Label>📅 Receipt Date</Form.Label>
          <Form.Control
            type="date"
            {...register("receiptDate")}
            onChange={(e) =>
              debouncedHandleInputChange("receiptDate", e.target.value)
            }
            isInvalid={!!errors.receiptDate}
          />
        </Form.Group>

        <Form.Group controlId="shippingAddress">
          <Form.Label>📦 Shipping Address</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            {...register("shippingAddress")}
            onChange={(e) =>
              debouncedHandleInputChange("shippingAddress", e.target.value)
            }
            isInvalid={!!errors.shippingAddress}
          />
        </Form.Group>

        <Form.Group controlId="billingAddress">
          <Form.Label>🏠 Billing Address</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            {...register("billingAddress")}
            onChange={(e) =>
              debouncedHandleInputChange("billingAddress", e.target.value)
            }
            isInvalid={!!errors.billingAddress}
          />
        </Form.Group>

        <Form.Group controlId="invoiceNo">
          <Form.Label>📄 Invoice No</Form.Label>
          <Form.Control
            {...register("invoiceNo")}
            onChange={(e) =>
              debouncedHandleInputChange("invoiceNo", e.target.value)
            }
            isInvalid={!!errors.invoiceNo}
          />
        </Form.Group>

        <Form.Group controlId="invoiceDate">
          <Form.Label>📅 Invoice Date</Form.Label>
          <Form.Control
            type="date"
            {...register("invoiceDate")}
            onChange={(e) =>
              debouncedHandleInputChange("invoiceDate", e.target.value)
            }
            isInvalid={!!errors.invoiceDate}
          />
        </Form.Group>

        <Form.Group controlId="fulfillingStatus">
          <Form.Label>📋 Fulfilling Status</Form.Label>
          <Form.Control
            {...register("fulfillingStatus")}
            onChange={(e) =>
              debouncedHandleInputChange("fulfillingStatus", e.target.value)
            }
            isInvalid={!!errors.fulfillingStatus}
          />
        </Form.Group>

        <Form.Group controlId="remarksByProduction">
          <Form.Label>✏️ Remarks by Production</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            {...register("remarksByProduction")}
            onChange={(e) =>
              debouncedHandleInputChange("remarksByProduction", e.target.value)
            }
            isInvalid={!!errors.remarksByProduction}
          />
        </Form.Group>

        <Form.Group controlId="remarksByAccounts">
          <Form.Label>✏️ Remarks by Accounts</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            {...register("remarksByAccounts")}
            onChange={(e) =>
              debouncedHandleInputChange("remarksByAccounts", e.target.value)
            }
            isInvalid={!!errors.remarksByAccounts}
          />
        </Form.Group>

        <Form.Group controlId="paymentReceived">
          <Form.Label>💰 Payment Received</Form.Label>
          <Controller
            name="paymentReceived"
            control={control}
            render={({ field }) => (
              <Form.Select
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  debouncedHandleInputChange("paymentReceived", e.target.value);
                }}
                isInvalid={!!errors.paymentReceived}
              >
                <option value="Not Received">Not Received</option>
                <option value="Received">Received</option>
              </Form.Select>
            )}
          />
        </Form.Group>

        <Form.Group controlId="billNumber">
          <Form.Label>📄 Bill Number</Form.Label>
          <Form.Control
            {...register("billNumber")}
            onChange={(e) =>
              debouncedHandleInputChange("billNumber", e.target.value)
            }
            isInvalid={!!errors.billNumber}
          />
        </Form.Group>

        <Form.Group controlId="completionStatus">
          <Form.Label>📋 Completion Status</Form.Label>
          <Controller
            name="completionStatus"
            control={control}
            render={({ field }) => (
              <Form.Select
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  debouncedHandleInputChange(
                    "completionStatus",
                    e.target.value
                  );
                }}
                isInvalid={!!errors.completionStatus}
              >
                <option value="In Progress">In Progress</option>
                <option value="Complete">Complete</option>
              </Form.Select>
            )}
          />
        </Form.Group>

        <Form.Group controlId="fulfillmentDate">
          <Form.Label>📅 Fulfillment Date</Form.Label>
          <Form.Control
            type="date"
            {...register("fulfillmentDate")}
            onChange={(e) =>
              debouncedHandleInputChange("fulfillmentDate", e.target.value)
            }
            isInvalid={!!errors.fulfillmentDate}
          />
        </Form.Group>
      </FormSection>
    </Form>
  );

  const renderUpdateForm = () => (
    <Form onSubmit={handleSubmit(onUpdateSubmit)}>
      <FormSection>
        <Form.Group controlId="sostatus">
          <Form.Label>📊 SO Status</Form.Label>
          <Form.Select
            value={updateData.sostatus}
            onChange={handleUpdateInputChange}
            name="sostatus"
          >
            <option value="Pending for Approval">Pending for Approval</option>
            <option value="Accounts Approved">Accounts Approved</option>
            <option value="Approved">Approved</option>
          </Form.Select>
        </Form.Group>

        <Form.Group controlId="remarks">
          <Form.Label>✏️ Remarks</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={updateData.remarks}
            onChange={handleUpdateInputChange}
            name="remarks"
            maxLength={500}
            placeholder="Enter your remarks here..."
          />
          <Form.Text>{updateData.remarks.length}/500</Form.Text>
        </Form.Group>
      </FormSection>
    </Form>
  );

  return (
    <StyledModal
      show={isOpen}
      onHide={onClose}
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title className="text-center w-100 d-flex align-items-center justify-content-center">
          {view === "options" ? (
            <>
              <FaCog className="me-2" />
              Sales Order Management
            </>
          ) : view === "edit" ? (
            <>
              <FaEdit className="me-2" />
              Edit Entry
            </>
          ) : (
            <>
              <FaSyncAlt className="me-2" />
              Update Approvals
            </>
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {view === "options" && renderOptions()}
        {view === "edit" && renderEditForm()}
        {view === "update" && renderUpdateForm()}
      </Modal.Body>

      <Modal.Footer>
        <StyledButton variant="danger" onClick={onClose} disabled={loading}>
          Close
        </StyledButton>
        {(view === "edit" || view === "update") &&
          (showConfirm ? (
            <>
              <StyledButton
                variant="warning"
                onClick={() => setShowConfirm(false)}
                disabled={loading}
              >
                Cancel
              </StyledButton>
              <StyledButton
                variant="success"
                onClick={
                  view === "edit" ? handleSubmit(onEditSubmit) : onUpdateSubmit
                }
                disabled={loading}
              >
                {loading ? (
                  <Spinner as="span" animation="border" size="sm" />
                ) : (
                  "Confirm"
                )}
              </StyledButton>
            </>
          ) : (
            <StyledButton
              variant="primary"
              onClick={
                view === "edit" ? handleSubmit(onEditSubmit) : onUpdateSubmit
              }
              disabled={loading}
            >
              {loading ? (
                <Spinner as="span" animation="border" size="sm" />
              ) : view === "edit" ? (
                "Save Changes"
              ) : (
                "Update"
              )}
            </StyledButton>
          ))}
      </Modal.Footer>
    </StyledModal>
  );
}

export default EditEntry;
