import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [productSales, setProductSales] = useState([]);
  const [filteredRevenue, setFilteredRevenue] = useState([]);
  const [filter, setFilter] = useState("monthly");

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get("/api/order");
        const data = response.data;
        setOrders(data);

        const revenue = data.reduce((sum, order) => sum + order.total_price, 0);
        setTotalRevenue(revenue);
        setTotalOrders(data.length);

        const salesData = {};
        const revenueData = { daily: {}, weekly: {}, monthly: {} };

        data.forEach((order) => {
          order.line_items.forEach((item) => {
            if (!salesData[item.name]) {
              salesData[item.name] = 0;
            }
            salesData[item.name] += item.amount;
          });

          const date = new Date(order.createdAt);
          const day = date.toLocaleDateString();
          const week = `Week ${Math.ceil(date.getDate() / 7)}-${
            date.getMonth() + 1
          }`;
          const month = date.toLocaleString("default", {
            month: "long",
            year: "numeric",
          });

          [day, week, month].forEach((key, index) => {
            const type =
              index === 0 ? "daily" : index === 1 ? "weekly" : "monthly";
            if (!revenueData[type][key]) {
              revenueData[type][key] = 0;
            }
            revenueData[type][key] += order.total_price;
          });
        });

        setProductSales(
          Object.entries(salesData).map(([name, amount]) => ({
            name,
            quantity: amount,
          }))
        );
        setFilteredRevenue(
          Object.entries(revenueData[filter]).map(([date, total]) => ({
            date,
            total,
          }))
        );
      } catch (error) {
        console.error("Error fetching orders", error);
      }
    }
    fetchData();
  }, [filter]);

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Total Revenue</h2>
          <p className="text-2xl font-bold">₹ {totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Total Orders</h2>
          <p className="text-2xl font-bold">{totalOrders}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Product Sales</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productSales}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantity" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Sales Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={productSales}
                dataKey="quantity"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {productSales.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md mt-6">
        <h2 className="text-xl font-semibold mb-4">Revenue Trend</h2>
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setFilter("daily")}
            className={`px-4 py-2 rounded ${
              filter === "daily" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setFilter("weekly")}
            className={`px-4 py-2 rounded ${
              filter === "weekly" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setFilter("monthly")}
            className={`px-4 py-2 rounded ${
              filter === "monthly" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Monthly
          </button>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredRevenue}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
