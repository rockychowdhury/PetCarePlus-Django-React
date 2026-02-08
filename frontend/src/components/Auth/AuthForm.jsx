import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Check } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Input from '../common/Form/Input';
import Button from '../common/Buttons/Button';
import SocialAuthButtons from './SocialAuthButtons';
import AuthToggle from './AuthToggle';
import { Link } from 'react-router-dom';
import { extractFieldErrors, validateRegistration } from '../../utils/validationUtils';
import { toast } from 'react-toastify';

const AuthForm = ({ initialMode = 'login', onSuccess }) => {
    const [mode, setMode] = useState(initialMode);
    const { login, register } = useAuth();
    const navigate = useNavigate();

    // Form State
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        termsAccepted: false,
        location_city: '',
        location_state: '',
        location_country: '',
        zip_code: '',
        latitude: null,
        longitude: null
    });

    // Default showPassword to true for Registration as requested
    const [showPassword, setShowPassword] = useState(false);

    // Updates showPassword default when mode changes
    useEffect(() => {
        if (mode === 'register') {
            setShowPassword(true);
        } else {
            setShowPassword(false);
        }
    }, [mode]);

    // Auto-detect location on mount if in register mode
    useEffect(() => {
        if (mode === 'register') {
            detectLocation();
        }
    }, [mode]);

    const detectLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const response = await axios.get(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
                        );
                        const address = response.data.address;
                        setFormData(prev => ({
                            ...prev,
                            latitude: parseFloat(latitude.toFixed(6)),
                            longitude: parseFloat(longitude.toFixed(6)),
                            location_city: address.city || address.town || address.village || address.hamlet || '',
                            location_state: address.state || '',
                            location_country: address.country || '',
                            zip_code: address.postcode || ''
                        }));
                    } catch (error) {
                        console.error("Failed to reverse geocode:", error);
                    }
                },
                (error) => {
                    console.log("Geolocation permission denied or failed:", error);
                }
            );
        }
    };

    const [isLoading, setIsLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear specific field error as user corrects it
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFieldErrors({});

        // Client-side Validation
        if (mode === 'register') {
            const clientErrors = validateRegistration(formData);
            if (Object.keys(clientErrors).length > 0) {
                setFieldErrors(clientErrors);
                // Show first error or all errors
                const errorMsg = Object.values(clientErrors).join(", ");
                toast.error(errorMsg);
                return;
            }
            if (!formData.termsAccepted) {
                toast.error("You must accept the terms.");
                return;
            }
        }

        setIsLoading(true);

        try {
            if (mode === 'login') {
                const user = await login({ email: formData.email, password: formData.password });
                if (onSuccess) onSuccess(user);
                else navigate('/dashboard');
            } else {
                // Register
                await register({
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    email: formData.email,
                    password: formData.password,
                    phone_number: '',
                    location_city: formData.location_city,
                    location_state: formData.location_state,
                    location_country: formData.location_country,
                    zip_code: formData.zip_code,
                    latitude: formData.latitude,
                    longitude: formData.longitude
                });
                navigate('/verify-email', { state: { email: formData.email } });
                if (onSuccess) onSuccess({ preventRedirect: true });
            }
        } catch (err) {
            console.error(err);
            // Parse Backend Errors
            const backendFieldErrors = extractFieldErrors(err);
            if (Object.keys(backendFieldErrors).length > 0) {
                setFieldErrors(backendFieldErrors);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Toggle */}
            <AuthToggle mode={mode} onToggle={setMode} />

            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-black text-[#402E11] tracking-tight mb-2">
                    {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="text-sm font-bold text-[#402E11]/40 leading-relaxed px-4">
                    {mode === 'login'
                        ? 'Enter your details to access your account'
                        : 'Join our community of pet lovers today'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Smooth Transition Wrapper for Name Fields */}
                <div className={`grid transition-all duration-300 ease-in-out ${mode === 'register' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <Input
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                placeholder="First Name"
                                error={fieldErrors.first_name}
                                className="bg-[#FAF3E0]/30 border-[#402E11]/10 rounded-2xl h-12 text-sm focus:border-[#C48B28] focus:ring-[#C48B28]/20"
                                required={mode === 'register'}
                            />
                            <Input
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                placeholder="Last Name"
                                error={fieldErrors.last_name}
                                className="bg-[#FAF3E0]/30 border-[#402E11]/10 rounded-2xl h-12 text-sm focus:border-[#C48B28] focus:ring-[#C48B28]/20"
                                required={mode === 'register'}
                            />
                        </div>
                    </div>
                </div>

                <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    startIcon={<Mail size={18} className="text-[#C48B28]" />}
                    error={fieldErrors.email}
                    className="bg-[#FAF3E0]/30 border-[#402E11]/10 rounded-2xl h-12 text-sm focus:border-[#C48B28] focus:ring-[#C48B28]/20"
                    required
                />

                <div className="relative">
                    <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder={mode === 'register' ? "Create Password" : "Password"}
                        startIcon={<Lock size={18} className="text-[#C48B28]" />}
                        error={fieldErrors.password}
                        className="bg-[#FAF3E0]/30 border-[#402E11]/10 rounded-2xl h-12 text-sm focus:border-[#C48B28] focus:ring-[#C48B28]/20"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-[14px] text-[#402E11]/40 hover:text-[#402E11] focus:outline-none"
                    >
                        {showPassword ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
                    </button>
                </div>

                {mode === 'login' && (
                    <div className="flex justify-end animate-fade-in">
                        <Link to="/forgot-password" title="Forgot Password?" className="text-[10px] font-black text-[#C48B28] uppercase tracking-wider hover:underline">
                            Forgot Password?
                        </Link>
                    </div>
                )}

                {/* Smooth Transition for Terms */}
                <div className={`grid transition-all duration-300 ease-in-out ${mode === 'register' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                        <label className="flex items-start gap-3 cursor-pointer group py-1 mb-2">
                            <input
                                type="checkbox"
                                name="termsAccepted"
                                checked={formData.termsAccepted}
                                onChange={handleChange}
                                className="mt-1 w-4 h-4 rounded border-[#402E11]/20 text-[#C48B28] focus:ring-0 focus:ring-offset-0 focus:outline-none"
                            />
                            <span className="text-[11px] font-bold text-[#402E11]/60 leading-tight">
                                I agree to the <Link to="/terms" className="text-[#402E11] font-black hover:underline">Terms</Link> and <Link to="/privacy" className="text-[#402E11] font-black hover:underline">Privacy Policy</Link>
                            </span>
                        </label>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-[#402E11] hover:bg-[#5A421A] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#402E11]/20 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3 mt-4"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                        mode === 'login' ? 'Sign In' : 'Create Account'
                    )}
                </button>

                <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#402E11]/10"></div>
                    </div>
                    <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.2em]">
                        <span className="px-3 bg-white text-[#402E11]/40">Or continue with</span>
                    </div>
                </div>

                <SocialAuthButtons />
            </form>
        </div>
    );
};

export default AuthForm;
