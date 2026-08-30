import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Icon } from '../Icon/Icon';
import { newStateSchema, type NewState } from '../../interfaces/state';

interface StateFormProps {
  initialValues?: NewState;
  disabled?: boolean;
  onSubmitState: (state: NewState) => void;
}

const inputClass =
  'col-span-12 rounded border px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand aria-invalid:border-danger';

export function StateForm({ initialValues, disabled = false, onSubmitState }: StateFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<NewState>({
    mode: 'onBlur',
    resolver: zodResolver(newStateSchema),
    defaultValues: { abbreviation: '', name: '' },
    values: initialValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmitState)} className="space-y-4">
      <div>
        <label htmlFor="abbreviation" className="mb-1 block text-sm font-medium text-gray-700">
          Abbreviation
        </label>
        <input
          id="abbreviation"
          maxLength={2}
          size={2}
          className={inputClass}
          aria-invalid={errors.abbreviation ? true : undefined}
          aria-describedby="abbreviation-error"
          {...register('abbreviation')}
        />
        {errors.abbreviation && (
          <div id="abbreviation-error" className="text-danger mt-1 text-sm">
            {errors.abbreviation.message}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          id="name"
          placeholder="Enter the state name..."
          className={`${inputClass} w-full`}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby="name-error"
          {...register('name')}
        />
        {errors.name && (
          <div id="name-error" className="text-danger mt-1 text-sm">
            {errors.name.message}
          </div>
        )}
      </div>

      <div className="text-right">
        <button
          type="submit"
          disabled={!isValid || disabled}
          className="bg-brand hover:bg-brand-dark inline-flex items-center gap-1 rounded px-4 py-1.5 text-white disabled:opacity-50"
        >
          <Icon name="check" size={14} />
          Save
        </button>
      </div>
    </form>
  );
}
