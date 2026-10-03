'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Input,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@velora/ui';
import { User, Sparkles, Building2, ArrowRight, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { UserRole } from '@velora/types';
import { authApi } from '../../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = React.useState<UserRole>(UserRole.CUSTOMER);
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [termsAgreed, setTermsAgreed] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setSuccessMessage(null);

    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';

    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (!phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[0-9]{10,14}$/.test(phoneNumber.replace(/\s+/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit mobile number';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!termsAgreed) {
      newErrors.terms = 'You must acknowledge the Terms of Service & Privacy Policy';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const response = await authApi.register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        password,
        role: selectedRole,
      });

      const user = response.data.user;
      setSuccessMessage(`Account initialized for ${user.firstName}. Preparing session...`);

      setTimeout(() => {
        if (selectedRole === UserRole.SALON_OWNER) {
          router.push('/salons');
        } else if (selectedRole === UserRole.PROVIDER) {
          router.push('/providers');
        } else {
          router.push('/services');
        }
      }, 900);
    } catch (err: any) {
      setApiError(err.message || 'Registration failed. Please verify submitted credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-[#faf8f5]">
      <div className="w-full max-w-xl space-y-6">
        {/* Architectural Monogram Header */}
        <div className="text-center space-y-2">
          <div className="w-11 h-11 mx-auto rounded-[5px] bg-[#1a1816] text-[#faf8f5] flex items-center justify-center font-serif text-lg font-bold shadow-[0_2px_4px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.15)] border border-[#1a1816]">
            V
          </div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8c827a] block">
            Account Registration
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-[#1a1816]">
            Create your Velora Account
          </h1>
          <p className="text-xs text-[#736b63] max-w-md mx-auto">
            Choose your account classification to configure your verified service access.
          </p>
        </div>

        <Card className="border-[#ded8cb] bg-white rounded-[6px] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <CardHeader className="pb-3 border-b border-[#f0ece1]">
            <CardTitle className="font-serif text-base font-normal text-[#1a1816]">
              1. Operational Profile Classification
            </CardTitle>
            <CardDescription className="text-xs text-[#736b63]">
              Select whether you are reserving services, offering certified treatments, or operating an atelier salon.
            </CardDescription>

            {/* Role Switcher */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3">
              {[
                {
                  role: UserRole.CUSTOMER,
                  title: 'Client',
                  desc: 'Book salon & home treatments',
                  icon: User,
                },
                {
                  role: UserRole.PROVIDER,
                  title: 'Specialist',
                  desc: 'Certified beauty provider',
                  icon: Sparkles,
                },
                {
                  role: UserRole.SALON_OWNER,
                  title: 'Atelier Partner',
                  desc: 'Studio & chair management',
                  icon: Building2,
                },
              ].map((item) => {
                const isSelected = selectedRole === item.role;
                const Icon = item.icon;
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => setSelectedRole(item.role)}
                    className={`p-3 text-left rounded-[5px] border transition-all ${
                      isSelected
                        ? 'border-[#1a1816] bg-[#f5f2eb] ring-1 ring-[#1a1816]'
                        : 'border-[#ded8cb] bg-white hover:border-[#b8b0a2]'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#1a1816] mb-2" />
                    <div className="text-xs font-bold text-[#1a1816]">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-[#736b63] mt-0.5 leading-snug">
                      {item.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {apiError && (
                <div className="p-3 rounded-[5px] bg-[#fdf5f4] border border-[#f1d0ce] text-xs text-[#a0382b] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-[#a0382b] mt-0.5 shrink-0" />
                  <span className="font-medium">{apiError}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-[5px] bg-[#f2f7f3] border border-[#cadbc9] text-xs text-[#274c3a] flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#274c3a] mt-0.5 shrink-0" />
                  <span className="font-medium">{successMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="First Name"
                  placeholder="e.g. Priya"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  error={errors.firstName}
                  required
                />
                <Input
                  label="Last Name"
                  placeholder="e.g. Sharma"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  error={errors.lastName}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="client@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  required
                  autoComplete="email"
                />
                <Input
                  label="Mobile Number"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  error={errors.phoneNumber}
                  required
                  autoComplete="tel"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  required
                  autoComplete="new-password"
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={errors.confirmPassword}
                  required
                  autoComplete="new-password"
                />
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2 space-y-1">
                <label className="flex items-start gap-2.5 text-xs text-[#59524c] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    className="mt-0.5 rounded-[3px] border-[#ded8cb] text-[#1a1816] focus:ring-[#1a1816]"
                  />
                  <span>
                    I accept the{' '}
                    <Link href="/terms" className="text-[#1a1816] font-semibold underline underline-offset-2">
                      Terms of Service
                    </Link>{' '}
                    and acknowledge the{' '}
                    <Link href="/privacy" className="text-[#1a1816] font-semibold underline underline-offset-2">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-xs text-[#a0382b] font-medium">
                    {errors.terms}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="w-full mt-4 h-10 text-xs font-semibold uppercase tracking-wider"
              >
                <span>
                  Register as {selectedRole === UserRole.CUSTOMER ? 'Client' : selectedRole === UserRole.PROVIDER ? 'Specialist' : 'Partner'}
                </span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center border-t border-[#f0ece1] pt-4">
            <p className="text-xs text-[#736b63]">
              Already registered?{' '}
              <Link
                href="/login"
                className="font-semibold text-[#1a1816] hover:underline underline-offset-2"
              >
                Sign In to Existing Account
              </Link>
            </p>
          </CardFooter>
        </Card>

        {/* Security Assurance Footer */}
        <div className="text-center flex items-center justify-center gap-1.5 text-[11px] text-[#8c827a]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#274c3a]" />
          <span>Specialist and salon credentials undergo manual administrative accreditation</span>
        </div>
      </div>
    </div>
  );
}
