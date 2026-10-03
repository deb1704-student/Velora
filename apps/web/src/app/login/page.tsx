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
import { ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
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

      setSuccessMessage(`Welcome back, ${user.firstName}! Redirecting...`);

      setTimeout(() => {
        if (user.role === UserRole.SALON_OWNER) {
          router.push('/salons');
        } else if (user.role === UserRole.PROVIDER) {
          router.push('/providers');
        } else {
          router.push('/services');
        }
      }, 800);
    } catch (err: any) {
      setApiError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 mx-auto rounded-md bg-zinc-900 text-white flex items-center justify-center font-bold text-sm dark:bg-zinc-100 dark:text-zinc-900">
            V
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Log in to Velora
          </h1>
          <p className="text-xs text-zinc-500">
            Access your customer appointments, specialist roster, or studio management console.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account Sign In</CardTitle>
            <CardDescription className="text-xs">
              Enter your registered email and credentials below.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {apiError && (
                <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-800 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                  <span>{apiError}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-200 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <Input
                label="Email Address"
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                required
                autoComplete="email"
              />

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Password <span className="text-rose-500">*</span>
                  </span>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
                  >
                    Forgot Password?
                  </Link>
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
                className="w-full mt-2"
              >
                <span>Continue to Dashboard</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center border-t border-zinc-100 dark:border-zinc-800 pt-4">
            <p className="text-xs text-zinc-500">
              Don&apos;t have an account yet?{' '}
              <Link
                href="/register"
                className="font-semibold text-zinc-900 hover:underline dark:text-white"
              >
                Register Here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
