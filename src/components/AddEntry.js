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
    gst: "", // Raw percentage input
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
    report: "",
    freightcs: "",
    installation: "",
    remarks: "",
    salesPerson: "",
    company: "",
    shippingAddress: "",
    billingAddress: "",
    sameAddress: false,
    orderType: "Private",
    paymentCollected: "",
    paymentMethod: "",
    paymentDue: "",
    neftTransactionId: "",
    chequeId: "",
  });

  const productOptions = {
    IFPD: {
      sizes: ["65 inch", "75 inch", "86 inch", "98 inch"],
      specs: [
        "Android 9, 4GB RAM, 32GB ROM",
        "Android 8, 4GB RAM, 32GB ROM",
        "Android 11, 4GB RAM, 32GB ROM",
        "Android 11, 8GB RAM, 128GB ROM",
        "Android 13, 4GB RAM, 32GB ROM",
        "Android 13, 8GB RAM, 128GB ROM",
        "Android 13, 8GB RAM, 128GB ROM  Inbuilt Camera",
        "Android 14, 8GB RAM, 128GB ROM",
        "Android 14, 8GB RAM, 128GB ROM Inbuilt Camera",
      ],
    },
    OPS: {
      sizes: ["N/A"],
      specs: [
        // i5 6th Gen
        "i5 6th Gen, 8GB RAM, 256GB ROM",
        "i5 6th Gen, 8GB RAM, 512GB ROM",
        "i5 6th Gen, 8GB RAM, 1TB ROM",
        "i5 6th Gen, 16GB RAM, 256GB ROM",
        "i5 6th Gen, 16GB RAM, 512GB ROM",
        "i5 6th Gen, 16GB RAM, 1TB ROM",

        // i5 7th Gen
        "i5 7th Gen, 8GB RAM, 256GB ROM",
        "i5 7th Gen, 8GB RAM, 512GB ROM",
        "i5 7th Gen, 8GB RAM, 1TB ROM",
        "i5 7th Gen, 16GB RAM, 256GB ROM",
        "i5 7th Gen, 16GB RAM, 512GB ROM",
        "i5 7th Gen, 16GB RAM, 1TB ROM",

        // i5 8th Gen
        "i5 8th Gen, 8GB RAM, 256GB ROM",
        "i5 8th Gen, 8GB RAM, 512GB ROM",
        "i5 8th Gen, 8GB RAM, 1TB ROM",
        "i5 8th Gen, 16GB RAM, 256GB ROM",
        "i5 8th Gen, 16GB RAM, 512GB ROM",
        "i5 8th Gen, 16GB RAM, 1TB ROM",

        // i5 11th Gen
        "i5 11th Gen, 8GB RAM, 256GB ROM",
        "i5 11th Gen, 8GB RAM, 512GB ROM",
        "i5 11th Gen, 8GB RAM, 1TB ROM",
        "i5 11th Gen, 16GB RAM, 256GB ROM",
        "i5 11th Gen, 16GB RAM, 512GB ROM",
        "i5 11th Gen, 16GB RAM, 1TB ROM",

        // i5 12th Gen
        "i5 12th Gen, 8GB RAM, 256GB ROM",
        "i5 12th Gen, 8GB RAM, 512GB ROM",
        "i5 12th Gen, 8GB RAM, 1TB ROM",
        "i5 12th Gen, 16GB RAM, 256GB ROM",
        "i5 12th Gen, 16GB RAM, 512GB ROM",
        "i5 12th Gen, 16GB RAM, 1TB ROM",

        // i7 4th Gen
        "i7 4th Gen, 8GB RAM, 256GB ROM",
        "i7 4th Gen, 8GB RAM, 512GB ROM",
        "i7 4th Gen, 8GB RAM, 1TB ROM",
        "i7 4th Gen, 16GB RAM, 256GB ROM",
        "i7 4th Gen, 16GB RAM, 512GB ROM",
        "i7 4th Gen, 16GB RAM, 1TB ROM",

        // i7 5th Gen
        "i7 5th Gen, 8GB RAM, 256GB ROM",
        "i7 5th Gen, 8GB RAM, 512GB ROM",
        "i7 5th Gen, 8GB RAM, 1TB ROM",
        "i7 5th Gen, 16GB RAM, 256GB ROM",
        "i7 5th Gen, 16GB RAM, 512GB ROM",
        "i7 5th Gen, 16GB RAM, 1TB ROM",

        // i7 6th Gen
        "i7 6th Gen, 8GB RAM, 256GB ROM",
        "i7 6th Gen, 8GB RAM, 512GB ROM",
        "i7 6th Gen, 8GB RAM, 1TB ROM",
        "i7 6th Gen, 16GB RAM, 256GB ROM",
        "i7 6th Gen, 16GB RAM, 512GB ROM",
        "i7 6th Gen, 16GB RAM, 1TB ROM",

        // i7 7th Gen
        "i7 7th Gen, 8GB RAM, 256GB ROM",
        "i7 7th Gen, 8GB RAM, 512GB ROM",
        "i7 7th Gen, 8GB RAM, 1TB ROM",
        "i7 7th Gen, 16GB RAM, 256GB ROM",
        "i7 7th Gen, 16GB RAM, 512GB ROM",
        "i7 7th Gen, 16GB RAM, 1TB ROM",

        // i7 8th Gen
        "i7 8th Gen, 8GB RAM, 256GB ROM",
        "i7 8th Gen, 8GB RAM, 512GB ROM",
        "i7 8th Gen, 8GB RAM, 1TB ROM",
        "i7 8th Gen, 16GB RAM, 256GB ROM",
        "i7 8th Gen, 16GB RAM, 512GB ROM",
        "i7 8th Gen, 16GB RAM, 1TB ROM",

        // i7 9th Gen
        "i7 9th Gen, 8GB RAM, 256GB ROM",
        "i7 9th Gen, 8GB RAM, 512GB ROM",
        "i7 9th Gen, 8GB RAM, 1TB ROM",
        "i7 9th Gen, 16GB RAM, 256GB ROM",
        "i7 9th Gen, 16GB RAM, 512GB ROM",
        "i7 9th Gen, 16GB RAM, 1TB ROM",

        // i7 10th Gen
        "i7 10th Gen, 8GB RAM, 256GB ROM",
        "i7 10th Gen, 8GB RAM, 512GB ROM",
        "i7 10th Gen, 8GB RAM, 1TB ROM",
        "i7 10th Gen, 16GB RAM, 256GB ROM",
        "i7 10th Gen, 16GB RAM, 512GB ROM",
        "i7 10th Gen, 16GB RAM, 1TB ROM",

        // i7 11th Gen
        "i7 11th Gen, 8GB RAM, 256GB ROM",
        "i7 11th Gen, 8GB RAM, 512GB ROM",
        "i7 11th Gen, 8GB RAM, 1TB ROM",
        "i7 11th Gen, 16GB RAM, 256GB ROM",
        "i7 11th Gen, 16GB RAM, 512GB ROM",
        "i7 11th Gen, 16GB RAM, 1TB ROM",

        // i7 12th Gen
        "i7 12th Gen, 8GB RAM, 256GB ROM",
        "i7 12th Gen, 8GB RAM, 512GB ROM",
        "i7 12th Gen, 8GB RAM, 1TB ROM",
        "i7 12th Gen, 16GB RAM, 256GB ROM",
        "i7 12th Gen, 16GB RAM, 512GB ROM",
        "i7 12th Gen, 16GB RAM, 1TB ROM",
      ],
    },
    "Digital Podium": {
      sizes: ["Standard"],
      specs: [
        'MINI PC 21.5" TOUCH DISPLAY, AMP. 70 WATT 30 W, 2 SPEAKER, 1 HANDHELD MIC, 1 GOOSENECK MIC',
        'MINI PC 21.5" TOUCH DISPLAY, AMP. 70 WATT 30 W, 2 SPEAKER, 2 HANDHELD MIC, 1 GOOSENECK MIC',
        'MINI PC 21.5" TOUCH DISPLAY, AMP. 70 WATT 30 W, 2 SPEAKER, 1 HANDHELD MIC, 1 COOLER MIC, 1 GOOSENECK MIC',
        'MINI PC 21.5" TOUCH DISPLAY, AMP. 70 WATT 30 W, 2 SPEAKER, 1 HANDHELD MIC, 2 COOLER MIC, 1 GOOSENECK MIC',
        'MINI PC 21.5" TOUCH DISPLAY, AMP. 70 WATT 30 W, 2 SPEAKER, 1 HANDHELD MIC, 1 GOOSENECK MIC, VISUALIZER',
        'MINI PC 21.5" TOUCH DISPLAY, AMP. 70 WATT 30 W, 2 SPEAKER, 2 HANDHELD MIC, 1 GOOSENECK MIC, VISUALIZER',

        // Advance
        'MINI PC 21.5" TOUCH DISPLAY, AMP. 70 WATT 30 W, 2 SPEAKER, 1 HANDHELD MIC, 1 COOLER MIC, 1 GOOSENECK MIC',
        'MINI PC 21.5" TOUCH DISPLAY, AMP. 70 WATT 30 W, 2 SPEAKER, 1 HANDHELD MIC, 2 COOLER MIC, 1 GOOSENECK MIC',
        'MINI PC 21.5" TOUCH DISPLAY, AMP. 70 WATT 30 W, 2 SPEAKER, 1 HANDHELD MIC, 1 GOOSENECK MIC',
        'MINI PC 21.5" TOUCH DISPLAY, AMP. 70 WATT 30 W, 2 SPEAKER, 2 HANDHELD MIC, 1 GOOSENECK MIC',
        'MINI PC 21.5" TOUCH DISPLAY, AMP. 70 WATT 30 W, 2 SPEAKER, 1 HANDHELD MIC, 1 GOOSENECK MIC, VISUALIZER',
        'MINI PC 21.5" TOUCH DISPLAY, AMP. 70 WATT 30 W, 2 SPEAKER, 2 HANDHELD MIC, 1 GOOSENECK MIC, VISUALIZER',
      ],
    },
    "Advance Digital Podium": {
      sizes: ["Front Display 32inch"],
      specs: [
        'MINI PC 21.5" TOUCH DISPLAY, AMP. 70 WATT 30 W, 2 SPEAKER, 1 HANDHELD MIC, 1 COOLER MIC, 1 GOOSENECK MIC',
        'MINI PC 21.5" TOUCH DISPLAY, AMP. 70 WATT 30 W, 2 SPEAKER, 1 HANDHELD MIC, 2 COOLER MIC, 1 GOOSENECK MIC',
        'MINI PC 21.5" TOUCH DISPLAY, AMP. 70 WATT 30 W, 2 SPEAKER, 1 HANDHELD MIC, 1 GOOSENECK MIC',
        'MINI PC 21.5" TOUCH DISPLAY, AMP. 70 WATT 30 W, 2 SPEAKER, 2 HANDHELD MIC, 1 GOOSENECK MIC',
        'MINI PC 21.5" TOUCH DISPLAY, AMP. 70 WATT 30 W, 2 SPEAKER, 1 HANDHELD MIC, 1 GOOSENECK MIC, VISUALIZER',
        'MINI PC 21.5" TOUCH DISPLAY, AMP. 70 WATT 30 W, 2 SPEAKER, 2 HANDHELD MIC, 1 GOOSENECK MIC, VISUALIZER',
      ],
    },
    "Audio Podium": { sizes: ["Full"], specs: ["N/A"] },
    Kiosk: {
      sizes: ["32 inch,43 inch,55 inch,65 inch"],
      specs: ["Touch Andriod 13/4/32", "Non-Touch Andriod 13/4/32"],
    },
    "PTZ Camera": {
      sizes: ["N/A"],
      specs: [
        "Non-Voice Tracking-Full HD",
        "UHD 20x",
        "FHD Voice Tracking",
        "4K Auto Tracking",
        "4K 12x",
        "HD 20x",
      ],
    },
    "Document Camera": {
      sizes: ["N/A"],
      specs: [
        "Hydraulic Wall Mount Visualizer",
        "Non-Hydraulic Wall Mount Visualizer",
        "Slim Portable Visualizer",
        "Table Top Portable Visualizer",
        "Visualizer",
      ],
    },
    UPS: {
      sizes: ["Standard"],
      specs: [
        "1 KVA",
        "2 KVA",
        "3 KVA",
        "4 KVA",
        "5 KVA",
        "6 KVA",
        "7 KVA",
        "8 KVA",
        "9 KVA",
        "10 KVA",
        "Offline UPS",
        "Online UPS",
      ],
    },
    "Wallmount Kit": {
      sizes: ["55 inch", "65 inch", "75 inch", "86 inch", "98 inch"],
      specs: ["Standard"],
    },
    "Stylus Pen": { sizes: ["N/A"], specs: ["N/A"] },
    "Sliding Shutter": {
      sizes: ["65 inch", "75 inch", "86 inch", "98 inch"],
      specs: ["Standard"],
    },
    "3 Cup Speaker": { sizes: ["N/A"], specs: ["N/A"] },
    Microphone: {
      sizes: ["N/A"],
      specs: ["Handheld Collar Mic", "Goose Neck Mic", "Collar/Lapel Mic"],
    },
    Keyboard: {
      sizes: ["N/A"],
      specs: ["Wireless", "Wired"],
    },
    Mouse: {
      sizes: ["N/A"],
      specs: ["Wireless", "Wired"],
    },
    "Interactive White Board": {
      sizes: ["82 inch"],
      specs: ["Ceramic", "Non-Ceramic"],
    },
    "Floor Stand": { sizes: ["N/A"], specs: ["N/A"] },
    "Notice Board": { sizes: ["N/A"], specs: ["N/A"] },
    Visualizer: { sizes: ["N/A"], specs: ["N/A"] },
    "Web Cam": {
      sizes: ["N/A"],
      specs: ["Full HD Non-AI Featured", "4K AI Featured", "4K Auto Tracking"],
    },
    "Bluetooth Microphone": { sizes: ["N/A"], specs: ["N/A"] },
    "UPS Cabinet": { sizes: ["N/A"], specs: ["N/A"] },
    "SD Card": {
      sizes: ["N/A"],
      specs: ["8GB", "16GB", "32GB", "64GB", "128GB"],
    },
    Casing: { sizes: ["N/A"], specs: ["N/A"] },
    "Fitting Accessories": { sizes: ["N/A"], specs: ["N/A"] },
    "HDMI Cable": {
      sizes: ["N/A"],
      specs: ["Standard", "4K"],
    },
    "White Board": { sizes: ["N/A"], specs: ["N/A"] },
    "C-type Cable": { sizes: ["N/A"], specs: ["N/A"] },
    "Fujifilm-Printer": {
      sizes: ["N/A"],
      specs: [
        "Color Printer",
        "Monochrome Printer",
        "Black and White Printer",
        "Multifunction Color Printer",
        "Multifunction Monochrome Printer",
        "Multifunction Black and White Printer",
      ],
    },
    "Google TV": {
      sizes: ["43 inch", "50 inch", "55 inch"],
      specs: ["4GB RAM / 32GB ROM 4K"],
    },
    "Wriety Software": { sizes: ["N/A"], specs: ["N/A"] },
    "Ceiling Mount Kit": {
      sizes: ["Standard"],
      specs: ["Projector Ceiling Mount", "PTZ Ceiling Mount"],
    },
    "Almirah Type Shutter": {
      sizes: ["65 inch", "75 inch", "86 inch", "98  inch"],
      specs: ["N/A"],
    },
    Aicharya: {
      sizes: ["N/A"],
      specs: ["Standard"],
    },
    Logo: { sizes: ["N/A"], specs: ["N/A"] },
    Microphones: { sizes: ["N/A"], specs: ["N/A"] },
    "E-Share License": { sizes: ["N/A"], specs: ["N/A"] },
    "PRO Share Software": { sizes: ["N/A"], specs: ["N/A"] },
    "E Share Software": { sizes: ["N/A"], specs: ["N/A"] },
    "DMS Software": { sizes: ["N/A"], specs: ["N/A"] },
    "Battery Bank": { sizes: ["N/A"], specs: ["N/A"] },
    "Rack & Interlink": { sizes: ["N/A"], specs: ["N/A"] },
    "Green Board": { sizes: ["N/A"], specs: ["N/A"] },
    "Wooden Podium": { sizes: ["N/A"], specs: ["N/A"] },
    "Writing Board": { sizes: ["N/A"], specs: ["N/A"] },
    "LED Video Wall": { sizes: ["N/A"], specs: ["N/A"] },
    "4K Video Bar": { sizes: ["N/A"], specs: ["N/A"] },
    "Microsoft Office 2016 Licensed": { sizes: ["N/A"], specs: ["N/A"] },
    "Windows 11 Licensed": { sizes: ["N/A"], specs: ["N/A"] },
    "Embibe Content": { sizes: ["N/A"], specs: ["N/A"] },
    SSD: {
      sizes: ["N/A"],
      specs: ["256GB", "512GB", "1TB"],
    },
    RAM: {
      sizes: ["N/A"],
      specs: ["8GB", "16GB"],
    },
    "Video Conferencing Camera": { sizes: ["N/A"], specs: ["N/A"] },
    "CBSE Content": { sizes: ["N/A"], specs: ["N/A"] },
    "ICSE Content": { sizes: ["N/A"], specs: ["N/A"] },
    "PA System Speakers": { sizes: ["N/A"], specs: ["N/A"] },
    "Red Board": { sizes: ["N/A"], specs: ["N/A"] },
    "Promark Stickers": { sizes: ["N/A"], specs: ["N/A"] },
    "Bluetooth Speaker": { sizes: ["N/A"], specs: ["N/A"] },
    "3 Cup Conference Speaker": { sizes: ["N/A"], specs: ["N/A"] },
    "Conference Setup-Delegate Room": { sizes: ["N/A"], specs: ["N/A"] },
    Content: { sizes: ["N/A"], specs: ["N/A"] },
    Flex: { sizes: ["N/A"], specs: ["N/A"] },
    "Wireless Speakerphone - Two Pair": { sizes: ["N/A"], specs: ["N/A"] },
    Remote: { sizes: ["N/A"], specs: ["N/A"] },
    "Educational Software": { sizes: ["N/A"], specs: ["N/A"] },
    "Hydraulic Bracket": { sizes: ["N/A"], specs: ["N/A"] },
    "Desktop PC Monitor": { sizes: ["N/A"], specs: ["N/A"] },
    "Home Theatre": { sizes: ["N/A"], specs: ["N/A"] },
    "Digital Audio Processor": { sizes: ["N/A"], specs: ["N/A"] },
    Projector: {
      sizes: ["N/A"],
      specs: ["Long Throw", "Short Throw", "Ultra Long Throw"],
    },
    "LED TV": { sizes: ["N/A"], specs: ["N/A"] },
    "Digital Podium Controller": { sizes: ["N/A"], specs: ["N/A"] },
    "Amplifier Mic Receiver": { sizes: ["N/A"], specs: ["N/A"] },
    "Wireless Mic Receiver": { sizes: ["N/A"], specs: ["N/A"] },
    "Projector Screen": { sizes: ["N/A"], specs: ["N/A"] },
    Speakerphone: { sizes: ["N/A"], specs: ["N/A"] },

    "Bubble Roll": { sizes: ["N/A"], specs: ["N/A"] },
    "Wrapping Roll": { sizes: ["N/A"], specs: ["N/A"] },
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
      "Mahuwadabar",
      "Anandnagar Maharajganj",
      "Badhnan",
      "Khalilabad",
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
      "Alaknanda",
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
    "GEM",
    "Goverment",
    "Private",
    "Demo",
    "Replacement",
    "Repair",
  ];
  const salesPersonlist = [
    "Aasim Musadiq",
    "Abhay Pratap Singh",
    "Abhayjit Sekhon",
    "Ajay Kumar",
    "Amarjeet Singh",
    "Aniket Singh",
    "Anil Kumar",
    "Animesh Trivedi",
    "Anirban Syam",
    "Ankit Sharma",
    "Anup Panday",
    "Arif Khan",
    "Arwinder Singh",
    "Awadesh Kumar Srivastav",
    "Bachan Pal",
    "Barjesh Singh",
    "Gursewak Singh",
    "Harish Kumar",
    "Harpeet Singh",
    "J P Sharma",
    "Jagan Lal",
    "Javvad Akram",
    "Kulwinder Singh",
    "Manish CS Lange",
    "Manjit Singh Chowhan",
    "Mayank Goutam",
    "Mayank Prasad",
    "Nikhil Sharma",
    "Parmjeet Singh",
    "Pitamber Sharma",
    "Purnendu Kumar",
    "Raj Bahadur Singh",
    "Rajeev Kumar Singh",
    "Rajeev Pal Singh",
    "Rajesh Kumar",
    "Rakesh Kumar",
    "Ramkumar Singh",
    "Rohit Kumar Tiwari",
    "Sahil Gupta",
    "Savir Khan",
    "Shri Kant",
    "Siddhartha Kumar",
    "Sidhant Oberai",
    "Sidhant Prajapati",
    "Sukhjinder Pal Singh",
    "Sumit Kushwaha",
    "Sunil Kukkar",
    "Surbhi Chugh",
    "Sushil Kumar",
    "Vageesh Bhardwaj",
    "Vaibhav Mishra",
    "Varun Budhiraja",
    "Vaseem Khan",
  ];
  const Reportinglist = [
    "Abhay Pratap Singh",
    "Abhayjit Sekhon",
    "Amarjeet Singh",
    "Arwinder Singh",
    "Bachan Pal",
    "Harpeet Singh",
    "J P Sharma",
    "Manish CS Lange",
    "Manjit Singh Chowhan",
    "Mayank Prasad",
    "Nikhil Sharma",
    "Purnendu Kumar",
    "Raj Bahadur Singh",
    "Rajeev Kumar Singh",
    "Rajeev Pal Singh",
    "Sahil Gupta",
    "Savir Khan",
    "Siddhartha Kumar",
    "Sukhjinder Pal Singh",
    "Sumit Kushwaha",
    "Sunil Kukkar",
    "Surbhi Chugh",
    "Sushil Kumar",
    "Varun Budhiraja",
    "Vaseem Khan",
  ];
  const paymentMethodOptions = ["Cash", "NEFT", "RTGS", "Cheque"];

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
        ...(name === "paymentCollected"
          ? { paymentDue: calculatePaymentDue(Number(value) || 0) }
          : {}),
        ...(name === "paymentMethod"
          ? { neftTransactionId: "", chequeId: "" }
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
      toast.error("Please fill all required product fields including GST (%)");
      return;
    }
    if (isNaN(Number(currentProduct.qty)) || Number(currentProduct.qty) <= 0) {
      toast.error("Quantity must be a positive number");
      return;
    }
    if (
      isNaN(Number(currentProduct.unitPrice)) ||
      Number(currentProduct.unitPrice) < 0
    ) {
      toast.error("Unit Price must be a non-negative number");
      return;
    }
    if (isNaN(Number(currentProduct.gst)) || Number(currentProduct.gst) < 0) {
      toast.error("GST (%) must be a non-negative number");
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
    setFormData((prev) => ({
      ...prev,
      paymentDue: calculatePaymentDue(Number(prev.paymentCollected) || 0),
    }));
  };

  const removeProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      paymentDue: calculatePaymentDue(Number(prev.paymentCollected) || 0),
    }));
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

  const calculateTotal = () => {
    const subtotalWithGST = products.reduce((sum, product) => {
      const qty = Number(product.qty) || 0;
      const unitPrice = Number(product.unitPrice) || 0;
      const gstRate = Number(product.gst) || 0;

      const base = qty * unitPrice;
      const gst = base * (gstRate / 100);

      return sum + base + gst;
    }, 0);

    const installation = Number(formData.installation) || 0;
    const freight = Number(formData.freightcs) || 0;

    return Number((subtotalWithGST + freight + installation).toFixed(2));
  };

  const calculatePaymentDue = (paymentCollected) => {
    const total = calculateTotal();
    const due = total - paymentCollected;
    return Number(due.toFixed(2));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.soDate) {
      toast.error("Please fill SO Date");
      return;
    }
    if (products.length === 0) {
      toast.error("Please add at least one product");
      return;
    }
    if (formData.paymentMethod === "NEFT" && !formData.neftTransactionId) {
      toast.error("Please provide NEFT Transaction ID");
      return;
    }
    if (formData.paymentMethod === "Cheque" && !formData.chequeId) {
      toast.error("Please provide Cheque ID");
      return;
    }

    const total = calculateTotal();

    const newEntry = {
      ...formData,
      products: products.map((p) => ({
        productType: p.productType,
        size: p.size || "N/A",
        spec: p.spec || "N/A",
        qty: Number(p.qty),
        unitPrice: Number(p.unitPrice),
        gst: Number(p.gst), // Send raw GST percentage
        serialNos: [],
        modelNos: [],
      })),
      soDate: formData.soDate,
      committedDate: formData.committedDate || null,
      total,

      freightcs: formData.freightcs || "",
      installation: formData.installation || "N/A",
      orderType: formData.orderType,
      paymentCollected: String(formData.paymentCollected || ""),
      paymentMethod: formData.paymentMethod || "",
      paymentDue: String(formData.paymentDue || ""),
      neftTransactionId: formData.neftTransactionId || "",
      chequeId: formData.chequeId || "",
      remarks: formData.remarks || "",
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
              placeholder: "Enter Customer Name",
            },
            {
              label: "Address",
              name: "partyAndAddress",
              type: "text",
              placeholder: "Enter Full Address",
            },
            {
              label: "State",
              name: "state",
              type: "select",
              options: Object.keys(statesAndCities),
              onChange: handleStateChange,
              placeholder: "Select State",
            },
            {
              label: "City",
              name: "city",
              type: "select",
              options: selectedState ? statesAndCities[selectedState] : [],
              onChange: handleCityChange,
              disabled: !selectedState,
              placeholder: "Select City",
            },
            {
              label: "Pin Code",
              name: "pinCode",
              type: "tel",
              inputMode: "numeric",
              placeholder: "e.g. 110001",
            },
            {
              label: "Contact Person Name",
              name: "name",
              type: "text",
              placeholder: "Enter Contact Person Name",
            },
            {
              label: "Contact Person No",
              name: "contactNo",
              type: "tel",
              inputMode: "numeric",
              maxLength: 10,
              placeholder: "e.g. 9876543210",
            },
            {
              label: "Customer Email",
              name: "customerEmail",
              type: "email",
              placeholder: "e.g. example@domain.com",
            },
            {
              label: "Sales Person",
              name: "salesPerson",
              type: "select",
              options: salesPersonlist,
              placeholder: "Enter Sales Person's Name",
            },
            {
              label: "Reporting Manager",
              name: "report",
              type: "select",
              options: Reportinglist,
              placeholder: "Enter Reporting Manager",
            },
            {
              label: "Company",
              name: "company",
              type: "select",
              options: ["Promark", "Promine", "Others"],
              placeholder: "Select Company",
            },
            {
              label: "Remarks",
              name: "remarks",
              type: "text",
              placeholder: "Enter any additional remarks",
            },
            {
              label: "Shipping Address",
              name: "shippingAddress",
              type: "text",
              placeholder: "Enter Shipping Address",
            },
            {
              label: "Billing Address",
              name: "billingAddress",
              type: "text",
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

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.5rem",
                marginTop: "1rem",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#475569",
                    marginBottom: "0.5rem",
                  }}
                >
                  Freight Charges
                </label>
                <input
                  type="text"
                  name="freightcs"
                  value={formData.freightcs || ""}
                  onChange={(e) => {
                    handleChange(e);
                    setFormData((prev) => ({
                      ...prev,
                      paymentDue: calculatePaymentDue(
                        Number(prev.paymentCollected) || 0
                      ),
                    }));
                  }}
                  placeholder="e.g. ₹2000, Paid"
                  style={{
                    padding: "0.75rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.75rem",
                    backgroundColor: "#f8fafc",
                    fontSize: "1rem",
                    color: "#1e293b",
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#475569",
                    marginBottom: "0.5rem",
                  }}
                >
                  Installation Charges
                </label>
                <input
                  type="text"
                  name="installation"
                  value={formData.installation || ""}
                  onChange={handleChange}
                  placeholder="e.g. ₹1000, Not Included"
                  style={{
                    padding: "0.75rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.75rem",
                    backgroundColor: "#f8fafc",
                    fontSize: "1rem",
                    color: "#1e293b",
                  }}
                />
              </div>
            </div>
          </div>

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
              💰 Payment Details
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.5rem",
                alignItems: "start",
              }}
            >
              {/* Left Side */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      color: "#475569",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Total Amount
                  </label>
                  <div
                    style={{
                      padding: "0.75rem",
                      backgroundColor: "#f1f5f9",
                      borderRadius: "0.75rem",
                      fontSize: "1rem",
                      color: "#1e293b",
                      fontWeight: "600",
                    }}
                  >
                    ₹ {calculateTotal()}
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      color: "#475569",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Payment Collected *
                  </label>
                  <input
                    type="number"
                    name="paymentCollected"
                    value={formData.paymentCollected}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "0.75rem",
                      backgroundColor: "#f8fafc",
                      fontSize: "1rem",
                      color: "#1e293b",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      color: "#475569",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Payment Due
                  </label>
                  <input
                    type="number"
                    name="paymentDue"
                    value={formData.paymentDue}
                    readOnly
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "0.75rem",
                      backgroundColor: "#e5e7eb",
                      fontSize: "1rem",
                      color: "#1e293b",
                    }}
                  />
                </div>
              </div>

              {/* Right Side */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      color: "#475569",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Payment Method *
                  </label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "0.75rem",
                      backgroundColor: "#f8fafc",
                      fontSize: "1rem",
                      color: "#1e293b",
                    }}
                  >
                    <option value="">Select Method</option>
                    {paymentMethodOptions.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.paymentMethod === "NEFT" && (
                  <div>
                    <label
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: "600",
                        color: "#475569",
                        marginBottom: "0.5rem",
                      }}
                    >
                      NEFT Transaction ID *
                    </label>
                    <input
                      type="text"
                      name="neftTransactionId"
                      value={formData.neftTransactionId}
                      onChange={handleChange}
                      placeholder="Enter NEFT Transaction ID"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #e2e8f0",
                        borderRadius: "0.75rem",
                        backgroundColor: "#f8fafc",
                        fontSize: "1rem",
                        color: "#1e293b",
                      }}
                    />
                  </div>
                )}

                {formData.paymentMethod === "Cheque" && (
                  <div>
                    <label
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: "600",
                        color: "#475569",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Cheque ID *
                    </label>
                    <input
                      type="text"
                      name="chequeId"
                      value={formData.chequeId}
                      onChange={handleChange}
                      placeholder="Enter Cheque ID"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #e2e8f0",
                        borderRadius: "0.75rem",
                        backgroundColor: "#f8fafc",
                        fontSize: "1rem",
                        color: "#1e293b",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

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
