import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  IconShieldCheck, 
  IconUsers, 
  IconCreditCard, 
  IconTrendingUp, 
  IconSettings, 
  IconLockAccess,
  IconCheck,
  IconAlertCircle,
  IconLoader2,
  IconDeviceAnalytics,
  IconPlus,
  IconX
} from "@tabler/icons-react";
import { apiClient } from '@/lib/apiClient';
import { PERMISSIONS, ROLES } from '@/lib/permissions';

const RBACManager = () => {
  const [selectedRole, setSelectedRole] = useState('admin');
  const [rolePermissions, setRolePermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [dynamicRoles, setDynamicRoles] = useState([...Object.values(ROLES)]);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  // Group permissions for better UI
  const permissionGroups = [
    {
      title: "Workforce Management",
      icon: <IconUsers size={20} />,
      items: [
        { id: PERMISSIONS.VIEW_WORKFORCE, label: "View Employee List", desc: "Access the workforce registry and basic info" },
        { id: PERMISSIONS.MANAGE_WORKFORCE, label: "Manage Employees", desc: "Add, edit, or resign employees" },
        { id: PERMISSIONS.VIEW_DOSSIER, label: "View Detailed Dossiers", desc: "Access sensitive employee documents and history" }
      ]
    },
    {
      title: "Finance & Treasury",
      icon: <IconCreditCard size={20} />,
      items: [
        { id: PERMISSIONS.VIEW_TREASURY, label: "View Treasury Center", desc: "Access financial overview and payroll list" },
        { id: PERMISSIONS.MANAGE_PAYROLL, label: "Manage Payroll", desc: "Process salaries and modify financial data" },
        { id: PERMISSIONS.VIEW_REVENUE, label: "Revenue Management", desc: "View invoicing and incoming revenue" }
      ]
    },
    {
      title: "CRM & Sales",
      icon: <IconTrendingUp size={20} />,
      items: [
        { id: PERMISSIONS.VIEW_CRM, label: "Customer Intelligence", desc: "Access client portfolio and pipelines" },
        { id: PERMISSIONS.MANAGE_PIPELINE, label: "Manage Sales Pipeline", desc: "Create and modify leads or deals" }
      ]
    },
    {
      title: "System Administration",
      icon: <IconSettings size={20} />,
      items: [
        { id: PERMISSIONS.ACCESS_ADMIN_PANEL, label: "Admin Control Center", desc: "Access global system management" },
        { id: PERMISSIONS.MANAGE_RBAC, label: "RBAC Authority", desc: "Modify roles and permissions (this page)" },
        { id: PERMISSIONS.VIEW_AUDIT_TRAIL, label: "Audit Logs", desc: "Monitor all system activity and changes" }
      ]
    }
  ];

  useEffect(() => {
    fetchPermissionsForRole();
  }, [selectedRole]);

  const fetchPermissionsForRole = async () => {
    setIsLoading(true);
    try {
      const { data: res } = await apiClient.get(`/api/rbac/permissions/${selectedRole}`);
      const data = res.data;

      setRolePermissions(data.map(p => p.permission_name));
    } catch (err) {
      console.error('Error fetching RBAC:', err);
      // Since some custom roles might not exist in backend yet (if backend hasn't been updated to return them),
      // we'll just set empty array instead of failing hard.
      setRolePermissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    
    const roleKey = newRoleName.trim().toLowerCase().replace(/\s+/g, '_');
    
    // Check if exists
    if (dynamicRoles.includes(roleKey)) {
      setMessage({ type: 'error', text: 'Role already exists!' });
      return;
    }

    setIsLoading(true);
    try {
      // Mock API call to create role metadata if needed
      await new Promise(r => setTimeout(r, 800));
      setDynamicRoles(prev => [...prev, roleKey]);
      setSelectedRole(roleKey);
      setRolePermissions([]);
      setShowAddRoleModal(false);
      setNewRoleName('');
      setMessage({ type: 'success', text: `Role ${roleKey} created successfully!` });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to create role.' });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePermission = (permId) => {
    setRolePermissions(prev => 
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await apiClient.post(`/api/rbac/permissions/${selectedRole}`, {
        permissions: rolePermissions
      });

      setMessage({ type: 'success', text: `Permissions for ${selectedRole.toUpperCase()} updated successfully!` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Save Error:', err);
      setMessage({ type: 'error', text: 'Error saving to Backend.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 h-full overflow-y-auto no-scrollbar bg-[#f8fafc] animate-fade-in">
      <div className="max-w-[1200px] mx-auto space-y-4 pb-20">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-transparent shadow-sm rounded-xl flex items-center justify-center text-ios-primary border border-slate-200">
                <IconLockAccess size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800 tracking-tight uppercase leading-none">RBAC Intelligence Center</h1>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Corporate Access & Authority Management</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button 
              onClick={handleSave} 
              disabled={isSaving || isLoading}
              className="h-10 px-6 bg-ios-primary hover:bg-ios-primary/90 text-white font-bold text-xs uppercase tracking-widest rounded-lg shadow-sm transition-all active:scale-95"
            >
              {isSaving ? <IconLoader2 className="animate-spin mr-2" size={14} /> : <IconShieldCheck className="mr-2" size={14} />}
              Save All Changes
            </Button>
          </div>
        </div>

        {message.text && (
          <div className={`p-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
            {message.type === 'success' ? <IconCheck size={16} /> : <IconAlertCircle size={16} />}
            <span className="text-xs font-bold uppercase tracking-widest">{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* ROLE SELECTOR (Left Sidebar) */}
          <div className="lg:col-span-1 space-y-2">
            <div className="flex items-center justify-between pl-1 mb-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Select Target Role</h3>
              <button 
                onClick={() => setShowAddRoleModal(true)}
                className="text-xs font-bold uppercase text-ios-primary hover:bg-red-50 px-2 py-1 rounded transition-colors flex items-center gap-1 shadow-sm"
              >
                <IconPlus size={10} /> New Role
              </button>
            </div>
            {dynamicRoles.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`w-full p-3 rounded-xl flex items-center justify-between transition-all duration-300 group ${
                  selectedRole === role 
                  ? 'bg-transparent border border-ios-primary shadow-sm' 
                  : 'bg-transparent border border-slate-200 hover:border-slate-200 shadow-sm hover:scale-[1.01]'
                }`}
              >
                <div className="flex flex-col items-start text-left">
                  <span className={`text-xs font-bold uppercase tracking-widest ${selectedRole === role ? 'text-ios-primary' : 'text-slate-600'}`}>{role}</span>
                  <span className="text-[11px] text-slate-400 font-bold">System Hierarchy {role === 'owner' ? '0' : '1'}</span>
                </div>
                <div className={`h-6 w-6 rounded-lg flex items-center justify-center transition-all ${selectedRole === role ? 'bg-ios-primary text-white shadow-sm' : 'bg-slate-50 text-slate-400 border border-slate-200 shadow-sm'}`}>
                  <IconShieldCheck size={12} />
                </div>
              </button>
            ))}
            
            <Card className="mt-6 border border-slate-700 bg-slate-800 text-white rounded-xl overflow-hidden shadow-sm">
              <CardContent className="p-4 space-y-2">
                <div className="h-8 w-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <IconDeviceAnalytics size={16} className="text-red-400" />
                </div>
                <p className="text-[11px] font-semibold leading-tight opacity-70">
                  Changes will instantly reflect across the network for the selected role.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* PERMISSION GRID (Main Area) */}
          <div className="lg:col-span-4">
            {isLoading ? (
              <div className="h-64 flex flex-col items-center justify-center gap-4">
                <IconLoader2 className="animate-spin text-ios-primary" size={32} />
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Syncing Matrix...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {permissionGroups.map((group, gIdx) => (
                  <Card key={gIdx} className="border border-slate-200 shadow-sm bg-transparent rounded-xl overflow-hidden transition-all hover:shadow-sm">
                    <CardHeader className="border-b border-slate-200 bg-slate-50/50 px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="text-ios-primary opacity-70">{React.cloneElement(group.icon, { size: 16 })}</div>
                        <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-widest">{group.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      {group.items.map((item) => (
                        <div 
                          key={item.id} 
                          onClick={() => togglePermission(item.id)}
                          className="flex items-start gap-3 cursor-pointer group"
                        >
                          <div className={`mt-0.5 h-5 w-5 rounded border flex items-center justify-center transition-all ${
                            rolePermissions.includes(item.id) 
                            ? 'bg-ios-primary border-ios-primary' 
                            : 'border-slate-200 bg-transparent'
                          }`}>
                            {rolePermissions.includes(item.id) && <IconCheck size={14} className="text-white" stroke={4} />}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className={`text-[11px] font-semibold transition-colors ${rolePermissions.includes(item.id) ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>
                              {item.label}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium leading-tight">
                              {item.desc}
                            </span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Add Role Modal */}
      {showAddRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-sm  animate-in fade-in duration-300">
          <Card className="w-full max-w-md border border-slate-200 bg-slate-50/90 shadow-sm rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <IconShieldCheck className="text-ios-primary" />
                  Create Custom Role
                </h3>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                  Define a new authority group
                </p>
              </div>
              <Button variant="ghost" onClick={() => setShowAddRoleModal(false)} className="h-10 w-10 p-0 rounded-full text-slate-500 hover:text-red-500 shadow-sm flex items-center justify-center">
                <IconX size={18} />
              </Button>
            </div>
            <form onSubmit={handleCreateRole} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-2">Role Name</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  value={newRoleName} 
                  onChange={(e) => setNewRoleName(e.target.value)} 
                  placeholder="e.g. HR Assistant, IT Support" 
                  className="w-full h-12 px-6 bg-transparent border border-slate-200 shadow-sm rounded-2xl text-[12px] font-bold focus:outline-none focus:border-ios-primary transition-all" 
                />
              </div>
              <div className="pt-4">
                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-ios-primary hover:bg-ios-primary/90 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-sm transition-all"
                >
                  {isLoading ? <IconLoader2 className="animate-spin mr-2" size={16} /> : <IconPlus className="mr-2" size={16} />}
                  Create Role
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RBACManager;
