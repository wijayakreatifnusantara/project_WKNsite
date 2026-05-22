export const EmployeeTable = {
    render: (employees = []) => {
        if (employees.length === 0) {
            return `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 4rem; color: var(--text-muted);">
                        <div style="font-size: 2rem; margin-bottom: 1rem;">📁</div>
                        <p style="font-weight: 500;">Tidak ada data karyawan ditemukan.</p>
                    </td>
                </tr>
            `;
        }

        return employees.map(emp => `
            <tr class="table-row-hover">
                <td style="padding: 1rem; text-align: center; white-space: nowrap;">
                    <div style="display: flex; gap: 4px; justify-content: center;">
                        <button class="btn btn-secondary" style="padding: 6px; border-radius: 8px;" onclick="viewEmployeeDetails(${emp.rowid})" title="Lihat Detail"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
                        <button class="btn btn-secondary" style="padding: 6px; border-radius: 8px;" onclick="showEditForm(${emp.rowid})" title="Edit Data"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                        <button class="btn btn-secondary" style="padding: 6px; border-radius: 8px; color: #f59e0b;" onclick="showResignForm(${emp.rowid})" title="Proses Resign"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg></button>
                        <button class="btn btn-secondary" style="padding: 6px; border-radius: 8px; color: #ef4444;" onclick="deleteEmployee(${emp.rowid})" title="Hapus Data"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>
                    </div>
                </td>
                <td style="padding: 1rem;"><span style="font-family: monospace; font-weight: 700; color: var(--primary-color);">${emp['Employee ID *'] || '-'}</span></td>
                <td style="padding: 1rem;">
                    <div style="font-weight: 700; color: var(--text-main);">${emp['Full Name *'] || '-'}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${emp['Email *'] || '-'}</div>
                </td>
                <td style="padding: 1rem;"><span style="font-size: 0.8125rem; font-weight: 500;">${emp['Organization Name *'] || '-'}</span></td>
                <td style="padding: 1rem;"><span style="font-size: 0.8125rem;">${emp['Job Position *'] || '-'}</span></td>
                <td style="padding: 1rem;">
                    <span class="status-badge" style="background: #dcfce7; color: #166534; border: 1px solid #bbf7d0;">
                        ${emp['Employment Status *'] || 'Active'}
                    </span>
                </td>
            </tr>
        `).join('');
    }
};
