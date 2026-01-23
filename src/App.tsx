import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { RequireRole } from "./routes/RequireRole";
import { CashierPage } from "./pages/CashierPage";
import { KitchenPage } from "./pages/KitchenPage";
import { LoginPage } from "./pages/LoginPage";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";
import { WaiterPage } from "./pages/WaiterPage";
import CreateOrderPage from "./pages/CreateOrderPage";
import PaymentPage from "./pages/PaymentPage";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<DashboardLayout />}>
        <Route
          path="/dashboard/waiter"
          element={
            <RequireRole allowed={["WAITER"]}>
              <WaiterPage />
            </RequireRole>
          }
        />
        <Route
          path="/create-order/:id"
          element={
            <RequireRole allowed={["WAITER"]}>
              <CreateOrderPage />
            </RequireRole>
          }
        />
        <Route
          path="/dashboard/kitchen"
          element={
            <RequireRole allowed={["KITCHEN"]}>
              <KitchenPage />
            </RequireRole>
          }
        />
        {/* Rota para a tela de seleção de mesas do caixa */}
        <Route
          path="/dashboard/cashier"
          element={
            <RequireRole allowed={["CASHIER"]}>
              <CashierPage />
            </RequireRole>
          }
        />
        {/* Rota para a tela de pagamento do caixa */}
        <Route
          path="/payment/:id"
          element={
            <RequireRole allowed={["CASHIER"]}>
              <PaymentPage />
            </RequireRole>
          }
        />
      </Route>

      <Route path="*" element={<LoginPage />} />
    </Routes>
  );
};

export default App;