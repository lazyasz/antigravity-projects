$pandocUrl = "https://github.com/jgm/pandoc/releases/download/3.10.1/pandoc-3.10.1-windows-x86_64.zip"
$tempZip = Join-Path $env:TEMP "pandoc.zip"
$tempDir = Join-Path $env:TEMP "pandoc_extracted"

# 1. Download Pandoc if not already present
if (-not (Test-Path "$tempDir\pandoc-3.10.1\pandoc.exe")) {
    Write-Host "Downloading Pandoc from $pandocUrl..."
    Invoke-WebRequest -Uri $pandocUrl -OutFile $tempZip
    Write-Host "Extracting Pandoc..."
    Expand-Archive -Path $tempZip -DestinationPath $tempDir -Force
    Remove-Item $tempZip
}

$pandocExe = "$tempDir\pandoc-3.10.1\pandoc.exe"

# 2. Write Markdown Presentation File
$mdContent = @"
% AGATE – FROM CONCEPT TO MVP
% Dhruv Anand Sakhare
% Special Project Management Intern | Turfingo Pvt. Ltd.

# Slide 1: Cover
**TURFINGO PVT. LTD. • SPECIAL PROJECT**  
**AGATE ESPORTS**  
**SPECIAL PROJECT MANAGEMENT**  

*   **Presenter:** Dhruv Anand Sakhare
*   **Role:** Special Project Management Intern
*   **Track:** Real-World Exposure Internship (Hybrid)
*   **Domain:** Business Development + Esports + Product Development

---

# Slide 2: Where I Fit Into the Project
## Project Hierarchy:
**Turfingo Pvt. Ltd.** -> **Agate Esports (Special Project)** -> **Special Project Management** -> **Intern**

## 4 Core Responsibility Pillars:
1.  **Research:** Understanding esports titles, competitive ecosystems, and player habits.
2.  **Operations:** Designing tournament structures, workflows, and governance rulebooks.
3.  **Product:** Planning, requirement gathering, and building the registration MVP.
4.  **Management:** Task planning, documentation, feedback incorporation, and stakeholder alignment.

---

# Slide 3: Week 1 — Research & Discovery
## Understanding the market, players, and competitive ecosystem

*   **Esports Research:** Analyzed gameplay mechanics, ranking systems, and tournament structures for Clash Royale and FIFA Mobile.
*   **Tournament Design:** Formulated tournament formats, qualification stages, and progression trees.
*   **Player Validation:** Created "MOM Test" questionnaires to gather unvarnished feedback on platform expectations and player pain points.

> "Before building the product, I first understood the users, games, and tournament ecosystem."

---

# Slide 4: Week 2 — Operations & Data Analysis
## Turning Research Into Operations

*   **Tournament Rulebooks:** Created match regulations, eligibility criteria, and dispute resolution policies for Clash Royale & FIFA Mobile.
*   **Match Operations:** Standardized player verification, scheduling, and moderator guidelines.
*   **Data Analytics:** Cleaned and structured player survey data to generate analytical reports.
*   **Product Requirements:** Defined functional requirements for the registration workflow.

**Pipeline:** Research -> Rules -> Operations -> Requirements -> Product Plan

> "I learned that a successful tournament platform needs both product technology and operational structure."

---

# Slide 5: The Turning Point
## From Documentation to Product (Transition from Weeks 1–2 to Weeks 3–4)

### What We Understood (Weeks 1–2)
*   Games & Player Behaviors
*   Match Rules & Tournament Operations
*   Validation Needs & Registration Requirements

### What We Built (Weeks 3–4)
*   User Authentication & Login
*   Team Registration & Game Selection
*   Form Validation & Admin Control Panel

**Core Insight:** Research and operational planning became the foundation for the Agate MVP.

---

# Slide 6: Week 3 — Building the Agate MVP
## Turning requirements into a working registration platform

*   **User Workflow Engine:** Player Account -> Authentication -> Team Reg -> Select Tournament -> Validation -> Submission -> Admin Portal
*   **Secure Authentication:** Player signup, login, and mock session validation.
*   **Dynamic Forms:** Team roster creation modules validating custom team sizes.
*   **State Persistence:** Integrated LocalStorage for persistence during development testing.

> "Week 3 transformed the project from an operational plan into a working MVP."

---

# Slide 7: Week 4 — Enhancing & Testing the MVP
## Moving from basic functionality toward a usable platform

*   **UI/UX Polish:** Refined interface, dynamic toast alerts, animated feedback states.
*   **Tournament Administration:** Active metrics cards, slot tracking, roster lookup overlays, approval/rejection operations.
*   **Quality Assurance:** End-to-end user flows, random network packet loss stress-testing, duplicate entry validation.

**Lifecycle:** Basic MVP -> UI/UX Polish -> Admin Controls -> E2E Testing -> Demo Ready

---

# Slide 8: Industrial Project Workflow
## Project Management & Infrastructure across the 4 weeks

*   **Notion:** Centralized project documentation, research notes, and rulebook drafts.
*   **GitHub:** Version control, repo management, and issue tracking.
*   **ClickUp / Jira:** Task tracking, milestone planning, and sprint management.
*   **Responsibilities:** Requirement analysis, task planning, mentor check-ins, feedback iteration, and workflow documentation.

> "My role connected business requirements, esports operations, and product execution."

---

# Slide 9: Learning & Skill Acquisition
## What the Internship Taught Me

*   **Project Management:** Requirement gathering, documentation, Agile workflows, and feedback loops.
*   **Business & Esports:** Competitive ecosystem design, player psychology, and tournament governance.
*   **Technical Execution:** Web app development, auth systems, input validation, and dashboard management.
*   **Product Thinking:** User validation, UI/UX optimization, error handling, and MVP prioritization.

---

# Slide 10: Final Reflection
## From Research to Real-World Execution

*   **Understand** -> **Plan** -> **Build** -> **Test** -> **Improve**
*   **Week 1:** "I learned to understand the ecosystem."
*   **Week 2:** "I learned to structure the operations."
*   **Week 3:** "I learned to turn requirements into an MVP."
*   **Week 4:** "I learned to refine, test, and prepare the product for presentation."

> "This internship changed my understanding of project management—from managing individual tasks to connecting research, operations, technology, and product outcomes."

**Thank You!**  
Dhruv Anand Sakhare — Special Project Management Intern | Agate @ Turfingo Pvt. Ltd.
"@

$mdFile = Join-Path (Get-Location) "slides.md"
$mdContent | Out-File $mdFile -Encoding utf8

# 3. Run Pandoc to generate PPTX
$pptxFile = Join-Path (Get-Location) "agate_presentation.pptx"
Write-Host "Converting markdown to PPTX..."
& $pandocExe $mdFile -o $pptxFile

if (Test-Path $pptxFile) {
    Write-Host "Success! PPTX generated at $pptxFile"
} else {
    Write-Error "Failed to generate PPTX file"
}
