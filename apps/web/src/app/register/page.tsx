'use client';

import * as React from 'react';
import Link from 'next/link';
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
import { ShieldCheck, User, Sparkles, Building2, ArrowRight } from 'lucide-react';
import { UserRole } from '@velora/types';

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = React.useState<UserRole>(UserRole.CUSTOMER);
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [termsAgreed, setTermsAgreed] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [feedbackMessage, setFeedbackMessage] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      newErrors.terms = 'You must agree to the Terms & Conditions and Privacy Policy';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setFeedbackMessage(
        `Registration baseline ready. In Phase 3 (Auth), this request submits to /api/v1/auth/register as a ${selectedRole} account.`
      );
    }, 800);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 mx-auto rounded-md bg-zinc-900 text-white flex items-center justify-center font-bold text-sm dark:bg-zinc-100 dark:text-zinc-900">
            V
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Create your Velora Account
          </h1>
          <p className="text-xs text-zinc-500">
            Select your account type to configure your service access profile.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">1. Select Account Type</CardTitle>
            <CardDescription className="text-xs">
              Determine your operational permissions on the platform.
            </CardDescription>

            {/* Role Switcher */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3">
              {[
                {
                  role: UserRole.CUSTOMER,
                  title: 'Customer',
                  desc: 'Book salon & home treatments',
                  icon: User,
                },
                {
                  role: UserRole.PROVIDER,
                  title: 'Specialist',
                  desc: 'Offer certified beauty services',
                  icon: Sparkles,
                },
                {
                  role: UserRole.SALON_OWNER,
                  title: 'Salon Partner',
                  desc: 'Manage studio & staff chairs',
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
                    className={`p-3 text-left rounded-md border transition-all ${
                      isSelected
                        ? 'border-zinc-950 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800/80 ring-1 ring-zinc-950 dark:ring-zinc-100'
                        : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-zinc-700 dark:text-zinc-300 mb-2" />
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5 leading-snug">
                      {item.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
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
                  placeholder="name@domain.com"
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
                <label className="flex items-start gap-2.5 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    className="mt-0.5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-950 dark:border-zinc-700"
                  />
                  <span>
                    I agree to the{' '}
                    <Link href="/terms" className="text-zinc-900 font-semibold underline dark:text-white">
                      Terms & Conditions
                    </Link>{' '}
                    and acknowledge the{' '}
                    <Link href="/privacy-policy" className="text-zinc-900 font-semibold underline dark:text-white">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                    {errors.terms}
                  </p>
                )}
              </div>

              {feedbackMessage && (
                <div className="p-3 rounded bg-zinc-100 border border-zinc-200 text-xs text-zinc-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{feedbackMessage}</span>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="w-full mt-4"
              >
                <span>Create {selectedRole === UserRole.CUSTOMER ? 'Customer' : selectedRole === UserRole.PROVIDER ? 'Specialist' : 'Partner'} Account</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center border-t border-zinc-100 dark:border-zinc-800 pt-4">
            <p className="text-xs text-zinc-500">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-semibold text-zinc-900 hover:underline dark:text-white"
              >
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
