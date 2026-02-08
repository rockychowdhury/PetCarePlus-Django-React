import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, EyeOff, User, Mail, Lock, Phone, AlertCircle, Check } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Modal from '../common/Modal/Modal';
import { useNavigate } from 'react-router';
import Logo from '../common/Logo';
import Input from '../common/Form/Input';
import Button from '../common/Buttons/Button';
import Checkbox from '../common/Form/Checkbox';
import Alert from '../common/Feedback/Alert';

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
    const [showPassword, setShowPassword] = useState(false);
    const { register, error, setError } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        password: '',
        confirm_password: '',
        termsAccepted: false,
        location_city: '',
        location_state: '',
        location_country: '',
        zip_code: '',
        latitude: null,
        longitude: null
    });

    const [localError, setLocalError] = useState('');

    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordCriteria, setPasswordCriteria] = useState({
        length: false,
        uppercase: false,
        number: false,
        special: false
    });

    useEffect(() => {
        validatePassword(formData.password);
    }, [formData.password]);

    // Auto-detect location on mount
    useEffect(() => {
        if (isOpen) {
            detectLocation();
        }
    }, [isOpen]);

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

    const validatePassword = (pwd) => {
        const criteria = {
            length: pwd.length >= 8,
            uppercase: /[A-Z]/.test(pwd),
            number: /[0-9]/.test(pwd),
            special: /[^A-Za-z0-9]/.test(pwd)
        };
        setPasswordCriteria(criteria);

        const metCount = Object.values(criteria).filter(Boolean).length;
        setPasswordStrength(metCount); // 0 to 4
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (localError) setLocalError('');
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');
        setError(null);

        // Custom Validations
        if (!formData.first_name.trim()) return setLocalError("First name is required");
        if (!formData.last_name.trim()) return setLocalError("Last name is required");
        if (!formData.email.trim()) return setLocalError("Email is required");
        if (!formData.phone_number.trim()) return setLocalError("Phone number is required");

        if (formData.password !== formData.confirm_password) {
            return setLocalError("Passwords must match");
        }

        if (passwordStrength < 4) {
            return setLocalError("Please meet all password requirements");
        }

        setIsLoading(true);
        try {
            await register({
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                phone_number: formData.phone_number,
                password: formData.password,
                location_city: formData.location_city,
                location_state: formData.location_state,
                location_country: formData.location_country,
                zip_code: formData.zip_code,
                latitude: formData.latitude,
                longitude: formData.longitude
            });
            onClose();
            navigate('/verify-email', { state: { email: formData.email } });
        } catch (err) {
            // Error handled by useAuth but we check here too if needed
        } finally {
            setIsLoading(false);
        }
    };

    const displayedError = localError || error;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="">
            <div className="flex flex-col mb-6">
                <div className="mb-6 flex justify-between items-start">
                    <div>
                        <Logo />
                        <p className="text-sm font-medium text-brand-secondary mt-1">Find loving homes for pets in need</p>
                    </div>
                    <button onClick={onSwitchToLogin} className="text-sm text-text-secondary hover:text-brand-primary font-medium">
                        Already have an account? <span className="underline">Log in</span>
                    </button>
                </div>

                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-text-primary">Create Your Account</h2>
                    <p className="text-text-secondary text-sm">Join our community of responsible pet lovers</p>
                </div>

                {displayedError && (
                    <Alert variant="error" className="mb-4">
                        {displayedError}
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="First Name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            placeholder="First Name"
                            required
                        />
                        <Input
                            label="Last Name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            placeholder="Last Name"
                            required
                        />
                    </div>

                    <div className="relative">
                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            startIcon={<Mail size={18} />}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <div className="relative">
                            <Input
                                label="Phone Number"
                                type="tel"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                placeholder="+1 (555) 000-0000"
                                startIcon={<Phone size={18} />}
                                required
                            />
                        </div>
                        <p className="text-[10px] text-text-secondary">We'll send you a verification code</p>
                    </div>

                    <div className="space-y-1">
                        <div className="relative">
                            <Input
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a strong password"
                                startIcon={<Lock size={18} />}
                                required
                                endIcon={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-text-secondary hover:text-text-primary"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                }
                            />
                        </div>

                        {/* Password Strength Meter */}
                        {formData.password && (
                            <div className="space-y-2 mt-2">
                                <div className="flex gap-1 h-1">
                                    {[...Array(4)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`flex-1 rounded-full transition-colors duration-300 ${i < passwordStrength
                                                ? passwordStrength <= 2 ? 'bg-orange-400' : 'bg-green-500' // Weak/Medium vs Strong
                                                : 'bg-gray-200'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-text-secondary">
                                    <div className={`flex items-center gap-1 ${passwordCriteria.length ? 'text-green-600' : ''}`}>
                                        {passwordCriteria.length ? <Check size={10} /> : <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />} Minimum 8 characters
                                    </div>
                                    <div className={`flex items-center gap-1 ${passwordCriteria.uppercase ? 'text-green-600' : ''}`}>
                                        {passwordCriteria.uppercase ? <Check size={10} /> : <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />} At least one uppercase letter
                                    </div>
                                    <div className={`flex items-center gap-1 ${passwordCriteria.number ? 'text-green-600' : ''}`}>
                                        {passwordCriteria.number ? <Check size={10} /> : <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />} At least one number
                                    </div>
                                    <div className={`flex items-center gap-1 ${passwordCriteria.special ? 'text-green-600' : ''}`}>
                                        {passwordCriteria.special ? <Check size={10} /> : <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />} At least one special character
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <Input
                            label="Confirm Password"
                            type="password"
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            placeholder="Re-enter your password"
                            startIcon={<Lock size={18} />}
                            required
                        />
                    </div>

                    <div className="pt-2">
                        <div className="flex items-start gap-3">
                            <Checkbox
                                name="termsAccepted"
                                checked={formData.termsAccepted}
                                onChange={handleChange}
                            />
                            <span className="text-xs text-text-secondary leading-tight pt-0.5 mt-1">
                                I agree to the <a href="#" className="font-bold underline hover:text-brand-secondary">Terms of Service</a> and <a href="#" className="font-bold underline hover:text-brand-secondary">Privacy Policy</a>
                            </span>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading || !formData.termsAccepted}
                        isLoading={isLoading}
                        className="w-full mt-4"
                        variant="primary"
                    >
                        Create Account
                    </Button>
                </form>
            </div>
        </Modal>
    );
};

export default RegisterModal;
