import { Outlet, useNavigate, Link } from 'react-router-dom';
import { LogOut, LayoutDashboard, FilePlus, Users, ShieldCheck } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#78be21] rounded-lg flex items-center justify-center text-white font-bold text-xl">
            H
          </div>
          <div>
            <h1 className="text-slate-900 font-bold text-lg leading-tight">HITAM CDC</h1>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Internship Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-slate-900 font-semibold text-sm">{user?.name}</p>
            <p className="text-slate-500 text-xs capitalize">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <div className="flex flex-1">
        <aside className="w-64 bg-white border-r border-slate-200 p-4 hidden md:block">
          <div className="space-y-1">
            {user?.role === 'student' && (
              <>
                <Link
                  to="/student"
                  className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-[#78be21] rounded-lg transition-all font-medium text-sm"
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
                <Link
                  to="/student/apply"
                  className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-[#78be21] rounded-lg transition-all font-medium text-sm"
                >
                  <FilePlus size={18} />
                  Apply Internship
                </Link>
              </>
            )}
            {user?.role === 'cdc' && (
              <Link
                to="/cdc"
                className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-[#78be21] rounded-lg transition-all font-medium text-sm"
              >
                <Users size={18} />
                Manage Applications
              </Link>
            )}
            {user?.role === 'principal' && (
              <Link
                to="/principal"
                className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-[#78be21] rounded-lg transition-all font-medium text-sm"
              >
                <ShieldCheck size={18} />
                Final Approvals
              </Link>
            )}
          </div>
        </aside>

        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
