import RegisteredUserController from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import { login } from '@/routes';
import { Form, Head, usePage } from '@inertiajs/react';
import { LoaderCircle, Shield, Settings, AlertCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function Register() {
    const { isFirstUser = false, managerRegistrationEnabled = true, cashierRegistrationEnabled = true } = usePage().props as {
        isFirstUser: boolean;
        managerRegistrationEnabled: boolean;
        cashierRegistrationEnabled: boolean;
    };

    // Check if registration is completely disabled
    const registrationDisabled = !isFirstUser && !managerRegistrationEnabled && !cashierRegistrationEnabled;

    if (registrationDisabled) {
        return (
            <AuthLayout title="Registration Unavailable" description="Account registration is currently disabled">
                <Head title="Register" />
                <div className="flex flex-col items-center gap-6 text-center">
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 w-full">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
                            Registration Currently Disabled
                        </h2>
                        <p className="text-red-600 dark:text-red-400 mb-4">
                            Account registration is currently disabled. Please contact an administrator to create your account.
                        </p>
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <TextLink href={login()}>
                            Log in
                        </TextLink>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout title="Create an account" description="Enter your details below to create your account">
            <Head title="Register" />
            <Form
                {...RegisteredUserController.store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Full name"
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Role Selection - Only show if not first user */}
                            {!isFirstUser && (
                                <div className="grid gap-2">
                                    <Label htmlFor="role">Account Type</Label>
                                    <select
                                        id="role"
                                        name="role"
                                        required
                                        tabIndex={3}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        defaultValue=""
                                    >
                                        <option value="">Select account type</option>
                                        {managerRegistrationEnabled && (
                                            <option value="manager">
                                                <Shield className="inline-block mr-2" size={16} />
                                                Manager - Full system access
                                            </option>
                                        )}
                                        {cashierRegistrationEnabled && (
                                            <option value="cashier">
                                                <Settings className="inline-block mr-2" size={16} />
                                                Cashier - Payment management access
                                            </option>
                                        )}
                                    </select>
                                    <InputError message={errors.role} />
                                    <p className="text-xs text-muted-foreground">
                                        {isFirstUser ? 'You will be automatically assigned as the system administrator.' : 'Choose the type of account you want to create.'}
                                    </p>
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">Confirm password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    tabIndex={5}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Confirm password"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <Button type="submit" className="mt-2 w-full" tabIndex={6}>
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Create account
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <TextLink href={login()} tabIndex={7}>
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
