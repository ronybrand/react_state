import { useEffect } from 'react';
import { Link } from 'react-router';
import { useStates } from '../../hooks/useStates';
import { useDeleteState } from '../../hooks/useDeleteState';
import { useErrorMessage } from '../../shared/ErrorMessage/useErrorMessage';
import { ErrorMessage } from '../../shared/ErrorMessage/ErrorMessage';
import { Spinner } from '../../shared/Spinner/Spinner';
import { Icon } from '../../shared/Icon/Icon';
import { extractErrorMessage } from '../../lib/extractErrorMessage';
import { extractRequestId } from '../../lib/extractRequestId';
import { formatDate } from '../../lib/formatDate';

export function StateList() {
  const { data: states = [], isLoading, isError, error: loadError } = useStates();
  const deleteState = useDeleteState();
  const { error, requestId, setError } = useErrorMessage();

  useEffect(() => {
    if (isError) {
      setError(
        extractErrorMessage(loadError, 'Failed to fetch states.'),
        extractRequestId(loadError),
      );
    }
  }, [isError, loadError, setError]);

  function handleDelete(id: number, abbreviation: string) {
    if (!window.confirm(`Are you sure you want to delete ${abbreviation}?`)) {
      return;
    }
    deleteState.mutate(id, {
      onError: (err) => {
        setError(extractErrorMessage(err, 'Failed to delete state.'), extractRequestId(err));
      },
    });
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      <ErrorMessage error={error} requestId={requestId} />

      <div className="mb-4 text-right">
        <Link
          to="/state/new"
          className="bg-success hover:bg-success/90 inline-flex items-center gap-1 rounded px-3 py-1.5 text-sm text-white"
        >
          <Icon name="plus" />
          New state
        </Link>
      </div>

      <div className="rounded border border-gray-200">
        <div className="font-display border-b border-gray-200 bg-gray-50 px-4 py-2 font-semibold">
          States
        </div>
        <div className="p-4">
          {isLoading && <Spinner />}

          {!isLoading && states.length === 0 && (
            <div className="py-3 text-center text-gray-500">
              <p>No states registered.</p>
              <Link
                to="/state/new"
                className="bg-success hover:bg-success/90 mt-2 inline-block rounded px-3 py-1 text-sm text-white"
              >
                Create the first state
              </Link>
            </div>
          )}

          {!isLoading && states.length > 0 && (
            <table className="w-full text-center text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-2">Abbreviation</th>
                  <th className="p-2">Name</th>
                  <th className="hidden p-2 md:table-cell">Created</th>
                  <th className="hidden p-2 md:table-cell">Last Updated</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {states.map((state) => (
                  <tr key={state.id} className="border-b border-gray-100">
                    <td className="p-2 font-semibold">{state.abbreviation}</td>
                    <td className="p-2">{state.name}</td>
                    <td className="hidden p-2 font-mono text-xs text-gray-500 md:table-cell">
                      {formatDate(state.createdAt)}
                    </td>
                    <td className="hidden p-2 font-mono text-xs text-gray-500 md:table-cell">
                      {formatDate(state.updatedAt)}
                    </td>
                    <td className="space-x-1 p-2">
                      <Link
                        to={`/state/${state.id}/edit`}
                        aria-label={`Edit ${state.abbreviation}`}
                        className="bg-brand hover:bg-brand-dark inline-flex items-center gap-1 rounded px-2 py-1 text-white"
                      >
                        <Icon name="pencil" size={14} />
                        <span className="hidden md:inline">Edit</span>
                      </Link>
                      <button
                        type="button"
                        aria-label={`Delete ${state.abbreviation}`}
                        disabled={deleteState.isPending}
                        onClick={() => handleDelete(state.id, state.abbreviation)}
                        className="bg-danger inline-flex items-center gap-1 rounded px-2 py-1 text-white hover:opacity-90 disabled:opacity-50"
                      >
                        <Icon name="trash" size={14} />
                        <span className="hidden md:inline">Delete</span>
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
