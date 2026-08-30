import { useNavigate } from 'react-router';
import { FormEstado } from '../../compartilhado/FormEstado/FormEstado';
import { ErrorMsg } from '../../compartilhado/ErrorMsg/ErrorMsg';
import { useErrorMsg } from '../../compartilhado/ErrorMsg/useErrorMsg';
import { useCriarEstado } from '../../hooks/useCriarEstado';
import { extraiMensagemErro } from '../../lib/extraiMensagemErro';
import { extraiRequestIdErro } from '../../lib/extraiRequestIdErro';
import type { NovoEstado } from '../../services/estadoService';

export function CriarEstado() {
  const navigate = useNavigate();
  const criarEstado = useCriarEstado();
  const { error, requestId, setError } = useErrorMsg();

  function handleEnviar(estado: NovoEstado) {
    criarEstado.mutate(estado, {
      onSuccess: () => navigate('/'),
      onError: (err) => {
        setError(extraiMensagemErro(err, 'Falha ao criar estado.'), extraiRequestIdErro(err));
      },
    });
  }

  return (
    <div className="mx-auto max-w-md p-4">
      <h1 className="font-display mb-4 text-xl font-semibold">Novo estado</h1>
      <ErrorMsg error={error} requestId={requestId} />
      <FormEstado desabilitado={criarEstado.isPending} onEnviar={handleEnviar} />
    </div>
  );
}
