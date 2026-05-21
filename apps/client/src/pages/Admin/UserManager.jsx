import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  IconUserPlus, 
  IconTrash, 
  IconSearch, 
  IconShieldCheck,
  IconLoader2,
  IconAlertCircle,
  IconCheck,
  IconUserCircle,
  IconMail,
  IconEdit,
  IconX,
  IconLock,
  IconUsersGroup,
  IconUserOff,
  IconUsers,
  IconChartBar,
  IconKey,
  IconEye,
  IconEyeOff,
  IconSelector
} from "@tabler/icons-react";
import { supabase } from '@/lib/supabaseClient';
import { ROLES } from '@/lib/permissions';

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('active'); 
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Visibility States
  const [showPass, setShowPass] = useState(false);
  const [showEditPass, setShowEditPass] = useState(false);

  // Auto-dismiss message after 3 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    username: '',
    full_name: '',
    password: '',
    role: 'staff',
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch Profiles (Users)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) throw profilesError;
      setUsers(profilesData || []);

      // Fetch Employees
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('name, email, employee_id')
        .order('name', { ascending: true });

      if (employeesError) throw employeesError;
      setEmployees(employeesData || []);

    } catch (err) {
      console.error('Error:', err);
      setMessage({ type: 'error', text: 'Gagal sinkronisasi data.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter employees who don't have a user account yet
  const availableEmployees = employees.filter(emp => 
    !users.some(u => u.username === emp.email)
  );

  const handleSelectEmployee = (emp) => {
    setNewUser({
      ...newUser,
      full_name: emp.name,
      username: emp.email || ''
    });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.password) {
      setMessage({ type: 'error', text: 'Password wajib diisi!' });
      return;
    }
    setIsActionLoading(true);
    try {
      const { error } = await supabase.from('profiles').insert([newUser]);
      if (error) throw error;
      setMessage({ type: 'success', text: `User ${newUser.username} berhasil didaftarkan!` });
      setNewUser({ username: '', full_name: '', password: '', role: 'staff', is_active: true });
      setShowAddForm(false);
      fetchData(); // Refresh both
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setIsActionLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editingUser.full_name,
          role: editingUser.role,
          password: editingUser.password,
          is_active: editingUser.is_active
        })
        .eq('id', editingUser.id);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Identitas berhasil diperbarui!' });
      setEditingUser(null);
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    setIsActionLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !user.is_active })
        .eq('id', user.id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Gagal merubah status.' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteUser = async (id, username) => {
    if (!window.confirm(`Hapus permanen ${username}?`)) return;
    setIsActionLoading(true);
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Gagal menghapus.' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeUsers = filteredUsers.filter(u => u.is_active !== false);
  const inactiveUsers = filteredUsers.filter(u => u.is_active === false);

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] animate-fade-in relative overflow-hidden">
      
      {/* PROFESSIONAL FIXED HEADER */}
      <div className="p-4 space-y-4 bg-[#f8fafc]/90 backdrop-blur-lg border-b border-slate-200 shadow-sm z-10">
        <div className="max-w-[1200px] mx-auto space-y-4">
          
          {/* CORPORATE TITLE */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-[#E31E24] border border-slate-200">
                <IconKey size={20} stroke={2.5} />
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-800 tracking-tight uppercase leading-none">User Management</h1>
                <p className="text-[8px] font-black text-[#E31E24] uppercase tracking-[0.3em] mt-1 opacity-80">Corporate Security Governance</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="h-10 px-6 bg-[#E31E24] hover:bg-[#C1181E] text-white font-black text-[9px] uppercase tracking-widest rounded-lg shadow-md transition-all active:scale-95"
            >
              {showAddForm ? 'CANCEL' : <><IconUserPlus className="mr-2" size={14} /> REGISTER USER</>}
            </Button>
          </div>

          {/* STATS SECTION */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard title="TOTAL REGISTRY" count={users.length} icon={<IconUsers size={16} />} color="text-slate-800" />
            <StatCard title="AUTHORIZED" count={activeUsers.length} icon={<IconUsersGroup size={16} />} color="text-green-600" />
            <StatCard title="RESTRICTED" count={inactiveUsers.length} icon={<IconUserOff size={16} />} color="text-red-500" />
          </div>

          {/* NAVIGATION & SEARCH */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex p-1 bg-slate-100/80 border border-slate-200/60 rounded-xl">
              <TabButton label="ACTIVE USERS" isActive={activeTab === 'active'} onClick={() => setActiveTab('active')} count={activeUsers.length} />
              <TabButton label="INACTIVE USERS" isActive={activeTab === 'resign'} onClick={() => setActiveTab('resign')} count={inactiveUsers.length} />
            </div>
            <div className="flex-1 w-full relative group">
              <IconSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#E31E24] transition-colors" />
              <input 
                type="text" 
                placeholder="SEARCH BY IDENTITY OR EMAIL..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full h-10 pl-11 pr-6 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-800 uppercase tracking-widest focus:outline-none focus:border-[#E31E24]/30 focus:shadow-sm transition-all" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* SCROLLABLE DATA SECTION */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <div className="max-w-[1200px] mx-auto space-y-2 pb-32">
          
          <style>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 5px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #d1d9e6;
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #E31E24;
            }
          `}</style>
          
          {message.text && (
            <div className={`p-3 rounded-xl flex items-center gap-3 mb-2 animate-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
              {message.type === 'success' ? <IconCheck size={16} /> : <IconAlertCircle size={16} />}
              <span className="text-[10px] font-black uppercase tracking-widest">{message.text}</span>
            </div>
          )}

          {/* ADD USER FORM - SYNCED WITH EMPLOYEES */}
          {showAddForm && (
            <Card className="border border-slate-200 bg-white shadow-lg rounded-2xl overflow-hidden mb-4 animate-in zoom-in-95 duration-300">
              <CardContent className="p-6">
                <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  
                  <div className="md:col-span-4 space-y-1 mb-2">
                    <label className="text-[9px] font-black text-[#E31E24] uppercase tracking-widest ml-1">Quick Select Employee</label>
                    <div className="relative group">
                      <IconUsers size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select 
                        onChange={(e) => {
                          const emp = availableEmployees.find(x => x.email === e.target.value);
                          if (emp) handleSelectEmployee(emp);
                        }}
                        className="w-full h-10 pl-11 pr-10 bg-white border border-slate-200 rounded-xl text-[11px] font-bold appearance-none focus:outline-none cursor-pointer focus:border-[#E31E24] focus:ring-1 focus:ring-[#E31E24] transition-all"
                      >
                        <option value="">-- Choose Employee --</option>
                        {availableEmployees.map(emp => (
                          <option key={emp.employee_id} value={emp.email}>{emp.name}</option>
                        ))}
                      </select>
                      <IconSelector size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Identity</label>
                    <input required type="email" value={newUser.username} onChange={(e) => setNewUser({...newUser, username: e.target.value})} className="w-full h-10 px-4 bg-white border border-slate-200 rounded-lg text-[11px] font-bold focus:outline-none focus:border-[#E31E24] focus:ring-1 focus:ring-[#E31E24] transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input required type="text" value={newUser.full_name} onChange={(e) => setNewUser({...newUser, full_name: e.target.value})} className="w-full h-10 px-4 bg-white border border-slate-200 rounded-lg text-[11px] font-bold focus:outline-none focus:border-[#E31E24] focus:ring-1 focus:ring-[#E31E24] transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
                    <div className="relative">
                      <input required type={showPass ? "text" : "password"} value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} className="w-full h-10 px-4 pr-10 bg-white border border-slate-200 rounded-lg text-[11px] font-bold focus:outline-none focus:border-[#E31E24] focus:ring-1 focus:ring-[#E31E24] transition-all" />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#E31E24]">
                        {showPass ? <IconEyeOff size={14} /> : <IconEye size={14} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Authority Role</label>
                    <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})} className="w-full h-10 px-4 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-[#E31E24] focus:ring-1 focus:ring-[#E31E24] transition-all">
                      {Object.values(ROLES).map(role => <option key={role} value={role}>{role.toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-4 flex justify-end mt-2">
                    <Button type="submit" disabled={isActionLoading} className="h-10 px-8 bg-slate-800 hover:bg-slate-700 text-white font-black text-[10px] uppercase tracking-widest rounded-lg shadow-md">PROVISION ACCOUNT</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <IconLoader2 className="animate-spin text-[#E31E24]" size={40} />
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Syncing Identity Matrix...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {(activeTab === 'active' ? activeUsers : inactiveUsers).length === 0 ? (
                <EmptyState message="No matching identity records found in this category." />
              ) : (
                (activeTab === 'active' ? activeUsers : inactiveUsers).map((u) => (
                  <UserCard key={u.id} user={u} onToggle={handleToggleStatus} onEdit={setEditingUser} onDelete={handleDeleteUser} />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-lg border border-slate-200 bg-white shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-10 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Modify Authority</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{editingUser.username}</p>
                </div>
                <button onClick={() => setEditingUser(null)} className="h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"><IconX size={20} /></button>
              </div>
              <form onSubmit={handleUpdateUser} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Legal Identity Name</label>
                  <input required type="text" value={editingUser.full_name} onChange={(e) => setEditingUser({...editingUser, full_name: e.target.value})} className="w-full h-14 px-6 bg-white border border-slate-200 rounded-2xl text-[13px] font-bold focus:outline-none focus:border-[#E31E24] focus:ring-1 focus:ring-[#E31E24] transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Access Password</label>
                  <div className="relative">
                    <input required type={showEditPass ? "text" : "password"} value={editingUser.password} onChange={(e) => setEditingUser({...editingUser, password: e.target.value})} className="w-full h-14 px-6 pr-14 bg-white border border-slate-200 rounded-2xl text-[13px] font-bold focus:outline-none focus:border-[#E31E24] focus:ring-1 focus:ring-[#E31E24] transition-all" />
                    <button type="button" onClick={() => setShowEditPass(!showEditPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#E31E24]">
                      {showEditPass ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Authority Role</label>
                  <select value={editingUser.role} onChange={(e) => setEditingUser({...editingUser, role: e.target.value})} className="w-full h-14 px-6 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-[#E31E24] focus:ring-1 focus:ring-[#E31E24] transition-all">
                    {Object.values(ROLES).map(role => <option key={role} value={role}>{role.toUpperCase()}</option>)}
                  </select>
                </div>
                <Button type="submit" disabled={isActionLoading} className="w-full h-14 bg-[#E31E24] hover:bg-[#C1181E] text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-lg">Save Authorization Changes</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// COMPONENTS
const StatCard = ({ title, count, icon, color }) => (
  <Card className="border border-slate-200 bg-white shadow-sm rounded-xl overflow-hidden transition-all hover:scale-[1.01]">
    <CardContent className="p-3 flex items-center justify-between">
      <div className="space-y-0.5">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <p className={`text-lg font-black tracking-tight ${color}`}>{count}</p>
      </div>
      <div className={`h-8 w-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center ${color} opacity-70`}>
        {icon}
      </div>
    </CardContent>
  </Card>
);

const TabButton = ({ label, isActive, onClick, count }) => (
  <button 
    onClick={onClick} 
    className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
      isActive 
      ? 'bg-white shadow-sm text-[#E31E24] border border-slate-200 font-bold' 
      : 'text-slate-500 hover:text-slate-700 font-medium'
    }`}
  >
    {label} <span className={`px-1.5 py-0.5 rounded-full text-[8px] ${isActive ? 'bg-red-50 text-[#E31E24]' : 'bg-slate-200 text-slate-600'}`}>{count}</span>
  </button>
);

const UserCard = ({ user, onToggle, onEdit, onDelete }) => (
  <div className={`bg-white border border-slate-200 shadow-sm px-4 py-3 rounded-xl flex items-center justify-between transition-all hover:shadow-md ${!user.is_active ? 'opacity-70 bg-slate-50/50' : ''}`}>
    <div className="flex items-center gap-4">
      <div className={`h-10 w-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center ${user.is_active ? 'text-[#E31E24]' : 'text-slate-300'}`}>
        {user.is_active ? <IconUserCircle size={20} /> : <IconLock size={20} />}
      </div>
      <div className="space-y-0.5">
        <h4 className="text-[12px] font-black text-slate-800 tracking-tight uppercase flex items-center gap-2">
          {user.full_name}
          {!user.is_active && <span className="text-[7px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full tracking-widest font-black uppercase">Restricted</span>}
        </h4>
        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400">
          <span className="flex items-center gap-1"><IconMail size={12} /> {user.username}</span>
          <span className="text-slate-200">|</span>
          <span className="uppercase text-[#E31E24] font-black tracking-widest">{user.role}</span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center gap-1">
        <span className={`text-[7px] font-black uppercase tracking-widest ${user.is_active ? 'text-green-600' : 'text-slate-400'}`}>
          {user.is_active ? 'Authorized' : 'Restricted'}
        </span>
        <button 
          onClick={() => onToggle(user)} 
          disabled={user.role === 'owner'} 
          className={`w-10 h-5 rounded-full p-0.5 transition-all duration-300 flex items-center border ${
            user.is_active ? 'bg-red-50 border-red-200' : 'bg-slate-100 border-slate-200'
          }`}
        >
          <div className={`h-3.5 w-3.5 rounded-full transition-all duration-300 transform ${user.is_active ? 'translate-x-5 bg-[#E31E24]' : 'translate-x-0 bg-slate-400'}`}></div>
        </button>
      </div>
      <div className="h-8 w-[1px] bg-slate-200"></div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => onEdit(user)} className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-50 border border-slate-200 hover:scale-105"><IconEdit size={14} /></Button>
        <Button variant="ghost" onClick={() => onDelete(user.id, user.username)} disabled={user.role === 'owner'} className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-[#E31E24] hover:bg-slate-50 border border-slate-200 hover:scale-105"><IconTrash size={14} /></Button>
      </div>
    </div>
  </div>
);

const EmptyState = ({ message }) => (
  <div className="py-24 flex flex-col items-center justify-center gap-6 bg-white border-2 border-dashed border-slate-200 rounded-2xl">
    <IconChartBar size={48} className="text-slate-300" />
    <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">{message}</p>
  </div>
);

export default UserManager;
