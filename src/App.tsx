import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useServerHealth } from './presentation/hooks/useServerHealth';
import Login from './presentation/screens/Login';
import ForgotPasswordScreen from './presentation/screens/ForgotPasswordScreen';
import Dashboard from './presentation/screens/Dashboard';
import TrackTrip from './presentation/screens/TrackTrip';
import TermsScreen from './presentation/legal/TermsScreen';
import PrivacyScreen from './presentation/legal/PrivacyScreen';
import ReturnToAppScreen from './presentation/payments/ReturnToAppScreen';
import ProtectedRoute from './presentation/components/ProtectedRoute';
import { PrivateLayout } from './presentation/components/layout/PrivateLayout';
import DriversScreen from './presentation/drivers/DriversScreen';
import DriverDetailScreen from './presentation/drivers/DriverDetailScreen';
import CompaniesScreen from './presentation/companies/CompaniesScreen';
import CompanyDetailScreen from './presentation/companies/CompanyDetailScreen';
import PayoutsScreen from './presentation/payouts/PayoutsScreen';
import TripsScreen from './presentation/trips/TripsScreen';
import ScheduledTripsScreen from './presentation/scheduledTrips/ScheduledTripsScreen';
import RecurringTripsScreen from './presentation/recurringTrips/RecurringTripsScreen';
import { LiveMapScreen } from './presentation/map/LiveMapScreen';
import RefundClaimsScreen from './presentation/refundClaims/RefundClaimsScreen';


function App() {
  useServerHealth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar-password" element={<ForgotPasswordScreen />} />

        {/* Publica: la abre un invitado sin sesion desde un link de WhatsApp/email */}
        <Route path="/track" element={<TrackTrip />} />

        {/* Publicas: legales (link en la app) y puente de vuelta desde Mercado Pago */}
        <Route path="/terminos" element={<TermsScreen />} />
        <Route path="/privacidad" element={<PrivacyScreen />} />
        <Route path="/volver-a-la-app" element={<ReturnToAppScreen />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<PrivateLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mapa" element={<LiveMapScreen />} />
            <Route path="/viajes" element={<TripsScreen />} />
            <Route path="/viajes-reservados" element={<ScheduledTripsScreen />} />
            <Route path="/traslados-recurrentes" element={<RecurringTripsScreen />} />
            <Route path="/conductores" element={<DriversScreen />} />
            <Route path="/conductores/:id" element={<DriverDetailScreen />} />
            <Route path="/retiros" element={<PayoutsScreen />} />
            <Route path="/reclamos-reembolso" element={<RefundClaimsScreen />} />
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
