'use client';

import { useState } from 'react';
import { useCommentsStore } from '@/store/commentsStore';
import { loginAction, logoutAction } from '@/actions/auth';
import { LogIn, LogOut, User, Shield, KeyRound, Loader2 } from 'lucide-react';

export function AuthNavbar() {
  const { currentUser, setCurrentUser } = useCommentsStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'user'>('user');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const res = await loginAction({
      username: selectedRole === 'admin' ? 'admin' : 'alex',
      password: selectedRole === 'admin' ? 'admin' : 'user',
    });

    if (res.success && res.user) {
      setCurrentUser(res.user);
      setIsOpen(false);
    } else {
      setError(res.error || 'Ошибка авторизации');
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    setIsLoading(true);
    await logoutAction();
    setCurrentUser(null);
    setIsLoading(false);
  };

  return (
    <div className="flex items-center gap-3">
      {currentUser ? (
        <div className="flex items-center gap-3 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                currentUser.role === 'admin'
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {currentUser.role === 'admin' ? (
                <Shield className="w-3.5 h-3.5" />
              ) : (
                <User className="w-3.5 h-3.5" />
              )}
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800 leading-none">
                {currentUser.name}
              </div>
              <span
                className={`text-[10px] uppercase font-semibold tracking-wider ${
                  currentUser.role === 'admin' ? 'text-rose-600' : 'text-blue-600'
                }`}
              >
                {currentUser.role === 'admin' ? 'Администратор' : 'Пользователь'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoading}
            title="Выйти из аккаунта"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Войти в систему</span>
          </button>

          {/* Modal login dialog */}
          {isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
              <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-2.5 mb-4 text-slate-900">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">Вход в систему</h3>
                    <p className="text-xs text-slate-500">Выберите тестовую роль для проверки прав</p>
                  </div>
                </div>

                {error && (
                  <div className="p-2.5 mb-4 bg-rose-50 text-rose-600 text-xs rounded-lg border border-rose-200">
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-700 block">
                      Выберите учетную запись:
                    </label>

                    <button
                      type="button"
                      onClick={() => setSelectedRole('admin')}
                      className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                        selectedRole === 'admin'
                          ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-500/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Shield className={`w-5 h-5 mt-0.5 ${selectedRole === 'admin' ? 'text-rose-600' : 'text-slate-400'}`} />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Администратор (admin)</div>
                        <div className="text-[11px] text-slate-500">Полные права: просмотр, создание, правка, удаление</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedRole('user')}
                      className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                        selectedRole === 'user'
                          ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <User className={`w-5 h-5 mt-0.5 ${selectedRole === 'user' ? 'text-blue-600' : 'text-slate-400'}`} />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Обычный пользователь (alex)</div>
                        <div className="text-[11px] text-slate-500">Просмотр, создание и редактирование (удаление закрыто)</div>
                      </div>
                    </button>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Войти</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      disabled={isLoading}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
