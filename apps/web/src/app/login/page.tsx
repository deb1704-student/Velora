'use client';

import * as React from 'react';
import Link from 'next/link';
import { Input, Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@velora/ui';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [loginMessage, setLoginMessage] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

    // Development mock feedback demonstrating authentication state
    setTimeout(() => {
      setIsLoading(false);
      setLoginMessage(
        'Authentication baseline active. Once Phase 3 (Auth Module) is executed, credentials will authenticate directly against NestJS API /api/v1/auth/login.'
      );
    }, 800);
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
            Access your customer appointments, provider dashboard, or salon management console.
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

              {loginMessage && (
                <div className="p-3 rounded bg-zinc-100 border border-zinc-200 text-xs text-zinc-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{loginMessage}</span>
                  </div>
                </div>
              )}

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
