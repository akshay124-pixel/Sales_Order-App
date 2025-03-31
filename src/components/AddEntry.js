import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function AddEntry({ onSubmit, onClose }) {
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [formData, setFormData] = useState({
    soDate: "",
    committedDate: "",

    status: "Pending",
    name: "",
    partyAndAddress: "",
    city: "",
    state: "",
    pinCode: "",
    contactNo: "",
    customerEmail: "",

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
    freightmodes: "",
    installation: "",
    salesPerson: "",
    company: "",

    shippingAddress: "",
    billingAddress: "",
    sameAddress: false,
  });

  const statesAndCities = {
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
    Punjab: ["Amritsar", "Mohali", "Ludhiana", "Patiala", "Jalandhar"],
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
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prevData) => ({
        ...prevData,
        sameAddress: checked,
        billingAddress: checked
          ? prevData.shippingAddress
          : prevData.billingAddress,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
        ...(name === "shippingAddress" && prevData.sameAddress
          ? { billingAddress: value }
          : {}),
      }));
    }
  };

  const handleStateChange = (e) => {
    const state = e.target.value;
    setSelectedState(state);
    setSelectedCity("");
    setFormData((prev) => ({
      ...prev,
      state,
      city: "",
    }));
  };

  const handleCityChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
    setFormData((prev) => ({
      ...prev,
      city,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.soDate || !formData.qty || !formData.unitPrice) {
      toast.error(
        "Please fill in all required fields: SO Date, Quantity, Unit Price"
      );
      return;
    }

    const total =
      Number(formData.qty) * Number(formData.unitPrice) +
      (Number(formData.gst || 0) / 100) * Number(formData.unitPrice) +
      Number(formData.freight || 0) +
      Number(formData.amount2 || 0);

    const newEntry = {
      ...formData,
      soDate: new Date(formData.soDate),
      committedDate: formData.committedDate
        ? new Date(formData.committedDate)
        : null,
      receiptDate: formData.receiptDate ? new Date(formData.receiptDate) : null,
      qty: Number(formData.qty),
      unitPrice: Number(formData.unitPrice),
      gst: Number(formData.gst || 0),
      total: Number(total),
      amount2: Number(formData.amount2 || 0),
      freight: Number(formData.freight || 0),
    };

    console.log("Submitting data:", newEntry);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/orders",
        newEntry,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("Success response:", response.data);
      toast.success("Order submitted successfully!");
      onSubmit(response.data);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMessage = error.response?.data?.error || "An error occurred";
      const errorDetails = error.response?.data?.details || [];
      toast.error(`${errorMessage}\nDetails: ${JSON.stringify(errorDetails)}`);
    }
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(71, 85, 105, 0.8))",
          backdropFilter: "blur(4px)",
          zIndex: 999,
          opacity: 0,
          animation: "fadeIn 0.4s ease forwards",
        }}
        onClick={onClose}
      ></div>

      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "linear-gradient(145deg, #ffffff, #f8fafc)",
          padding: "2rem",
          borderRadius: "1.25rem",
          boxShadow:
            "0 15px 40px rgba(0, 0, 0, 0.25), 0 5px 15px rgba(0, 0, 0, 0.1)",
          zIndex: 1000,
          maxHeight: "85vh",
          width: "90%",
          maxWidth: "1000px",
          fontFamily: "'Poppins', sans-serif",
          opacity: 0,
          animation: "slideUp 0.4s ease forwards",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            textAlign: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: "600",
              color: "#2575fc",
              letterSpacing: "-0.025em",
              margin: 0,
            }}
          >
            Add Sales Entry
          </h2>
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "0.5rem",
              right: "0.5rem",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#64748b",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = "#1e293b";
              e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = "#64748b";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <svg
              style={{ width: "1.75rem", height: "1.75rem" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.5rem",
            width: "100%",
            padding: "0 1rem",
          }}
        >
          {[
            {
              label: "SO Date *",
              name: "soDate",
              type: "date",
              required: true,
            },
            { label: "Committed Date", name: "committedDate", type: "date" },

            {
              label: "Status",
              name: "status",
              type: "select",
              options: [
                "Pending",
                "Delivered",
                "Hold",
                "Order Canceled",
                "Dispatched",
                "In Transit",
              ],
            },
            { label: "Party & Address", name: "partyAndAddress", type: "text" },
            {
              label: "State *",
              name: "state",
              type: "select",
              options: Object.keys(statesAndCities),
              onChange: handleStateChange,
              required: true,
            },
            {
              label: "City *",
              name: "city",
              type: "select",
              options: selectedState ? statesAndCities[selectedState] : [],
              onChange: handleCityChange,
              required: true,
              disabled: !selectedState,
            },
            {
              label: "Pin Code",
              name: "pinCode",
              type: "tel",
              inputMode: "numeric",
              pattern: "[0-9]*",
              onChange: (e) =>
                setFormData((prev) => ({
                  ...prev,
                  [e.target.name]: e.target.value.replace(/[^0-9]/g, ""),
                })),
            },
            {
              label: "Contact Person Name",
              name: "name",
              type: "text",
            },
            {
              label: "Contact Person No",
              name: "contactNo",
              type: "tel",
              inputMode: "numeric",
              pattern: "[0-9]*",
              maxLength: 10,
              onChange: (e) =>
                setFormData((prev) => ({
                  ...prev,
                  [e.target.name]: e.target.value
                    .replace(/[^0-9]/g, "")
                    .slice(0, 10),
                })),
            },
            { label: "Customer Email", name: "customerEmail", type: "email" },

            { label: "Product Type", name: "productType", type: "text" },
            { label: "Size", name: "size", type: "text" },
            { label: "Spec", name: "spec", type: "text" },
            { label: "Product Details", name: "productDetails", type: "text" },
            {
              label: "Quantity *",
              name: "qty",
              type: "number",
              inputMode: "numeric",
              pattern: "[0-9]*",
              required: true,
              onChange: (e) =>
                setFormData((prev) => ({
                  ...prev,
                  [e.target.name]: e.target.value.replace(/[^0-9]/g, ""),
                })),
            },
            {
              label: "Unit Price *",
              name: "unitPrice",
              type: "number",
              inputMode: "decimal",
              required: true,
              onChange: (e) =>
                setFormData((prev) => ({
                  ...prev,
                  [e.target.name]: e.target.value
                    .replace(/[^0-9.]/g, "")
                    .replace(/(\..*)\./g, "$1"),
                })),
            },
            {
              label: "GST (%)",
              name: "gst",
              type: "number",
              inputMode: "decimal",
              onChange: (e) =>
                setFormData((prev) => ({
                  ...prev,
                  [e.target.name]: e.target.value
                    .replace(/[^0-9.]/g, "")
                    .replace(/(\..*)\./g, "$1"),
                })),
            },
            { label: "Payment Terms", name: "paymentTerms", type: "text" },
            {
              label: "Amount2",
              name: "amount2",
              type: "number",
              inputMode: "decimal",
              onChange: (e) =>
                setFormData((prev) => ({
                  ...prev,
                  [e.target.name]: e.target.value
                    .replace(/[^0-9.]/g, "")
                    .replace(/(\..*)\./g, "$1"),
                })),
            },
            {
              label: "Freight Charges",
              name: "freight",
              type: "number",
              inputMode: "decimal",
              onChange: (e) =>
                setFormData((prev) => ({
                  ...prev,
                  [e.target.name]: e.target.value
                    .replace(/[^0-9.]/g, "")
                    .replace(/(\..*)\./g, "$1"),
                })),
            },
            {
              label: "Freight Status",
              name: "freightmode",
              type: "select",
              options: ["To Pay", "Include", " Extra or As Per Actual"],
            },
            {
              label: "Freight Mode",
              name: "freightmodes",
              type: "select",
              options: ["Others", "BlueDart", "Om Logistics"],
            },
            {
              label: "Installation Charges",
              name: "installation",
              type: "select",
              options: ["N/A", "Include", "Others"],
            },
            { label: "Sales Person", name: "salesPerson", type: "text" },
            {
              label: "Company",
              name: "company",
              type: "select",
              options: ["ProMark", "ProMine", "Others"],
            },

            {
              label: "Shipping Address *",
              name: "shippingAddress",
              type: "text",
              required: true,
              onChange: handleChange,
            },
            {
              label: "Billing Address *",
              name: "billingAddress",
              type: "text",
              required: true,
              onChange: handleChange,
              disabled: formData.sameAddress,
            },
            {
              label: "📝 Same as Shipping Address",
              name: "sameAddress",
              type: "checkbox",
              onChange: handleChange,
            },
          ].map((field) => (
            <div
              key={field.name}
              style={{
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
              }}
            >
              <label
                style={{
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  color: "#475569",
                  marginBottom: "0.5rem",
                  letterSpacing: "0.02em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {field.label}
                {field.required && (
                  <span style={{ color: "#f43f5e", marginLeft: "0.3rem" }}>
                    *
                  </span>
                )}
              </label>
              {field.type === "select" ? (
                <select
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={
                    field.onChange ||
                    ((e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [e.target.name]: e.target.value,
                      })))
                  }
                  required={field.required}
                  disabled={field.disabled}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.75rem",
                    backgroundColor: field.disabled ? "#e5e7eb" : "#f8fafc",
                    fontSize: "1rem",
                    color: field.disabled ? "#6b7280" : "#1e293b",
                    outline: "none",
                    transition: "all 0.3s ease",
                    boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.05)",
                    cursor: field.disabled ? "not-allowed" : "pointer",
                    minHeight: "2.5rem",
                  }}
                  onFocus={(e) => {
                    if (!field.disabled) {
                      e.target.style.borderColor = "#6366f1";
                      e.target.style.boxShadow =
                        "0 0 0 4px rgba(99, 102, 241, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.05)";
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow =
                      "inset 0 2px 4px rgba(0, 0, 0, 0.05)";
                  }}
                >
                  <option value="">Select {field.label.split(" ")[0]}</option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : field.type === "checkbox" ? (
                <input
                  type="checkbox"
                  name={field.name}
                  checked={formData[field.name] || false}
                  onChange={field.onChange || handleChange}
                  style={{
                    width: "1.25rem",
                    height: "1.25rem",
                    marginTop: "0.5rem",
                    accentColor: "#6366f1",
                    cursor: "pointer",
                  }}
                />
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={
                    field.onChange ||
                    ((e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [e.target.name]: e.target.value,
                      })))
                  }
                  required={field.required}
                  maxLength={field.maxLength}
                  inputMode={field.inputMode}
                  pattern={field.pattern}
                  disabled={field.disabled}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.75rem",
                    backgroundColor: field.disabled ? "#e5e7eb" : "#f8fafc",
                    fontSize: "1rem",
                    color: field.disabled ? "#6b7280" : "#1e293b",
                    outline: "none",
                    transition: "all 0.3s ease",
                    boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.05)",
                    minHeight: "2.5rem",
                  }}
                  onFocus={(e) => {
                    if (!field.disabled) {
                      e.target.style.borderColor = "#6366f1";
                      e.target.style.boxShadow =
                        "0 0 0 4px rgba(99, 102, 241, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.05)";
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow =
                      "inset 0 2px 4px rgba(0, 0, 0, 0.05)";
                  }}
                  onKeyPress={(e) => {
                    if (field.inputMode === "numeric" && !/[0-9]/.test(e.key))
                      e.preventDefault();
                    if (field.inputMode === "decimal" && !/[0-9.]/.test(e.key))
                      e.preventDefault();
                  }}
                  onPaste={(e) => {
                    const pasted = e.clipboardData.getData("text");
                    if (
                      field.inputMode === "numeric" &&
                      !/^[0-9]*$/.test(pasted)
                    ) {
                      e.preventDefault();
                      setFormData((prev) => ({
                        ...prev,
                        [field.name]: pasted
                          .replace(/[^0-9]/g, "")
                          .slice(0, field.maxLength || Infinity),
                      }));
                    }
                    if (
                      field.inputMode === "decimal" &&
                      !/^[0-9.]*$/.test(pasted)
                    ) {
                      e.preventDefault();
                      setFormData((prev) => ({
                        ...prev,
                        [field.name]: pasted
                          .replace(/[^0-9.]/g, "")
                          .replace(/(\..*)\./g, "$1"),
                      }));
                    }
                  }}
                />
              )}
            </div>
          ))}
          <div
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              justifyContent: "flex-end",
              gap: "1rem",
              marginTop: "1.5rem",
              paddingBottom: "1rem",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#e2e8f0",
                color: "#475569",
                border: "none",
                borderRadius: "0.75rem",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "600",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#cbd5e1";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(0, 0, 0, 0.15)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#e2e8f0";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 15px rgba(0, 0, 0, 0.1)";
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: "0.75rem 1.5rem",
                background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
                color: "#ffffff",
                border: "none",
                borderRadius: "0.75rem",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "600",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(135deg, #6d28d9, #2563eb)";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(0, 0, 0, 0.25)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(135deg, #7c3aed, #3b82f6)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 15px rgba(0, 0, 0, 0.2)";
              }}
            >
              Submit
            </button>
          </div>
        </form>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translate(-50%, -40%); }
            to { opacity: 1; transform: translate(-50%, -50%); }
          }
        `}
      </style>
    </>
  );
}

export default AddEntry;
