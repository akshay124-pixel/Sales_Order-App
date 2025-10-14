import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
import { Button, Form } from "react-bootstrap";
import { X, Download, Calendar } from "lucide-react";
import axios from "axios";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Styled Components
const DrawerOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: ${(props) => (props.isOpen ? "block" : "none")};
`;

const DrawerContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80vh;
  max-height: 80vh;
  background: linear-gradient(135deg, #e6f0fa, #f3e8ff);
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  transform: translateY(${(props) => (props.isOpen ? "0" : "100%")});
  transition: transform 0.4s ease-in-out;
  overflow: hidden;
  padding: 20px;
  font-family: "Poppins", sans-serif;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    height: 90vh;
    max-height: 90vh;
    padding: 10px;
  }
`;

const DrawerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  background: linear-gradient(135deg, #2575fc, #6a11cb);
  border-radius: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 8px;
    gap: 8px;
  }
`;

const DrawerTitle = styled.h3`
  color: white;
  font-weight: 700;
  font-size: 1.2rem;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    gap: 8px;
  }
`;

const CloseButton = styled(Button)`
  background: #dc3545;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
  &:hover {
    background: #b02a37;
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 10px;
    font-size: 0.8rem;
  }
`;

const ExportButton = styled(Button)`
  background: #28a745;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
  &:hover {
    background: #218838;
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 10px;
    font-size: 0.8rem;
  }
`;

const DatePickerContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 5px;
  z-index: 2000;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const StyledDatePicker = styled(DatePicker)`
  padding: 8px 30px 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  width: 140px;
  background: white;
  color: #1e3a8a;
  font-family: "Poppins", sans-serif;
  &:focus {
    outline: none;
    border-color: #2575fc;
    box-shadow: 0 0 0 3px rgba(37, 117, 252, 0.3);
  }
  &::placeholder {
    color: #6b7280;
  }

  @media (max-width: 768px) {
    width: 100%;
    font-size: 0.8rem;
    padding: 8px;
  }
`;

const DatePickerIcon = styled(Calendar)`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  width: 18px;
  height: 18px;
  pointer-events: none;

  @media (max-width: 768px) {
    right: 8px;
    width: 16px;
    height: 16px;
  }
`;

const DatePickerPopup = styled.div`
  .react-datepicker {
    z-index: 2000 !important;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-family: "Poppins", sans-serif;
  }
  .react-datepicker__triangle {
    display: none;
  }
  .react-datepicker__header {
    background: linear-gradient(135deg, #2575fc, #6a11cb);
    color: white;
    border-bottom: none;
  }
  .react-datepicker__current-month,
  .react-datepicker__day-name {
    color: white;
    font-weight: 500;
  }
  .react-datepicker__day {
    color: #1e3a8a;
    &:hover {
      background: #f0f7ff;
    }
  }
  .react-datepicker__day--selected,
  .react-datepicker__day--keyboard-selected {
    background: #2575fc;
    color: white;
  }
  .react-datepicker__day--outside-month {
    color: #6b7280;
  }

  @media (max-width: 768px) {
    .react-datepicker {
      width: 100%;
      font-size: 0.8rem;
    }
  }
`;

const ResetButton = styled(Button)`
  background: #6b7280;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
  &:hover {
    background: #4b5563;
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 10px;
    font-size: 0.8rem;
  }
`;

const SalesPersonSelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const StyledFormSelect = styled(Form.Select)`
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  width: 160px;
  background: white;
  color: #1e3a8a;
  font-family: "Poppins", sans-serif;
  &:focus {
    outline: none;
    border-color: #2575fc;
    box-shadow: 0 0 0 3px rgba(37, 117, 252, 0.3);
  }

  @media (max-width: 768px) {
    width: 100%;
    font-size: 0.8rem;
    padding: 8px;
  }
`;

const TableContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  border-radius: 12px;
  background: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  max-height: calc(80vh - 100px);

  @media (max-width: 768px) {
    max-height: calc(90vh - 120px);
    overflow-x: auto;
  }
`;

const DashboardTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;

  @media (max-width: 768px) {
    min-width: 1150px; /* Ensure horizontal scrolling */
  }
`;

const TotalHeaderRow = styled.tr`
  background: linear-gradient(135deg, #1e3a8a, #4b0082);
  position: sticky;
  top: 0;
  z-index: 20;
`;

const TableHeaderRow = styled.tr`
  background: linear-gradient(135deg, #2575fc, #6a11cb);
  position: sticky;
  top: 48px;
  z-index: 15;
  @media (max-width: 768px) {
    top: 36px;
  }
`;

const TeamHeaderRow = styled.tr`
  background: linear-gradient(135deg, #2575fc, #6a11cb);
  position: sticky;
  top: 44px;
  z-index: 15;
`;

const TotalHeader = styled.th`
  padding: 12px 15px;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  text-align: left;
  &:nth-child(1) {
    width: 20%;
  }
  &:nth-child(2) {
    width: 12%;
  }
  &:nth-child(3) {
    width: 16%;
  }
  &:nth-child(4) {
    width: 16%;
  }
  &:nth-child(5) {
    width: 16%;
  }
  &:nth-child(6) {
    width: 12%;
  }
  &:nth-child(7) {
    width: 12%;
  }

  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 8px;
  }
`;

const TableHeader = styled.th`
  padding: 12px 15px;
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  text-transform: uppercase;
  text-align: left;
  &:nth-child(1) {
    width: 20%;
  }
  &:nth-child(2) {
    width: 12%;
  }
  &:nth-child(3) {
    width: 16%;
  }
  &:nth-child(4) {
    width: 16%;
  }
  &:nth-child(5) {
    width: 16%;
  }
  &:nth-child(6) {
    width: 12%;
  }
  &:nth-child(7) {
    width: 12%;
  }

  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 8px;
  }
`;

const TeamHeader = styled.th`
  padding: 12px 15px;
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  text-transform: uppercase;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 8px;
  }
`;

const TableCell = styled.td`
  padding: 12px 15px;
  border-bottom: 1px solid #e6f0fa;
  font-size: 0.9rem;
  color: #1e3a8a;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  &:nth-child(1) {
    width: 20%;
  }
  &:nth-child(2) {
    width: 12%;
  }
  &:nth-child(3) {
    width: 16%;
  }
  &:nth-child(4) {
    width: 16%;
  }
  &:nth-child(5) {
    width: 16%;
  }
  &:nth-child(6) {
    width: 12%;
  }
  &:nth-child(7) {
    width: 12%;
  }

  @media (max-width: 768px) {
    font-size: 0.75rem;
    padding: 8px;
  }
`;

const TableRow = styled.tr`
  &:hover {
    background-color: #f0f7ff;
  }
`;

const SalesDashboardDrawer = ({ isOpen, onClose }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedSalesPerson, setSelectedSalesPerson] = useState("All");
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("role");
  const [currentUser, setCurrentUser] = useState(null);
  const [groupByTeam, setGroupByTeam] = useState(false);
  const [teamMemberIds, setTeamMemberIds] = useState([]);
  const [salesScope, setSalesScope] = useState("team");

  const isTeamMemberOrder = (order) => {
    return order.createdBy?._id !== userId;
  };

  const uniqueSalesPersons = useMemo(() => {
    const persons = [
      ...new Set(
        orders.map(
          (order) => order.createdBy?.username?.trim() || "Sales Order Team"
        )
      ),
    ];
    return ["All", ...persons.sort()];
  }, [orders]);

  const filterOrders = useCallback(
    (ordersToFilter, start, end, salesPerson) => {
      let filtered = [...ordersToFilter];

      if (start || end) {
        filtered = filtered.filter((order) => {
          const orderDate = new Date(order.soDate);
          const startDateAdjusted = start
            ? new Date(start.setHours(0, 0, 0, 0))
            : null;
          const endDateAdjusted = end
            ? new Date(end.setHours(23, 59, 59, 999))
            : null;
          return (
            (!startDateAdjusted || orderDate >= startDateAdjusted) &&
            (!endDateAdjusted || orderDate <= endDateAdjusted)
          );
        });
      }

      if (salesPerson && salesPerson !== "All") {
        filtered = filtered.filter(
          (order) =>
            (order.createdBy?.username?.trim() || "Sales Order Team") ===
            salesPerson
        );
      }

      if (userRole === "Sales") {
        if (salesScope === "own") {
          filtered = filtered.filter(
            (order) => order.createdBy?._id === userId
          );
        } else {
          const allowedIds = new Set([userId, ...teamMemberIds]);
          filtered = filtered.filter((order) => {
            const createdById = order.createdBy?._id;
            const isAssignedToMe = Array.isArray(order.assignedTo)
              ? order.assignedTo.includes(userId)
              : false;
            return allowedIds.has(createdById) || isAssignedToMe;
          });
        }
      }

      return filtered;
    },
    [userRole, currentUser, userId, teamMemberIds, salesScope]
  );

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Your session has expired. Please log in again.");
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_URL}/api/get-orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Fetched orders:", response.data);
      setOrders(response.data || []);
    } catch (error) {
      console.error("Error fetching orders:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      let errorMessage = "Something went wrong while loading orders.";

      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Your session has expired. Please log in again.";
        } else if (error.response.status === 404) {
          errorMessage = "No orders found.";
        } else if (error.response.status === 500) {
          errorMessage = "Server is not responding. Please try again later.";
        } else {
          errorMessage = error.response.data?.error || errorMessage;
        }
      } else if (error.request) {
        errorMessage =
          "Unable to connect. Please check your internet connection.";
      }

      toast.error(errorMessage);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
      (async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) return;
          const res = await axios.get(
            `${process.env.REACT_APP_URL}/api/current-user`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setCurrentUser(res.data);
          if (userRole === "Sales") {
            try {
              const teamRes = await axios.get(
                `${process.env.REACT_APP_URL}/api/fetch-my-team`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              const ids = (teamRes.data?.data || []).map((u) => u._id);
              setTeamMemberIds(ids);
            } catch (err) {
              console.warn("Failed to fetch team members", err?.message);
            }
          }
        } catch (e) {
          console.warn(
            "Failed to fetch current user for dashboard",
            e?.message
          );
        }
      })();
      const baseOrigin = (() => {
        try {
          return new URL(process.env.REACT_APP_URL).origin;
        } catch {
          return process.env.REACT_APP_URL;
        }
      })();
      const socket = io(baseOrigin, {
        path: "/sales/socket.io",
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        withCredentials: true,
        transports: ["websocket", "polling"],
      });

      socket.on("connect", () => {
        console.log("Connected to Socket.IO server, ID:", socket.id);
        // Hinglish: Server per-user/role rooms use object payload -> 'global' ki zarurat nahi
        socket.emit("join", { userId, role: userRole });
        toast.success("Connected to real-time updates!");
      });

      socket.on("orderUpdate", (data) => {
        console.log("Order update received:", data);
        // Hinglish: Single fetch enough; duplicates bachane ke liye yahin pe limited action rakha hai
        fetchOrders();
      });

      socket.on("connect_error", (error) => {
        console.error("Socket.IO connection error:", error.message);
        toast.error(`Connection to server failed: ${error.message}`);
      });

      socket.on("disconnect", (reason) => {
        console.log("Socket.IO disconnected:", reason);
        if (reason !== "io client disconnect") {
          toast.warn(`Disconnected from server: ${reason}. Reconnecting...`);
        }
      });

      socket.on("reconnect", (attempt) => {
        console.log("Socket.IO reconnected after attempt:", attempt);
        toast.success("Reconnected to server!");
        fetchOrders();
      });

      return () => {
        // Hinglish: Cleanup listeners to avoid duplicate bindings / memory leaks
        socket.off("connect");
        socket.off("orderUpdate");
        socket.off("connect_error");
        socket.off("disconnect");
        socket.off("reconnect");
        socket.disconnect();
        console.log("Socket.IO disconnected and listeners cleaned up");
      };
    }
  }, [isOpen]);

  const filteredOrders = useMemo(() => {
    return filterOrders(orders, startDate, endDate, selectedSalesPerson);
  }, [orders, startDate, endDate, selectedSalesPerson, filterOrders]);

  const salesAnalytics = useMemo(() => {
    console.log("Computing sales analytics for orders:", filteredOrders);
    return filteredOrders.reduce((acc, order) => {
      const personName =
        order.createdBy?.username?.trim() || "Sales Order Team";
      const leaderName =
        order.createdBy?.assignedToLeader?.username || `${personName} (Leader)`;

      let groupKey;
      let showTeamBadge = false;
      if ((userRole === "Admin" || userRole === "SuperAdmin") && groupByTeam) {
        groupKey = `${leaderName}:::${personName}`;
      } else {
        groupKey = personName;
        showTeamBadge = isTeamMemberOrder(order);
      }

      if (!acc[groupKey]) {
        acc[groupKey] = {
          teamName:
            (userRole === "Admin" || userRole === "SuperAdmin") && groupByTeam
              ? leaderName
              : undefined,
          personName: personName,
          totalOrders: 0,
          totalAmount: 0,
          totalPaymentCollected: 0,
          totalPaymentDue: 0,
          dueOver30Days: 0,
          totalUnitPrice: 0,
          isTeamMember: showTeamBadge,
        };
      }

      const total = Number(order.total) || 0;
      const paymentCollected = parseFloat(order.paymentCollected) || 0;
      const paymentDue = parseFloat(order.paymentDue) || 0;

      const unitPriceTotal =
        order.products?.reduce((sum, product) => {
          const unitPrice = Number(product.unitPrice) || 0;
          const qty = Number(product.qty) || 0;
          return sum + unitPrice * qty;
        }, 0) || 0;

      if (isFinite(total)) {
        acc[groupKey].totalOrders += 1;
        acc[groupKey].totalAmount += total;
      }
      if (isFinite(paymentCollected)) {
        acc[groupKey].totalPaymentCollected += paymentCollected;
      }
      if (isFinite(paymentDue)) {
        acc[groupKey].totalPaymentDue += paymentDue;
      }
      if (isFinite(unitPriceTotal)) {
        acc[groupKey].totalUnitPrice += unitPriceTotal;
      }

      const soDate = order.soDate ? new Date(order.soDate) : null;
      const currentDate = new Date();
      if (
        soDate &&
        !isNaN(soDate.getTime()) &&
        isFinite(paymentDue) &&
        paymentDue > 0
      ) {
        const daysSinceOrder = Math.floor(
          (currentDate - soDate) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceOrder > 30) {
          acc[groupKey].dueOver30Days += paymentDue;
        }
      }

      return acc;
    }, {});
  }, [filteredOrders, userRole, groupByTeam]);

  const overallTotals = Object.values(salesAnalytics).reduce(
    (acc, data) => ({
      totalOrders: acc.totalOrders + data.totalOrders,
      totalAmount: acc.totalAmount + data.totalAmount,
      totalPaymentCollected:
        acc.totalPaymentCollected + data.totalPaymentCollected,
      totalPaymentDue: acc.totalPaymentDue + data.totalPaymentDue,
      dueOver30Days: acc.dueOver30Days + data.dueOver30Days,
      totalUnitPrice: acc.totalUnitPrice + data.totalUnitPrice,
    }),
    {
      totalOrders: 0,
      totalAmount: 0,
      totalPaymentCollected: 0,
      totalPaymentDue: 0,
      dueOver30Days: 0,
      totalUnitPrice: 0,
    }
  );

  const analyticsData = Object.entries(salesAnalytics).map(([key, data]) => ({
    teamName: data.teamName,
    createdBy: data.personName || key,
    totalOrders: data.totalOrders,
    totalAmount: Number(data.totalAmount.toFixed(2)),
    totalPaymentCollected: Number(data.totalPaymentCollected.toFixed(2)),
    totalPaymentDue: Number(data.totalPaymentDue.toFixed(2)),
    dueOver30Days: Number(data.dueOver30Days.toFixed(2)),
    totalUnitPrice: Number(data.totalUnitPrice.toFixed(2)),
    isTeamMember: data.isTeamMember,
    collectionRate:
      data.totalAmount > 0
        ? Number(
            ((data.totalPaymentCollected / data.totalAmount) * 100).toFixed(2)
          )
        : 0,
    dueRate:
      data.totalAmount > 0
        ? Number(((data.totalPaymentDue / data.totalAmount) * 100).toFixed(2))
        : 0,
    avgOrderValue:
      data.totalOrders > 0
        ? Number((data.totalAmount / data.totalOrders).toFixed(2))
        : 0,
  }));

  const groupedAnalytics = useMemo(() => {
    if (!((userRole === "Admin" || userRole === "SuperAdmin") && groupByTeam))
      return null;

    const groups = new Map();
    for (const row of analyticsData) {
      const team = row.teamName || "Unassigned";
      if (!groups.has(team)) groups.set(team, []);
      groups.get(team).push(row);
    }

    for (const [team, rows] of groups) {
      rows.sort((a, b) => {
        if (b.totalAmount !== a.totalAmount)
          return b.totalAmount - a.totalAmount;
        return a.createdBy.localeCompare(b.createdBy);
      });
    }

    const sorted = Array.from(groups.entries()).sort(([a], [b]) =>
      a.localeCompare(b)
    );

    const withTotals = sorted.map(([team, rows]) => {
      const totals = rows.reduce(
        (acc, r) => ({
          totalOrders: acc.totalOrders + r.totalOrders,
          totalAmount: acc.totalAmount + r.totalAmount,
          totalPaymentCollected:
            acc.totalPaymentCollected + r.totalPaymentCollected,
          totalPaymentDue: acc.totalPaymentDue + r.totalPaymentDue,
          dueOver30Days: acc.dueOver30Days + r.dueOver30Days,
          totalUnitPrice: acc.totalUnitPrice + r.totalUnitPrice,
        }),
        {
          totalOrders: 0,
          totalAmount: 0,
          totalPaymentCollected: 0,
          totalPaymentDue: 0,
          dueOver30Days: 0,
          totalUnitPrice: 0,
        }
      );
      const teamCollectionRate =
        totals.totalAmount > 0
          ? Number(
              (
                (totals.totalPaymentCollected / totals.totalAmount) *
                100
              ).toFixed(2)
            )
          : 0;
      const teamDueRate =
        totals.totalAmount > 0
          ? Number(
              ((totals.totalPaymentDue / totals.totalAmount) * 100).toFixed(2)
            )
          : 0;
      const teamAOV =
        totals.totalOrders > 0
          ? Number((totals.totalAmount / totals.totalOrders).toFixed(2))
          : 0;
      return { team, rows, totals, teamCollectionRate, teamDueRate, teamAOV };
    });

    return withTotals;
  }, [analyticsData, userRole, groupByTeam]);

  const [expandedTeams, setExpandedTeams] = useState({});
  const toggleTeam = useCallback((team) => {
    setExpandedTeams((prev) => ({ ...prev, [team]: !prev[team] }));
  }, []);

  const adminTeamSections = useMemo(() => {
    if (!((userRole === "Admin" || userRole === "SuperAdmin") && groupByTeam))
      return null;

    const personAggByLeader = new Map();
    const leaderNameById = new Map();
    const personNameById = new Map();

    for (const order of filteredOrders) {
      const createdById = order.createdBy?._id || "unknown";
      const createdByName =
        order.createdBy?.username?.trim() || "Sales Order Team";
      const leaderId = order.createdBy?.assignedToLeader?._id || createdById;
      const leaderName =
        order.createdBy?.assignedToLeader?.username || createdByName;

      leaderNameById.set(leaderId, leaderName);
      personNameById.set(createdById, createdByName);

      if (!personAggByLeader.has(leaderId)) {
        personAggByLeader.set(leaderId, new Map());
      }
      const perPerson = personAggByLeader.get(leaderId);

      if (!perPerson.has(createdById)) {
        perPerson.set(createdById, {
          personId: createdById,
          personName: createdByName,
          totalOrders: 0,
          totalAmount: 0,
          totalPaymentCollected: 0,
          totalPaymentDue: 0,
          dueOver30Days: 0,
          totalUnitPrice: 0,
        });
      }
      const agg = perPerson.get(createdById);

      const total = Number(order.total) || 0;
      const paymentCollected = parseFloat(order.paymentCollected) || 0;
      const paymentDue = parseFloat(order.paymentDue) || 0;
      const unitPriceTotal =
        order.products?.reduce((sum, product) => {
          const unitPrice = Number(product.unitPrice) || 0;
          const qty = Number(product.qty) || 0;
          return sum + unitPrice * qty;
        }, 0) || 0;

      if (isFinite(total)) {
        agg.totalOrders += 1;
        agg.totalAmount += total;
      }
      if (isFinite(paymentCollected))
        agg.totalPaymentCollected += paymentCollected;
      if (isFinite(paymentDue)) agg.totalPaymentDue += paymentDue;
      if (isFinite(unitPriceTotal)) agg.totalUnitPrice += unitPriceTotal;

      const soDate = order.soDate ? new Date(order.soDate) : null;
      const currentDate = new Date();
      if (
        soDate &&
        !isNaN(soDate.getTime()) &&
        isFinite(paymentDue) &&
        paymentDue > 0
      ) {
        const daysSinceOrder = Math.floor(
          (currentDate - soDate) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceOrder > 30) agg.dueOver30Days += paymentDue;
      }
    }

    const sections = [];
    for (const [leaderId, perPerson] of personAggByLeader.entries()) {
      const leaderName = leaderNameById.get(leaderId) || "Unknown";
      const rows = Array.from(perPerson.values()).map((agg) => ({
        personId: agg.personId,
        createdBy: agg.personName,
        totalOrders: agg.totalOrders,
        totalAmount: Number(agg.totalAmount.toFixed(2)),
        totalPaymentCollected: Number(agg.totalPaymentCollected.toFixed(2)),
        totalPaymentDue: Number(agg.totalPaymentDue.toFixed(2)),
        dueOver30Days: Number(agg.dueOver30Days.toFixed(2)),
        totalUnitPrice: Number(agg.totalUnitPrice.toFixed(2)),
      }));

      const memberCount = rows.filter((r) => r.personId !== leaderId).length;
      if (memberCount === 0) continue;

      const totals = rows.reduce(
        (acc, r) => ({
          totalOrders: acc.totalOrders + r.totalOrders,
          totalAmount: acc.totalAmount + r.totalAmount,
          totalPaymentCollected:
            acc.totalPaymentCollected + r.totalPaymentCollected,
          totalPaymentDue: acc.totalPaymentDue + r.totalPaymentDue,
          dueOver30Days: acc.dueOver30Days + r.dueOver30Days,
          totalUnitPrice: acc.totalUnitPrice + r.totalUnitPrice,
        }),
        {
          totalOrders: 0,
          totalAmount: 0,
          totalPaymentCollected: 0,
          totalPaymentDue: 0,
          dueOver30Days: 0,
          totalUnitPrice: 0,
        }
      );

      rows.sort((a, b) => {
        if (a.personId === leaderId && b.personId !== leaderId) return -1;
        if (b.personId === leaderId && a.personId !== leaderId) return 1;
        if (b.totalAmount !== a.totalAmount)
          return b.totalAmount - a.totalAmount;
        return a.createdBy.localeCompare(b.createdBy);
      });

      sections.push({
        teamId: leaderId,
        teamName: leaderName,
        memberCount,
        totals,
        rows,
      });
    }

    sections.sort((a, b) => a.teamName.localeCompare(b.teamName));
    return sections;
  }, [filteredOrders, userRole, groupByTeam]);

  const handleExportToExcel = () => {
    try {
      const exportData = [
        {
          "Created By": "Overall Totals",
          "Total Orders": overallTotals.totalOrders,
          "Total Amount (₹)": overallTotals.totalAmount.toFixed(2),
          "Payment Collected (₹)":
            overallTotals.totalPaymentCollected.toFixed(2),
          "Payment Due (₹)": overallTotals.totalPaymentDue.toFixed(2),
          "Due Over 30 Days (₹)": overallTotals.dueOver30Days.toFixed(2),
          "Total Unit Price (₹)": overallTotals.totalUnitPrice.toFixed(2),
        },
        {},
        ...analyticsData.map((data) =>
          (userRole === "Admin" || userRole === "SuperAdmin") && groupByTeam
            ? {
                Team: data.teamName || "",
                "Sales Person": data.createdBy,
                "Total Orders": data.totalOrders,
                "Total Amount (₹)": data.totalAmount.toFixed(2),
                "Payment Collected (₹)": data.totalPaymentCollected.toFixed(2),
                "Payment Due (₹)": data.totalPaymentDue.toFixed(2),
                "Due Over 30 Days (₹)": data.dueOver30Days.toFixed(2),
                "Total Unit Price (₹)": data.totalUnitPrice.toFixed(2),
              }
            : {
                "Created By": data.createdBy,
                "Total Orders": data.totalOrders,
                "Total Amount (₹)": data.totalAmount.toFixed(2),
                "Payment Collected (₹)": data.totalPaymentCollected.toFixed(2),
                "Payment Due (₹)": data.totalPaymentDue.toFixed(2),
                "Due Over 30 Days (₹)": data.dueOver30Days.toFixed(2),
                "Total Unit Price (₹)": data.totalUnitPrice.toFixed(2),
              }
        ),
      ];

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      worksheet["!cols"] = [
        { wch: 20 },
        { wch: 12 },
        { wch: 16 },
        { wch: 16 },
        { wch: 16 },
        { wch: 16 },
        { wch: 16 },
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Analytics");

      const fileBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const blob = new Blob([fileBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Sales_Analytics_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Exported sales analytics to Excel!");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Failed to export to Excel. Please try again.");
    }
  };

  const handleReset = useCallback(() => {
    setStartDate(null);
    setEndDate(null);
    setSelectedSalesPerson("All");
  }, []);

  return (
    <>
      <DrawerOverlay isOpen={isOpen} onClick={onClose} />
      <DrawerContainer isOpen={isOpen}>
        <DrawerHeader>
          <DrawerTitle>Sales Orders Analytics</DrawerTitle>
          <ButtonContainer>
            <DatePickerPopup>
              <DatePickerContainer>
                <StyledDatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  placeholderText="Start Date"
                  dateFormat="dd/MM/yyyy"
                  isClearable
                />
                <DatePickerIcon size={18} />
              </DatePickerContainer>
            </DatePickerPopup>
            <DatePickerPopup>
              <DatePickerContainer>
                <StyledDatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  placeholderText="End Date"
                  dateFormat="dd/MM/yyyy"
                  isClearable
                />
                <DatePickerIcon size={18} />
              </DatePickerContainer>
            </DatePickerPopup>
            <SalesPersonSelectContainer>
              <StyledFormSelect
                value={selectedSalesPerson}
                onChange={(e) => setSelectedSalesPerson(e.target.value)}
                aria-label="Select Sales Person"
              >
                {uniqueSalesPersons.map((person, index) => (
                  <option key={index} value={person}>
                    {person}
                  </option>
                ))}
              </StyledFormSelect>
            </SalesPersonSelectContainer>
            {userRole === "Sales" && (
              <ResetButton
                onClick={() =>
                  setSalesScope((v) => (v === "team" ? "own" : "team"))
                }
              >
                {salesScope === "team" ? "Show Own Only" : "Show My Team"}
              </ResetButton>
            )}
            {(userRole === "Admin" || userRole === "SuperAdmin") && (
              <ResetButton onClick={() => setGroupByTeam((v) => !v)}>
                {groupByTeam ? "Show Per Person" : "Show Team-wise"}
              </ResetButton>
            )}
            <ResetButton onClick={handleReset}>
              <X size={16} />
              Reset
            </ResetButton>
            {userRole === "SuperAdmin" && (
              <ExportButton onClick={handleExportToExcel}>
                <Download size={18} />
                Export
              </ExportButton>
            )}
            <CloseButton onClick={onClose}>
              <X size={18} />
              Close
            </CloseButton>
          </ButtonContainer>
        </DrawerHeader>
        <TableContainer>
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              Loading...
            </div>
          ) : (
            <DashboardTable>
              <thead>
                <TotalHeaderRow>
                  <TotalHeader>Overall Totals</TotalHeader>
                  <TotalHeader>{overallTotals.totalOrders}</TotalHeader>
                  <TotalHeader>
                    ₹
                    {overallTotals.totalAmount.toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                  </TotalHeader>
                  <TotalHeader>
                    ₹
                    {overallTotals.totalPaymentCollected.toLocaleString(
                      "en-IN",
                      {
                        maximumFractionDigits: 0,
                      }
                    )}
                  </TotalHeader>
                  <TotalHeader>
                    ₹
                    {overallTotals.totalPaymentDue.toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                  </TotalHeader>
                  <TotalHeader>
                    ₹
                    {overallTotals.dueOver30Days.toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                  </TotalHeader>
                  <TotalHeader>
                    ₹
                    {overallTotals.totalUnitPrice.toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                  </TotalHeader>
                </TotalHeaderRow>
                {(userRole !== "Admin" && userRole !== "SuperAdmin") ||
                !groupByTeam ? (
                  <TableHeaderRow>
                    <TableHeader>Sales Persons</TableHeader>
                    <TableHeader>Total Orders</TableHeader>
                    <TableHeader>Total Amount (₹)</TableHeader>
                    <TableHeader>Payment Collected (₹)</TableHeader>
                    <TableHeader>Payment Due (₹)</TableHeader>
                    <TableHeader>Due Over 30 Days (₹)</TableHeader>
                    <TableHeader>Total Unit Price (₹)</TableHeader>
                  </TableHeaderRow>
                ) : (
                  <TeamHeaderRow>
                    <TeamHeader colSpan={8}>Team Analytics</TeamHeader>
                  </TeamHeaderRow>
                )}
              </thead>
              <tbody>
                {analyticsData.length > 0 ? (
                  (userRole === "Admin" || userRole === "SuperAdmin") &&
                  groupByTeam &&
                  adminTeamSections ? (
                    adminTeamSections.map(
                      ({ teamId, teamName, rows, totals, memberCount }) => (
                        <React.Fragment key={teamId}>
                          <TableRow>
                            <TableCell
                              colSpan={8}
                              style={{
                                padding: 0,
                                border: "none",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "8px 12px",
                                  background:
                                    "linear-gradient(135deg, #4b5efa, #7e22ce)",
                                  cursor: "pointer",
                                }}
                                onClick={() => toggleTeam(teamId)}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 10,
                                    alignItems: "center",
                                    color: "white",
                                    fontWeight: 700,
                                    fontSize: 14,
                                  }}
                                >
                                  <span style={{ fontSize: 12 }}>
                                    {expandedTeams[teamId] ? "▾" : "▸"}
                                  </span>
                                  <span>Team: {teamName}</span>
                                  <span>| Members: {memberCount}</span>
                                  <span>| Orders: {totals.totalOrders}</span>
                                  <span>
                                    | Amount: ₹
                                    {totals.totalAmount.toLocaleString(
                                      "en-IN",
                                      {
                                        maximumFractionDigits: 0,
                                      }
                                    )}
                                  </span>
                                </div>
                              </div>
                              {expandedTeams[teamId] && (
                                <div
                                  style={{ padding: 10, background: "#ffffff" }}
                                >
                                  <table
                                    style={{
                                      width: "100%",
                                      borderCollapse: "collapse",
                                    }}
                                  >
                                    <thead>
                                      <tr style={{ background: "#f1f5f9" }}>
                                        <th
                                          style={{
                                            textAlign: "left",
                                            padding: 8,
                                            fontSize: "0.9rem",
                                            color: "#1e3a8a",
                                          }}
                                        >
                                          Sales Person
                                        </th>
                                        <th
                                          style={{
                                            textAlign: "left",
                                            padding: 8,
                                            fontSize: "0.9rem",
                                            color: "#1e3a8a",
                                          }}
                                        >
                                          Total Orders
                                        </th>
                                        <th
                                          style={{
                                            textAlign: "left",
                                            padding: 8,
                                            fontSize: "0.9rem",
                                            color: "#1e3a8a",
                                          }}
                                        >
                                          Total Amount (₹)
                                        </th>
                                        <th
                                          style={{
                                            textAlign: "left",
                                            padding: 8,
                                            fontSize: "0.9rem",
                                            color: "#1e3a8a",
                                          }}
                                        >
                                          Collected (₹)
                                        </th>
                                        <th
                                          style={{
                                            textAlign: "left",
                                            padding: 8,
                                            fontSize: "0.9rem",
                                            color: "#1e3a8a",
                                          }}
                                        >
                                          Due (₹)
                                        </th>
                                        <th
                                          style={{
                                            textAlign: "left",
                                            padding: 8,
                                            fontSize: "0.9rem",
                                            color: "#1e3a8a",
                                          }}
                                        >
                                          Due &gt;30d (₹)
                                        </th>
                                        <th
                                          style={{
                                            textAlign: "left",
                                            padding: 8,
                                            fontSize: "0.9rem",
                                            color: "#1e3a8a",
                                          }}
                                        >
                                          Unit Price (₹)
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {rows.map((data, index) => (
                                        <tr
                                          key={`${teamId}-member-${index}`}
                                          style={{
                                            borderTop: "1px solid #e5e7eb",
                                          }}
                                        >
                                          <td style={{ padding: 8 }}>
                                            {data.createdBy || "Unknown"}
                                          </td>
                                          <td style={{ padding: 8 }}>
                                            {data.totalOrders}
                                          </td>
                                          <td style={{ padding: 8 }}>
                                            ₹
                                            {data.totalAmount.toLocaleString(
                                              "en-IN",
                                              {
                                                maximumFractionDigits: 0,
                                              }
                                            )}
                                          </td>
                                          <td style={{ padding: 8 }}>
                                            ₹
                                            {data.totalPaymentCollected.toLocaleString(
                                              "en-IN",
                                              { maximumFractionDigits: 0 }
                                            )}
                                          </td>
                                          <td style={{ padding: 8 }}>
                                            ₹
                                            {data.totalPaymentDue.toLocaleString(
                                              "en-IN",
                                              {
                                                maximumFractionDigits: 0,
                                              }
                                            )}
                                          </td>
                                          <td style={{ padding: 8 }}>
                                            ₹
                                            {data.dueOver30Days.toLocaleString(
                                              "en-IN",
                                              {
                                                maximumFractionDigits: 0,
                                              }
                                            )}
                                          </td>
                                          <td style={{ padding: 8 }}>
                                            ₹
                                            {data.totalUnitPrice.toLocaleString(
                                              "en-IN",
                                              {
                                                maximumFractionDigits: 0,
                                              }
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      )
                    )
                  ) : (
                    analyticsData
                      .slice()
                      .sort((a, b) => b.totalAmount - a.totalAmount)
                      .map((data, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              {data.createdBy}
                            </div>
                          </TableCell>
                          <TableCell>{data.totalOrders}</TableCell>
                          <TableCell>
                            ₹
                            {data.totalAmount.toLocaleString("en-IN", {
                              maximumFractionDigits: 0,
                            })}
                          </TableCell>
                          <TableCell>
                            ₹
                            {data.totalPaymentCollected.toLocaleString(
                              "en-IN",
                              {
                                maximumFractionDigits: 0,
                              }
                            )}
                          </TableCell>
                          <TableCell>
                            ₹
                            {data.totalPaymentDue.toLocaleString("en-IN", {
                              maximumFractionDigits: 0,
                            })}
                          </TableCell>
                          <TableCell>
                            ₹
                            {data.dueOver30Days.toLocaleString("en-IN", {
                              maximumFractionDigits: 0,
                            })}
                          </TableCell>
                          <TableCell>
                            ₹
                            {data.totalUnitPrice.toLocaleString("en-IN", {
                              maximumFractionDigits: 0,
                            })}
                          </TableCell>
                        </TableRow>
                      ))
                  )
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} style={{ textAlign: "center" }}>
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </tbody>
            </DashboardTable>
          )}
        </TableContainer>
      </DrawerContainer>
    </>
  );
};

export default SalesDashboardDrawer;
