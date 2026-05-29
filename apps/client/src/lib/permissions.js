/**
 * 🛡️ WKNsite Central Permission Registry
 * Defines what each role is authorized to perform within the system.
 */

export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff'
};

export const PERMISSIONS = {
  // Workforce Management
  VIEW_WORKFORCE: 'view_workforce',
  MANAGE_WORKFORCE: 'manage_workforce',
  VIEW_DOSSIER: 'view_dossier',
  
  // Finance & Treasury
  VIEW_TREASURY: 'view_treasury',
  MANAGE_PAYROLL: 'manage_payroll',
  VIEW_REVENUE: 'view_revenue',
  
  // CRM & Sales
  VIEW_CRM: 'view_crm',
  MANAGE_PIPELINE: 'manage_pipeline',
  
  // System Administration
  ACCESS_ADMIN_PANEL: 'access_admin_panel',
  MANAGE_SYSTEM_SETTINGS: 'manage_system_settings',
  MANAGE_RBAC: 'manage_rbac',
  MANAGE_USERS: 'manage_users',
  VIEW_AUDIT_TRAIL: 'view_audit_trail',

  // Attendance & Workforce Optimization
  CAN_CHECK_IN: 'can_check_in',
  VIEW_ATTENDANCE_REPORTS: 'view_attendance_reports',
  MANAGE_ATTENDANCE: 'manage_attendance'
};



export const hasPermission = (user, permission) => {
  if (!user || !user.permissions) return false;
  return user.permissions.includes(permission);
};
