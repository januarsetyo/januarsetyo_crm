import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import UserTable from "./pages/Tables/UserTables";
import ProductTable from "./pages/Tables/productTables";
import LeadTable from "./pages/Tables/LeadTables";
import CustomerTable from "./pages/Tables/CustomerTables";
import DealTable from "./pages/Tables/DealTables";
import Home from "./pages/Dashboard/Home";
import ProtectedRoute from "./components/common/ProtectedRoute";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            <Route path="/user" element={<UserTable />} />
            <Route path="/data-produk" element={<ProductTable />} />
            <Route path="/leads" element={<LeadTable />} />
            <Route path="/data-customer" element={<CustomerTable />} />
            <Route path="/data-deals-pipeline" element={<DealTable />} />
            <Route path="/blank" element={<Blank />} />

          </Route>
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
