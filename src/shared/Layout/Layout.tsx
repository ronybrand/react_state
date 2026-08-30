import { Link, Outlet } from 'react-router';
import { Footer } from '../Footer/Footer';

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <nav className="bg-brand px-4 py-3">
        <Link to="/" className="font-display text-lg font-semibold text-white">
          State CRUD - React/Java
        </Link>
      </nav>
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
