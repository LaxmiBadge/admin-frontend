import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../../components/AdminLayout";

const API_CUSTOMERS =
  "https://ecommerce-backend-y1bv.onrender.com/api/user/get-profile";

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCustomers = async () => {
    try {
      setLoading(true);

      const res = await axios.get(API_CUSTOMERS);

      // API CONDITIONS HANDLING
      if (Array.isArray(res.data)) {
        setCustomers(res.data);
      } else if (res.data.user) {
        setCustomers([res.data.user]);
      } else if (res.data.data) {
        setCustomers(res.data.data);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError("Unable to load customer list.");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <AdminLayout>
      <div className="p-4 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-5">Login Customers</h1>

        {loading && (
          <p className="text-gray-600 animate-pulse">Loading customers...</p>
        )}

        {error && <p className="text-red-600 font-semibold mb-4">{error}</p>}

        {!loading && customers.length === 0 && (
          <p className="text-gray-600">No customers found.</p>
        )}

        {/* Responsive Table */}
        <div className="overflow-x-auto shadow rounded-lg">
          <table className="w-full border-collapse bg-white">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Role</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((cust) => (
                <tr key={cust._id} className="border-b hover:bg-gray-100">
                  <td className="p-3">{cust.name}</td>
                  <td className="p-3">{cust.email}</td>
                  <td className="p-3">{cust.phone || "—"}</td>
                  <td className="p-3 capitalize">
                    {cust.role || "customer"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CustomersPage;
