import { Route, Routes } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { RequireRole } from "./routes/RequireRole";
import { CashierPage } from "./pages/CashierPage";
import { KitchenPage } from "./pages/KitchenPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";
import { WaiterPage } from "./pages/WaiterPage";
import CreateOrderPage from "./pages/CreateOrderPage"; // <-- IMPORTANTE

const App = () => {
  return (
    <Routes>
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
        {/* ROTA CORRETA PARA CRIAR PEDIDO */}
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
        <Route
          path="/dashboard/cashier"
          element={
            <RequireRole allowed={["CASHIER"]}>
              <CashierPage />
            </RequireRole>
          }
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;