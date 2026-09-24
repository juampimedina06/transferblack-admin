import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuthStore } from '../auth/store/useAuthStore';
import { authActions } from '../../core/auth/action/auth.actions';
import { AuthError } from '../../core/auth/interface/auth.interface';
import { Loader2 } from 'lucide-react';
import transferLogo from '../../assets/img/logo_transferblack_sinfodo.png';

const loginSchema = z.object({
  email: z.string().email('Formato de email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setErrorMsg('');
    try {
      const response = await authActions.login(data.email, data.password);
      setSession(response);
      navigate('/dashboard');
    } catch (error: unknown) {
      if (error instanceof AuthError) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg('Error al intentar iniciar sesión. Intente más tarde.');
      }
    }
  };

  return (
    <div className="flex min-h-screen font-montserrat">
      {/* Lado Izquierdo - Branding */}
      <div className="hidden lg:flex w-1/2 bg-obsidian relative flex-col justify-center text-white overflow-hidden p-12 lg:p-24">
        {/* Marca de agua (Watermark logo gigante) */}
        <img 
          src={transferLogo} 
          alt="Transfer Black Logo" 
          className="absolute -right-[20%] top-1/2 -translate-y-1/2 w-[850px] opacity-[0.03] select-none pointer-events-none"
        />

        {/* Header Superior */}
        <div className="absolute top-12 left-12 lg:left-24 flex items-center gap-3">
          <div className="bg-champagne-gold text-obsidian font-bold text-lg w-10 h-10 flex items-center justify-center rounded-sm">
            TB
          </div>
          <span className="font-bold tracking-widest text-sm text-white">TRANSFER BLACK</span>
        </div>

        {/* Contenido Principal */}
        <div className="relative z-10 max-w-lg mt-10">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Traslados privados con<br />estándar corporativo.
          </h1>
          <p className="text-gray-400 text-lg mb-12">
            Consola de operaciones para la flota de Córdoba. Aprobación de conductores, monitoreo de viajes en curso y liquidaciones.
          </p>
          
          <div className="border-t border-gray-800 pt-8 flex gap-8">
            <div>
              <div className="text-champagne-gold font-bold text-2xl mb-1">318</div>
              <div className="text-gray-500 text-xs uppercase tracking-wider">conductores activos</div>
            </div>
            <div>
              <div className="text-champagne-gold font-bold text-2xl mb-1">24</div>
              <div className="text-gray-500 text-xs uppercase tracking-wider">cuentas corporativas</div>
            </div>
            <div>
              <div className="text-champagne-gold font-bold text-2xl mb-1">2</div>
              <div className="text-gray-500 text-xs uppercase tracking-wider">categorías: Essential y Comfort</div>
            </div>
          </div>
        </div>

        {/* Footer Inferior */}
        <div className="absolute bottom-12 left-12 lg:left-24 text-gray-600 text-xs">
          Acceso restringido al equipo de operaciones. Toda actividad queda registrada.
        </div>
      </div>

      {/* Lado Derecho - Formulario */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-8 lg:px-32">
        <div className="w-full max-w-sm mx-auto">
          <div className="mb-8 text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Ingresar al panel</h2>
            <p className="text-gray-500 text-sm">Usá tu cuenta de operaciones de Transfer Black.</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 rounded text-sm text-center border border-red-200">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                {...register('email')}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-obsidian focus:border-obsidian transition-colors text-gray-900"
                placeholder="micaela.ferreyra@transferblack.com.ar"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="block w-full pl-3 pr-20 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-obsidian focus:border-obsidian transition-colors text-gray-900"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-xs font-medium text-gray-500 hover:text-gray-800"
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-obsidian focus:ring-obsidian w-4 h-4 cursor-pointer" />
                <span className="text-xs text-gray-600 font-medium">Mantener la sesión abierta</span>
              </label>
              <a href="#" className="text-xs text-gray-600 hover:text-obsidian font-medium">
                Olvidé mi contraseña
              </a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-3 px-4 rounded shadow-sm text-sm font-medium text-white bg-[#111111] hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-2"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : null}
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <p className="text-xs text-gray-400 leading-relaxed">
              ¿Problemas para entrar? Escribinos a soporte@transferblack.com.ar o al<br/>+54 351 421-8890.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
