import React, { useState } from 'react';
import { IconKey, IconX, IconLoader2, IconAlertCircle } from '@tabler/icons-react';
import { apiClient } from '@/lib/apiClient';

const ResetPasswordModal = ({ isOpen, onClose, employee, onSuccess }) => {
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !employee) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.put(`/api/employees/${employee.id || employee['EMPLOYEE ID']}/reset-password`, {
        new_password: newPassword
      });
      alert('Password berhasil di-reset!');
      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err.message || 'Gagal reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setNewPassword('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in font-outfit">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-slide-up relative">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-white/10 rounded-lg flex items-center justify-center text-white">
              <IconKey size={18} stroke={2} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Reset Password</h3>
              <p className="text-[10px] text-slate-300">Atur ulang sandi akun karyawan</p>
            </div>
          </div>
          <button onClick={handleClose} className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <IconX size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6 flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="h-10 w-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold text-sm shrink-0">
              {employee['Photo'] || employee.photo ? (
                <img src={employee['Photo'] || employee.photo} alt={employee['EMPLOYEE NAME']} className="w-full h-full object-cover rounded-full" />
              ) : (
                (employee['EMPLOYEE NAME'] || 'A')[0].toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 uppercase truncate">{employee['EMPLOYEE NAME']}</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">{employee['EMAIL']}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Password Baru</label>
              <input 
                type="text" 
                placeholder="Masukkan password baru"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-start gap-2 text-rose-600">
                <IconAlertCircle size={16} className="shrink-0 mt-0.5" />
                <p className="text-xs font-medium">{error}</p>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button 
              type="button" 
              onClick={handleClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors uppercase tracking-wider"
              disabled={isLoading}
            >
              Batal
            </button>
            <button 
              type="submit"
              disabled={isLoading || !newPassword}
              className="px-6 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider flex items-center gap-2"
            >
              {isLoading ? <IconLoader2 size={16} className="animate-spin" /> : <IconKey size={16} />}
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
