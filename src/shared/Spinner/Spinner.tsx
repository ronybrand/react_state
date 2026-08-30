export function Spinner() {
  return (
    <div role="status" className="flex justify-center py-4">
      <div className="border-brand h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      <span className="sr-only">Carregando...</span>
    </div>
  );
}
