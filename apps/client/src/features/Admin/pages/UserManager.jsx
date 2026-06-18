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
  IconSelector,
  IconLink
} from "@tabler/icons-react";
import { apiClient } from '@/lib/apiClient';
import { ROLES } from '@/lib/permissions';

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('active'); 
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedUsers, setSelectedUsers] = useState([]);
  
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
      const profilesRes = await apiClient.get('/auth/profiles');
      setUsers(profilesRes.data.data || []);

      // Fetch Employees
      const employeesRes = await apiClient.get('/employees');
      
      // employee api returns { data, total, page, page_size }
      setEmployees(employeesRes.data.data || []);

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
    setIsActionLoading(true);
    try {
      await apiClient.post('/auth/profiles', newUser);
      setMessage({ type: 'success', text: `User ${newUser.username} berhasil didaftarkan!${!newUser.password ? ' Link setup akan dikirim ke email.' : ''}` });
      setNewUser({ username: '', full_name: '', password: '', role: 'staff', is_active: true });
      setShowAddForm(false);
      fetchData(); // Refresh both
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || err.message });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setIsActionLoading(true);
    try {
      const payload = {
        full_name: editingUser.full_name,
        role: editingUser.role,
        is_active: editingUser.is_active
      };
      if (editingUser.password) payload.password = editingUser.password;
      
      await apiClient.put(`/auth/profiles/${editingUser.id}`, payload);
      setMessage({ type: 'success', text: 'Identitas berhasil diperbarui!' });
      setEditingUser(null);
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || err.message });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    setIsActionLoading(true);
    try {
      await apiClient.put(`/auth/profiles/${user.id}`, { is_active: !user.is_active });
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
      await apiClient.delete(`/auth/profiles/${id}`);
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Gagal menghapus.' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSendResetLink = async (user) => {
    if (!window.confirm(`Kirim link setup/reset password ke ${user.username}?`)) return;
    setIsActionLoading(true);
    try {
      await apiClient.post(`/auth/profiles/${user.id}/reset-link`);
      setMessage({ type: 'success', text: `Link setup password telah dikirim ke ${user.username}` });
    } catch (err) {
      setMessage({ type: 'error', text: 'Gagal mengirim link setup.' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleBulkSuspend = async () => {
    if (selectedUsers.length === 0) return;
    if (!window.confirm(`Suspend ${selectedUsers.length} user secara massal?`)) return;
    setIsActionLoading(true);
    try {
      await Promise.all(selectedUsers.map(id => apiClient.put(`/auth/profiles/${id}`, { is_active: false })));
      setMessage({ type: 'success', text: `${selectedUsers.length} user berhasil di-suspend.` });
      setSelectedUsers([]);
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Gagal suspend massal.' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSelectUser = (id) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]);
  };

  const availableRoles = [...new Set([...Object.values(ROLES), ...users.map(u => u.role).filter(Boolean)])];

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
              <div className="h-10 w-10 bg-transparent shadow-sm rounded-xl flex items-center justify-center text-ios-primary border border-slate-200">
                <IconKey size={20} stroke={2.5} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800 tracking-tight uppercase leading-none">User Management</h1>
                <p className="text-[11px] font-semibold text-ios-primary uppercase tracking-widest mt-1 opacity-80">Corporate Security Governance</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="h-10 px-6 bg-ios-primary hover:bg-ios-primary/90 text-white font-bold text-xs uppercase tracking-widest rounded-lg shadow-sm transition-all active:scale-95"
            >
              {showAddForm ? 'CANCEL' : <><IconUserPlus className="mr-2" size={14} /> REGISTER USER</>}
            </Button>
          </div>

          {/* STATS SECTION */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard data-tooltip="TOTAL REGISTRY" count={users.length} icon={<IconUsers size={16} />} color="text-slate-800" />
            <StatCard data-tooltip="AUTHORIZED" count={activeUsers.length} icon={<IconUsersGroup size={16} />} color="text-green-600" />
            <StatCard data-tooltip="RESTRICTED" count={inactiveUsers.length} icon={<IconUserOff size={16} />} color="text-red-500" />
          </div>

          {/* NAVIGATION & SEARCH */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex p-1 bg-slate-100/80 border border-slate-200/60 rounded-xl">
              <TabButton label="ACTIVE USERS" isActive={activeTab === 'active'} onClick={() => { setActiveTab('active'); setSelectedUsers([]); }} count={activeUsers.length} />
              <TabButton label="INACTIVE USERS" isActive={activeTab === 'resign'} onClick={() => { setActiveTab('resign'); setSelectedUsers([]); }} count={inactiveUsers.length} />
            </div>
            {selectedUsers.length > 0 && (
              <Button onClick={handleBulkSuspend} disabled={isActionLoading} className="h-10 px-4 bg-orange-100 text-orange-600 hover:bg-orange-200 border border-orange-200 text-xs font-bold uppercase tracking-widest shadow-sm transition-all">
                <IconUserOff size={14} className="mr-2" /> Suspend Selected ({selectedUsers.length})
              </Button>
            )}
            <div className="flex-1 w-full relative group">
              <IconSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-ios-primary transition-colors" />
              <input 
                type="text" 
                placeholder="SEARCH BY IDENTITY OR EMAIL..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full h-10 pl-11 pr-6 bg-transparent border border-slate-200 rounded-xl text-xs font-bold text-slate-800 uppercase tracking-widest focus:outline-none focus:border-ios-primary/30 focus:shadow-sm transition-all" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* SCROLLABLE DATA SECTION */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <div className="max-w-[1200px] mx-auto space-y-2 pb-32">
          

          
          {message.text && (
            <div className={`p-3 rounded-xl flex items-center gap-3 mb-2 animate-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
              {message.type === 'success' ? <IconCheck size={16} /> : <IconAlertCircle size={16} />}
              <span className="text-xs font-bold uppercase tracking-widest">{message.text}</span>
            </div>
          )}

          {/* ADD USER FORM - SYNCED WITH EMPLOYEES */}
          {showAddForm && (
            <Card className="border border-slate-200 bg-transparent shadow-sm rounded-2xl overflow-hidden mb-4 animate-in zoom-in-95 duration-300">
              <CardContent className="p-6">
                <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  
                  <div className="md:col-span-4 space-y-1 mb-2">
                    <label className="text-xs font-bold text-ios-primary uppercase tracking-widest ml-1">Quick Select Employee</label>
                    <div className="relative group">
                      <IconUsers size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select 
                        onChange={(e) => {
                          const emp = availableEmployees.find(x => x.email === e.target.value);
                          if (emp) handleSelectEmployee(emp);
                        }}
                        className="w-full h-10 pl-11 pr-10 bg-transparent border border-slate-200 rounded-xl text-[11px] font-semibold appearance-none focus:outline-none cursor-pointer focus:border-ios-primary focus:ring-1 focus:ring-ios-primary transition-all"
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
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Email Identity</label>
                    <input required type="email" value={newUser.username} onChange={(e) => setNewUser({...newUser, username: e.target.value})} className="w-full h-10 px-4 bg-transparent border border-slate-200 rounded-lg text-[11px] font-semibold focus:outline-none focus:border-ios-primary focus:ring-1 focus:ring-ios-primary transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                    <input required type="text" value={newUser.full_name} onChange={(e) => setNewUser({...newUser, full_name: e.target.value})} className="w-full h-10 px-4 bg-transparent border border-slate-200 rounded-lg text-[11px] font-semibold focus:outline-none focus:border-ios-primary focus:ring-1 focus:ring-ios-primary transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Secure Password (Opsional)</label>
                    <div className="relative">
                      <input type={showPass ? "text" : "password"} value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} placeholder="Kosongkan untuk kirim Setup Link via email" className="w-full h-10 px-4 pr-10 bg-transparent border border-slate-200 rounded-lg text-[11px] font-semibold focus:outline-none focus:border-ios-primary focus:ring-1 focus:ring-ios-primary transition-all" />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ios-primary">
                        {showPass ? <IconEyeOff size={14} /> : <IconEye size={14} />}
                      </button>
                    </div>
                  </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Authority Role</label>
                      <input list="roles" value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})} className="w-full h-10 px-4 bg-transparent border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-ios-primary focus:ring-1 focus:ring-ios-primary transition-all" />
                      <datalist id="roles">
                        {availableRoles.map(role => <option key={role} value={role}>{role.toUpperCase()}</option>)}
                      </datalist>
                    </div>
                  <div className="md:col-span-4 flex justify-end mt-2">
                    <Button type="submit" disabled={isActionLoading} className="h-10 px-8 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-widest rounded-lg shadow-sm">PROVISION ACCOUNT</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <IconLoader2 className="animate-spin text-ios-primary" size={40} />
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Syncing Identity Matrix...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {(activeTab === 'active' ? activeUsers : inactiveUsers).length === 0 ? (
                <EmptyState message="No matching identity records found in this category." />
              ) : (
                (activeTab === 'active' ? activeUsers : inactiveUsers).map((u) => (
                  <UserCard key={u.id} user={u} onToggle={handleToggleStatus} onEdit={setEditingUser} onDelete={handleDeleteUser} isSelected={selectedUsers.includes(u.id)} onSelect={() => handleSelectUser(u.id)} onSendLink={() => handleSendResetLink(u)} />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-sm  animate-in fade-in duration-300">
          <Card className="w-full max-w-lg border border-slate-200 bg-transparent shadow-sm rounded-xl overflow-hidden">
            <CardContent className="p-10 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Modify Authority</h3>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{editingUser.username}</p>
                </div>
                <button onClick={() => setEditingUser(null)} className="h-10 w-10 rounded-full bg-transparent shadow-sm flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"><IconX size={20} /></button>
              </div>
              <form onSubmit={handleUpdateUser} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-2">Legal Identity Name</label>
                  <input required type="text" value={editingUser.full_name} onChange={(e) => setEditingUser({...editingUser, full_name: e.target.value})} className="w-full h-14 px-6 bg-transparent border border-slate-200 rounded-2xl text-[13px] font-bold focus:outline-none focus:border-ios-primary focus:ring-1 focus:ring-ios-primary transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-2">Access Password</label>
                  <div className="relative">
                    <input required type={showEditPass ? "text" : "password"} value={editingUser.password} onChange={(e) => setEditingUser({...editingUser, password: e.target.value})} className="w-full h-14 px-6 pr-14 bg-transparent border border-slate-200 rounded-2xl text-[13px] font-bold focus:outline-none focus:border-ios-primary focus:ring-1 focus:ring-ios-primary transition-all" />
                    <button type="button" onClick={() => setShowEditPass(!showEditPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ios-primary">
                      {showEditPass ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                    </button>
                  </div>
                </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-2">Authority Role</label>
                    <input list="edit-roles" value={editingUser.role} onChange={(e) => setEditingUser({...editingUser, role: e.target.value})} className="w-full h-14 px-6 bg-transparent border border-slate-200 rounded-2xl text-[11px] font-semibold uppercase tracking-widest focus:outline-none focus:border-ios-primary focus:ring-1 focus:ring-ios-primary transition-all" />
                    <datalist id="edit-roles">
                      {availableRoles.map(role => <option key={role} value={role}>{role.toUpperCase()}</option>)}
                    </datalist>
                  </div>
                <Button type="submit" disabled={isActionLoading} className="w-full h-14 bg-ios-primary hover:bg-ios-primary/90 text-white font-bold text-[11px] uppercase tracking-widest rounded-2xl shadow-sm">Save Authorization Changes</Button>
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
  <Card className="border border-slate-200 bg-transparent shadow-sm rounded-xl overflow-hidden transition-all hover:scale-[1.01]">
    <CardContent className="p-3 flex items-center justify-between">
      <div className="space-y-0.5">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{title}</p>
        <p className={`text-lg font-bold tracking-tight ${color}`}>{count}</p>
      </div>
      <div className={`h-8 w-8 rounded-lg bg-white shadow-sm border-none flex items-center justify-center ${color} opacity-70`}>
        {icon}
      </div>
    </CardContent>
  </Card>
);

const TabButton = ({ label, isActive, onClick, count }) => (
  <button 
    onClick={onClick} 
    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
      isActive 
      ? 'bg-transparent shadow-sm text-ios-primary border border-slate-200 font-bold' 
      : 'text-slate-500 hover:text-slate-700 font-medium'
    }`}
  >
    {label} <span className={`px-1.5 py-0.5 rounded-full text-[11px] ${isActive ? 'bg-red-50 text-ios-primary' : 'bg-slate-200 text-slate-600'}`}>{count}</span>
  </button>
);

const UserCard = ({ user, onToggle, onEdit, onDelete, isSelected, onSelect, onSendLink }) => (
  <div className={`bg-transparent border ${isSelected ? 'border-ios-primary bg-red-50/30' : 'border-slate-200'} shadow-sm px-4 py-3 rounded-xl flex items-center justify-between transition-all hover:shadow-sm ${!user.is_active ? 'opacity-70 bg-slate-50/50' : ''}`}>
    <div className="flex items-center gap-4">
      <input type="checkbox" checked={isSelected} onChange={onSelect} className="w-4 h-4 rounded border-slate-300 text-ios-primary cursor-pointer focus:outline-none focus:border-ios-primary focus:ring-2 focus:ring-ios-primary/20 transition-all" />
      <div className={`h-10 w-10 rounded-lg bg-white shadow-sm border-none flex items-center justify-center ${user.is_active ? 'text-ios-primary' : 'text-slate-300'}`}>
        {user.is_active ? <IconUserCircle size={20} /> : <IconLock size={20} />}
      </div>
      <div className="space-y-0.5">
        <h4 className="text-[12px] font-bold text-slate-800 tracking-tight uppercase flex items-center gap-2">
          {user.full_name}
          {!user.is_active && <span className="text-[11px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full tracking-widest font-bold uppercase">Restricted</span>}
        </h4>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <span className="flex items-center gap-1"><IconMail size={12} /> {user.username}</span>
          <span className="text-slate-200">|</span>
          <span className="uppercase text-ios-primary font-bold tracking-widest">{user.role}</span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center gap-1">
        <span className={`text-[11px] font-semibold uppercase tracking-widest ${user.is_active ? 'text-green-600' : 'text-slate-400'}`}>
          {user.is_active ? 'Authorized' : 'Restricted'}
        </span>
        <button 
          onClick={() => onToggle(user)} 
          disabled={user.role === 'owner'} 
          className={`w-10 h-5 rounded-full p-0.5 transition-all duration-300 flex items-center border ${
            user.is_active ? 'bg-red-50 border-red-200' : 'bg-slate-100 border-slate-200'
          }`}
        >
          <div className={`h-3.5 w-3.5 rounded-full transition-all duration-300 transform ${user.is_active ? 'translate-x-5 bg-ios-primary' : 'translate-x-0 bg-slate-400'}`}></div>
        </button>
      </div>
      <div className="h-8 w-[1px] bg-slate-200"></div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => onSendLink(user)} data-tooltip="Send Setup/Reset Password Link" className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:text-green-600 hover:shadow-sm border border-slate-200 hover:scale-105"><IconLink size={14} /></Button>
        <Button variant="ghost" onClick={() => onEdit(user)} data-tooltip="Edit User" className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:text-blue-600 hover:shadow-sm border border-slate-200 hover:scale-105"><IconEdit size={14} /></Button>
        <Button variant="ghost" onClick={() => onDelete(user.id, user.username)} data-tooltip="Delete User" disabled={user.role === 'owner'} className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-ios-primary hover:shadow-sm border border-slate-200 hover:scale-105"><IconTrash size={14} /></Button>
      </div>
    </div>
  </div>
);

const EmptyState = ({ message }) => (
  <div className="py-24 flex flex-col items-center justify-center gap-6 bg-transparent border-2 border-dashed border-slate-200 rounded-2xl">
    <IconChartBar size={48} className="text-slate-300" />
    <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">{message}</p>
  </div>
);

export default UserManager;
