import { Link, useRouteError } from 'react-router';

export function RotaErro() {
  const erro = useRouteError();

  if (import.meta.env.DEV) {
    console.error(erro);
  }

  return (
    <div className="mx-auto max-w-md p-4" role="alert">
      <h1 className="font-display mb-2 text-xl font-semibold">Algo deu errado</h1>
      <p className="text-gray-600">
        Ocorreu um erro inesperado ao carregar esta página. Tente voltar para o início.
      </p>
      <Link to="/" className="text-brand mt-4 inline-block underline">
        Voltar para o início
      </Link>
    </div>
  );
}
