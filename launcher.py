import os
import sys
import time
import re
import socket
import threading
import subprocess
import webbrowser
import tkinter as tk
from tkinter import messagebox
import customtkinter as ctk
from PIL import Image, ImageTk
import qrcode

# Configure CustomTkinter
ctk.set_appearance_mode("Dark")
ctk.set_default_color_theme("dark-blue")

# Base Directories
if getattr(sys, 'frozen', False):
    APP_DIR = os.path.dirname(sys.executable)
else:
    APP_DIR = os.path.dirname(os.path.abspath(__file__))

PORT = 3000
LOCAL_URL = f"http://localhost:{PORT}"

class PortfolioLauncher(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("Chatdanai Portfolio Launcher — Server & Cloudflare Share")
        self.geometry("780x720")
        self.minsize(740, 680)

        # Set Window Icon
        icon_path = os.path.join(APP_DIR, "icon.ico")
        if os.path.exists(icon_path):
            try:
                self.iconbitmap(icon_path)
            except Exception:
                pass

        self.configure(fg_color="#0B0E14")

        # Process References
        self.node_process = None
        self.cloudflared_process = None
        self.public_url = None
        self.is_running = False

        # Build UI
        self.build_ui()

        # Handle Window Close Event
        self.protocol("WM_DELETE_WINDOW", self.on_close)

        # Auto-start on launch
        self.after(500, self.start_services)

    def build_ui(self):
        # 1. Header Frame
        header_frame = ctk.CTkFrame(self, fg_color="#121620", corner_radius=12, border_width=1, border_color="#232938")
        header_frame.pack(fill="x", padx=16, pady=(16, 10))

        header_content = ctk.CTkFrame(header_frame, fg_color="transparent")
        header_content.pack(fill="x", padx=16, pady=12)

        # Title Group
        title_label = ctk.CTkLabel(
            header_content,
            text="CHATDANAI.S — PORTFOLIO LAUNCHER",
            font=ctk.CTkFont(family="Segoe UI", size=20, weight="bold"),
            text_color="#F59E0B"
        )
        title_label.pack(anchor="w")

        subtitle_label = ctk.CTkLabel(
            header_content,
            text="ระบบควบคุมเซิร์ฟเวอร์พอร์ตโฟลิโอ & แชร์ออนไลน์ผ่าน Cloudflare Tunnel (HTTPS)",
            font=ctk.CTkFont(family="Segoe UI", size=12),
            text_color="#9CA3AF"
        )
        subtitle_label.pack(anchor="w", pady=(2, 0))

        # 2. Main Columns Frame (Left: Control & Links / Right: QR Code)
        cols_frame = ctk.CTkFrame(self, fg_color="transparent")
        cols_frame.pack(fill="x", padx=16, pady=6)
        cols_frame.grid_columnconfigure(0, weight=3)
        cols_frame.grid_columnconfigure(1, weight=2)

        # --- LEFT COLUMN: Cards & Controls ---
        left_col = ctk.CTkFrame(cols_frame, fg_color="transparent")
        left_col.grid(row=0, column=0, sticky="nsew", padx=(0, 8))

        # Card A: Local Server
        local_card = ctk.CTkFrame(left_col, fg_color="#151922", corner_radius=10, border_width=1, border_color="#242B3B")
        local_card.pack(fill="x", pady=(0, 10))

        local_header = ctk.CTkFrame(local_card, fg_color="transparent")
        local_header.pack(fill="x", padx=14, pady=(10, 4))

        ctk.CTkLabel(
            local_header,
            text="เซิร์ฟเวอร์ในเครื่อง (Local Server)",
            font=ctk.CTkFont(family="Segoe UI", size=14, weight="bold"),
            text_color="#F3F4F6"
        ).pack(side="left")

        self.local_status_badge = ctk.CTkLabel(
            local_header,
            text="● กำลังตรวจสอบ...",
            font=ctk.CTkFont(family="Segoe UI", size=12, weight="bold"),
            text_color="#F59E0B"
        )
        self.local_status_badge.pack(side="right")

        local_body = ctk.CTkFrame(local_card, fg_color="transparent")
        local_body.pack(fill="x", padx=14, pady=(0, 12))

        self.btn_open_local = ctk.CTkButton(
            local_body,
            text="🌐 เปิดเว็บไซต์ในเครื่อง (localhost:3000)",
            command=self.open_local_browser,
            fg_color="#1E293B",
            hover_color="#334155",
            text_color="#38BDF8",
            font=ctk.CTkFont(family="Segoe UI", size=13, weight="bold"),
            height=34,
            corner_radius=8
        )
        self.btn_open_local.pack(fill="x")

        # Card B: Cloudflare Public Tunnel
        cf_card = ctk.CTkFrame(left_col, fg_color="#151922", corner_radius=10, border_width=1, border_color="#242B3B")
        cf_card.pack(fill="x", pady=(0, 10))

        cf_header = ctk.CTkFrame(cf_card, fg_color="transparent")
        cf_header.pack(fill="x", padx=14, pady=(10, 4))

        ctk.CTkLabel(
            cf_header,
            text="ลิงก์สาธารณะแชร์ให้อาจารย์/HR (Cloudflare)",
            font=ctk.CTkFont(family="Segoe UI", size=14, weight="bold"),
            text_color="#F3F4F6"
        ).pack(side="left")

        self.cf_status_badge = ctk.CTkLabel(
            cf_header,
            text="● รอดำเนินการ",
            font=ctk.CTkFont(family="Segoe UI", size=12, weight="bold"),
            text_color="#9CA3AF"
        )
        self.cf_status_badge.pack(side="right")

        cf_body = ctk.CTkFrame(cf_card, fg_color="transparent")
        cf_body.pack(fill="x", padx=14, pady=(0, 12))

        # URL Box Row
        url_row = ctk.CTkFrame(cf_body, fg_color="transparent")
        url_row.pack(fill="x", pady=(0, 8))

        self.url_entry = ctk.CTkEntry(
            url_row,
            placeholder_text="กำลังเชื่อมต่อ Cloudflare Tunnel...",
            font=ctk.CTkFont(family="Consolas", size=12),
            fg_color="#0D1117",
            border_color="#30363D",
            text_color="#34D399",
            height=34,
            corner_radius=6
        )
        self.url_entry.pack(side="left", fill="x", expand=True, padx=(0, 6))

        self.btn_copy_url = ctk.CTkButton(
            url_row,
            text="📋 คัดลอก",
            command=self.copy_public_url,
            fg_color="#D97706",
            hover_color="#B45309",
            text_color="#FFFFFF",
            font=ctk.CTkFont(family="Segoe UI", size=12, weight="bold"),
            width=70,
            height=34,
            corner_radius=6
        )
        self.btn_copy_url.pack(side="right")

        # Open Public URL Button
        self.btn_open_public = ctk.CTkButton(
            cf_body,
            text="🌍 เปิดลิงก์สาธารณะ (เปิดดูได้ทุกอุปกรณ์)",
            command=self.open_public_browser,
            fg_color="#0891B2",
            hover_color="#0E7490",
            text_color="#FFFFFF",
            font=ctk.CTkFont(family="Segoe UI", size=13, weight="bold"),
            height=34,
            corner_radius=8
        )
        self.btn_open_public.pack(fill="x")

        # Control Buttons Grid
        ctrl_frame = ctk.CTkFrame(left_col, fg_color="transparent")
        ctrl_frame.pack(fill="x")
        ctrl_frame.grid_columnconfigure((0, 1, 2, 3), weight=1)

        self.btn_start = ctk.CTkButton(
            ctrl_frame,
            text="▶ เริ่มทำงาน",
            command=self.start_services,
            fg_color="#059669",
            hover_color="#047857",
            font=ctk.CTkFont(family="Segoe UI", size=12, weight="bold"),
            height=32,
            corner_radius=6
        )
        self.btn_start.grid(row=0, column=0, padx=2, sticky="ew")

        self.btn_stop = ctk.CTkButton(
            ctrl_frame,
            text="⏹ หยุด",
            command=self.stop_services,
            fg_color="#DC2626",
            hover_color="#B91C1C",
            font=ctk.CTkFont(family="Segoe UI", size=12, weight="bold"),
            height=32,
            corner_radius=6
        )
        self.btn_stop.grid(row=0, column=1, padx=2, sticky="ew")

        self.btn_restart = ctk.CTkButton(
            ctrl_frame,
            text="🔄 รีสตาร์ท",
            command=self.restart_services,
            fg_color="#4B5563",
            hover_color="#374151",
            font=ctk.CTkFont(family="Segoe UI", size=12, weight="bold"),
            height=32,
            corner_radius=6
        )
        self.btn_restart.grid(row=0, column=2, padx=2, sticky="ew")

        self.btn_folder = ctk.CTkButton(
            ctrl_frame,
            text="📁 โฟลเดอร์งาน",
            command=self.open_folder,
            fg_color="#1E293B",
            hover_color="#334155",
            font=ctk.CTkFont(family="Segoe UI", size=12, weight="bold"),
            height=32,
            corner_radius=6
        )
        self.btn_folder.grid(row=0, column=3, padx=2, sticky="ew")

        # --- RIGHT COLUMN: QR Code Card ---
        right_col = ctk.CTkFrame(cols_frame, fg_color="#151922", corner_radius=10, border_width=1, border_color="#242B3B")
        right_col.grid(row=0, column=1, sticky="nsew", padx=(8, 0))

        qr_header = ctk.CTkLabel(
            right_col,
            text="สแกนดูบนมือถือ (QR Code)",
            font=ctk.CTkFont(family="Segoe UI", size=13, weight="bold"),
            text_color="#F3F4F6"
        )
        qr_header.pack(pady=(12, 4))

        # QR Code Container
        self.qr_label = ctk.CTkLabel(right_col, text="", width=150, height=150)
        self.qr_label.pack(pady=4)

        self.qr_hint = ctk.CTkLabel(
            right_col,
            text="รหัส QR จะปรากฏเมื่อ\nCloudflare เชื่อมต่อสำเร็จ",
            font=ctk.CTkFont(family="Segoe UI", size=11),
            text_color="#9CA3AF"
        )
        self.qr_hint.pack(pady=(2, 10))

        # Default placeholder QR
        self.generate_placeholder_qr()

        # 3. Live Log Viewer Section
        log_frame = ctk.CTkFrame(self, fg_color="#121620", corner_radius=10, border_width=1, border_color="#232938")
        log_frame.pack(fill="both", expand=True, padx=16, pady=(8, 12))

        log_header = ctk.CTkFrame(log_frame, fg_color="transparent")
        log_header.pack(fill="x", padx=12, pady=(8, 4))

        ctk.CTkLabel(
            log_header,
            text="บันทึกการทำงานแบบเรียลไทม์ (Live Activity Logs)",
            font=ctk.CTkFont(family="Segoe UI", size=12, weight="bold"),
            text_color="#D1D5DB"
        ).pack(side="left")

        btn_clear_log = ctk.CTkButton(
            log_header,
            text="ล้างบันทึก",
            command=self.clear_logs,
            fg_color="transparent",
            hover_color="#1F2937",
            text_color="#9CA3AF",
            font=ctk.CTkFont(family="Segoe UI", size=11),
            width=60,
            height=24
        )
        btn_clear_log.pack(side="right")

        self.log_textbox = ctk.CTkTextbox(
            log_frame,
            fg_color="#0A0D14",
            text_color="#94A3B8",
            font=ctk.CTkFont(family="Consolas", size=11),
            corner_radius=6,
            border_width=1,
            border_color="#1E2433"
        )
        self.log_textbox.pack(fill="both", expand=True, padx=12, pady=(0, 10))

    # --- QR Code Helpers ---
    def generate_placeholder_qr(self):
        img = Image.new("RGB", (140, 140), "#151922")
        self.display_qr_image(img)

    def generate_qr(self, url):
        try:
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_M,
                box_size=4,
                border=2,
            )
            qr.add_data(url)
            qr.make(fit=True)
            img = qr.make_image(fill_color="#0B0E14", back_color="#FFFFFF").convert("RGB")
            img = img.resize((140, 140), Image.Resampling.LANCZOS)
            self.display_qr_image(img)
            self.qr_hint.configure(text="ใช้กล้องมือถือสแกนเพื่อเปิดดู\nพอร์ตโฟลิโอได้จากทุกที่")
        except Exception as e:
            self.log(f"[QR Error] {e}")

    def display_qr_image(self, pil_image):
        ctk_img = ctk.CTkImage(light_image=pil_image, dark_image=pil_image, size=(140, 140))
        self.qr_label.configure(image=ctk_img)

    # --- Logging Helper ---
    def log(self, message):
        timestamp = time.strftime("%H:%M:%S")
        formatted = f"[{timestamp}] {message}\n"
        self.after(0, lambda: self._append_log(formatted))

    def _append_log(self, text):
        self.log_textbox.insert("end", text)
        self.log_textbox.see("end")

    def clear_logs(self):
        self.log_textbox.delete("1.0", "end")

    # --- Port & Service Checks ---
    def is_port_in_use(self, port):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            return s.connect_ex(('127.0.0.1', port)) == 0

    # --- Service Control ---
    def start_services(self):
        if self.is_running:
            self.log("เซิร์ฟเวอร์และ Cloudflare กำลังทำงานอยู่แล้ว")
            return

        self.is_running = True
        self.btn_start.configure(state="disabled")
        self.btn_stop.configure(state="normal")
        self.log("กำลังเริ่มระบบพอร์ตโฟลิโอ...")

        # 1. Start Node Server Thread
        threading.Thread(target=self._run_node_server, daemon=True).start()

        # 2. Start Cloudflare Tunnel Thread
        threading.Thread(target=self._run_cloudflare_tunnel, daemon=True).start()

    def _run_node_server(self):
        # Check if already running on port 3000
        if self.is_port_in_use(PORT):
            self.log(f"ตรวจพบเซิร์ฟเวอร์ทำงานอยู่บนพอร์ต {PORT} แล้ว (Active)")
            self.after(0, lambda: self.local_status_badge.configure(text=f"● ทำงานอยู่ (PORT {PORT})", text_color="#10B981"))
            return

        server_js = os.path.join(APP_DIR, "server.js")
        if not os.path.exists(server_js):
            self.log(f"[Error] ไม่พบไฟล์ {server_js}")
            self.after(0, lambda: self.local_status_badge.configure(text="● ไม่พบไฟล์ server.js", text_color="#EF4444"))
            return

        self.log("กำลังเริ่ม Node.js server.js...")
        self.after(0, lambda: self.local_status_badge.configure(text="● กำลังสตาร์ท...", text_color="#F59E0B"))

        try:
            # CREATE_NO_WINDOW flag on Windows
            startupinfo = None
            if os.name == 'nt':
                startupinfo = subprocess.STARTUPINFO()
                startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
                startupinfo.wShowWindow = subprocess.SW_HIDE

            self.node_process = subprocess.Popen(
                ["node", "server.js"],
                cwd=APP_DIR,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                encoding="utf-8",
                errors="replace",
                bufsize=1,
                startupinfo=startupinfo
            )

            # Check port loop
            for _ in range(20):
                time.sleep(0.5)
                if self.is_port_in_use(PORT):
                    self.log(f"Node.js พร้อมใช้งานที่ {LOCAL_URL}!")
                    self.after(0, lambda: self.local_status_badge.configure(text=f"● ทำงานอยู่ (PORT {PORT})", text_color="#10B981"))
                    break

            # Stream logs
            for line in self.node_process.stdout:
                line_str = line.strip()
                if line_str:
                    self.log(f"[Server] {line_str}")

        except Exception as e:
            self.log(f"[Server Error] {e}")
            self.after(0, lambda: self.local_status_badge.configure(text="● ผิดพลาด", text_color="#EF4444"))

    def _run_cloudflare_tunnel(self):
        self.after(0, lambda: self.cf_status_badge.configure(text="● กำลังเชื่อมต่อ...", text_color="#F59E0B"))
        self.after(0, lambda: self.url_entry.delete(0, "end"))
        self.after(0, lambda: self.url_entry.insert(0, "กำลังขอลิงก์จาก Cloudflare..."))

        self.log("กำลังเชื่อมต่อ Cloudflare Quick Tunnel...")

        # Wait for local port to be ready
        for _ in range(15):
            if self.is_port_in_use(PORT):
                break
            time.sleep(0.5)

        cmd = ["cloudflared", "tunnel", "--url", f"http://localhost:{PORT}"]

        try:
            startupinfo = None
            if os.name == 'nt':
                startupinfo = subprocess.STARTUPINFO()
                startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
                startupinfo.wShowWindow = subprocess.SW_HIDE

            self.cloudflared_process = subprocess.Popen(
                cmd,
                cwd=APP_DIR,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                encoding="utf-8",
                errors="replace",
                bufsize=1,
                startupinfo=startupinfo
            )

            url_pattern = re.compile(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com")

            # cloudflared logs the tunnel URL to stderr
            for line in self.cloudflared_process.stderr:
                line_str = line.strip()
                if line_str:
                    match = url_pattern.search(line_str)
                    if match and not self.public_url:
                        self.public_url = match.group(0)
                        self.log(f"★ ได้รับลิงก์สาธารณะ Cloudflare: {self.public_url}")
                        self.after(0, self._on_tunnel_connected)
                    elif "ERR" in line_str or "error" in line_str.lower():
                        self.log(f"[Cloudflare] {line_str}")

        except FileNotFoundError:
            self.log("[Error] ไม่พบโปรแกรม cloudflared ในระบบ")
            self.after(0, lambda: self.cf_status_badge.configure(text="● ไม่พบ cloudflared", text_color="#EF4444"))
        except Exception as e:
            self.log(f"[Cloudflare Error] {e}")
            self.after(0, lambda: self.cf_status_badge.configure(text="● ผิดพลาด", text_color="#EF4444"))

    def _on_tunnel_connected(self):
        self.cf_status_badge.configure(text="● ออนไลน์พร้อมแชร์ (HTTPS)", text_color="#10B981")
        self.url_entry.delete(0, "end")
        self.url_entry.insert(0, self.public_url)
        self.generate_qr(self.public_url)

    def stop_services(self, on_complete=None):
        if not self.is_running and not self.cloudflared_process and not self.node_process:
            if on_complete:
                on_complete()
            return

        self.log("กำลังหยุดการทำงานทั้งหมด...")
        self.btn_start.configure(state="disabled")
        self.btn_stop.configure(state="disabled")
        self.local_status_badge.configure(text="● กำลังหยุด...", text_color="#F59E0B")
        self.cf_status_badge.configure(text="● กำลังหยุด...", text_color="#F59E0B")

        def _do_stop():
            # Terminate cloudflared instantly (kill avoids waiting)
            cf_proc = self.cloudflared_process
            self.cloudflared_process = None
            if cf_proc:
                try:
                    cf_proc.kill()
                except Exception:
                    pass

            # Terminate node process instantly
            node_proc = self.node_process
            self.node_process = None
            if node_proc:
                try:
                    node_proc.kill()
                except Exception:
                    pass

            # Quick background cleanup for any orphan cloudflared
            if os.name == 'nt':
                try:
                    subprocess.Popen(
                        ["taskkill", "/F", "/IM", "cloudflared.exe"],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL,
                        creationflags=0x08000000  # CREATE_NO_WINDOW
                    )
                except Exception:
                    pass

            self.public_url = None
            self.is_running = False

            def _update_ui():
                self.local_status_badge.configure(text="● หยุดทำงานแล้ว", text_color="#EF4444")
                self.cf_status_badge.configure(text="● ออฟไลน์", text_color="#EF4444")
                self.url_entry.delete(0, "end")
                self.url_entry.insert(0, "เซิร์ฟเวอร์หยุดทำงานแล้ว")
                self.generate_placeholder_qr()
                self.qr_hint.configure(text="รหัส QR จะปรากฏเมื่อ\nCloudflare เชื่อมต่อสำเร็จ")

                self.btn_start.configure(state="normal")
                self.btn_stop.configure(state="disabled")
                self.log("หยุดระบบทั้งหมดเรียบร้อยแล้ว")
                if on_complete:
                    on_complete()

            self.after(0, _update_ui)

        threading.Thread(target=_do_stop, daemon=True).start()

    def restart_services(self):
        self.log("กำลังรีสตาร์ทระบบ...")
        self.stop_services(on_complete=lambda: self.after(500, self.start_services))

    # --- Actions ---
    def open_local_browser(self):
        webbrowser.open(LOCAL_URL)
        self.log(f"เปิดเว็บเบราว์เซอร์: {LOCAL_URL}")

    def open_public_browser(self):
        if self.public_url:
            webbrowser.open(self.public_url)
            self.log(f"เปิดเว็บเบราว์เซอร์ (Cloudflare): {self.public_url}")
        else:
            messagebox.showinfo("แจ้งเตือน", "ยังไม่ได้รับลิงก์ Cloudflare Tunnel กรุณารอสักครู่")

    def copy_public_url(self):
        if self.public_url:
            self.clipboard_clear()
            self.clipboard_append(self.public_url)
            self.update()
            self.btn_copy_url.configure(text="✓ คัดลอกแล้ว!", fg_color="#10B981")
            self.after(2000, lambda: self.btn_copy_url.configure(text="📋 คัดลอก", fg_color="#D97706"))
            self.log("คัดลอกลิงก์สาธารณะลงคลิปบอร์ดแล้ว")
        else:
            messagebox.showinfo("แจ้งเตือน", "ยังไม่มีลิงก์สำหรับคัดลอก")

    def open_folder(self):
        if os.name == 'nt':
            os.startfile(APP_DIR)
        else:
            subprocess.Popen(['xdg-open', APP_DIR])
        self.log(f"เปิดโฟลเดอร์โครงการ: {APP_DIR}")

    def on_close(self):
        # 1. Hide the window IMMEDIATELY (0ms instant response for user!)
        self.withdraw()

        # 2. Kill background processes instantly
        try:
            if self.cloudflared_process:
                self.cloudflared_process.kill()
        except Exception:
            pass

        try:
            if self.node_process:
                self.node_process.kill()
        except Exception:
            pass

        if os.name == 'nt':
            try:
                subprocess.Popen(
                    ["taskkill", "/F", "/IM", "cloudflared.exe"],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    creationflags=0x08000000
                )
            except Exception:
                pass

        # 3. Destroy window and terminate process cleanly
        try:
            self.destroy()
        except Exception:
            pass
        os._exit(0)

if __name__ == "__main__":
    app = PortfolioLauncher()
    app.mainloop()
