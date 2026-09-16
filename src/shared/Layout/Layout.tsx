import { Link, Outlet, useNavigate } from 'react-router';
import { Footer } from '../Footer/Footer';
import { Icon } from '../Icon/Icon';
import { authService } from '../../services/authService';
import { isTokenValid } from '../../lib/tokenStorage';

export function Layout() {
  const navigate = useNavigate();

  function handleLogout() {
    authService.logout();
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <nav className="bg-brand flex items-center justify-between px-4 py-3">
        <Link to="/" className="font-display text-lg font-semibold text-white">
          State CRUD - React/Java
        </Link>
        {isTokenValid() && (
          <button
            type="button"
            aria-label="Sair"
            title="Sair"
            className="cursor-pointer text-white"
            onClick={handleLogout}
          >
            <Icon name="box-arrow-right" />
          </button>
        )}
      </nav>
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
