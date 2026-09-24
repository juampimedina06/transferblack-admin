import { useAuthStore } from '../auth/store/useAuthStore';

const Dashboard = () => {
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard VIP</h1>
      <p>Bienvenido al panel de administración.</p>
      <button 
        onClick={logout}
        className="mt-6 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
      >
        Cerrar Sesión
      </button>
    </div>
  );
};

export default Dashboard;
