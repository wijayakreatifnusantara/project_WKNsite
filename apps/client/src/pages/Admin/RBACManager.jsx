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
  IconDeviceAnalytics
} from "@tabler/icons-react";
import { supabase } from '@/lib/supabaseClient';
import { PERMISSIONS, ROLES } from '@/lib/permissions';

const RBACManager = () => {
  const [selectedRole, setSelectedRole] = useState('admin');
  const [rolePermissions, setRolePermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

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
      const { data, error } = await supabase
        .from('role_permissions')
        .select('permission_name')
        .eq('role_name', selectedRole);

      if (error) throw error;
      setRolePermissions(data.map(p => p.permission_name));
    } catch (err) {
      console.error('Error fetching RBAC:', err);
      setMessage({ type: 'error', text: 'Failed to sync with Supabase.' });
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
      // 1. Delete all current permissions for this role
      await supabase.from('role_permissions').delete().eq('role_name', selectedRole);

      // 2. Insert new set of permissions
      if (rolePermissions.length > 0) {
        const insertData = rolePermissions.map(p => ({
          role_name: selectedRole,
          permission_name: p
        }));
        const { error } = await supabase.from('role_permissions').insert(insertData);
        if (error) throw error;
      }

      setMessage({ type: 'success', text: `Permissions for ${selectedRole.toUpperCase()} updated successfully!` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Save Error:', err);
      setMessage({ type: 'error', text: 'Error saving to Supabase. Check RLS policies.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 h-full overflow-y-auto no-scrollbar bg-[#f0f2f5] animate-fade-in">
      <div className="max-w-[1200px] mx-auto space-y-4 pb-20">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff] rounded-xl flex items-center justify-center text-[#E31E24] border border-white">
                <IconLockAccess size={20} />
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-800 tracking-tight uppercase leading-none">RBAC Intelligence Center</h1>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Corporate Access & Authority Management</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button 
              onClick={handleSave} 
              disabled={isSaving || isLoading}
              className="h-10 px-6 bg-[#E31E24] hover:bg-[#C1181E] text-white font-black text-[9px] uppercase tracking-widest rounded-lg shadow-md transition-all active:scale-95"
            >
              {isSaving ? <IconLoader2 className="animate-spin mr-2" size={14} /> : <IconShieldCheck className="mr-2" size={14} />}
              Save All Changes
            </Button>
          </div>
        </div>

        {message.text && (
          <div className={`p-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
            {message.type === 'success' ? <IconCheck size={16} /> : <IconAlertCircle size={16} />}
            <span className="text-[10px] font-black uppercase tracking-widest">{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* ROLE SELECTOR (Left Sidebar) */}
          <div className="lg:col-span-1 space-y-2">
            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2">Select Target Role</h3>
            {Object.values(ROLES).map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`w-full p-3 rounded-xl flex items-center justify-between transition-all duration-300 group ${
                  selectedRole === role 
                  ? 'bg-[#f0f2f5] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] border border-white' 
                  : 'bg-[#f0f2f5] shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff] hover:scale-[1.01]'
                }`}
              >
                <div className="flex flex-col items-start text-left">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${selectedRole === role ? 'text-[#E31E24]' : 'text-slate-600'}`}>{role}</span>
                  <span className="text-[7px] text-slate-400 font-bold">System Hierarchy {role === 'owner' ? '0' : '1'}</span>
                </div>
                <div className={`h-6 w-6 rounded-lg flex items-center justify-center transition-all ${selectedRole === role ? 'bg-[#E31E24] text-white shadow-sm' : 'bg-white text-slate-300 shadow-sm'}`}>
                  <IconShieldCheck size={12} />
                </div>
              </button>
            ))}
            
            <Card className="mt-6 border-white border-2 bg-slate-800 text-white rounded-xl overflow-hidden shadow-lg">
              <CardContent className="p-4 space-y-2">
                <div className="h-8 w-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <IconDeviceAnalytics size={16} className="text-red-400" />
                </div>
                <p className="text-[8px] font-bold leading-tight opacity-70">
                  Changes will instantly reflect across the network for the selected role.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* PERMISSION GRID (Main Area) */}
          <div className="lg:col-span-4">
            {isLoading ? (
              <div className="h-64 flex flex-col items-center justify-center gap-4">
                <IconLoader2 className="animate-spin text-[#E31E24]" size={32} />
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Syncing Matrix...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {permissionGroups.map((group, gIdx) => (
                  <Card key={gIdx} className="border-white border-2 shadow-sm bg-[#f0f2f5] rounded-xl overflow-hidden transition-all hover:shadow-md">
                    <CardHeader className="border-b border-white/50 bg-white/30 px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="text-[#E31E24] opacity-70">{React.cloneElement(group.icon, { size: 16 })}</div>
                        <CardTitle className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{group.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      {group.items.map((item) => (
                        <div 
                          key={item.id} 
                          onClick={() => togglePermission(item.id)}
                          className="flex items-start gap-3 cursor-pointer group"
                        >
                          <div className={`mt-0.5 h-5 w-5 rounded bg-white border-2 flex items-center justify-center transition-all ${
                            rolePermissions.includes(item.id) 
                            ? 'bg-[#E31E24] border-[#E31E24] shadow-sm shadow-red-200' 
                            : 'border-slate-200'
                          }`}>
                            {rolePermissions.includes(item.id) && <IconCheck size={14} className="text-white" stroke={4} />}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className={`text-[11px] font-black transition-colors ${rolePermissions.includes(item.id) ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>
                              {item.label}
                            </span>
                            <span className="text-[8px] text-slate-400 font-medium leading-tight">
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
    </div>
  );
};

export default RBACManager;
