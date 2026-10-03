import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import transferLogo from '../../assets/img/logo_transferblack_sinfodo.png';
import { authStorage } from '../auth/store/authStorage';
import { useAuthStore } from '../auth/store/useAuthStore';
import { authActions } from '../../core/auth/action/auth.actions';
import { AuthError } from '../../core/auth/interface/auth.interface';
import { OtpInput } from '../auth/components/OtpInput';
import { PasswordRequirements } from '../auth/components/PasswordRequirements';
import { Button } from '../components/common';

type Step = 'email' | 'pin' | 'password' | 'success';

const COOLDOWN_SECONDS = 60;

export const ForgotPasswordScreen: React.FC = () => {
  const navigate = useNavigate();

  // Estados del flujo
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [resetToken, setResetToken] = useState<string | null>(null);

  // Estados de contraseña
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados de carga y error
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfoMessage, setSuccessInfoMessage] = useState<string | null>(null);

  // Cooldown de reenvío
  const [cooldown, setCooldown] = useState(0);

  // Limpieza de sesión previa al entrar
  useEffect(() => {
    authStorage.removeTokens();
    useAuthStore.getState().logout();
  }, []);

  // Temporizador para el cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Paso 1: Solicitar PIN por correo
  const handleRequestPin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMessage('Por favor, ingresá un correo electrónico corporativo válido.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authActions.forgotPassword(cleanEmail);
      setSuccessInfoMessage(response.data.message);
      setCooldown(COOLDOWN_SECONDS);
      setStep('pin');
    } catch (err) {
      if (err instanceof AuthError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Ocurrió un error al enviar el código. Reintentá en unos momentos.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Reenviar PIN
  const handleResendPin = async () => {
    if (cooldown > 0 || isLoading) return;
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const response = await authActions.forgotPassword(email.trim().toLowerCase());
      setSuccessInfoMessage(response.data.message);
      setCooldown(COOLDOWN_SECONDS);
    } catch (err) {
      if (err instanceof AuthError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('No se pudo reenviar el código. Intente nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Paso 2: Verificar PIN de 6 dígitos
  const handleVerifyPin = async (codeToVerify?: string) => {
    const code = (codeToVerify || pinCode).trim();
    setErrorMessage(null);

    if (code.length !== 6) {
      setErrorMessage('El código debe contener exactamente 6 dígitos.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authActions.verifyResetCode(email, code);
      setResetToken(response.data.reset_token);
      setStep('password');
    } catch (err) {
      if (err instanceof AuthError) {
        const attemptsMsg = (err.details as { attempts_remaining?: number })?.attempts_remaining
          ? ` (Te quedan ${(err.details as { attempts_remaining: number }).attempts_remaining} intentos)`
          : '';
        setErrorMessage(`${err.message}${attemptsMsg}`);
      } else {
        setErrorMessage('El código de verificación es inválido o ha expirado.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Paso 3: Restablecer contraseña
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!resetToken) {
      setErrorMessage('La sesión de recuperación caducó. Volvé a solicitar un código.');
      setStep('email');
      return;
    }

    // Validar requisitos
    const hasMinLength = newPassword.length >= 8;
    const hasLower = /[a-z]/.test(newPassword);
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);

    if (!hasMinLength || !hasLower || !hasUpper || !hasNumber) {
      setErrorMessage('La contraseña no cumple con todos los requisitos de seguridad.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Las contraseñas ingresadas no coinciden.');
      return;
    }

    setIsLoading(true);
    try {
      await authActions.resetPassword(resetToken, newPassword);
      setStep('success');
      // Redirección suave al login tras unos segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      if (err instanceof AuthError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('No se pudo restablecer la contraseña. Reintentá.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen font-montserrat bg-white dark:bg-dark-bg">
      {/* Lado Izquierdo - Branding Corporativo Transfer Black */}
      <div className="hidden lg:flex w-1/2 bg-obsidian relative flex-col justify-center text-white overflow-hidden p-12 lg:p-24 select-none">
        <img
          src={transferLogo}
          alt="Transfer Black Logo"
          className="absolute -right-[20%] top-1/2 -translate-y-1/2 w-[850px] opacity-[0.03] select-none pointer-events-none"
        />

        {/* Header Superior con Logo */}
        <div className="absolute top-12 left-12 lg:left-24 flex items-center gap-3">
          <div className="bg-champagne-gold text-obsidian font-bold text-lg w-10 h-10 flex items-center justify-center rounded-sm">
            TB
          </div>
          <span className="font-bold tracking-widest text-sm text-white">TRANSFER BLACK</span>
        </div>

        {/* Contenido Editorial */}
        <div className="relative z-10 max-w-lg mt-10">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Seguridad y control<br />en cada acceso.
          </h1>
          <p className="text-gray-400 text-lg mb-12">
            Restablecé tus credenciales de acceso de forma segura mediante verificación por PIN corporativo.
          </p>

          <div className="border-t border-gray-800 pt-8 flex items-center gap-4 text-xs text-gray-400">
            <KeyRound className="w-5 h-5 text-champagne-gold flex-shrink-0" />
            <span>
              La clave actualizada revoca automáticamente todas las sesiones activas anteriores por seguridad.
            </span>
          </div>
        </div>

        {/* Footer Inferior */}
        <div className="absolute bottom-12 left-12 lg:left-24 text-gray-600 text-xs">
          Consola operativa de Córdoba • Toda actividad de seguridad queda auditada.
        </div>
      </div>

      {/* Lado Derecho - Formulario Interactivo */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-24 py-12">
        <div className="w-full max-w-md mx-auto">
          {/* Navegación de retorno */}
          <div className="mb-8 flex items-center justify-between">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a Iniciar Sesión</span>
            </Link>

            {step !== 'success' && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-champagne-gold">
                Paso{' '}
                {step === 'email' ? '1 de 3' : step === 'pin' ? '2 de 3' : '3 de 3'}
              </span>
            )}
          </div>

          {/* Banner de Error */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl text-xs font-semibold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/40 flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
              <span className="flex-1">{errorMessage}</span>
            </div>
          )}

          {/* PASO 1: Ingreso de Correo Electrónico */}
          {step === 'email' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                  ¿Olvidaste tu contraseña?
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Ingresá tu correo corporativo. Si la cuenta existe, te enviaremos un código numérico de 6 dígitos.
                </p>
              </div>

              <form onSubmit={handleRequestPin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      autoFocus
                      placeholder="ejemplo@transferblack.com.ar"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-champagne-gold/50 focus:border-champagne-gold transition-all shadow-sm disabled:opacity-50"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                  isLoading={isLoading}
                  className="mt-2 bg-[#111111] hover:bg-black text-white dark:bg-champagne-gold dark:hover:bg-champagne-gold/90 dark:text-obsidian font-bold"
                >
                  Enviar código de verificación
                </Button>
              </form>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-dark-border text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                El código de verificación tiene una validez de 15 minutos. Si no lo recibís, revisá la casilla de spam o promociones.
              </div>
            </div>
          )}

          {/* PASO 2: Verificación de Código PIN */}
          {step === 'pin' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                  Verificar código PIN
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Ingresá el código de 6 dígitos que enviamos a{' '}
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {email}
                  </span>
                  .
                </p>
              </div>

              {successInfoMessage && (
                <div className="p-3 text-xs text-amber-800 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 rounded-xl">
                  {successInfoMessage}
                </div>
              )}

              {/* Input OTP de 6 dígitos */}
              <div className="py-2">
                <OtpInput
                  value={pinCode}
                  onChange={setPinCode}
                  onComplete={(code) => handleVerifyPin(code)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-3">
                <Button
                  type="button"
                  variant="primary"
                  fullWidth
                  size="lg"
                  disabled={pinCode.length !== 6 || isLoading}
                  isLoading={isLoading}
                  onClick={() => handleVerifyPin()}
                  className="bg-[#111111] hover:bg-black text-white dark:bg-champagne-gold dark:hover:bg-champagne-gold/90 dark:text-obsidian font-bold"
                >
                  Verificar y continuar
                </Button>

                {/* Botón de reenvío con temporizador */}
                <div className="flex items-center justify-between text-xs pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setPinCode('');
                    }}
                    className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cambiar correo
                  </button>

                  <button
                    type="button"
                    onClick={handleResendPin}
                    disabled={cooldown > 0 || isLoading}
                    className={`font-semibold flex items-center gap-1.5 transition-colors ${
                      cooldown > 0 || isLoading
                        ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        : 'text-champagne-gold hover:underline'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>
                      {cooldown > 0
                        ? `Reenviar código en ${cooldown}s`
                        : 'Reenviar código'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PASO 3: Definir Nueva Clave */}
          {step === 'password' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                  Definir nueva contraseña
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Creá una contraseña segura para tu cuenta de operaciones.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* Nueva contraseña */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      autoFocus
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-champagne-gold/50 focus:border-champagne-gold transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirmar contraseña */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Confirmar nueva contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-champagne-gold/50 focus:border-champagne-gold transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Indicador de Requisitos en tiempo real */}
                <PasswordRequirements
                  password={newPassword}
                  confirmPassword={confirmPassword}
                  showMatchCheck={true}
                />

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                  isLoading={isLoading}
                  className="mt-2 bg-[#111111] hover:bg-black text-white dark:bg-champagne-gold dark:hover:bg-champagne-gold/90 dark:text-obsidian font-bold"
                >
                  Restablecer contraseña
                </Button>
              </form>
            </div>
          )}

          {/* PASO 4: Éxito */}
          {step === 'success' && (
            <div className="text-center space-y-6 animate-in zoom-in-95 duration-300 py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  ¡Contraseña actualizada con éxito!
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
                  Tus nuevas credenciales ya están activas. Te estamos redirigiendo automáticamente a la pantalla de inicio de sesión...
                </p>
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  variant="primary"
                  fullWidth
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="bg-[#111111] hover:bg-black text-white dark:bg-champagne-gold dark:hover:bg-champagne-gold/90 dark:text-obsidian font-bold"
                >
                  Iniciar sesión ahora
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordScreen;
