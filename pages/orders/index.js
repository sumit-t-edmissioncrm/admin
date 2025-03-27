import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  
  // Define order status options
  const orderStatuses = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled"
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  function fetchOrders() {
    axios.get("/api/order").then((response) => {
      setOrders(response.data);
    });
  }

  async function updateOrderStatus(orderId, newStatus) {
    try {
      await axios.put("/api/order", {
        _id: orderId,
        status: newStatus
      });
      
      toast.success("Order status updated!");
      fetchOrders(); // Refresh orders to show updated status
    } catch (error) {
      toast.error("Failed to update order status");
      console.error(error);
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Orders</h1>
      {orders.length > 0 &&
        orders.map((order, index) => (
          <div
            key={order._id}
            className="bg-white rounded-lg shadow-md p-4 mb-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Order #{index + 1}
              </h2>
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-start">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Status:
                  </label>
                  <div className="flex items-center gap-2">
                    <select 
                      value={order.status || 'pending'}
                      onChange={(ev) => updateOrderStatus(order._id, ev.target.value)}
                      className="block w-40 pl-3 pr-10 py-1.5 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      {orderStatuses.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                    
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                      ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'}`}
                    >
                      {order.status || 'pending'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="text-gray-600 mb-2">Id: {order._id}</h3>
                <h3 className="text-md font-medium mb-2">By: {order.name}</h3>
              </div>
              <div>
                {/* <h3 className="text-md font-medium mb-2">Country: {order.country}</h3> */}
                <h3 className="text-md font-medium mb-2">
                  Address: {order.address}
                </h3>
                {/* <h3 className="text-md font-medium mb-2">City: {order.city}</h3> */}
                <h3 className="text-gray-600 mb-2">Zip Code: {order.zip}</h3>
                <h3 className="text-md font-medium mb-2">
                  Email: {order.email}
                </h3>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4">Product</th>
                    <th className="py-2 px-4">Quantity</th>
                    <th className="py-2 px-4">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {order.line_items &&
                    order.line_items.map((product) => (
                      <tr key={product.id}>
                        <td className="py-2 px-4">{product.name}</td>
                        <td className="py-2 px-4">{product.amount}</td>
                        <td className="py-2 px-4">
                          {product.price.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
    </div>
  );
};

export default Orders;
