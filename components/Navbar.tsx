
import React from 'react';
import { AppRoute } from '../types';

interface NavbarProps {
  currentRoute: AppRoute;
  setRoute: (route: AppRoute) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, setRoute, isLoggedIn, onLogout }) => {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div 
            className="flex-shrink-0 flex items-center cursor-pointer" 
            onClick={() => setRoute(AppRoute.HOME)}
          >
            <span className="text-blue-600 font-bold text-2xl tracking-tight">ALUMNI</span>
            <span className="text-slate-700 font-medium ml-1">PORTAL</span>
          </div>
          <div className="hidden md:flex space-x-8">
            <button 
              onClick={() => setRoute(AppRoute.HOME)}
              className={`${currentRoute === AppRoute.HOME ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'} px-1 py-4 text-sm font-medium transition-all`}
            >
              หน้าแรก
            </button>
            {isLoggedIn && (
              <button 
                onClick={() => setRoute(AppRoute.PROFILE)}
                className={`${currentRoute === AppRoute.PROFILE ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'} px-1 py-4 text-sm font-medium transition-all`}
              >
                โปรไฟล์ของฉัน
              </button>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <button 
                onClick={onLogout}
                className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                ออกจากระบบ
              </button>
            ) : (
              <>
                <button 
                  onClick={() => setRoute(AppRoute.LOGIN)}
                  className="text-slate-600 text-sm font-medium hover:text-blue-600"
                >
                  เข้าสู่ระบบ
                </button>
                <button 
                  /* Fix: AppRoute.REGISTER does not exist, using AppRoute.LOGIN which handles registration in this app */
                  onClick={() => setRoute(AppRoute.LOGIN)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  สมัครสมาชิก
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};