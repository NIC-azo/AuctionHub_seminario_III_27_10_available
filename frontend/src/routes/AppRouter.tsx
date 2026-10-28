import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthPages } from "../app/pages/AuthPages";
import { CatalogPage } from "../app/pages/CatalogPage";
import { CreateProduct } from "../app/pages/CreateProduct";
import { NotFoundPage } from "../app/pages/NotFoundPage";
import { ProductDetailPage } from "../app/pages/ProductDetailPage";
import { ProfilePage } from "../app/pages/ProfilePage";
import { MainLayout } from "../layout/MainLayout";
import { ProtectedRoutes } from "../secure/ProtectedRoutes";
import { RedirectGuest } from "../secure/RedirectGuest";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<CatalogPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route element={<RedirectGuest />}>
            <Route path="login" element={<AuthPages mode="login" />} />
            <Route path="register" element={<AuthPages mode="register" />} />
          </Route>
          <Route element={<ProtectedRoutes />}>
            <Route path="profile" element={<ProfilePage />} />
            <Route element={<ProtectedRoutes allowedRoles={["seller", "admin"]} />}>
              <Route path="products/new" element={<CreateProduct />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
