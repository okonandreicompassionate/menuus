/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { StorefrontPage } from './pages/StorefrontPage';
import { DashboardLayout } from './pages/DashboardLayout';
import { DashboardOverview } from './pages/DashboardOverview';
import { DashboardMenu } from './pages/DashboardMenu';
import { DashboardCategories } from './pages/DashboardCategories';
import { DashboardOrders } from './pages/DashboardOrders';
import { DashboardSettings } from './pages/DashboardSettings';
import { DashboardStorefront } from './pages/DashboardStorefront';
import { StorageService } from './services/storage';

export default function App() {
  useEffect(() => {
    StorageService.init();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<LoginPage />} />
        <Route path="/store/:slug" element={<StorefrontPage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="menu" element={<DashboardMenu />} />
          <Route path="categories" element={<DashboardCategories />} />
          <Route path="orders" element={<DashboardOrders />} />
          <Route path="settings" element={<DashboardSettings />} />
          <Route path="storefront" element={<DashboardStorefront />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
