import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Phone, Lock, ArrowRight } from 'lucide-react';
import { Button, Input, Card } from '../components/ui';
import { authAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle } from '../lib/firebase';

export default function Login() {
  const [step, setStep] = useState('phone'); // phone | otp | register
  const [phone, setPhone] = useState('+91');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authAPI.sendOTP(phone);
      if (data.success) {
        setStep('otp');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authAPI.verifyOTP(phone, otp);
      if (data.success) {
        login(data.data.token, data.data.user);
        if (data.data.isNewUser) {
          setIsNewUser(true);
          setStep('register');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authAPI.register({ name, email });
      if (data.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      const { data } = await authAPI.googleLogin({
        uid: user.uid,
        email: user.email,
        name: user.displayName || 'Google User',
        avatar_url: user.photoURL,
      });
      if (data.success) {
        login(data.data.token, data.data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDummyLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const { data } = await authAPI.dummyLogin();
      if (data.success) {
        login(data.data.token, data.data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Dummy login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-text">Welcome to SAHYOG</h1>
          <p className="text-text-secondary mt-1">
            {step === 'phone' && 'Login with your WhatsApp number'}
            {step === 'otp' && 'Enter the OTP sent to your WhatsApp'}
            {step === 'register' && 'Complete your profile to get started'}
          </p>
        </div>

        <Card hover={false}>
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {step === 'phone' && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <Input
                id="phone"
                label="WhatsApp Phone Number"
                type="tel"
                placeholder="+919876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200">
                <Phone className="h-4 w-4 text-green-600 flex-shrink-0" />
                <p className="text-xs text-green-700">
                  We'll send a 6-digit OTP to your WhatsApp number for secure login.
                </p>
              </div>
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Send OTP
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div className="text-center mb-2">
                <p className="text-sm text-text-secondary">OTP sent to <strong className="text-text">{phone}</strong></p>
                <button type="button" onClick={() => setStep('phone')} className="text-xs text-primary hover:underline mt-1">
                  Change number
                </button>
              </div>
              <Input
                id="otp"
                label="Enter OTP"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-2xl tracking-[0.5em] font-mono"
                required
              />
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                <Lock className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                  OTP is valid for 5 minutes. Check your WhatsApp messages.
                </p>
              </div>
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Verify & Login
              </Button>
            </form>
          )}

          {step === 'register' && (
            <form onSubmit={handleRegister} className="space-y-5">
              <Input
                id="name"
                label="Full Name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                id="email"
                label="Email (optional)"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Complete Registration
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          )}

          {step === 'phone' && (
            <>
              <div className="relative mt-6 mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm font-medium leading-6">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleGoogleLogin} 
                loading={loading} 
                className="w-full bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 mb-3"
                size="lg"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 mr-2" />
                Sign in with Google
              </Button>
              
              <Button 
                type="button" 
                onClick={handleDummyLogin} 
                loading={loading} 
                className="w-full bg-gray-800 text-white hover:bg-gray-900"
                size="lg"
              >
                Dummy Login (Dev Only)
              </Button>
            </>
          )}
        </Card>

        <p className="text-center text-xs text-text-muted mt-6">
          By continuing, you agree to SAHYOG's Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
