import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FilterProvider } from './context/FilterContext';
import { DataProvider } from './context/DataContext';
import Header from './components/layout/Header';
import ActivityLog from './pages/ActivityLog';
import QuantDashboard from './pages/QuantDashboard';
import CustomerDetail from './pages/CustomerDetail';
import Admin from './pages/Admin';
import TravelPlanner from './pages/TravelPlanner';

const App: React.FC = () => {
  return (
    <DataProvider>
      <FilterProvider>
        <HashRouter>
          <div className="min-h-screen bg-slate-50 text-slate-800">
            <Header />
            <main className="p-4 sm:p-6 lg:p-8">
              <Routes>
                <Route path="/" element={<Navigate to="/log" replace />} />
                <Route path="/log" element={<ActivityLog />} />
                <Route path="/quant" element={<QuantDashboard />} />
                <Route path="/travel" element={<TravelPlanner />} />
                <Route path="/customers/:id" element={<CustomerDetail />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </main>
          </div>
        </HashRouter>
      </FilterProvider>
    </DataProvider>
  );
};

export default App;