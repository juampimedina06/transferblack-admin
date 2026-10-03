import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useServerHealth } from './presentation/hooks/useServerHealth';
import Login from './presentation/screens/Login';
import ForgotPasswordScreen from './presentation/screens/ForgotPasswordScreen';
import Dashboard from './presentation/screens/Dashboard';
import TrackTrip from './presentation/screens/TrackTrip';
import ProtectedRoute from './presentation/components/ProtectedRoute';
import { PrivateLayout } from './presentation/components/layout/PrivateLayout';
import DriversScreen from './presentation/drivers/DriversScreen';
import DriverDetailScreen from './presentation/drivers/DriverDetailScreen';
import CompaniesScreen from './presentation/companies/CompaniesScreen';
import CompanyDetailScreen from './presentation/companies/CompanyDetailScreen';
import PayoutsScreen from './presentation/payouts/PayoutsScreen';

function App() {
  useServerHealth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar-password" element={<ForgotPasswordScreen />} />

        {/* Publica: la abre un invitado sin sesion desde un link de WhatsApp/email */}
        <Route path="/track" element={<TrackTrip />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<PrivateLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Rutas pendientes con placeholder */}
            <Route path="/mapa" element={<Navigate to="/dashboard" replace />} />
            <Route path="/viajes" element={<Navigate to="/dashboard" replace />} />
            <Route path="/conductores" element={<DriversScreen />} />
            <Route path="/conductores/:id" element={<DriverDetailScreen />} />
            <Route path="/retiros" element={<PayoutsScreen />} />
            <Route path="/empresas" element={<CompaniesScreen />} />
            <Route path="/empresas/:companyId" element={<CompanyDetailScreen />} />
            <Route path="/pasajeros" element={<Navigate to="/dashboard" replace />} />
            <Route path="/configuracion" element={<Navigate to="/dashboard" replace />} />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
