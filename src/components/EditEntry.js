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

function EditEntry({ isOpen, onClose, onEntryUpdated, entryToEdit }) {
  const initialFormData = useMemo(
    () => ({
      soDate: "",
      serialno: "",
      committedDate: "",
      dispatchFrom: "",
      status: "Pending",
      dispatchDate: "",
      partyAndAddress: "",
      city: "",
      state: "",
      pinCode: "",
      name: "",
      contactNo: "",
      customerEmail: "",
      modelNo: "",
      productType: "",
      size: "",
      spec: "",
      productDetails: "",
      qty: "",
      unitPrice: "",
      gst: "",
      total: "",
      paymentTerms: "",
      amount2: "",
      freight: "",
      freightmode: "",
      installation: "",
      salesPerson: "",
      company: "",
      transporter: "",
      transporterDetails: "",
      docketNo: "",
      receiptDate: "",
      shippingAddress: "",
      billingAddress: "",
    }),
    []
  );

  const initialUpdateData = useMemo(
    () => ({
      sostatus: "Pending for Approval",
      remarks: "",
      invoiceNo: "",
      invoiceDate: "",
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
  } = useForm({
    mode: "onChange",
    defaultValues: initialFormData,
  });

  const selectedState = watch("state");

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
        serialno: entryToEdit.serialno || "",
        dispatchDate: entryToEdit.dispatchDate
          ? new Date(entryToEdit.dispatchDate).toISOString().split("T")[0]
          : "",
        partyAndAddress: entryToEdit.partyAndAddress || "",
        city: entryToEdit.city || "",
        state: entryToEdit.state || "",
        pinCode: entryToEdit.pinCode || "",
        name: entryToEdit.name || "",
        contactNo: entryToEdit.contactNo || "",
        customerEmail: entryToEdit.customerEmail || "",
        modelNo: entryToEdit.modelNo || "",
        productType: entryToEdit.productType || "",
        size: entryToEdit.size || "",
        spec: entryToEdit.spec || "",
        productDetails: entryToEdit.productDetails || "",
        qty: entryToEdit.qty !== undefined ? String(entryToEdit.qty) : "",
        unitPrice:
          entryToEdit.unitPrice !== undefined
            ? String(entryToEdit.unitPrice)
            : "",
        gst: entryToEdit.gst !== undefined ? String(entryToEdit.gst) : "",
        total: entryToEdit.total !== undefined ? String(entryToEdit.total) : "",
        paymentTerms: entryToEdit.paymentTerms || "",
        amount2:
          entryToEdit.amount2 !== undefined ? String(entryToEdit.amount2) : "",
        freight:
          entryToEdit.freight !== undefined ? String(entryToEdit.freight) : "",
        freightmode: entryToEdit.freightmode || "",
        freightmodes: entryToEdit.freightmodes || "",
        installation: entryToEdit.installation || "",
        salesPerson: entryToEdit.salesPerson || "",
        company: entryToEdit.company || "",
        transporter: entryToEdit.transporter || "",
        transporterDetails: entryToEdit.transporterDetails || "",
        shippingAddress: entryToEdit.shippingAddress || "",
        billingAddress: entryToEdit.billingAddress || "",
        docketNo: entryToEdit.docketNo || "",
        receiptDate: entryToEdit.receiptDate
          ? new Date(entryToEdit.receiptDate).toISOString().split("T")[0]
          : "",
      };
      const newUpdateData = {
        sostatus: entryToEdit.sostatus || "Pending for Approval",
        remarks: entryToEdit.remarks || "",
        invoiceNo: entryToEdit.invoiceNo || "",
        invoiceDate: entryToEdit.invoiceDate
          ? new Date(entryToEdit.invoiceDate).toISOString().split("T")[0]
          : "",
      };
      setFormData(newFormData);
      setUpdateData(newUpdateData);
      reset(newFormData);
      setView("options");
      setError(null);
      setShowConfirm(false);
    }
  }, [isOpen, entryToEdit, reset]);

  const debouncedHandleInputChange = useCallback(
    debounce((name, value) => {
      setFormData((prev) => ({
        ...prev,
        [name]:
          name === "contactNo"
            ? value.replace(/\D/g, "").slice(0, 10)
            : [
                "qty",
                "unitPrice",
                "gst",
                "total",
                "amount2",
                "freight",
              ].includes(name)
            ? value === ""
              ? ""
              : Number(value)
            : value,
      }));
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
        soDate: data.soDate || undefined,
        serialno: data.serialno || undefined,
        committedDate: data.committedDate || undefined,
        dispatchFrom: data.dispatchFrom || undefined,
        status: data.status || "Pending",
        dispatchDate: data.dispatchDate || undefined,
        partyAndAddress: data.partyAndAddress || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        pinCode: data.pinCode || undefined,
        name: data.name || undefined,
        contactNo: data.contactNo || undefined,
        customerEmail: data.customerEmail || undefined,
        modelNo: data.modelNo || undefined,
        productType: data.productType || undefined,
        size: data.size || undefined,
        spec: data.spec || undefined,
        productDetails: data.productDetails || undefined,
        qty: data.qty === "" ? undefined : Number(data.qty),
        unitPrice: data.unitPrice === "" ? undefined : Number(data.unitPrice),
        gst: data.gst === "" ? undefined : Number(data.gst),
        total: data.total === "" ? undefined : Number(data.total),
        paymentTerms: data.paymentTerms || undefined,
        amount2: data.amount2 === "" ? undefined : Number(data.amount2),
        freight: data.freight === "" ? undefined : Number(data.freight),
        freightmode: data.freightmode || undefined,
        installation: data.installation || undefined,
        salesPerson: data.salesPerson || undefined,
        company: data.company || undefined,
        transporter: data.transporter || undefined,
        transporterDetails: data.transporterDetails || undefined,
        shippingAddress: data.shippingAddress || undefined,
        billingAddress: data.billingAddress || undefined,
        docketNo: data.docketNo || undefined,
        receiptDate: data.receiptDate || undefined,
      };

      const response = await axios.put(
        `http://localhost:5000/api/edit/${entryToEdit._id}`,
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
        err.response?.data?.message || "Failed to update entry.";
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

  const onUpdateSubmit = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    setLoading(true);
    try {
      const submissionData = {
        sostatus: updateData.sostatus || "Pending for Approval",
        remarks: updateData.remarks || undefined,
        invoiceNo: updateData.invoiceNo || undefined,
        invoiceDate: updateData.invoiceDate || undefined,
      };

      const response = await axios.put(
        `http://localhost:5000/api/edit/${entryToEdit._id}`,
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
      "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati"],
      "Arunachal Pradesh": ["Itanagar", "Tawang", "Ziro", "Pasighat"],
      Assam: ["Guwahati", "Dibrugarh", "Jorhat", "Silchar"],
      Bihar: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur"],
      Chhattisgarh: ["Raipur", "Bilaspur", "Durg", "Korba"],
      Goa: ["Panaji", "Margao", "Vasco da Gama", "Mapusa"],
      Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
      Haryana: ["Gurgaon", "Faridabad", "Panipat", "Ambala"],
      "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Mandi"],
      Jharkhand: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro"],
      Karnataka: ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi"],
      Kerala: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Kannur"],
      "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur"],
      Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik"],
      Manipur: ["Imphal", "Churachandpur", "Thoubal", "Bishnupur"],
      Meghalaya: ["Shillong", "Tura", "Nongpoh", "Cherrapunjee"],
      Mizoram: ["Aizawl", "Lunglei", "Champhai", "Serchhip"],
      Nagaland: ["Kohima", "Dimapur", "Mokokchung", "Tuensang"],
      Odisha: ["Bhubaneswar", "Cuttack", "Rourkela", "Puri"],
      Punjab: ["Amritsar", "Ludhiana", "Patiala", "Jalandhar"],
      Rajasthan: ["Jaipur", "Udaipur", "Jodhpur", "Kota"],
      Sikkim: ["Gangtok", "Namchi", "Pelling", "Geyzing"],
      "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"],
      Telangana: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"],
      Tripura: ["Agartala", "Udaipur", "Dharmanagar", "Kailashahar"],
      "Uttar Pradesh": [
        "Lucknow",
        "Kanpur",
        "Varanasi",
        "Agra",
        "Allahabad",
        "Ghaziabad",
        "Noida",
        "Meerut",
        "Aligarh",
        "Bareilly",
        "Badaun",
      ],
      Uttarakhand: ["Dehradun", "Haridwar", "Nainital", "Rishikesh"],
      "West Bengal": ["Kolkata", "Darjeeling", "Siliguri", "Howrah"],
      "Andaman and Nicobar Islands": [
        "Port Blair",
        "Havelock Island",
        "Diglipur",
      ],
      Chandigarh: ["Chandigarh"],
      "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
      Delhi: ["New Delhi"],
      "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla"],
      Ladakh: ["Leh", "Kargil"],
      Lakshadweep: ["Kavaratti", "Agatti", "Minicoy"],
      Puducherry: ["Puducherry", "Karaikal", "Mahe", "Yanam"],
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
          <Form.Control.Feedback type="invalid">
            {errors.committedDate?.message}
          </Form.Control.Feedback>
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
          <Form.Control.Feedback type="invalid">
            {errors.dispatchFrom?.message}
          </Form.Control.Feedback>
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
          <Form.Control.Feedback type="invalid">
            {errors.status?.message}
          </Form.Control.Feedback>
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
          <Form.Control.Feedback type="invalid">
            {errors.dispatchDate?.message}
          </Form.Control.Feedback>
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
          <Form.Control.Feedback type="invalid">
            {errors.partyAndAddress?.message}
          </Form.Control.Feedback>
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
          <Form.Control.Feedback type="invalid">
            {errors.state?.message}
          </Form.Control.Feedback>
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
          <Form.Control.Feedback type="invalid">
            {errors.city?.message}
          </Form.Control.Feedback>
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

        <Form.Group controlId="name">
          <Form.Label>👤 Contact Person Name</Form.Label>
          <Form.Control
            {...register("name")}
            onChange={(e) => debouncedHandleInputChange("name", e.target.value)}
            isInvalid={!!errors.name}
          />
          <Form.Control.Feedback type="invalid">
            {errors.name?.message}
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

        <Form.Group controlId="shippingAddress">
          <Form.Label>📦 Shipping Address *</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            {...register("shippingAddress", {
              required: "Shipping address is required",
            })}
            onChange={(e) =>
              debouncedHandleInputChange("shippingAddress", e.target.value)
            }
            isInvalid={!!errors.shippingAddress}
          />
          <Form.Control.Feedback type="invalid">
            {errors.shippingAddress?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="billingAddress">
          <Form.Label>🏠 Billing Address *</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            {...register("billingAddress", {
              required: "Billing address is required",
            })}
            onChange={(e) =>
              debouncedHandleInputChange("billingAddress", e.target.value)
            }
            isInvalid={!!errors.billingAddress}
          />
          <Form.Control.Feedback type="invalid">
            {errors.billingAddress?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="modelNo">
          <Form.Label>🔢 Model No</Form.Label>
          <Form.Control
            placeholder="Enter Model number"
            {...register("modelNo")}
            onChange={(e) =>
              debouncedHandleInputChange("modelNo", e.target.value)
            }
            isInvalid={!!errors.modelNo}
          />
          <Form.Control.Feedback type="invalid">
            {errors.modelNo?.message}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="serialno" style={{ marginBottom: "20px" }}>
          <Form.Label
            style={{
              fontWeight: "600",
              color: "#333",
              marginBottom: "8px",
            }}
          >
            🏷️ Serial No
          </Form.Label>
          <Form.Control
            type="text"
            {...register("serialno")}
            onChange={(e) =>
              debouncedHandleInputChange("serialno", e.target.value)
            }
            placeholder="Enter serial number"
            style={{
              borderRadius: "10px",
              border: "1px solid #ced4da",
              padding: "12px",
              fontSize: "1rem",
              transition: "all 0.3s ease",
            }}
            onFocus={(e) =>
              (e.target.style.boxShadow = "0 0 10px rgba(37, 117, 252, 0.5)")
            }
            onBlur={(e) => (e.target.style.boxShadow = "none")}
            isInvalid={!!errors.serialno}
          />
          <Form.Control.Feedback type="invalid">
            {errors.serialno?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="productType">
          <Form.Label>📦 Product Type</Form.Label>
          <Form.Control
            {...register("productType")}
            onChange={(e) =>
              debouncedHandleInputChange("productType", e.target.value)
            }
            isInvalid={!!errors.productType}
          />
          <Form.Control.Feedback type="invalid">
            {errors.productType?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="size">
          <Form.Label>📏 Size</Form.Label>
          <Form.Control
            {...register("size")}
            onChange={(e) => debouncedHandleInputChange("size", e.target.value)}
            isInvalid={!!errors.size}
          />
          <Form.Control.Feedback type="invalid">
            {errors.size?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="spec">
          <Form.Label>📋 Specification</Form.Label>
          <Form.Control
            {...register("spec")}
            onChange={(e) => debouncedHandleInputChange("spec", e.target.value)}
            isInvalid={!!errors.spec}
          />
          <Form.Control.Feedback type="invalid">
            {errors.spec?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="productDetails">
          <Form.Label>📝 Product Details</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            {...register("productDetails")}
            onChange={(e) =>
              debouncedHandleInputChange("productDetails", e.target.value)
            }
            isInvalid={!!errors.productDetails}
          />
          <Form.Control.Feedback type="invalid">
            {errors.productDetails?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="qty">
          <Form.Label>🔢 Quantity *</Form.Label>
          <Form.Control
            type="number"
            {...register("qty", {
              required: "Quantity is required",
              min: { value: 1, message: "Quantity must be at least 1" },
            })}
            onChange={(e) => debouncedHandleInputChange("qty", e.target.value)}
            isInvalid={!!errors.qty}
          />
          <Form.Control.Feedback type="invalid">
            {errors.qty?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="unitPrice">
          <Form.Label>💰 Unit Price *</Form.Label>
          <Form.Control
            type="number"
            step="0.01"
            {...register("unitPrice", {
              required: "Unit Price is required",
              min: { value: 0, message: "Unit Price cannot be negative" },
            })}
            onChange={(e) =>
              debouncedHandleInputChange("unitPrice", e.target.value)
            }
            isInvalid={!!errors.unitPrice}
          />
          <Form.Control.Feedback type="invalid">
            {errors.unitPrice?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="gst">
          <Form.Label>📊 GST (%)</Form.Label>
          <Form.Control
            type="number"
            step="0.01"
            {...register("gst", {
              min: { value: 0, message: "GST cannot be negative" },
              max: { value: 100, message: "GST cannot exceed 100%" },
            })}
            onChange={(e) => debouncedHandleInputChange("gst", e.target.value)}
            isInvalid={!!errors.gst}
          />
          <Form.Control.Feedback type="invalid">
            {errors.gst?.message}
          </Form.Control.Feedback>
        </Form.Group>

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

        <Form.Group controlId="paymentTerms">
          <Form.Label>💳 Payment Terms</Form.Label>
          <Form.Control
            {...register("paymentTerms")}
            onChange={(e) =>
              debouncedHandleInputChange("paymentTerms", e.target.value)
            }
            isInvalid={!!errors.paymentTerms}
          />
          <Form.Control.Feedback type="invalid">
            {errors.paymentTerms?.message}
          </Form.Control.Feedback>
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

        <Form.Group controlId="freight">
          <Form.Label>🚚 Freight</Form.Label>
          <Form.Control
            type="number"
            step="0.01"
            {...register("freight", {
              min: { value: 0, message: "Freight cannot be negative" },
            })}
            onChange={(e) =>
              debouncedHandleInputChange("freight", e.target.value)
            }
            isInvalid={!!errors.freight}
          />
          <Form.Control.Feedback type="invalid">
            {errors.freight?.message}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="freightMode">
          <Form.Label>🚚 Freight Status</Form.Label>
          <Form.Select
            {...register("freightmode")}
            onChange={(e) =>
              debouncedHandleInputChange("freightmode", e.target.value)
            }
            isInvalid={!!errors.freightmode}
            aria-label="Freight Mode"
          >
            <option value="">Select Freight Mode</option>
            <option value="To Pay">To Pay</option>
            <option value="Include">Include</option>
            <option value="Extra As Per Actual">Extra As Per Actual</option>
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {errors.freightmode?.message}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="freightmodes">
          <Form.Label>📦 Freight Mode</Form.Label>
          <Form.Select
            {...register("freightmodes")}
            onChange={(e) =>
              debouncedHandleInputChange("freightmodes", e.target.value)
            }
            isInvalid={!!errors.freightmode}
          >
            <option value="">Select Freight Mode</option>
            <option value="Others">Others</option>
            <option value="BlueDart">BlueDart</option>
            <option value="Om Logistics">Om Logistics</option>
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {errors.freightmodes?.message}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="installation">
          <Form.Label>🛠️ Installation Charges</Form.Label>
          <Form.Select
            {...register("installation")}
            onChange={(e) =>
              debouncedHandleInputChange("installation", e.target.value)
            }
            onFocus={(e) =>
              (e.target.style.boxShadow = "0 0 10px rgba(37, 117, 252, 0.5)")
            }
            onBlur={(e) => (e.target.style.boxShadow = "none")}
            isInvalid={!!errors.installation}
          >
            <option value="">Select Installation Charges</option>
            <option value="N/A">N/A</option>
            <option value="Include">Include</option>
            <option value="Others">Others</option>
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {errors.installation?.message}
          </Form.Control.Feedback>
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
          <Form.Control.Feedback type="invalid">
            {errors.salesPerson?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="company">
          <Form.Label>🏢 Company</Form.Label>
          <Form.Select
            {...register("company")}
            onChange={(e) =>
              debouncedHandleInputChange("company", e.target.value)
            }
            isInvalid={!!errors.company}
          >
            <option value="">Select Company</option>
            <option value="ProMark">ProMark</option>
            <option value="ProMine">ProMine</option>
            <option value="Others">Others</option>
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {errors.company?.message}
          </Form.Control.Feedback>
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
          <Form.Control.Feedback type="invalid">
            {errors.transporter?.message}
          </Form.Control.Feedback>
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
          <Form.Control.Feedback type="invalid">
            {errors.transporterDetails?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="docketNo">
          <Form.Label>📄 Docket No</Form.Label>
          <Form.Control
            placeholder="Enter Docket No"
            {...register("docketNo")}
            onChange={(e) =>
              debouncedHandleInputChange("docketNo", e.target.value)
            }
            isInvalid={!!errors.docketNo}
          />
          <Form.Control.Feedback type="invalid">
            {errors.docketNo?.message}
          </Form.Control.Feedback>
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
          <Form.Control.Feedback type="invalid">
            {errors.receiptDate?.message}
          </Form.Control.Feedback>
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
            <option value="Approved">Approved</option>
          </Form.Select>
        </Form.Group>

        <Form.Group controlId="invoiceNo">
          <Form.Label>📄 Invoice No</Form.Label>
          <Form.Control
            type="text"
            value={updateData.invoiceNo}
            onChange={handleUpdateInputChange}
            name="invoiceNo"
            placeholder="Enter invoice number"
          />
        </Form.Group>

        <Form.Group controlId="invoiceDate">
          <Form.Label>📅 Invoice Date</Form.Label>
          <Form.Control
            type="date"
            value={updateData.invoiceDate}
            onChange={handleUpdateInputChange}
            name="invoiceDate"
          />
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
