import { useEffect } from 'react';
import { Link } from 'react-router';
import { useEstados } from '../../hooks/useEstados';
import { useExcluirEstado } from '../../hooks/useExcluirEstado';
import { useErrorMsg } from '../../compartilhado/ErrorMsg/useErrorMsg';
import { ErrorMsg } from '../../compartilhado/ErrorMsg/ErrorMsg';
import { Spinner } from '../../compartilhado/Spinner/Spinner';
import { Icon } from '../../compartilhado/Icon/Icon';
import { extraiMensagemErro } from '../../lib/extraiMensagemErro';
import { extraiRequestIdErro } from '../../lib/extraiRequestIdErro';
import { formatarData } from '../../lib/formatarData';

export function ListaEstado() {
  const { data: estados = [], isLoading, isError, error: erroCarregamento } = useEstados();
  const excluirEstado = useExcluirEstado();
  const { error, requestId, setError } = useErrorMsg();

  useEffect(() => {
    if (isError) {
      setError(extraiMensagemErro(erroCarregamento, 'Falha ao buscar estados.'));
    }
  }, [isError, erroCarregamento, setError]);

  function handleExcluir(id: number, sigla: string) {
    if (!window.confirm(`Tem certeza que deseja excluir ${sigla}?`)) {
      return;
    }
    excluirEstado.mutate(id, {
      onError: (err) => {
        setError(extraiMensagemErro(err, 'Falha ao deletar estado.'), extraiRequestIdErro(err));
      },
    });
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      <ErrorMsg error={error} requestId={requestId} />

      <div className="mb-4 text-right">
        <Link
          to="/estado/criar"
          className="bg-success hover:bg-success/90 inline-flex items-center gap-1 rounded px-3 py-1.5 text-sm text-white"
        >
          <Icon name="plus" />
          Novo estado
        </Link>
      </div>

      <div className="rounded border border-gray-200">
        <div className="font-display border-b border-gray-200 bg-gray-50 px-4 py-2 font-semibold">
          Estados
        </div>
        <div className="p-4">
          {isLoading && <Spinner />}

          {!isLoading && estados.length === 0 && (
            <div className="py-3 text-center text-gray-500">
              <p>Nenhum estado cadastrado.</p>
              <Link
                to="/estado/criar"
                className="bg-success hover:bg-success/90 mt-2 inline-block rounded px-3 py-1 text-sm text-white"
              >
                Criar o primeiro estado
              </Link>
            </div>
          )}

          {!isLoading && estados.length > 0 && (
            <table className="w-full text-center text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-2">Sigla</th>
                  <th className="p-2">Nome</th>
                  <th className="hidden p-2 md:table-cell">Criado</th>
                  <th className="hidden p-2 md:table-cell">Última Alteração</th>
                  <th className="p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {estados.map((estado) => (
                  <tr key={estado.id} className="border-b border-gray-100">
                    <td className="p-2 font-semibold">{estado.sigla}</td>
                    <td className="p-2">{estado.nome}</td>
                    <td className="hidden p-2 font-mono text-xs text-gray-500 md:table-cell">
                      {formatarData(estado.dataHoraCadastro)}
                    </td>
                    <td className="hidden p-2 font-mono text-xs text-gray-500 md:table-cell">
                      {formatarData(estado.dataHoraUltimaAtualizacao)}
                    </td>
                    <td className="space-x-1 p-2">
                      <Link
                        to={`/estado/editar/${estado.id}`}
                        aria-label={`Editar ${estado.sigla}`}
                        className="bg-brand hover:bg-brand-dark inline-flex items-center gap-1 rounded px-2 py-1 text-white"
                      >
                        <Icon name="pencil" size={14} />
                        <span className="hidden md:inline">Editar</span>
                      </Link>
                      <button
                        type="button"
                        aria-label={`Excluir ${estado.sigla}`}
                        disabled={excluirEstado.isPending}
                        onClick={() => handleExcluir(estado.id, estado.sigla)}
                        className="bg-danger inline-flex items-center gap-1 rounded px-2 py-1 text-white hover:opacity-90 disabled:opacity-50"
                      >
                        <Icon name="trash" size={14} />
                        <span className="hidden md:inline">Excluir</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
