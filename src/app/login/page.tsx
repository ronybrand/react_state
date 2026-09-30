'use client';

import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { FormPage } from '../../shared/FormPage/FormPage';
import { useErrorMessage } from '../../shared/ErrorMessage/useErrorMessage';
import { useLogin } from '../../hooks/useLogin';
import { extractRequestId } from '../../lib/extractRequestId';
import type { LoginCredentials } from '../../services/authService';

const inputClass =
  'col-span-12 rounded border px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand aria-invalid:border-danger';

export default function Login() {
  const router = useRouter();
  const login = useLogin();
  const { error, requestId, setError } = useErrorMessage();
  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm<LoginCredentials>({
    mode: 'onChange',
    defaultValues: { username: '', password: '' },
  });
  // login.isPending only reflects the last committed render, so a second
  // click/Enter fired before React re-renders would still see it as false -
  // this ref is set synchronously and closes that gap.
  const submitInFlight = useRef(false);

  function handleLogin(credentials: LoginCredentials) {
    if (submitInFlight.current) {
      return;
    }
    submitInFlight.current = true;

    login.mutate(credentials, {
      onSuccess: () => router.push('/'),
      onError: (err) => {
        submitInFlight.current = false;
        setError('Invalid username or password.', extractRequestId(err));
      },
    });
  }

  return (
    <FormPage title="Login" error={error} requestId={requestId}>
      {
        // react-hook-form's handleSubmit(fn) returns a submit handler that
        // reads its internal form-state ref when invoked - not during
        // render - but the new (experimental, React Compiler-oriented)
        // react-hooks/refs rule can't tell the difference and flags the ref
        // access inside handleSubmit's implementation as if it happened
        // here. This is the standard, documented react-hook-form API used
        // unchanged from the Vite original; disabling the rule for this one
        // line rather than restructuring a working, idiomatic pattern.
      }
      {/* eslint-disable-next-line react-hooks/refs */}
      <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
        <div>
          <label htmlFor="username" className="mb-1 block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            id="username"
            autoComplete="username"
            className={inputClass}
            {...register('username', { required: true })}
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className={inputClass}
            {...register('password', { required: true })}
          />
        </div>

        <div className="text-right">
          <button
            type="submit"
            disabled={!isValid || login.isPending}
            className="bg-brand hover:bg-brand-dark inline-flex cursor-pointer items-center gap-1 rounded px-4 py-1.5 text-white disabled:cursor-default disabled:opacity-50"
          >
            Log in
          </button>
        </div>
      </form>
      <p className="mt-4 text-sm text-gray-600" data-testid="demo-credentials">
        Demo credentials (intentionally public): <strong>admin</strong> /{' '}
        <strong>Estado-Demo-2026</strong>
      </p>
    </FormPage>
  );
}
