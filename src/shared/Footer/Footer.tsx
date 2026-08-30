import { useFrontendVersion } from '../../hooks/useFrontendVersion';
import { useBackendInfo } from '../../hooks/useBackendInfo';
import { formatDate } from '../../lib/formatDate';

export function Footer() {
  const { data: frontendVersion } = useFrontendVersion();
  const { data: backendInfo } = useBackendInfo();

  if (!frontendVersion && !backendInfo) {
    return null;
  }

  return (
    <footer className="mt-4 py-3 text-center text-xs text-gray-400">
      {frontendVersion && (
        <span>
          front {frontendVersion.commit} · {formatDate(frontendVersion.buildDate)}
        </span>
      )}
      {frontendVersion && backendInfo && <span className="mx-2">|</span>}
      {backendInfo && (
        <span>
          back {backendInfo.build.commit} · {formatDate(backendInfo.build.time)}
        </span>
      )}
    </footer>
  );
}
