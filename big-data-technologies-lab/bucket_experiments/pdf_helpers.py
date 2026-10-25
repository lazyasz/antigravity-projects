import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

# Paths
BASE_DIR = r"C:\Users\dhruv\.gemini\antigravity-ide\scratch\bdtl_bucket_experiments"
SHOTS_DIR = os.path.join(BASE_DIR, "screenshots")
DOWNLOADS_DIR = r"C:\Users\dhruv\Downloads"
os.makedirs(DOWNLOADS_DIR, exist_ok=True)

PDF_DHRUV = os.path.join(DOWNLOADS_DIR, "Dhruv_Sakhare_Experiments_1_and_3.pdf")
PDF_ADESH = os.path.join(DOWNLOADS_DIR, "Adesh_Patankar_Experiments_1_and_4.pdf")

# Custom Canvas for Two-Pass Page Numbering and Running Header/Footer
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            return  # Suppress running header and footer on cover page

        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#4B5563"))

        # Running Header
        header_text = getattr(self, "student_header", "Big Data Technologies Laboratory | Hive Practical Journal")
        self.drawString(42, 808, header_text)
        self.drawRightString(553, 808, "Apache Hive Lab Experiments")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.6)
        self.line(42, 802, 553, 802)

        # Running Footer
        self.line(42, 40, 553, 40)
        footer_sub = "Department of Computer Science & Engineering"
        self.drawString(42, 28, footer_sub)
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(553, 28, page_str)
        self.restoreState()

def get_doc_styles():
    styles = getSampleStyleSheet()
    
    primary = colors.HexColor("#1E3A8A")     # Navy
    secondary = colors.HexColor("#0284C7")   # Blue
    dark = colors.HexColor("#1F2937")        # Charcoal
    accent = colors.HexColor("#D97706")      # Amber

    styles.add(ParagraphStyle(
        'CoverSuper',
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=secondary,
        alignment=1, # Center
        spaceAfter=8
    ))
    styles.add(ParagraphStyle(
        'CoverTitle',
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=30,
        textColor=primary,
        alignment=1,
        spaceAfter=14
    ))
    styles.add(ParagraphStyle(
        'CoverSubtitle',
        fontName='Helvetica',
        fontSize=12,
        leading=18,
        textColor=dark,
        alignment=1,
        spaceAfter=24
    ))
    styles.add(ParagraphStyle(
        'ExpHeaderBanner',
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=colors.white,
        spaceBefore=0,
        spaceAfter=0
    ))
    styles.add(ParagraphStyle(
        'SecHeading',
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=primary,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    ))
    styles.add(ParagraphStyle(
        'SubSecHeading',
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=secondary,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    ))
    styles.add(ParagraphStyle(
        'BodyCustom',
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=dark,
        spaceBefore=3,
        spaceAfter=5
    ))
    styles.add(ParagraphStyle(
        'BodyCustomBold',
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=14,
        textColor=dark,
        spaceBefore=3,
        spaceAfter=5
    ))
    styles.add(ParagraphStyle(
        'CodeSnippet',
        fontName='Courier',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor("#1E293B"),
        backColor=colors.HexColor("#F1F5F9"),
        borderPadding=6,
        spaceBefore=5,
        spaceAfter=6,
        keepWithNext=True
    ))
    styles.add(ParagraphStyle(
        'FigCaption',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12,
        textColor=primary,
        alignment=1, # Center
        spaceBefore=5,
        spaceAfter=3,
        keepWithNext=True
    ))
    styles.add(ParagraphStyle(
        'FigExplanation',
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#4B5563"),
        alignment=0, # Justified / Left
        spaceBefore=2,
        spaceAfter=10
    ))
    styles.add(ParagraphStyle(
        'CalloutText',
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=colors.HexColor("#1E3A8A"),
        spaceBefore=2,
        spaceAfter=2
    ))
    styles.add(ParagraphStyle(
        'TableData',
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=dark
    ))
    styles.add(ParagraphStyle(
        'TableHeader',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    ))
    styles.add(ParagraphStyle(
        'ResultBox',
        fontName='Helvetica',
        fontSize=9.5,
        leading=14.5,
        textColor=colors.HexColor("#065F46") # Emerald
    ))
    return styles

def build_banner(text, styles):
    p = Paragraph(text, styles['ExpHeaderBanner'])
    t = Table([[p]], colWidths=[513])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#1E3A8A")),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    return t

def build_callout(text, styles, border_color="#0284C7", bg_color="#F0F9FF"):
    p = Paragraph(text, styles['CalloutText'])
    t = Table([[p]], colWidths=[513])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor(bg_color)),
        ('LINELEFT', (0,0), (-1,-1), 3.5, colors.HexColor(border_color)),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    return t

def make_screenshot_block(img_filename, fig_num, title, explanation, styles, width=500, height=310):
    img_path = os.path.join(SHOTS_DIR, img_filename)
    flowables = []
    if os.path.exists(img_path):
        img = Image(img_path, width=width, height=height)
        flowables.append(img)
    else:
        flowables.append(Paragraph(f"[Missing Image: {img_filename}]", styles['BodyCustomBold']))
    
    caption_p = Paragraph(f"<b>Figure {fig_num}:</b> {title}", styles['FigCaption'])
    flowables.append(caption_p)
    exp_p = Paragraph(f"<b>Technical Analysis:</b> {explanation}", styles['FigExplanation'])
    flowables.append(exp_p)
    flowables.append(Spacer(1, 4))
    return KeepTogether(flowables)

print("PDF Helper module loaded successfully.")
