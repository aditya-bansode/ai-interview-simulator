import io
from datetime import datetime
from typing import Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
)

def generate_pdf_report(data: Dict[str, Any]) -> io.BytesIO:
    """
    Compiles a highly professional, publication-quality evaluation PDF report.
    Returns the report as an in-memory BytesIO binary stream.
    """
    buffer = io.BytesIO()
    
    # 1. Page Template Setup (0.75 in margins)
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=54,
        leftMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    story = []
    
    # 2. Typography Styles setup
    styles = getSampleStyleSheet()
    
    # Custom Brand Colors
    primary_color = colors.HexColor("#0F172A")    # Slate 900
    accent_color = colors.HexColor("#2563EB")     # Royal Blue
    success_color = colors.HexColor("#16A34A")    # Green 600
    border_color = colors.HexColor("#CBD5E1")     # Gray 300
    bg_light = colors.HexColor("#F8FAFC")         # Slate 50
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=primary_color,
        alignment=TA_CENTER,
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=accent_color,
        alignment=TA_CENTER,
        spaceAfter=20
    )
    
    h1_style = ParagraphStyle(
        'SecHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=primary_color,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#334155")
    )
    
    body_bold_style = ParagraphStyle(
        'BodyDarkBold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )
    
    bullet_style = ParagraphStyle(
        'BulletItem',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=3
    )

    # Calculate overall aggregates
    qa_list = data.get("qa_history", [])
    total_q = len(qa_list)
    
    avg_tech = 0
    avg_comm = 0
    avg_gram = 0
    avg_conf = 0
    
    if total_q > 0:
        avg_tech = sum(item.get("technical_score", 0) for item in qa_list) // total_q
        avg_comm = sum(item.get("communication_score", 0) for item in qa_list) // total_q
        avg_gram = sum(item.get("grammar_score", 0) for item in qa_list) // total_q
        avg_conf = sum(item.get("confidence_score", 0) for item in qa_list) // total_q
        
    overall_score = (avg_tech + avg_comm + avg_gram + avg_conf) // 4 if total_q > 0 else 0

    # 3. Compile Cover Header
    story.append(Paragraph("AI INTERVIEW SIMULATOR REPORT", title_style))
    story.append(Paragraph(f"Mock Technical Assessment Feedback Summary", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=accent_color, spaceAfter=20))
    
    # 4. Session Metadata Table
    meta_data = [
        [Paragraph("Target Job Role:", body_bold_style), Paragraph(data.get("role", "Software Engineer"), body_style),
         Paragraph("Date Processed:", body_bold_style), Paragraph(datetime.now().strftime("%B %d, %Y"), body_style)],
        [Paragraph("Initial Difficulty:", body_bold_style), Paragraph(data.get("experience_level", "Intermediate"), body_style),
         Paragraph("Overall Score:", body_bold_style), Paragraph(f"<b>{overall_score}/100</b>", body_style)]
    ]
    meta_table = Table(meta_data, colWidths=[120, 130, 120, 130])
    meta_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 15))
    
    # 5. Proctoring & Attention Analysis Dashboard Section
    story.append(Paragraph("Proctoring & Attention Statistics", h1_style))
    
    proctor_data = [
        [Paragraph("Gaze Tracking Indicator", body_bold_style), Paragraph("Metric Value", body_bold_style), Paragraph("Performance Interpretation", body_bold_style)],
        [Paragraph("Eye Contact Rate", body_style), Paragraph(f"{data.get('eye_contact_rate', 0)}%", body_style), 
         Paragraph("Measures gaze alignment relative to the screen bounds.", body_style)],
        [Paragraph("Webcam Presence Rate", body_style), Paragraph(f"{data.get('face_presence_rate', 0)}%", body_style), 
         Paragraph("Confirms candidates remained visible inside the camera frame.", body_style)],
        [Paragraph("Excessive Head Movements", body_style), Paragraph(f"{data.get('head_movements', 0)} counts", body_style), 
         Paragraph("Flags sudden shifts that could suggest looking away.", body_style)],
        [Paragraph("Primary Emotion Logged", body_style), Paragraph(data.get("dominant_emotion", "Neutral").upper(), body_style), 
         Paragraph("Dominant attribute assessed by DeepFace classifier.", body_style)]
    ]
    
    proctor_table = Table(proctor_data, colWidths=[150, 100, 250])
    proctor_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), bg_light),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('LINEBELOW', (0,0), (-1,0), 1.5, primary_color),
        ('LINEBELOW', (0,1), (-1,-1), 0.5, border_color),
    ]))
    story.append(proctor_table)
    story.append(Spacer(1, 15))
    
    # 6. Resume Summary Block
    story.append(Paragraph("Resume Analysis Summary", h1_style))
    story.append(Paragraph(data.get("resume_summary", "No parsed resume profile available for this session."), body_style))
    story.append(Spacer(1, 20))
    
    story.append(PageBreak())
    
    # 7. Detailed Question-by-Question breakdown
    story.append(Paragraph("Detailed Question Breakdown", h1_style))
    
    for idx, item in enumerate(qa_list):
        q_num = idx + 1
        
        story.append(Paragraph(f"<b>Question {q_num}:</b> {item.get('question', '')}", body_bold_style))
        story.append(Spacer(1, 4))
        story.append(Paragraph(f"<i>Candidate Answer:</i> {item.get('answer', '')}", body_style))
        story.append(Spacer(1, 8))
        
        # Scoring metrics row
        scores_data = [
            [
                Paragraph("<b>Technical:</b>", body_style), Paragraph(f"{item.get('technical_score', 0)}%", body_style),
                Paragraph("<b>Communication:</b>", body_style), Paragraph(f"{item.get('communication_score', 0)}%", body_style),
                Paragraph("<b>Grammar:</b>", body_style), Paragraph(f"{item.get('grammar_score', 0)}%", body_style),
                Paragraph("<b>Confidence:</b>", body_style), Paragraph(f"{item.get('confidence_score', 0)}%", body_style)
            ]
        ]
        scores_table = Table(scores_data, colWidths=[70, 50, 95, 50, 70, 50, 75, 40])
        scores_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), bg_light),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOX', (0, 0), (-1, -1), 0.5, border_color),
        ]))
        story.append(scores_table)
        story.append(Spacer(1, 8))
        
        # AI Suggestions
        story.append(Paragraph("<b>AI Recommendations:</b>", body_bold_style))
        for sug in item.get("suggestions", []):
            story.append(Paragraph(f"• {sug}", bullet_style))
        if not item.get("suggestions"):
            story.append(Paragraph("• No suggestions recorded.", bullet_style))
            
        story.append(Spacer(1, 6))
        
        # Exemplar response
        story.append(Paragraph("<b>Exemplar Response Guide:</b>", body_bold_style))
        story.append(Paragraph(item.get("correct_answer", "No exemplar answer logged."), body_style))
        
        # Spacer boundary
        story.append(Spacer(1, 12))
        story.append(HRFlowable(width="100%", thickness=0.5, color=border_color, spaceAfter=14))
        
    # Compile document
    doc.build(story)
    
    buffer.seek(0)
    return buffer
