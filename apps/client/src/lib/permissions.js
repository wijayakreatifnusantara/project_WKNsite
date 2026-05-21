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

const ROLE_PERMISSIONS = {
  [ROLES.OWNER]: Object.values(PERMISSIONS), // Owner has ALL permissions
  
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_WORKFORCE,
    PERMISSIONS.MANAGE_WORKFORCE,
    PERMISSIONS.VIEW_DOSSIER,
    PERMISSIONS.VIEW_TREASURY,
    PERMISSIONS.MANAGE_PAYROLL,
    PERMISSIONS.VIEW_REVENUE,
    PERMISSIONS.VIEW_CRM,
    PERMISSIONS.MANAGE_PIPELINE,
    PERMISSIONS.ACCESS_ADMIN_PANEL,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_AUDIT_TRAIL,
    PERMISSIONS.CAN_CHECK_IN,
    PERMISSIONS.VIEW_ATTENDANCE_REPORTS,
    PERMISSIONS.MANAGE_ATTENDANCE
  ],
  
  [ROLES.MANAGER]: [
    PERMISSIONS.VIEW_WORKFORCE,
    PERMISSIONS.VIEW_DOSSIER,
    PERMISSIONS.VIEW_TREASURY,
    PERMISSIONS.VIEW_REVENUE,
    PERMISSIONS.VIEW_CRM,
    PERMISSIONS.MANAGE_PIPELINE,
    PERMISSIONS.CAN_CHECK_IN,
    PERMISSIONS.VIEW_ATTENDANCE_REPORTS
  ],
  
  [ROLES.STAFF]: [
    PERMISSIONS.VIEW_WORKFORCE,
    PERMISSIONS.VIEW_CRM,
    PERMISSIONS.CAN_CHECK_IN
  ]
};

/**
 * Validates if a specific role has the required permission.
 */
export const hasPermission = (role, permission) => {
  if (!role) return false;
  const userPermissions = ROLE_PERMISSIONS[role.toLowerCase()] || [];
  return userPermissions.includes(permission);
};
