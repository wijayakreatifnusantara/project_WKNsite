export const EmployeeModal = {
    render: (mode = 'add', employee = {}) => {
        const isEdit = mode === 'edit';
        const title = isEdit ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru';
        const buttonText = isEdit ? 'Update Karyawan' : 'Simpan Karyawan';

        return `
            <div class="modal-card">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="close-modal" id="close-modal">&times;</button>
                </div>
                <form id="employee-form" data-mode="${mode}" data-rowid="${employee.rowid || ''}">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Full Name *</label>
                            <input type="text" name="Full Name *" class="form-input" placeholder="Nama Lengkap" value="${employee['Full Name *'] || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Employee ID / NIK *</label>
                            <input type="text" name="Employee ID *" class="form-input" placeholder="Contoh: 2024001" value="${employee['Employee ID *'] || ''}" required ${isEdit ? 'readonly style="background: #f1f5f9;"' : ''}>
                        </div>
                        <div class="form-group">
                            <label>Email *</label>
                            <input type="email" name="Email *" class="form-input" placeholder="nama@wijayakn.com" value="${employee['Email *'] || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Job Position *</label>
                            <input type="text" name="Job Position *" class="form-input" placeholder="Contoh: Senior Developer" value="${employee['Job Position *'] || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Organization Name * (Departemen)</label>
                            <input type="text" name="Organization Name *" class="form-input" placeholder="Contoh: IT Support" value="${employee['Organization Name *'] || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Mobile Phone Number</label>
                            <input type="text" name="Mobile Phone Number" class="form-input" placeholder="0812..." value="${employee['Mobile Phone Number'] || ''}">
                        </div>
                        <div class="form-group">
                            <label>Join Date *</label>
                            <input type="date" name="Join Date *" class="form-input" value="${employee['Join Date *'] || ''}" required>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="cancel-modal">Batal</button>
                        <button type="submit" class="btn btn-primary">${buttonText}</button>
                    </div>
                </form>
            </div>
        `;
    }
};
