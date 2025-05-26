import React from "react";
import { X } from "lucide-react";

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
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 max-h-[80vh] h-[80vh] bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-t-3xl shadow-2xl z-[1000] transform transition-transform duration-500 ease-in-out overflow-y-auto p-6 font-poppins ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl mb-6 shadow-lg">
          <h3 className="text-white text-lg font-bold tracking-tight">
            Salesperson Dashboard
          </h3>
          <button
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-md"
            onClick={onClose}
          >
            <X size={18} />
            Close
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-600 to-purple-600">
                <th className="p-4 text-white font-semibold text-sm uppercase text-left">
                  Salesperson
                </th>
                <th className="p-4 text-white font-semibold text-sm uppercase text-left">
                  Total Orders
                </th>
                <th className="p-4 text-white font-semibold text-sm uppercase text-left">
                  Total Amount (₹)
                </th>
                <th className="p-4 text-white font-semibold text-sm uppercase text-left">
                  Payment Collected (₹)
                </th>
                <th className="p-4 text-white font-semibold text-sm uppercase text-left">
                  Payment Due (₹)
                </th>
                <th className="p-4 text-white font-semibold text-sm uppercase text-left">
                  Avg Credit Days
                </th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.length > 0 ? (
                analyticsData.map((data, index) => (
                  <tr
                    key={index}
                    className="hover:bg-indigo-50 transition-colors duration-150"
                  >
                    <td className="p-4 text-indigo-900 font-medium text-sm">
                      {data.salesPerson}
                    </td>
                    <td className="p-4 text-indigo-900 text-sm">
                      {data.totalOrders}
                    </td>
                    <td className="p-4 text-indigo-900 text-sm">
                      ₹{data.totalAmount}
                    </td>
                    <td className="p-4 text-indigo-900 text-sm">
                      ₹{data.totalPaymentCollected}
                    </td>
                    <td className="p-4 text-indigo-900 text-sm">
                      ₹{data.totalPaymentDue}
                    </td>
                    <td className="p-4 text-indigo-900 text-sm">
                      {data.averageCreditDays}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="p-4 text-center text-indigo-900 text-sm"
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default SalesDashboardDrawer;
