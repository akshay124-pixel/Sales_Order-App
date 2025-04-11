import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Modal, Form, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { useForm, Controller } from "react-hook-form";
import styled from "styled-components";
import debounce from "lodash/debounce";
import { FaEdit, FaSyncAlt, FaCog } from "react-icons/fa";

// Styled Components (unchanged)
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
      partyAndAddress: "",
      city: "",
      state: "",
      pinCode: "",
      name: "",
      contactNo: "",
      customerEmail: "",
      customername: "",
      products: [
        {
          productType: "",
          size: "N/A",
          spec: "N/A",
          qty: "",
          unitPrice: "", // Added unitPrice with empty string default
          serialNos: "",
          modelNos: "",
        },
      ],
      gst: "0",
      total: "",
      paymentTerms: "",
      amount2: "0",
      freightcs: "",
      installation: "N/A",
      installationStatus: "Pending",
      remarksByInstallation: "",
      dispatchStatus: "Not Dispatched",
      salesPerson: "",
      company: "ProMark",
      orderType: "Private order",
      transporter: "",
      transporterDetails: "",
      docketNo: "",
      receiptDate: "",
      shippingAddress: "",
      billingAddress: "",
      sameAddress: false,
      invoiceNo: "",
      invoiceDate: "",
      fulfillingStatus: "Pending",
      remarksByProduction: "",
      remarksByAccounts: "",
      paymentReceived: "Not Received",
      billNumber: "",
      completionStatus: "In Progress",
      fulfillmentDate: "",
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
        partyAndAddress: entryToEdit.partyAndAddress || "",
        city: entryToEdit.city || "",
        state: entryToEdit.state || "",
        pinCode: entryToEdit.pinCode || "",
        name: entryToEdit.name || "",
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
                unitPrice: p.unitPrice !== undefined ? String(p.unitPrice) : "", // Map unitPrice
                serialNos:
                  p.serialNos?.length > 0 ? p.serialNos.join(", ") : "",
                modelNos: p.modelNos?.length > 0 ? p.modelNos.join(", ") : "",
              }))
            : [
                {
                  productType: "",
                  size: "N/A",
                  spec: "N/A",
                  qty: "",
                  unitPrice: "", // Ensure unitPrice is included
                  serialNos: "",
                  modelNos: "",
                },
              ],
        gst: entryToEdit.gst !== undefined ? String(entryToEdit.gst) : "0",
        total: entryToEdit.total !== undefined ? String(entryToEdit.total) : "",
        paymentTerms: entryToEdit.paymentTerms || "",
        amount2:
          entryToEdit.amount2 !== undefined ? String(entryToEdit.amount2) : "0",
        freightcs: entryToEdit.freightcs || "",
        installation: entryToEdit.installation || "N/A",
        installationStatus: entryToEdit.installationStatus || "Pending",
        remarksByInstallation: entryToEdit.remarksByInstallation || "",
        dispatchStatus: entryToEdit.dispatchStatus || "Not Dispatched",
        salesPerson: entryToEdit.salesPerson || "",
        company: entryToEdit.company || "ProMark",
        orderType: entryToEdit.orderType || "Private order",
        transporter: entryToEdit.transporter || "",
        transporterDetails: entryToEdit.transporterDetails || "",
        docketNo: entryToEdit.docketNo || "",
        receiptDate: entryToEdit.receiptDate
          ? new Date(entryToEdit.receiptDate).toISOString().split("T")[0]
          : "",
        shippingAddress: entryToEdit.shippingAddress || "",
        billingAddress: entryToEdit.billingAddress || "",
        sameAddress: entryToEdit.sameAddress || false,
        invoiceNo:
          entryToEdit.invoiceNo !== undefined
            ? String(entryToEdit.invoiceNo)
            : "",
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
      };
      const newUpdateData = {
        sostatus: entryToEdit.sostatus || "Pending for Approval",
        remarks: entryToEdit.remarks || "",
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
    debounce((name, value, index) => {
      if (name.startsWith("products.")) {
        const [_, field, idx] = name.split(".");
        setFormData((prev) => {
          const newProducts = [...prev.products];
          newProducts[idx] = {
            ...newProducts[idx],
            [field]:
              field === "qty" || field === "unitPrice" // Handle unitPrice as number
                ? value === ""
                  ? ""
                  : Number(value)
                : field === "serialNos" || field === "modelNos"
                ? value
                : value,
          };
          return { ...prev, products: newProducts };
        });
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]:
            name === "contactNo"
              ? value.replace(/\D/g, "").slice(0, 10)
              : ["gst", "total", "amount2", "invoiceNo"].includes(name)
              ? value === ""
                ? ""
                : Number(value)
              : name === "sameAddress"
              ? value === "true" || value === true
              : value,
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
        partyAndAddress: data.partyAndAddress || null,
        city: data.city || null,
        state: data.state || null,
        pinCode: data.pinCode || null,
        name: data.name || null,
        contactNo: data.contactNo || null,
        customerEmail: data.customerEmail || null,
        customername: data.customername || null,
        products: data.products.map((p) => ({
          productType: p.productType || undefined,
          size: p.size || "N/A",
          spec: p.spec || "N/A",
          qty: p.qty === "" ? undefined : Number(p.qty),
          unitPrice: p.unitPrice === "" ? undefined : Number(p.unitPrice), // Ensure unitPrice is included
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
        })),
        gst: data.gst === "" ? 0 : Number(data.gst),
        total: data.total === "" ? undefined : Number(data.total),
        paymentTerms: data.paymentTerms || null,
        amount2: data.amount2 === "" ? 0 : Number(data.amount2),
        freightcs: data.freightcs || null,
        installation: data.installation || "N/A",
        installationStatus: data.installationStatus || "Pending",
        remarksByInstallation: data.remarksByInstallation || "",
        dispatchStatus: data.dispatchStatus || "Not Dispatched",
        salesPerson: data.salesPerson || null,
        company: data.company || "ProMark",
        transporter: data.transporter || null,
        transporterDetails: data.transporterDetails || null,
        docketNo: data.docketNo || null,
        orderType: data.orderType || "Private order",
        receiptDate: data.receiptDate ? new Date(data.receiptDate) : null,
        shippingAddress: data.shippingAddress || "",
        billingAddress: data.billingAddress || "",
        sameAddress: data.sameAddress || false,
        invoiceNo: data.invoiceNo === "" ? null : Number(data.invoiceNo),
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
      };

      // Validate that all products have a unitPrice
      submissionData.products.forEach((p, index) => {
        if (p.unitPrice === undefined || p.unitPrice === null) {
          throw new Error(`Unit Price is required for product ${index + 1}`);
        }
      });

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
        unitPrice: "", // Ensure unitPrice is included
        serialNos: "",
        modelNos: "",
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
              unitPrice: "", // Ensure unitPrice is included
              serialNos: "",
              modelNos: "",
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
                unitPrice: "", // Ensure unitPrice is included
                serialNos: "",
                modelNos: "",
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
      "Andhra Pradesh": [
        "Visakhapatnam",
        "Jaganathpuram",
        "Vijayawada",
        "Guntur",
        "Tirupati",
        "Kurnool",
        "Rajahmundry",
        "Nellore",
        "Anantapur",
        "Kadapa",
        "Srikakulam",
        "Eluru",
        "Ongole",
        "Chittoor",
        "Proddatur",
        "Machilipatnam",
      ],
      "Arunachal Pradesh": [
        "Itanagar",
        "Tawang",
        "Ziro",
        "Pasighat",
        "Bomdila",
        "Naharlagun",
        "Roing",
        "Aalo",
        "Tezu",
        "Changlang",
        "Khonsa",
        "Yingkiong",
        "Daporijo",
        "Seppa",
      ],
      Assam: [
        "Agartala",
        "Tripura",
        "Guwahati",
        "Dibrugarh",
        "Jorhat",
        "Silchar",
        "Tezpur",
        "Tinsukia",
        "Nagaon",
        "Sivasagar",
        "Barpeta",
        "Goalpara",
        "Karimganj",
        "Lakhimpur",
        "Diphu",
        "Golaghat",
        "Kamrup",
      ],
      Bihar: [
        "Patna",
        "Mirzapur",
        "Jehanabad",
        "Mithapur",
        "Gaya",
        "Bhagalpur",
        "Muzaffarpur",
        "Darbhanga",
        "Purnia",
        "Ara",
        "Begusarai",
        "Katihar",
        "Munger",
        "Chapra",
        "Sasaram",
        "Hajipur",
        "Bihar Sharif",
        "Sitamarhi",
      ],
      Chhattisgarh: [
        "Raipur",
        "Bilaspur",
        "Durg",
        "Korba",
        "Bhilai",
        "Rajnandgaon",
        "Jagdalpur",
        "Ambikapur",
        "Raigarh",
        "Dhamtari",
        "Kawardha",
        "Mahasamund",
        "Kondagaon",
        "Bijapur",
      ],
      Goa: [
        "Panaji",
        "Margao",
        "Vasco da Gama",
        "Mapusa",
        "Ponda",
        "Bicholim",
        "Sanguem",
        "Canacona",
        "Quepem",
        "Valpoi",
        "Sanquelim",
        "Curchorem",
      ],
      Gujarat: [
        "Ahmedabad",
        "Surat",
        "Vadodara",
        "Rajkot",
        "Bhavnagar",
        "Jamnagar",
        "Junagadh",
        "Gandhinagar",
        "Anand",
        "Morbi",
        "Nadiad",
        "Porbandar",
        "Mehsana",
        "Bharuch",
        "Navsari",
        "Surendranagar",
      ],
      Haryana: [
        "Bahadurgarh",
        "Gurugram",
        "Faridabad",
        "Panipat",
        "Ambala",
        "Hisar",
        "Rohtak",
        "Karnal",
        "Bhiwani",
        "Kaithal",
        "Kurukshetra",
        "Sonipat",
        "Jhajjar",
        "Jind",
        "Fatehabad",
        "Pehowa",
        "Pinjore",
        "Rewari",
        "Yamunanagar",
        "Sirsa",
        "Dabwali",
        "Narwana",
      ],
      "Himachal Pradesh": [
        "Nagrota Surian",
        "Shimla",
        "Dharamshala",
        "Solan",
        "Mandi",
        "Hamirpur",
        "Kullu",
        "Manali",
        "Nahan",
        "Palampur",
        "Baddi",
        "Sundarnagar",
        "Paonta Sahib",
        "Bilaspur",
        "Chamba",
        "Una",
        "Kangra",
        "Parwanoo",
        "Nalagarh",
        "Rohru",
        "Keylong",
      ],
      Jharkhand: [
        "Ranchi",
        "Jamshedpur",
        "Dhanbad",
        "Bokaro",
        "Deoghar",
        "Hazaribagh",
        "Giridih",
        "Ramgarh",
        "Chaibasa",
        "Palamu",
        "Gumla",
        "Lohardaga",
        "Dumka",
        "Chatra",
        "Pakur",
        "Jamtara",
        "Simdega",
        "Sahibganj",
        "Godda",
        "Latehar",
        "Khunti",
      ],
      Karnataka: [
        "Bengaluru",
        "Mysuru",
        "Mangaluru",
        "Hubballi",
        "Belagavi",
        "Kalaburagi",
        "Ballari",
        "Davangere",
        "Shivamogga",
        "Tumakuru",
        "Udupi",
        "Vijayapura",
        "Chikkamagaluru",
        "Hassan",
        "Mandya",
        "Raichur",
        "Bidar",
        "Bagalkot",
        "Chitradurga",
        "Kolar",
        "Gadag",
        "Yadgir",
        "Haveri",
        "Dharwad",
        "Ramanagara",
        "Chikkaballapur",
        "Kodagu",
        "Koppal",
      ],
      Kerala: [
        "Thiruvananthapuram",
        "Kochi",
        "Kozhikode",
        "Kannur",
        "Alappuzha",
        "Thrissur",
        "Kottayam",
        "Palakkad",
        "Ernakulam",
        "Malappuram",
        "Pathanamthitta",
        "Idukki",
        "Wayanad",
        "Kollam",
        "Kasaragod",
        "Punalur",
        "Varkala",
        "Changanassery",
        "Kayani",
        "Kizhakkambalam",
        "Perumbavoor",
        "Muvattupuzha",
        "Attingal",
        "Vypin",
        "North Paravur",
        "Adoor",
        "Cherthala",
        "Mattancherry",
        "Fort Kochi",
        "Munroe Island",
      ],
      "Madhya Pradesh": [
        "Bhopal",
        "Indore",
        "Gwalior",
        "Jabalpur",
        "Ujjain",
        "Sagar",
        "Ratlam",
        "Satna",
        "Dewas",
        "Murwara (Katni)",
        "Chhindwara",
        "Rewa",
        "Burhanpur",
        "Khandwa",
        "Bhind",
        "Shivpuri",
        "Vidisha",
        "Sehore",
        "Hoshangabad",
        "Itarsi",
        "Neemuch",
        "Chhatarpur",
        "Betul",
        "Mandsaur",
        "Damoh",
        "Singrauli",
        "Guna",
        "Ashok Nagar",
        "Datia",
        "Mhow",
        "Pithampur",
        "Shahdol",
        "Seoni",
        "Mandla",
        "Tikamgarh",
        "Raisen",
        "Narsinghpur",
        "Morena",
        "Barwani",
        "Rajgarh",
        "Khargone",
        "Anuppur",
        "Umaria",
        "Dindori",
        "Sheopur",
        "Alirajpur",
        "Jhabua",
        "Sidhi",
        "Harda",
        "Balaghat",
        "Agar Malwa",
      ],
      Maharashtra: [
        "Mumbai",
        "Pune",
        "Nagpur",
        "Nashik",
        "Aurangabad",
        "Solapur",
        "Kolhapur",
        "Thane",
        "Satara",
        "Latur",
        "Chandrapur",
        "Jalgaon",
        "Bhiwandi",
        "Shirdi",
        "Akola",
        "Parbhani",
        "Raigad",
        "Washim",
        "Buldhana",
        "Nanded",
        "Yavatmal",
        "Beed",
        "Amravati",
        "Kalyan",
        "Dombivli",
        "Ulhasnagar",
        "Nagothane",
        "Vasai",
        "Virar",
        "Mira-Bhayandar",
        "Dhule",
        "Sangli",
        "Wardha",
        "Ahmednagar",
        "Pandharpur",
        "Malegaon",
        "Osmanabad",
        "Gondia",
        "Baramati",
        "Jalna",
        "Hingoli",
        "Sindhudurg",
        "Ratnagiri",
        "Palghar",
        "Ambarnath",
        "Badlapur",
        "Taloja",
        "Alibaug",
        "Murbad",
        "Karjat",
        "Pen",
        "Newasa",
      ],
      Manipur: [
        "Imphal",
        "Churachandpur",
        "Thoubal",
        "Bishnupur",
        "Kakching",
        "Senapati",
        "Ukhrul",
        "Tamenglong",
        "Jiribam",
        "Moreh",
        "Noney",
        "Pherzawl",
        "Kangpokpi",
      ],
      Meghalaya: [
        "Shillong",
        "Tura",
        "Nongpoh",
        "Cherrapunjee",
        "Jowai",
        "Baghmara",
        "Williamnagar",
        "Mawkyrwat",
        "Resubelpara",
        "Mairang",
      ],
      Mizoram: [
        "Aizawl",
        "Lunglei",
        "Champhai",
        "Serchhip",
        "Kolasib",
        "Saiha",
        "Lawngtlai",
        "Mamit",
        "Hnahthial",
        "Khawzawl",
        "Saitual",
      ],
      Nagaland: [
        "Kohima",
        "Dimapur",
        "Mokokchung",
        "Tuensang",
        "Wokha",
        "Mon",
        "Zunheboto",
        "Phek",
        "Longleng",
        "Kiphire",
        "Peren",
      ],
      Odisha: [
        "Bhubaneswar",
        "Cuttack",
        "Rourkela",
        "Puri",
        "Sambalpur",
        "Berhampur",
        "Balasore",
        "Baripada",
        "Bhadrak",
        "Jeypore",
        "Angul",
        "Dhenkanal",
        "Keonjhar",
        "Kendrapara",
        "Jagatsinghpur",
        "Paradeep",
        "Bargarh",
        "Rayagada",
        "Koraput",
        "Nabarangpur",
        "Kalahandi",
        "Nuapada",
        "Phulbani",
        "Balangir",
        "Sundargarh",
      ],
      Punjab: [
        "Amritsar",
        "Ludhiana",
        "Jalandhar",
        "Patiala",
        "Bathinda",
        "Mohali", // Also known as Sahibzada Ajit Singh Nagar (SAS Nagar)
        "Hoshiarpur",
        "Gurdaspur",
        "Ferozepur",
        "Sangrur",
        "Moga",
        "Rupnagar", // Official name for Ropar
        "Kapurthala",
        "Faridkot",
        "Muktsar", // Corrected from "Makatsar"
        "Fazilka",
        "Barnala",
        "Mansa",
        "Tarn Taran",
        "Nawanshahr", // Also known as Shaheed Bhagat Singh Nagar
        "Pathankot",
        "Zirakpur",
        "Khanna",
        "Malerkotla",
        "Abohar",
        "Rajpura",
        "Phagwara",
        "Batala",
        "Samrala",
        "Anandpur Sahib",
        "Sirhind",
        "Kharar",
        "Morinda",
        "Bassi Pathana",
        "Khamanon", // Corrected from "Khamano"
        "Chunni Kalan",
        "Balachaur",
        "Dinanagar",
        "Dasuya",
        "Nakodar",
        "Jagraon",
        "Sunam",
        "Dhuri",
        "Lehragaga",
        "Rampura Phul",
      ],
      Rajasthan: [
        "Baran",
        "Newai",
        "Gaganagar",
        "Suratgarh",
        "Jaipur",
        "Udaipur",
        "Jodhpur",
        "Kota",
        "Ajmer",
        "Bikaner",
        "Alwar",
        "Bharatpur",
        "Sikar",
        "Pali",
        "Nagaur",
        "Jhunjhunu",
        "Chittorgarh",
        "Tonk",
        "Barmer",
        "Jaisalmer",
        "Dholpur",
        "Bhilwara",
        "Hanumangarh",
        "Sawai Madhopur",
      ],
      Sikkim: [
        "Gangtok",
        "Namchi",
        "Pelling",
        "Geyzing",
        "Mangan",
        "Rangpo",
        "Jorethang",
        "Yuksom",
        "Ravangla",
        "Lachen",
        "Lachung",
      ],
      "Tamil Nadu": [
        "Chennai",
        "Coimbatore",
        "Madurai",
        "Tiruchirappalli",
        "Salem",
        "Erode",
        "Tirunelveli",
        "Vellore",
        "Thanjavur",
        "Tuticorin",
        "Dindigul",
        "Cuddalore",
        "Kancheepuram",
        "Nagercoil",
        "Kumbakonam",
        "Karur",
        "Sivakasi",
        "Namakkal",
        "Tiruppur",
      ],
      Telangana: [
        "Hyderabad",
        "Warangal",
        "Nizamabad",
        "Karimnagar",
        "Khammam",
        "Mahbubnagar",
        "Ramagundam",
        "Siddipet",
        "Adilabad",
        "Nalgonda",
        "Mancherial",
        "Kothagudem",
        "Zaheerabad",
        "Miryalaguda",
        "Bhongir",
        "Jagtial",
      ],
      Tripura: [
        "Agartala",
        "Udaipur",
        "Dharmanagar",
        "Kailashahar",
        "Belonia",
        "Kamalpur",
        "Ambassa",
        "Khowai",
        "Sabroom",
        "Sonamura",
        "Melaghar",
      ],
      "Uttar Pradesh": [
        "Shikohabad ",
        "Lucknow",
        "Matbarganj",
        "Kasganj",
        "Kanpur",
        "Varanasi",
        "Agra",
        "Prayagraj (Allahabad)",
        "Ghaziabad",
        "Noida",
        "Meerut",
        "Aligarh",
        "Bareilly",
        "Moradabad",
        "Saharanpur",
        "Gorakhpur",
        "Firozabad",
        "Jhansi",
        "Muzaffarnagar",
        "Mathura-Vrindavan",
        "Budaun",
        "Rampur",
        "Shahjahanpur",
        "Farrukhabad-Fatehgarh",
        "Ayodhya",
        "Unnao",
        "Jaunpur",
        "Lakhimpur",
        "Hathras",
        "Banda",
        "Pilibhit",
        "Barabanki",
        "Khurja",
        "Gonda",
        "Mainpuri",
        "Lalitpur",
        "Sitapur",
        "Etah",
        "Deoria",
        "Ghazipur",
      ],
      Uttarakhand: [
        "Dehradun",
        "Haridwar",
        "Nainital",
        "Rishikesh",
        "Mussoorie",
        "Almora",
        "Pithoragarh",
        "Haldwani",
        "Rudrapur",
        "Bageshwar",
        "Champawat",
        "Uttarkashi",
        "Roorkee",
        "Tehri",
        "Lansdowne",
      ],
      "West Bengal": [
        "Kolkata",
        "Garia",
        "Darjeeling",
        "Siliguri",
        "Howrah",
        "Asansol",
        "Durgapur",
        "Malda",
        "Cooch Behar",
        "Haldia",
        "Kharagpur",
        "Raiganj",
        "Bardhaman",
        "Jalpaiguri",
        "Chandannagar",
        "Kalimpong",
        "Alipurduar",
      ],
      "Andaman and Nicobar Islands": [
        "Port Blair",
        "Havelock Island",
        "Diglipur",
        "Neil Island",
        "Car Nicobar",
        "Little Andaman",
        "Long Island",
        "Mayabunder",
        "Campbell Bay",
        "Rangat",
        "Wandoor",
      ],
      Chandigarh: [
        "Sector 1",
        "Sector 2",
        "Sector 3",
        "Sector 4",
        "Sector 5",
        "Sector 6",
        "Sector 7",
        "Sector 8",
        "Sector 9",
        "Sector 10",
        "Sector 11",
        "Sector 12",
        "Sector 13", // Note: Sector 13 does not exist in Chandigarh.
        "Sector 14",
        "Sector 15",
        "Sector 16",
        "Sector 17",
        "Sector 18",
        "Sector 19",
        "Sector 20",
        "Sector 21",
        "Sector 22",
        "Sector 23",
        "Sector 24",
        "Sector 25",
        "Sector 26",
        "Sector 27",
        "Sector 28",
        "Sector 29",
        "Sector 30",
        "Sector 31",
        "Sector 32",
        "Sector 33",
        "Sector 34",
        "Sector 35",
        "Sector 36",
        "Sector 37",
        "Sector 38",
        "Sector 39",
        "Sector 40",
        "Sector 41",
        "Sector 42",
        "Sector 43",
        "Sector 44",
        "Sector 45",
        "Sector 46",
        "Sector 47",
      ],
      "Dadra and Nagar Haveli and Daman and Diu": [
        "Daman",
        "Diu",
        "Silvassa",
        "Amli",
        "Kachigam",
        "Naroli",
        "Vapi",
        "Marwad",
        "Samarvarni",
        "Kawant",
      ],
      Delhi: [
        "New Delhi",
        "Old Delhi",
        "Dwarka",
        "Rohini",
        "Karol Bagh",
        "Lajpat Nagar",
        "Saket",
        "Vasant Kunj",
        "Janakpuri",
        "Mayur Vihar",
        "Shahdara",
        "Preet Vihar",
        "Pitampura",
        "Chanakyapuri",
        "Narela",
        "Mehrauli",
        "Najafgarh",
        "Okhla",
        "Tilak Nagar",
      ],
      "Jammu and Kashmir": [
        "Srinagar",
        "Jammu",
        "Anantnag",
        "Baramulla",
        "Pulwama",
        "Kupwara",
        "Udhampur",
        "Kathua",
        "Poonch",
        "Kulgam",
        "Budgam",
        "Bandipora",
        "Ganderbal",
        "Rajouri",
        "Reasi",
        "Doda",
        "Miran sahib",
      ],
      Ladakh: [
        "Leh",
        "Kargil",
        "Diskit",
        "Padum",
        "Nubra",
        "Tangtse",
        "Sankoo",
        "Zanskar",
        "Nyoma",
        "Turtuk",
        "Hanle",
      ],
      Lakshadweep: [
        "Kavaratti",
        "Agatti",
        "Minicoy",
        "Amini",
        "Andrott",
        "Kalpeni",
        "Kadmat",
        "Chetlat",
        "Bitra",
        "Bangaram",
      ],
      Puducherry: [
        "Puducherry",
        "Karaikal",
        "Mahe",
        "Yanam",
        "Villianur",
        "Bahour",
        "Oulgaret",
        "Ariyankuppam",
        "Nettapakkam",
      ],
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

        <Form.Group controlId="orderType">
          <Form.Label>📦 Order Type</Form.Label>
          <Form.Control
            as="select"
            {...register("orderType")}
            onChange={(e) =>
              debouncedHandleInputChange("orderType", e.target.value)
            }
            isInvalid={!!errors.orderType}
          >
            <option value="GEM order">GEM order</option>
            <option value="Govt. order">Govt. order</option>
            <option value="Private order">Private order</option>
            <option value="For Demo">For Demo</option>
            <option value="Replacement">Replacement</option>
            <option value="For repair purpose">For repair purpose</option>
          </Form.Control>
          <Form.Control.Feedback type="invalid">
            {errors.orderType?.message}
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
            type="text"
            {...register("customername", {
              required: "Customer name is required",
            })}
            onChange={(e) =>
              debouncedHandleInputChange("customername", e.target.value)
            }
            isInvalid={!!errors.customername}
          />
          <Form.Control.Feedback type="invalid">
            {errors.customername?.message}
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

        <Form.Group controlId="sameAddress">
          <Form.Label>📝 Same as Shipping</Form.Label>
          <Form.Check
            type="checkbox"
            {...register("sameAddress")}
            onChange={(e) =>
              debouncedHandleInputChange("sameAddress", e.target.checked)
            }
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
          <Form.Select
            {...register("company")}
            onChange={(e) =>
              debouncedHandleInputChange("company", e.target.value)
            }
            isInvalid={!!errors.company}
          >
            <option value="ProMark">ProMark</option>
            <option value="ProMine">ProMine</option>
            <option value="Others">Others</option>
          </Form.Select>
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

        <Form.Group controlId="invoiceNo">
          <Form.Label>📄 Invoice No</Form.Label>
          <Form.Control
            type="number"
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
          <Form.Label>📅 Production Date</Form.Label>
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
            <option value="Accounts Approved">"Accounts Approved"</option>
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
