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
                        <button class="btn btn-secondary" style="padding: 6px; border-radius: 8px;" onclick="viewEmployeeDetails(${emp.rowid})" title="Lihat Detail">👁️</button>
                        <button class="btn btn-secondary" style="padding: 6px; border-radius: 8px;" onclick="showEditForm(${emp.rowid})" title="Edit Data">✏️</button>
                        <button class="btn btn-secondary" style="padding: 6px; border-radius: 8px; color: #f59e0b;" onclick="showResignForm(${emp.rowid})" title="Proses Resign">🚪</button>
                        <button class="btn btn-secondary" style="padding: 6px; border-radius: 8px; color: #ef4444;" onclick="deleteEmployee(${emp.rowid})" title="Hapus Data">🗑️</button>
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
