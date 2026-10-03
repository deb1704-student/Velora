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
import { ArrowRight, AlertCircle, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';
import { authApi } from '../../lib/api';
import { UserRole } from '@velora/types';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setSuccessMessage(null);

    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });
      const user = response.data.user;

      setSuccessMessage(`Welcome back, ${user.firstName}! Directing to your portal...`);

      setTimeout(() => {
        if (user.role === UserRole.SALON_OWNER) {
          router.push('/salons');
        } else if (user.role === UserRole.PROVIDER) {
          router.push('/providers');
        } else {
          router.push('/bookings');
        }
      }, 700);
    } catch (err: any) {
      setApiError(err.message || 'Authentication failed. Please verify your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-16 bg-[#faf8f5]">
      <div className="w-full max-w-md space-y-6">
        {/* Architectural Monogram Header */}
        <div className="text-center space-y-2">
          <div className="w-11 h-11 mx-auto rounded-[5px] bg-[#1a1816] text-[#faf8f5] flex items-center justify-center font-serif text-lg font-bold shadow-[0_2px_4px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.15)] border border-[#1a1816]">
            V
          </div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8c827a] block">
            Client & Partner Authentication
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-[#1a1816]">
            Sign in to Velora
          </h1>
          <p className="text-xs text-[#736b63] max-w-xs mx-auto">
            Access your treatment reservations, specialist schedule, or atelier workstation console.
          </p>
        </div>

        <Card className="border-[#ded8cb] bg-white rounded-[6px] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <CardHeader className="pb-3 border-b border-[#f0ece1]">
            <CardTitle className="font-serif text-base font-normal text-[#1a1816]">
              Account Credentials
            </CardTitle>
            <CardDescription className="text-xs text-[#736b63]">
              Enter your registered email and passphrase to continue.
            </CardDescription>
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

              <Input
                label="Email Address"
                type="email"
                placeholder="client@velora.luxury"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                required
                autoComplete="email"
              />

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#3d3834]">
                    Password <span className="text-[#a0382b]">*</span>
                  </span>
                  <span className="text-[11px] text-[#736b63] cursor-not-allowed">
                    Protected by BCrypt-12
                  </span>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  required
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="w-full mt-2 h-10 text-xs font-semibold uppercase tracking-wider"
              >
                <span>Continue to Account</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center border-t border-[#f0ece1] pt-4">
            <p className="text-xs text-[#736b63]">
              Do not have an account yet?{' '}
              <Link
                href="/register"
                className="font-semibold text-[#1a1816] hover:underline underline-offset-2"
              >
                Register as Client or Specialist
              </Link>
            </p>
          </CardFooter>
        </Card>

        {/* Security Assurance Footer */}
        <div className="text-center flex items-center justify-center gap-1.5 text-[11px] text-[#8c827a]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#274c3a]" />
          <span>Sessions securely verified with JWT-authenticated tokens</span>
        </div>
      </div>
    </div>
  );
}
