import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function AddEntry({ onSubmit, onClose }) {
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [products, setProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState({
    productType: "",
    size: "",
    spec: "",
    qty: "",
    unitPrice: "",
    gst: "",
  });

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
    customername: "",
    paymentTerms: "",
    amount2: "",
    freightcs: "",
    installation: "",
    salesPerson: "",
    company: "",
    shippingAddress: "",
    billingAddress: "",
    sameAddress: false,
    orderType: "Private order",
  });

  const productOptions = {
    IFPD: {
      sizes: ["65 inch", "75 inch", "86 inch", "98 inch"],
      specs: ["Android 14, 8GB RAM, 128GB ROM"],
    },
    OPS: {
      sizes: ["N/A"],
      specs: [
        "i5 11th Gen, 8GB RAM, 256GB ROM",
        "i5 11th Gen, 8GB RAM, 512GB ROM",
        "i5 11th Gen, 8GB RAM, 1TB ROM",
        "i5 12th Gen, 8GB RAM, 256GB ROM",
        "i5 12th Gen, 8GB RAM, 512GB ROM",
        "i5 12th Gen, 8GB RAM, 1TB ROM",
        "i7 11th Gen, 8GB RAM, 256GB ROM",
        "i7 11th Gen, 8GB RAM, 512GB ROM",
        "i7 11th Gen, 8GB RAM, 1TB ROM",
        "i7 12th Gen, 8GB RAM, 256GB ROM",
        "i7 12th Gen, 8GB RAM, 512GB ROM",
        "i7 12th Gen, 8GB RAM, 1TB ROM",
        "i7 12th Gen, 16GB RAM, 256GB ROM",
        "i7 12th Gen, 16GB RAM, 512GB ROM",
        "i7 12th Gen, 16GB RAM, 1TB ROM",
      ],
    },
    "Digital Podium": { sizes: ["Full"], specs: ["N/A"] },
    "Audio Podium": { sizes: ["Full"], specs: ["N/A"] },
    Kiosk: { sizes: ["N/A"], specs: ["Touch", "Non-Touch"] },
    "PTZ Camera": { sizes: ["N/A"], specs: ["4K 12x", "HD 20x"] },
    "Document Camera": { sizes: ["N/A"], specs: ["Visualizer"] },
    UPS: { sizes: ["N/A"], specs: ["N/A"] },
  };

  const statesAndCities = {
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
      "Mohali",
      "Hoshiarpur",
      "Gurdaspur",
      "Ferozepur",
      "Sangrur",
      "Moga",
      "Rupnagar",
      "Kapurthala",
      "Faridkot",
      "Muktsar",
      "Fazilka",
      "Barnala",
      "Mansa",
      "Tarn Taran",
      "Nawanshahr",
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
      "Khamanon",
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
      "Shikohabad",
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
  };

  const orderTypeOptions = [
    "GEM order",
    "Govt. order",
    "Private order",
    "For Demo",
    "Replacement",
    "For repair purpose",
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        sameAddress: checked,
        billingAddress: checked ? prev.shippingAddress : prev.billingAddress,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        ...(name === "shippingAddress" && prev.sameAddress
          ? { billingAddress: value }
          : {}),
      }));
    }
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "productType"
        ? { size: "", spec: "", gst: "" }
        : name === "size"
        ? { spec: "", gst: "" }
        : {}),
    }));
  };

  const addProduct = () => {
    if (
      !currentProduct.productType ||
      !currentProduct.qty ||
      !currentProduct.unitPrice ||
      currentProduct.gst === ""
    ) {
      toast.error("Please fill all required product fields including GST");
      return;
    }
    setProducts([...products, { ...currentProduct }]);
    setCurrentProduct({
      productType: "",
      size: "",
      spec: "",
      qty: "",
      unitPrice: "",
      gst: "",
    });
  };

  const removeProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
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

    if (!formData.soDate || products.length === 0) {
      toast.error("Please fill SO Date and add at least one product");
      return;
    }

    const calculateTotal = (products, formData) => {
      const subtotal = products.reduce((sum, product) => {
        const quantity = Number(product.qty) || 0;
        const price = Number(product.unitPrice) || 0;
        const gstPercentage = Number(product.gst) || 0;

        const baseAmount = quantity * price;
        const gstAmount = (gstPercentage / 100) * baseAmount;

        return sum + baseAmount + gstAmount;
      }, 0);

      const freight = Number(formData.freightcs) || 0;
      const additionalAmount = Number(formData.amount2) || 0;

      const total = subtotal + freight + additionalAmount;

      return Number(total.toFixed(2));
    };

    const total = calculateTotal(products, formData);

    const newEntry = {
      ...formData,
      products: products.map((p) => ({
        ...p,
        gst: Number(p.gst || 0),
      })),
      soDate: new Date(formData.soDate),
      committedDate: formData.committedDate
        ? new Date(formData.committedDate)
        : null,
      total: Number(total),
      amount2: Number(formData.amount2 || 0),
      freightcs: formData.freightcs || null,
      orderType: formData.orderType || "Private order",
    };

    try {
      const response = await axios.post(
        "https://sales-order-server.onrender.com/api/orders",
        newEntry
      );
      toast.success("Order submitted successfully!");
      onSubmit(response.data);
      onClose();
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.error || "An error occurred");
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
          maxWidth: "1100px",
          fontFamily: "'Poppins', sans-serif",
          opacity: 0,
          animation: "slideUp 0.4s ease forwards",
          overflowY: "auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h2
            style={{
              fontSize: "2.2rem",
              fontWeight: "700",
              background: "linear-gradient(135deg, #2575fc, #6a11cb)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "1px",
              textShadow: "1px 1px 3px rgba(0, 0, 0, 0.05)",
              marginBottom: "1rem",
            }}
          >
            📝 Add Sales Order
          </h2>

          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#64748b",
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
          }}
        >
          {/* Basic Fields */}
          {[
            {
              label: "SO Date *",
              name: "soDate",
              type: "date",
              required: true,
              placeholder: "Select Sales Order Date",
            },
            {
              label: "Committed Date",
              name: "committedDate",
              type: "date",
              placeholder: "Select Committed Date",
            },
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
              placeholder: "Select Order Status",
            },
            {
              label: "Order Type *",
              name: "orderType",
              type: "select",
              options: orderTypeOptions,
              required: true,
              placeholder: "Select Order Type",
            },
            {
              label: "Customer Name",
              name: "customername",
              type: "text",
              required: true,
              placeholder: "Enter Customer Name",
            },
            {
              label: "Address",
              name: "partyAndAddress",
              type: "text",
              placeholder: "Enter Full Address",
            },
            {
              label: "State *",
              name: "state",
              type: "select",
              options: Object.keys(statesAndCities),
              onChange: handleStateChange,
              required: true,
              placeholder: "Select State",
            },
            {
              label: "City *",
              name: "city",
              type: "select",
              options: selectedState ? statesAndCities[selectedState] : [],
              onChange: handleCityChange,
              required: true,
              disabled: !selectedState,
              placeholder: "Select City",
            },
            {
              label: "Pin Code",
              name: "pinCode",
              type: "tel",
              inputMode: "numeric",
              required: true,
              placeholder: "e.g. 110001",
            },
            {
              label: "Contact Person Name",
              name: "name",
              type: "text",
              required: true,
              placeholder: "Enter Contact Person Name",
            },
            {
              label: "Contact Person No",
              name: "contactNo",
              type: "tel",
              inputMode: "numeric",
              maxLength: 10,
              required: true,
              placeholder: "e.g. 9876543210",
            },
            {
              label: "Customer Email",
              name: "customerEmail",
              type: "email",
              required: true,
              placeholder: "e.g. example@domain.com",
            },
            {
              label: "Payment Terms",
              name: "paymentTerms",
              type: "text",
              required: true,
              placeholder: "e.g. 50% Advance, 50% on Delivery",
            },
            {
              label: "Amount2",
              name: "amount2",
              type: "number",
              inputMode: "decimal",
              required: true,
              placeholder: "Enter Additional Amount",
            },
            {
              label: "Freight Charges & Status",
              name: "freightcs",
              type: "text",
              required: true,
              placeholder: "e.g. ₹2000, Paid",
            },
            {
              label: "Installation Charges",
              name: "installation",
              type: "text",
              required: true,
              placeholder: "e.g. ₹1000, Not Included",
            },
            {
              label: "Sales Person",
              name: "salesPerson",
              type: "text",
              required: true,
              placeholder: "Enter Sales Person's Name",
            },
            {
              label: "Company",
              name: "company",
              type: "select",
              options: ["Promark", "Promine", "Others"],
              placeholder: "Select Company",
            },
            {
              label: "Shipping Address *",
              name: "shippingAddress",
              type: "text",
              required: true,
              placeholder: "Enter Shipping Address",
            },
            {
              label: "Billing Address *",
              name: "billingAddress",
              type: "text",
              required: true,
              disabled: formData.sameAddress,
              placeholder: "Enter Billing Address",
            },
            {
              label: "📝 Same as Shipping",
              name: "sameAddress",
              type: "checkbox",
            },
          ].map((field) => (
            <div
              key={field.name}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <label
                style={{
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  color: "#475569",
                  marginBottom: "0.5rem",
                }}
              >
                {field.label}
                {field.required && <span style={{ color: "#f43f5e" }}>*</span>}
              </label>
              {field.type === "select" ? (
                <select
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={field.onChange || handleChange}
                  required={field.required}
                  disabled={field.disabled}
                  style={{
                    padding: "0.75rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.75rem",
                    backgroundColor: field.disabled ? "#e5e7eb" : "#f8fafc",
                    fontSize: "1rem",
                    color: "#1e293b",
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
                  onChange={handleChange}
                  style={{
                    width: "1.25rem",
                    height: "1.25rem",
                    accentColor: "#6366f1",
                  }}
                />
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={field.onChange || handleChange}
                  required={field.required}
                  maxLength={field.maxLength}
                  inputMode={field.inputMode}
                  disabled={field.disabled}
                  style={{
                    padding: "0.75rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.75rem",
                    backgroundColor: field.disabled ? "#e5e7eb" : "#f8fafc",
                    fontSize: "1rem",
                    color: "#1e293b",
                  }}
                />
              )}
            </div>
          ))}

          {/* Product Section */}
          <div style={{ gridColumn: "1 / -1", marginTop: "1rem" }}>
            <h3
              style={{
                fontSize: "1.5rem",
                background: "linear-gradient(135deg, #2575fc, #6a11cb)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: "700",
                marginBottom: "1rem",
                letterSpacing: "1px",
                textShadow: "1px 1px 2px rgba(0, 0, 0, 0.05)",
              }}
            >
              ✨ Add Products
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr auto",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#475569",
                  }}
                >
                  Product Type *
                </label>
                <select
                  name="productType"
                  value={currentProduct.productType}
                  onChange={handleProductChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.75rem",
                  }}
                >
                  <option value="">Select Product</option>
                  {Object.keys(productOptions).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#475569",
                  }}
                >
                  Size
                </label>
                <select
                  name="size"
                  value={currentProduct.size}
                  onChange={handleProductChange}
                  disabled={!currentProduct.productType}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.75rem",
                  }}
                >
                  <option value="">Select Size</option>
                  {currentProduct.productType &&
                    productOptions[currentProduct.productType].sizes.map(
                      (size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      )
                    )}
                </select>
              </div>
              <div>
                <label
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#475569",
                  }}
                >
                  Specification
                </label>
                <select
                  name="spec"
                  value={currentProduct.spec}
                  onChange={handleProductChange}
                  disabled={!currentProduct.productType}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.75rem",
                  }}
                >
                  <option value="">Select Spec</option>
                  {currentProduct.productType &&
                    productOptions[currentProduct.productType].specs.map(
                      (spec) => (
                        <option key={spec} value={spec}>
                          {spec}
                        </option>
                      )
                    )}
                </select>
              </div>
              <div>
                <label
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#475569",
                  }}
                >
                  Quantity *
                </label>
                <input
                  type="number"
                  name="qty"
                  value={currentProduct.qty}
                  onChange={handleProductChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.75rem",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#475569",
                  }}
                >
                  Unit Price *
                </label>
                <input
                  type="number"
                  name="unitPrice"
                  value={currentProduct.unitPrice}
                  onChange={handleProductChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.75rem",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#475569",
                  }}
                >
                  GST (%) *
                </label>
                <input
                  type="number"
                  name="gst"
                  value={currentProduct.gst}
                  onChange={handleProductChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.75rem",
                  }}
                />
              </div>
              <button
                type="button"
                onClick={addProduct}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "linear-gradient(135deg, #2575fc, #6a11cb)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "0.75rem",
                  cursor: "pointer",
                  alignSelf: "end",
                  fontWeight: "600",
                  letterSpacing: "0.5px",
                  transition: "all 0.3s ease",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 6px 16px rgba(101, 86, 231, 0.5)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(101, 86, 231, 0.3)")
                }
              >
                Add ➕
              </button>
            </div>

            {/* Added Products List */}
            {products.length > 0 && (
              <div style={{ marginTop: "1rem" }}>
                <h4 style={{ fontSize: "1rem", color: "#475569" }}>
                  Added Products:
                </h4>
                <div style={{ maxHeight: "150px", overflowY: "auto" }}>
                  {products.map((product, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "0.5rem",
                        background: "#f1f5f9",
                        borderRadius: "0.5rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <span>
                        {product.productType} | {product.size} | {product.spec}{" "}
                        | Qty: {product.qty} | Price: ₹{product.unitPrice} |
                        GST: {product.gst}%
                      </span>
                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                        style={{
                          color: "#ef4444",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              justifyContent: "flex-end",
              gap: "1rem",
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
              }}
            >
              Submit
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -40%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </>
  );
}

export default AddEntry;
