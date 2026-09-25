import fitz  # PyMuPDF
import os

output_dir = os.path.dirname(os.path.abspath(__file__))

# Extract Portfolio pages
portfolio_pdf = os.path.join(os.path.dirname(output_dir), '..', '..', 'Portfolio_TH.pdf')
portfolio_pdf = os.path.normpath(portfolio_pdf)
print(f"Extracting Portfolio from: {portfolio_pdf}")
doc = fitz.open(portfolio_pdf)
for i, page in enumerate(doc):
    mat = fitz.Matrix(3.0, 3.0)  # 3x zoom for high DPI
    pix = page.get_pixmap(matrix=mat, alpha=False)
    out_path = os.path.join(output_dir, f"portfolio_page_{i+1}.jpg")
    pix.save(out_path, jpg_quality=92)
    print(f"  Portfolio page {i+1}: {pix.width}x{pix.height} -> {out_path}")
doc.close()

# Extract Resume pages
resume_pdf = os.path.join(os.path.dirname(output_dir), '..', '..', 'Resume_TH.pdf')
resume_pdf = os.path.normpath(resume_pdf)
print(f"\nExtracting Resume from: {resume_pdf}")
doc = fitz.open(resume_pdf)
for i, page in enumerate(doc):
    mat = fitz.Matrix(3.0, 3.0)
    pix = page.get_pixmap(matrix=mat, alpha=False)
    out_path = os.path.join(output_dir, f"resume_page_{i+1}.jpg")
    pix.save(out_path, jpg_quality=92)
    print(f"  Resume page {i+1}: {pix.width}x{pix.height} -> {out_path}")
doc.close()

print("\nDone!")
