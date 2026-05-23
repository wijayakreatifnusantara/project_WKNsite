import os
import tempfile
import requests
from datetime import datetime
from fpdf import FPDF
from utils.supabase_client import supabase_client

class RequestPDFGenerator:
    """PDF Generator for Leave and Overtime Requests with auto-embedded signatures"""
    
    @staticmethod
    def _download_image(url: str) -> str:
        """Downloads a public image to a temp file and returns its path"""
        if not url:
            return None
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                temp_dir = tempfile.gettempdir()
                # Create a unique temp file name with png extension
                temp_path = os.path.join(temp_dir, f"sig_{os.urandom(8).hex()}.png")
                with open(temp_path, "wb") as f:
                    f.write(response.content)
                return temp_path
        except Exception as e:
            print(f"[PDF Generator] Failed to download signature from {url}: {e}")
        return None

    @classmethod
    async def generate_leave_pdf(cls, request_id: str, employee_data: dict, request_data: dict, manager_signature_url: str = None) -> str:
        """Generates Leave Request PDF and uploads to Supabase storage"""
        pdf = FPDF(orientation="P", unit="mm", format="A4")
        pdf.add_page()
        
        # 1. Header (Kop Surat WKN)
        pdf.set_font("Helvetica", "B", 16)
        pdf.set_text_color(227, 30, 36) # WKN Red
        pdf.cell(0, 8, "PT. WIJAYA KARYA NUSANTARA", ln=True, align="C")
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(100, 116, 139)
        pdf.cell(0, 5, "Intelligent Construction & Infrastructure Ecosystem Development", ln=True, align="C")
        pdf.cell(0, 5, "Email: contact@wijayakn.com | Website: www.wijayakn.com", ln=True, align="C")
        
        # Double border line
        pdf.set_draw_color(227, 30, 36)
        pdf.set_line_width(0.8)
        pdf.line(10, 30, 200, 30)
        pdf.set_draw_color(30, 41, 59)
        pdf.set_line_width(0.2)
        pdf.line(10, 31, 200, 31)
        pdf.ln(10)
        
        # 2. Document Title
        pdf.set_font("Helvetica", "B", 14)
        pdf.set_text_color(30, 41, 59)
        pdf.cell(0, 10, "SURAT PENGAJUAN IZIN / SAKIT / CUTI KARYAWAN", ln=True, align="C")
        pdf.set_font("Helvetica", "", 10)
        pdf.cell(0, 5, f"No. Ref: WKN/LEAVE/{request_id[:8].upper()}", ln=True, align="C")
        pdf.ln(8)
        
        # 3. Metadata Table
        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(0, 8, "I. DETAIL IDENTITAS KARYAWAN", ln=True)
        pdf.set_font("Helvetica", "", 10)
        
        # Table helper
        def draw_row(label, val):
            pdf.set_font("Helvetica", "B", 10)
            pdf.cell(50, 7, f"  {label}", border=1)
            pdf.set_font("Helvetica", "", 10)
            pdf.cell(0, 7, f"  {val}", border=1, ln=True)
            
        draw_row("Nama Lengkap", employee_data.get("name", "N/A"))
        draw_row("ID Karyawan", employee_data.get("employee_id") or employee_data.get("id", "N/A"))
        draw_row("Jabatan", employee_data.get("job_position", "N/A"))
        draw_row("Organisasi / Divisi", employee_data.get("organization_name", "N/A"))
        pdf.ln(8)
        
        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(0, 8, "II. DETAIL PENGAJUAN ABSEN / CUTI", ln=True)
        pdf.set_font("Helvetica", "", 10)
        
        leave_type_labels = {
            "Annual": "Cuti Tahunan (Annual Leave)",
            "Sick": "Sakit (Sick Leave)",
            "Emergency": "Izin Darurat (Emergency)",
            "Unpaid": "Izin Tanpa Upah (Unpaid Leave)"
        }
        
        leave_type = request_data.get("leave_type")
        leave_label = leave_type_labels.get(leave_type, leave_type)
        
        draw_row("Jenis Pengajuan", leave_label)
        draw_row("Tanggal Mulai", request_data.get("start_date"))
        draw_row("Tanggal Selesai", request_data.get("end_date"))
        draw_row("Total Hari Kerja", f"{request_data.get('days_count', 0)} Hari")
        
        # Reason block
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(50, 15, "  Alasan Keperluan", border=1)
        pdf.set_font("Helvetica", "", 10)
        # Using multi_cell for reason to wrap long text
        x, y = pdf.get_x(), pdf.get_y()
        pdf.multi_cell(0, 5, f"  {request_data.get('reason', '')}", border=1)
        pdf.set_y(y + 15)
        pdf.ln(6)
        
        # 4. Status Approval
        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(0, 8, "III. STATUS PERSETUJUAN (APPROVAL)", ln=True)
        pdf.set_font("Helvetica", "", 10)
        
        status = request_data.get("status", "Pending")
        status_label = "MENUNGGU (PENDING)"
        if status == "Approved":
            status_label = "DISETUJUI (APPROVED)"
        elif status == "Rejected":
            status_label = "DITOLAK (REJECTED)"
            
        draw_row("Status Dokumen", status_label)
        draw_row("Waktu Pengajuan", request_data.get("applied_at") or datetime.now().isoformat())
        pdf.ln(12)
        
        # 5. Signatures area
        # We need to position signatures side by side
        # Left: Manager/Owner, Right: Employee
        y_start = pdf.get_y()
        
        # Downloader for signatures
        emp_sig_path = cls._download_image(employee_data.get("signature_url"))
        mgr_sig_path = cls._download_image(manager_signature_url) if status == "Approved" else None
        
        # Manager Column
        pdf.set_xy(10, y_start)
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(85, 5, "MENGETAHUI / MENYETUJUI,", ln=False, align="C")
        
        # Employee Column
        pdf.set_xy(110, y_start)
        pdf.cell(85, 5, "KARYAWAN PEMOHON,", ln=True, align="C")
        
        # Space for signatures (draw images if available)
        img_y = pdf.get_y() + 2
        
        # Embed Manager Signature
        if mgr_sig_path and os.path.exists(mgr_sig_path):
            pdf.image(mgr_sig_path, x=37, y=img_y, w=30, h=18)
        else:
            pdf.set_xy(10, img_y + 8)
            pdf.set_font("Helvetica", "I", 9)
            pdf.set_text_color(148, 163, 184)
            pdf.cell(85, 5, "(Belum ditandatangani)" if status != "Approved" else "(Tanda tangan digital)", ln=False, align="C")
            pdf.set_text_color(30, 41, 59)
            
        # Embed Employee Signature
        if emp_sig_path and os.path.exists(emp_sig_path):
            pdf.image(emp_sig_path, x=137, y=img_y, w=30, h=18)
        else:
            pdf.set_xy(110, img_y + 8)
            pdf.set_font("Helvetica", "I", 9)
            pdf.set_text_color(148, 163, 184)
            pdf.cell(85, 5, "(Belum ditandatangani)", ln=True, align="C")
            pdf.set_text_color(30, 41, 59)
            
        # Printed Names
        pdf.set_xy(10, img_y + 22)
        pdf.set_font("Helvetica", "B", 10)
        # Fetch manager name
        mgr_name = "MANAGER / OWNER"
        if status == "Approved" and request_data.get("approved_by"):
            try:
                # Retrieve approver details
                appr_res = supabase_client.client.table("employees").select("name").eq("id", request_data.get("approved_by")).execute()
                if appr_res.data:
                    mgr_name = appr_res.data[0].get("name", "MANAGER / OWNER")
            except Exception:
                pass
        pdf.cell(85, 5, f"({mgr_name})", ln=False, align="C")
        
        pdf.set_xy(110, img_y + 22)
        pdf.cell(85, 5, f"({employee_data.get('name', 'N/A')})", ln=True, align="C")
        
        # Cleanup temporary files
        for p in [emp_sig_path, mgr_sig_path]:
            if p and os.path.exists(p):
                try:
                    os.remove(p)
                except Exception:
                    pass
                    
        # Save PDF to temporary file
        temp_pdf_dir = tempfile.gettempdir()
        temp_pdf_path = os.path.join(temp_pdf_dir, f"leave_{request_id}.pdf")
        pdf.output(temp_pdf_path)
        
        # Upload to Supabase Storage
        uploaded_url = await cls._upload_pdf_to_storage(temp_pdf_path, f"requests/leave_{request_id}.pdf")
        
        # Clean up local PDF
        if os.path.exists(temp_pdf_path):
            try:
                os.remove(temp_pdf_path)
            except Exception:
                pass
                
        return uploaded_url

    @classmethod
    async def generate_overtime_pdf(cls, request_id: str, employee_data: dict, request_data: dict, manager_signature_url: str = None) -> str:
        """Generates Overtime Request PDF and uploads to Supabase storage"""
        pdf = FPDF(orientation="P", unit="mm", format="A4")
        pdf.add_page()
        
        # 1. Header (Kop Surat WKN)
        pdf.set_font("Helvetica", "B", 16)
        pdf.set_text_color(227, 30, 36) # WKN Red
        pdf.cell(0, 8, "PT. WIJAYA KARYA NUSANTARA", ln=True, align="C")
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(100, 116, 139)
        pdf.cell(0, 5, "Intelligent Construction & Infrastructure Ecosystem Development", ln=True, align="C")
        pdf.cell(0, 5, "Email: contact@wijayakn.com | Website: www.wijayakn.com", ln=True, align="C")
        
        # Double border line
        pdf.set_draw_color(227, 30, 36)
        pdf.set_line_width(0.8)
        pdf.line(10, 30, 200, 30)
        pdf.set_draw_color(30, 41, 59)
        pdf.set_line_width(0.2)
        pdf.line(10, 31, 200, 31)
        pdf.ln(10)
        
        # 2. Document Title
        pdf.set_font("Helvetica", "B", 14)
        pdf.set_text_color(30, 41, 59)
        pdf.cell(0, 10, "SURAT PERINTAH & PERTANGGUNGJAWABAN LEMBUR", ln=True, align="C")
        pdf.set_font("Helvetica", "", 10)
        pdf.cell(0, 5, f"No. Ref: WKN/OVERTIME/{request_id[:8].upper()}", ln=True, align="C")
        pdf.ln(8)
        
        # 3. Metadata Table
        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(0, 8, "I. DETAIL IDENTITAS KARYAWAN", ln=True)
        pdf.set_font("Helvetica", "", 10)
        
        # Table helper
        def draw_row(label, val):
            pdf.set_font("Helvetica", "B", 10)
            pdf.cell(50, 7, f"  {label}", border=1)
            pdf.set_font("Helvetica", "", 10)
            pdf.cell(0, 7, f"  {val}", border=1, ln=True)
            
        draw_row("Nama Lengkap", employee_data.get("name", "N/A"))
        draw_row("ID Karyawan", employee_data.get("employee_id") or employee_data.get("id", "N/A"))
        draw_row("Jabatan", employee_data.get("job_position", "N/A"))
        draw_row("Organisasi / Divisi", employee_data.get("organization_name", "N/A"))
        pdf.ln(8)
        
        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(0, 8, "II. DETAIL PENUGASAN LEMBUR", ln=True)
        pdf.set_font("Helvetica", "", 10)
        
        draw_row("Tanggal Lembur", request_data.get("date"))
        draw_row("Jam Mulai", request_data.get("start_time"))
        draw_row("Jam Selesai", request_data.get("end_time"))
        draw_row("Total Durasi", f"{request_data.get('duration_hours', 0)} Jam")
        
        # Reason block
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(50, 15, "  Tugas / Alasan Lembur", border=1)
        pdf.set_font("Helvetica", "", 10)
        # Using multi_cell for reason to wrap long text
        y = pdf.get_y()
        pdf.multi_cell(0, 5, f"  {request_data.get('reason', '')}", border=1)
        pdf.set_y(y + 15)
        pdf.ln(6)
        
        # 4. Status Approval
        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(0, 8, "III. STATUS OTORISASI", ln=True)
        pdf.set_font("Helvetica", "", 10)
        
        status = request_data.get("status", "Pending")
        status_label = "MENUNGGU (PENDING)"
        if status == "Approved":
            status_label = "DISETUJUI (APPROVED)"
        elif status == "Rejected":
            status_label = "DITOLAK (REJECTED)"
            
        draw_row("Status Lembur", status_label)
        draw_row("Waktu Pembuatan", request_data.get("created_at") or datetime.now().isoformat())
        pdf.ln(12)
        
        # 5. Signatures area
        y_start = pdf.get_y()
        
        emp_sig_path = cls._download_image(employee_data.get("signature_url"))
        mgr_sig_path = cls._download_image(manager_signature_url) if status == "Approved" else None
        
        # Manager Column
        pdf.set_xy(10, y_start)
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(85, 5, "MENGETAHUI / MENYETUJUI,", ln=False, align="C")
        
        # Employee Column
        pdf.set_xy(110, y_start)
        pdf.cell(85, 5, "KARYAWAN YANG DITUGASKAN,", ln=True, align="C")
        
        # Space for signatures (draw images if available)
        img_y = pdf.get_y() + 2
        
        # Embed Manager Signature
        if mgr_sig_path and os.path.exists(mgr_sig_path):
            pdf.image(mgr_sig_path, x=37, y=img_y, w=30, h=18)
        else:
            pdf.set_xy(10, img_y + 8)
            pdf.set_font("Helvetica", "I", 9)
            pdf.set_text_color(148, 163, 184)
            pdf.cell(85, 5, "(Belum ditandatangani)" if status != "Approved" else "(Tanda tangan digital)", ln=False, align="C")
            pdf.set_text_color(30, 41, 59)
            
        # Embed Employee Signature
        if emp_sig_path and os.path.exists(emp_sig_path):
            pdf.image(emp_sig_path, x=137, y=img_y, w=30, h=18)
        else:
            pdf.set_xy(110, img_y + 8)
            pdf.set_font("Helvetica", "I", 9)
            pdf.set_text_color(148, 163, 184)
            pdf.cell(85, 5, "(Belum ditandatangani)", ln=True, align="C")
            pdf.set_text_color(30, 41, 59)
            
        # Printed Names
        pdf.set_xy(10, img_y + 22)
        pdf.set_font("Helvetica", "B", 10)
        mgr_name = "MANAGER / OWNER"
        if status == "Approved" and request_data.get("approved_by"):
            try:
                appr_res = supabase_client.client.table("employees").select("name").eq("id", request_data.get("approved_by")).execute()
                if appr_res.data:
                    mgr_name = appr_res.data[0].get("name", "MANAGER / OWNER")
            except Exception:
                pass
        pdf.cell(85, 5, f"({mgr_name})", ln=False, align="C")
        
        pdf.set_xy(110, img_y + 22)
        pdf.cell(85, 5, f"({employee_data.get('name', 'N/A')})", ln=True, align="C")
        
        # Cleanup temporary files
        for p in [emp_sig_path, mgr_sig_path]:
            if p and os.path.exists(p):
                try:
                    os.remove(p)
                except Exception:
                    pass
                    
        # Save PDF to temporary file
        temp_pdf_dir = tempfile.gettempdir()
        temp_pdf_path = os.path.join(temp_pdf_dir, f"overtime_{request_id}.pdf")
        pdf.output(temp_pdf_path)
        
        # Upload to Supabase Storage
        uploaded_url = await cls._upload_pdf_to_storage(temp_pdf_path, f"requests/overtime_{request_id}.pdf")
        
        # Clean up local PDF
        if os.path.exists(temp_pdf_path):
            try:
                os.remove(temp_pdf_path)
            except Exception:
                pass
                
        return uploaded_url

    @classmethod
    async def _upload_pdf_to_storage(cls, file_path: str, remote_path: str) -> str:
        """Uploads local PDF to Supabase Storage 'documents' bucket and returns its public URL"""
        if not supabase_client.client:
            raise Exception("Supabase client not initialized")
            
        # Ensure 'documents' bucket exists programmatically
        try:
            buckets = supabase_client.client.storage.list_buckets()
            doc_bucket_exists = any(b.name == "documents" for b in buckets)
            if not doc_bucket_exists:
                supabase_client.client.storage.create_bucket("documents", options={"public": True})
                print("[PDF Generator] Created 'documents' bucket in Supabase storage.")
        except Exception as bucket_err:
            print(f"[PDF Generator] Warning checking/creating bucket: {bucket_err}")
            
        # Upload file
        try:
            with open(file_path, "rb") as f:
                # Upload with upsert=True to overwrite when approval state changes
                res = supabase_client.client.storage.from_("documents").upload(
                    path=remote_path,
                    file=f,
                    file_options={"content-type": "application/pdf", "x-upsert": "true"}
                )
                
            # Get public URL
            public_url_res = supabase_client.client.storage.from_("documents").get_public_url(remote_path)
            return public_url_res
        except Exception as upload_err:
            print(f"[PDF Generator] Error uploading PDF to storage: {upload_err}")
            raise upload_err
