import re
from typing import List, Dict, Any

# Dictionary of common technology keywords to match from text
TECH_KEYWORDS = [
    # Languages
    "Python", "JavaScript", "TypeScript", "Go", "Golang", "Java", "C++", "C#", "Ruby", "PHP", "Rust", "Swift", "Kotlin", "SQL", "HTML", "CSS",
    # Frameworks / Libraries
    "React", "Vue", "Angular", "Next.js", "Vite", "Express", "Node.js", "Django", "Flask", "FastAPI", "Spring Boot", "Laravel", "Rails",
    # Databases
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "DynamoDB", "Cassandra", "Oracle",
    # DevOps / Cloud
    "Docker", "Kubernetes", "AWS", "Google Cloud", "GCP", "Azure", "Terraform", "CI/CD", "GitHub Actions", "Jenkins", "Nginx",
    # AI / ML
    "PyTorch", "TensorFlow", "scikit-learn", "OpenCV", "Pandas", "NumPy", "LLM", "OpenAI"
]

def analyze_resume_text(text: str) -> Dict[str, Any]:
    """
    Parses raw resume text and extracts structured arrays for:
    - Skills
    - Projects
    - Education
    - Experience
    - Technologies
    - Certifications
    """
    # 1. Match technology keywords in the entire text
    technologies = []
    for tech in TECH_KEYWORDS:
        # Match word boundaries case-insensitively
        pattern = r'\b' + re.escape(tech) + r'\b'
        if re.search(pattern, text, re.IGNORECASE):
            technologies.append(tech)
            
    # 2. Extract sections using boundaries
    sections = {
        "skills": ["skills", "core competencies", "technical skills"],
        "projects": ["projects", "personal projects", "key projects"],
        "education": ["education", "academic history", "credentials"],
        "experience": ["experience", "employment history", "professional experience", "work history"],
        "certifications": ["certifications", "licenses", "courses", "certificates"]
    }
    
    parsed_sections = {
        "skills": [],
        "projects": [],
        "education": [],
        "experience": [],
        "technologies": technologies,
        "certifications": []
    }
    
    # Clean text to split lines
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    
    # Identify headings and index positions
    header_indices = []
    for idx, line in enumerate(lines):
        line_lower = line.lower().strip()
        # Clean header matching: string length is short, and matches one of our section keywords
        for section_key, keywords in sections.items():
            if any(line_lower == kw or line_lower.startswith(kw + ":") or (len(line_lower) < 25 and kw in line_lower) for kw in keywords):
                header_indices.append((idx, section_key))
                break
                
    # Sort indices by line number
    header_indices.sort(key=lambda x: x[0])
    
    # Split text blocks under each heading
    for index, (line_idx, section_key) in enumerate(header_indices):
        start_line = line_idx + 1
        # The section ends where the next heading begins, or at the end of lines
        end_line = header_indices[index + 1][0] if index + 1 < len(header_indices) else len(lines)
        
        section_lines = lines[start_line:end_line]
        
        # Clean lines: remove bullets like '-', '*', etc.
        cleaned_items = []
        for s_line in section_lines:
            s_line = re.sub(r'^[-\*\u2022]\s*', '', s_line).strip()
            if s_line and len(s_line) > 3:
                cleaned_items.append(s_line)
                
        # Save items (limit to max 10 items per section to keep db payload lean)
        parsed_sections[section_key].extend(cleaned_items[:10])
        
    # Heuristic Fallback if sections were not matched (e.g. different layout)
    # Just try to grab lines containing bullet symbols or common words
    for section_key in ["skills", "projects", "education", "experience", "certifications"]:
        if not parsed_sections[section_key]:
            # Look for lines containing keywords
            keyword_list = sections[section_key]
            for line in lines:
                if any(kw in line.lower() for kw in keyword_list) and len(line) > 15:
                    line_cleaned = re.sub(r'^[-\*\u2022]\s*', '', line).strip()
                    parsed_sections[section_key].append(line_cleaned)
            # Cap fallbacks
            parsed_sections[section_key] = parsed_sections[section_key][:5]
            
    return parsed_sections
