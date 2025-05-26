import React from "react";
import styled from "styled-components";
import { Button } from "react-bootstrap";
import { X } from "lucide-react";

// Styled Components for the Drawer
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
  overflow-y: auto;
  padding: 20px;
  font-family: "Poppins", sans-serif;
`;

const DrawerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: linear-gradient(135deg, #2575fc, #6a11cb);
  border-radius: 12px;
  margin-bottom: 20px;
`;

const DrawerTitle = styled.h3`
  color: white;
  font-weight: 700;
  font-size: 1.2rem;
  margin: 0;
`;

const CloseButton = styled(Button)`
  background: #dc3545;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 5px;
  &:hover {
    background: #b02a37;
  }
`;

const DashboardTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
`;

const TableHeader = styled.th`
  padding: 12px 15px;
  background: linear-gradient(135deg, #2575fc, #6a11cb);
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  text-transform: uppercase;
  text-align: left;
`;

const TableCell = styled.td`
  padding: 12px 15px;
  border-bottom: 1px solid #e6f0fa;
  font-size: 0.9rem;
  color: #1e3a8a;
  text-align: left;
`;

const TableRow = styled.tr`
  &:hover {
    background-color: #f0f7ff;
  }
`;

const SalesDashboardDrawer = ({ isOpen, onClose, orders }) => {
  // Compute analytics per salesperson
  const salesAnalytics = orders.reduce((acc, order) => {
    const salesPerson = order.salesPerson || "Unknown";
    if (!acc[salesPerson]) {
      acc[salesPerson] = {
        totalOrders: 0,
        totalAmount: 0,
        totalPaymentCollected: 0,
        totalPaymentDue: 0,
        creditDaysSum: 0,
        creditDaysCount: 0,
      };
    }
    acc[salesPerson].totalOrders += 1;
    acc[salesPerson].totalAmount += Number(order.total) || 0;
    acc[salesPerson].totalPaymentCollected +=
      Number(order.paymentCollected) || 0;
    acc[salesPerson].totalPaymentDue += Number(order.paymentDue) || 0;
    if (order.creditDays && !isNaN(Number(order.creditDays))) {
      acc[salesPerson].creditDaysSum += Number(order.creditDays);
      acc[salesPerson].creditDaysCount += 1;
    }
    return acc;
  }, {});

  // Convert to array for table rendering
  const analyticsData = Object.entries(salesAnalytics).map(
    ([salesPerson, data]) => ({
      salesPerson,
      totalOrders: data.totalOrders,
      totalAmount: data.totalAmount.toFixed(2),
      totalPaymentCollected: data.totalPaymentCollected.toFixed(2),
      totalPaymentDue: data.totalPaymentDue.toFixed(2),
      averageCreditDays:
        data.creditDaysCount > 0
          ? (data.creditDaysSum / data.creditDaysCount).toFixed(1)
          : "-",
    })
  );

  return (
    <>
      <DrawerOverlay isOpen={isOpen} onClick={onClose} />
      <DrawerContainer isOpen={isOpen}>
        <DrawerHeader>
          <DrawerTitle>Salesperson Dashboard</DrawerTitle>
          <CloseButton onClick={onClose}>
            <X size={18} />
            Close
          </CloseButton>
        </DrawerHeader>
        <DashboardTable>
          <thead>
            <tr>
              <TableHeader>Salesperson</TableHeader>
              <TableHeader>Total Orders</TableHeader>
              <TableHeader>Total Amount (₹)</TableHeader>
              <TableHeader>Payment Collected (₹)</TableHeader>
              <TableHeader>Payment Due (₹)</TableHeader>
              <TableHeader>Avg Credit Days</TableHeader>
            </tr>
          </thead>
          <tbody>
            {analyticsData.length > 0 ? (
              analyticsData.map((data, index) => (
                <TableRow key={index}>
                  <TableCell>{data.salesPerson}</TableCell>
                  <TableCell>{data.totalOrders}</TableCell>
                  <TableCell>₹{data.totalAmount}</TableCell>
                  <TableCell>₹{data.totalPaymentCollected}</TableCell>
                  <TableCell>₹{data.totalPaymentDue}</TableCell>
                  <TableCell>{data.averageCreditDays}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} style={{ textAlign: "center" }}>
                  No data available
                </TableCell>
              </TableRow>
            )}
          </tbody>
        </DashboardTable>
      </DrawerContainer>
    </>
  );
};

export default SalesDashboardDrawer;
