import { useForm } from 'react-hook-form';
import { Icon } from '../Icon/Icon';
import type { NovoEstado } from '../../services/estadoService';

interface FormEstadoProps {
  valoresIniciais?: NovoEstado;
  desabilitado?: boolean;
  onEnviar: (estado: NovoEstado) => void;
}

const inputClasse =
  'col-span-12 rounded border px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand aria-invalid:border-danger';

export function FormEstado({ valoresIniciais, desabilitado = false, onEnviar }: FormEstadoProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<NovoEstado>({
    mode: 'onBlur',
    defaultValues: { sigla: '', nome: '' },
    values: valoresIniciais,
  });

  return (
    <form onSubmit={handleSubmit(onEnviar)} className="space-y-4">
      <div>
        <label htmlFor="sigla" className="mb-1 block text-sm font-medium text-gray-700">
          Sigla
        </label>
        <input
          id="sigla"
          maxLength={2}
          size={2}
          className={inputClasse}
          aria-invalid={errors.sigla ? true : undefined}
          aria-describedby="sigla-erro"
          {...register('sigla', { required: true, minLength: 2, maxLength: 2 })}
        />
        {errors.sigla && (
          <div id="sigla-erro" className="text-danger mt-1 text-sm">
            Digite a sigla do estado.
          </div>
        )}
      </div>

      <div>
        <label htmlFor="nome" className="mb-1 block text-sm font-medium text-gray-700">
          Nome
        </label>
        <input
          id="nome"
          placeholder="Digite o nome do estado..."
          className={`${inputClasse} w-full`}
          aria-invalid={errors.nome ? true : undefined}
          aria-describedby="nome-erro"
          {...register('nome', { required: true, minLength: 3, maxLength: 100 })}
        />
        {errors.nome && (
          <div id="nome-erro" className="text-danger mt-1 text-sm">
            Digite o nome do estado.
          </div>
        )}
      </div>

      <div className="text-right">
        <button
          type="submit"
          disabled={!isValid || desabilitado}
          className="bg-brand hover:bg-brand-dark inline-flex items-center gap-1 rounded px-4 py-1.5 text-white disabled:opacity-50"
        >
          <Icon name="check" size={14} />
          Salvar
        </button>
      </div>
    </form>
  );
}
