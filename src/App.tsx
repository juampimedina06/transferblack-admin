import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './presentation/screens/Login';
import Dashboard from './presentation/screens/Dashboard';
import TrackTrip from './presentation/screens/TrackTrip';
import ProtectedRoute from './presentation/components/ProtectedRoute';
import { PrivateLayout } from './presentation/components/layout/PrivateLayout';
import DriversScreen from './presentation/drivers/DriversScreen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

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
            <Route path="/retiros" element={<Navigate to="/dashboard" replace />} />
            <Route path="/empresas" element={<Navigate to="/dashboard" replace />} />
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
