# Wardley Map Library Documentation

This directory contains comprehensive documentation for the Wardley Map Library project.

## 📚 Documentation Index

### Development Documentation
- **[CLAUDE.md](../CLAUDE.md)** - Development notes and guidelines for Claude Code
  - Project structure and architecture
  - Development workflows and branch strategy
  - Code conventions and best practices
  - Common tasks and debugging guides

### Planning and Enhancement
- **[ENHANCEMENTS.md](./ENHANCEMENTS.md)** - Future enhancement roadmap
  - Authentication system implementation plans
  - Review system design options
  - Feature prioritization matrix
  - Technical implementation strategies

### Content Management
- **[MANIFEST.md](./MANIFEST.md)** - Book discovery and categorization system
  - How book manifests are generated
  - Categorization logic and rules
  - Book metadata structure

- **[TABLE_OF_CONTENTS.md](./TABLE_OF_CONTENTS.md)** - TOC generation system
  - Automated table of contents creation
  - Anchor generation and navigation
  - TOC validation and testing

## 🏗️ Project Structure

```
/workspaces/GenAI-Books/
├── docs/                    # Documentation (this folder)
│   ├── README.md           # Documentation index (this file)
│   ├── ENHANCEMENTS.md     # Enhancement roadmap
│   ├── MANIFEST.md         # Book discovery system
│   └── TABLE_OF_CONTENTS.md # TOC generation system
├── README.md               # Main project README  
├── CLAUDE.md               # Development guidelines
├── api/                    # Vercel serverless functions
├── books/                  # Book content library
├── public/                 # Frontend assets
├── scripts/                # Utility scripts
├── tests/                  # Test suite
└── ...                     # Other project files
```

## 🎯 Quick Links

### For Developers
- Start with [CLAUDE.md](../CLAUDE.md) for development setup and guidelines
- Review [ENHANCEMENTS.md](./ENHANCEMENTS.md) for planned features and implementation strategies

### For Content Contributors
- See [MANIFEST.md](./MANIFEST.md) to understand how books are discovered and categorized
- Check [TABLE_OF_CONTENTS.md](./TABLE_OF_CONTENTS.md) for TOC generation requirements

### For Users
- Visit the main [README.md](../README.md) for project overview and usage instructions

## 📝 Documentation Guidelines

### Keeping Documentation Updated
- Update relevant docs when making architectural changes
- Add new enhancement ideas to ENHANCEMENTS.md
- Document new development patterns in ../CLAUDE.md
- Keep the main README.md user-focused and concise

### Documentation Standards
- Use clear, descriptive headings
- Include code examples where helpful
- Maintain consistent formatting
- Link between related documentation sections
- Update modification dates when making significant changes

---

*Documentation organized: January 6, 2025*