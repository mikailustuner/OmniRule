# Command: Document — Professional Document Creator

Generate McKinsey/IBM-style PDF reports and PowerPoint presentations.

Works in: Claude Code, OpenCode, Codex, and any AGENTS.md runner.

---

## When to use this command

Invoke `/document` when the user asks for:
- PDF reports, analyses, proposals, executive summaries
- PowerPoint presentations, pitch decks, slide decks
- Any structured document with professional formatting
- Turkish: "rapor", "sunum", "teklif", "analiz", "PDF yap", "slayt hazırla"

---

## Workflow

### Step 1: Clarify (if needed)
Ask only if truly ambiguous:
- PDF or PPTX?
- What's the topic / what content should it contain?
- Any specific sections required?

### Step 2: Research
Before writing, gather content:
- Read any referenced files in the project
- Use provided information from the conversation
- Structure into logical sections

### Step 3: Write content as Markdown
Prepare the content file with proper structure:

**For PDF** (`content.md`):
```markdown
## Executive Summary
[Key findings in 3–5 sentences]

## Background
[Context]

## Analysis
### Finding 1
### Finding 2

## Recommendations
| Priority | Action | Timeline |
|---|---|---|
| High | ... | Q1 |

## Appendix
```

**For PPTX** (`content.md`):
```markdown
## Agenda
- Topic 1
- Topic 2

## [Section Title]
[3 bullet points or body text]

## Key Metrics
KPI: 42% | Label: Growth YoY
KPI: $2.4M | Label: Cost Saved

## Next Steps
- Action 1 — Owner — Deadline
```

### Step 4: Generate
```bash
# PDF
npm run tool:document -- --type=pdf --title="Report Title" \
  --subtitle="Optional subtitle" --org="Company" --input=content.md --output=report.pdf

# PPTX
npm run tool:document -- --type=pptx --title="Presentation Title" \
  --input=content.md --output=slides.pptx
```

### Step 5: Confirm
Report the output path and file size. Offer to regenerate with changes.

---

## Design Defaults (always applied)
- **Style:** IBM/McKinsey — dark navy + IBM blue palette
- **Font:** IBM Plex Sans → Inter → system-ui
- **PDF pages:** A4, 20mm/25mm margins, professional footer with page numbers
- **Cover page:** Auto-generated with title, subtitle, date, org
- **PPTX:** 16:9, header bar on every slide, consistent typography
