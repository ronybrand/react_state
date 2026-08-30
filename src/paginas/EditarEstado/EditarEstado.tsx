import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { FormEstado } from '../../compartilhado/FormEstado/FormEstado';
import { ErrorMsg } from '../../compartilhado/ErrorMsg/ErrorMsg';
import { useErrorMsg } from '../../compartilhado/ErrorMsg/useErrorMsg';
import { Spinner } from '../../compartilhado/Spinner/Spinner';
import { useEstado } from '../../hooks/useEstado';
import { useAtualizarEstado } from '../../hooks/useAtualizarEstado';
import { extraiMensagemErro } from '../../lib/extraiMensagemErro';
import { extraiRequestIdErro } from '../../lib/extraiRequestIdErro';
import type { NovoEstado } from '../../services/estadoService';

export function EditarEstado() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const estadoId = Number(id);
  const idValido = id !== undefined && Number.isInteger(estadoId) && estadoId > 0;

  const {
    data: estado,
    isLoading,
    isError,
    error: erroCarregamento,
  } = useEstado(estadoId, { enabled: idValido });
  const atualizarEstado = useAtualizarEstado();
  const { error, requestId, setError } = useErrorMsg();

  useEffect(() => {
    if (!idValido) {
      setError('Estado inválido.');
      return;
    }
    if (isError) {
      setError(
        extraiMensagemErro(erroCarregamento, 'Falha ao buscar estado.'),
        extraiRequestIdErro(erroCarregamento),
      );
    }
  }, [idValido, isError, erroCarregamento, setError]);

  function handleEnviar(dados: NovoEstado) {
    if (!estado) {
      return;
    }
    atualizarEstado.mutate(
      { ...estado, ...dados },
      {
        onSuccess: () => navigate('/'),
        onError: (err) => {
          setError(extraiMensagemErro(err, 'Falha ao atualizar estado.'), extraiRequestIdErro(err));
        },
      },
    );
  }

  return (
    <div className="mx-auto max-w-md p-4">
      <h1 className="font-display mb-4 text-xl font-semibold">Editar estado</h1>
      <ErrorMsg error={error} requestId={requestId} />
      {idValido && isLoading && <Spinner />}
      {estado && (
        <FormEstado
          valoresIniciais={{ sigla: estado.sigla, nome: estado.nome }}
          desabilitado={atualizarEstado.isPending}
          onEnviar={handleEnviar}
        />
      )}
    </div>
  );
}
