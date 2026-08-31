import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { FormPage } from '../../shared/FormPage/FormPage';
import { useErrorMessage } from '../../shared/ErrorMessage/useErrorMessage';
import { useLogin } from '../../hooks/useLogin';
import { extractErrorMessage } from '../../lib/extractErrorMessage';
import { extractRequestId } from '../../lib/extractRequestId';
import type { LoginCredentials } from '../../services/authService';

const inputClass =
  'col-span-12 rounded border px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand aria-invalid:border-danger';

export function Login() {
  const navigate = useNavigate();
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

  function handleLogin(credentials: LoginCredentials) {
    login.mutate(credentials, {
      onSuccess: () => navigate('/'),
      onError: (err) => {
        setError(extractErrorMessage(err, 'Invalid username or password.'), extractRequestId(err));
      },
    });
  }

  return (
    <FormPage title="Login" error={error} requestId={requestId}>
      <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
        <div>
          <label htmlFor="username" className="mb-1 block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            id="username"
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
            className={inputClass}
            {...register('password', { required: true })}
          />
        </div>

        <div className="text-right">
          <button
            type="submit"
            disabled={!isValid || login.isPending}
            className="bg-brand hover:bg-brand-dark inline-flex items-center gap-1 rounded px-4 py-1.5 text-white disabled:opacity-50"
          >
            Log in
          </button>
        </div>
      </form>
    </FormPage>
  );
}
