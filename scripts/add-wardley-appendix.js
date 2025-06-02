#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

class WardleyAppendixAdder {
    constructor() {
        this.booksDirectory = path.join(__dirname, '..', 'books');
        this.appendixContent = this.generateAppendixContent();
    }

    generateAppendixContent() {
        return `

---

Appendix: Further Reading on Wardley Mapping

The following books, primarily authored by Mark Craddock, offer comprehensive insights into various aspects of Wardley Mapping:

## Core Wardley Mapping Series

1. **Wardley Mapping, The Knowledge: Part One, Topographical Intelligence in Business**
   - Author: Simon Wardley
   - Editor: Mark Craddock
   - Part of the Wardley Mapping series (5 books)
   - Available in Kindle Edition
   - [Amazon Link](https://www.amazon.com/dp/B0BVSXB5W5)

   This foundational text introduces readers to the Wardley Mapping approach:
   - Covers key principles, core concepts, and techniques for creating situational maps
   - Teaches how to anchor mapping in user needs and trace value chains
   - Explores anticipating disruptions and determining strategic gameplay
   - Introduces the foundational doctrine of strategic thinking
   - Provides a framework for assessing strategic plays
   - Includes concrete examples and scenarios for practical application

   The book aims to equip readers with:
   - A strategic compass for navigating rapidly shifting competitive landscapes
   - Tools for systematic situational awareness
   - Confidence in creating strategic plays and products
   - An entrepreneurial mindset for continual learning and improvement

2. **Wardley Mapping Doctrine: Universal Principles and Best Practices that Guide Strategic Decision-Making**
   - Author: Mark Craddock
   - Part of the Wardley Mapping series (5 books)
   - Available in Kindle Edition
   - [Amazon Link](https://www.amazon.com/dp/B0C2SFTR7Z)

   This book explores how doctrine supports organizational learning and adaptation:
   - Standardisation: Enhances efficiency through consistent application of best practices
   - Shared Understanding: Fosters better communication and alignment within teams
   - Guidance for Decision-Making: Offers clear guidelines for navigating complexity
   - Adaptability: Encourages continuous evaluation and refinement of practices

   Key features:
   - In-depth analysis of doctrine's role in strategic thinking
   - Case studies demonstrating successful application of doctrine
   - Practical frameworks for implementing doctrine in various organizational contexts
   - Exploration of the balance between stability and flexibility in strategic planning

   Ideal for:
   - Business leaders and executives
   - Strategic planners and consultants
   - Organizational development professionals
   - Anyone interested in enhancing their strategic decision-making capabilities

3. **Wardley Mapping Gameplays: Transforming Insights into Strategic Actions**
   - Author: Mark Craddock
   - Part of the Wardley Mapping series (5 books)
   - Available in Kindle Edition
   - [Amazon Link](https://www.amazon.com/dp/B0C7CR9R9Q)

   This book delves into gameplays, a crucial component of Wardley Mapping:

   - Gameplays are context-specific patterns of strategic action derived from Wardley Maps
   - Types of gameplays include:
     * User Perception plays (e.g., education, bundling)
     * Accelerator plays (e.g., open approaches, exploiting network effects)
     * De-accelerator plays (e.g., creating constraints, exploiting IPR)
     * Market plays (e.g., differentiation, pricing policy)
     * Defensive plays (e.g., raising barriers to entry, managing inertia)
     * Attacking plays (e.g., directed investment, undermining barriers to entry)
     * Ecosystem plays (e.g., alliances, sensing engines)

   Gameplays enhance strategic decision-making by:
   1. Providing contextual actions tailored to specific situations
   2. Enabling anticipation of competitors' moves
   3. Inspiring innovative approaches to challenges and opportunities
   4. Assisting in risk management
   5. Optimizing resource allocation based on strategic positioning

   The book includes:
   - Detailed explanations of each gameplay type
   - Real-world examples of successful gameplay implementation
   - Frameworks for selecting and combining gameplays
   - Strategies for adapting gameplays to different industries and contexts

4. **Navigating Inertia: Understanding Resistance to Change in Organisations**
   - Author: Mark Craddock
   - Part of the Wardley Mapping series (5 books)
   - Available in Kindle Edition
   - [Amazon Link](https://www.amazon.com/dp/B0C34FX8XC)

   This comprehensive guide explores organizational inertia and strategies to overcome it:

   Key Features:
   - In-depth exploration of inertia in organizational contexts
   - Historical perspective on inertia's role in business evolution
   - Practical strategies for overcoming resistance to change
   - Integration of Wardley Mapping as a diagnostic tool

   The book is structured into six parts:
   1. Understanding Inertia: Foundational concepts and historical context
   2. Causes and Effects of Inertia: Internal and external factors contributing to inertia
   3. Diagnosing Inertia: Tools and techniques, including Wardley Mapping
   4. Strategies to Overcome Inertia: Interventions for cultural, behavioral, structural, and process improvements
   5. Case Studies and Practical Applications: Real-world examples and implementation frameworks
   6. The Future of Inertia Management: Emerging trends and building adaptive capabilities

   This book is invaluable for:
   - Organizational leaders and managers
   - Change management professionals
   - Business strategists and consultants
   - Researchers in organizational behavior and management

5. **Wardley Mapping Climate: Decoding Business Evolution**
   - Author: Mark Craddock
   - Part of the Wardley Mapping series (5 books)
   - Available in Kindle Edition
   - [Amazon Link](https://www.amazon.com/dp/B0BVHF2MBH)

   This comprehensive guide explores climatic patterns in business landscapes:

   Key Features:
   - In-depth exploration of 31 climatic patterns across six domains: Components, Financial, Speed, Inertia, Competitors, and Prediction
   - Real-world examples from industry leaders and disruptions
   - Practical exercises and worksheets for applying concepts
   - Strategies for navigating uncertainty and driving innovation
   - Comprehensive glossary and additional resources

   The book enables readers to:
   - Anticipate market changes with greater accuracy
   - Develop more resilient and adaptive strategies
   - Identify emerging opportunities before competitors
   - Navigate complexities of evolving business ecosystems

   It covers topics from basic Wardley Mapping to advanced concepts like the Red Queen Effect and Jevon's Paradox, offering a complete toolkit for strategic foresight.

   Perfect for:
   - Business strategists and consultants
   - C-suite executives and business leaders
   - Entrepreneurs and startup founders
   - Product managers and innovation teams
   - Anyone interested in cutting-edge strategic thinking

## Practical Resources

6. **Wardley Mapping Cheat Sheets & Notebook**
   - Author: Mark Craddock
   - 100 pages of Wardley Mapping design templates and cheat sheets
   - Available in paperback format
   - [Amazon Link](https://www.amazon.com/dp/B09TPDM9PP)

   This practical resource includes:
   - Ready-to-use Wardley Mapping templates
   - Quick reference guides for key Wardley Mapping concepts
   - Space for notes and brainstorming
   - Visual aids for understanding mapping principles

   Ideal for:
   - Practitioners looking to quickly apply Wardley Mapping techniques
   - Workshop facilitators and educators
   - Anyone wanting to practice and refine their mapping skills

## Specialized Applications

7. **UN Global Platform Handbook on Information Technology Strategy: Wardley Mapping The Sustainable Development Goals (SDGs)**
   - Author: Mark Craddock
   - Explores the use of Wardley Mapping in the context of sustainable development
   - Available for free with Kindle Unlimited or for purchase
   - [Amazon Link](https://www.amazon.com/dp/B09PNKFHG4)

   This specialized guide:
   - Applies Wardley Mapping to the UN's Sustainable Development Goals
   - Provides strategies for technology-driven sustainable development
   - Offers case studies of successful SDG implementations
   - Includes practical frameworks for policy makers and development professionals

8. **AIconomics: The Business Value of Artificial Intelligence**
   - Author: Mark Craddock
   - Applies Wardley Mapping concepts to the field of artificial intelligence in business
   - [Amazon Link](https://www.amazon.com/dp/B0C6V9VZ9B)

   This book explores:
   - The impact of AI on business landscapes
   - Strategies for integrating AI into business models
   - Wardley Mapping techniques for AI implementation
   - Future trends in AI and their potential business implications

   Suitable for:
   - Business leaders considering AI adoption
   - AI strategists and consultants
   - Technology managers and CIOs
   - Researchers in AI and business strategy

These resources offer a range of perspectives and applications of Wardley Mapping, from foundational principles to specific use cases. Readers are encouraged to explore these works to enhance their understanding and application of Wardley Mapping techniques.

Note: Amazon links are subject to change. If a link doesn't work, try searching for the book title on Amazon directly.`;
    }

    async addAppendixToBook(bookDirectory) {
        try {
            const bookPath = path.join(this.booksDirectory, bookDirectory, 'full_book.md');

            // Check if file exists
            try {
                await fs.access(bookPath);
            } catch {
                console.log(`📖 ${bookDirectory}: full_book.md not found, skipping...`);
                return false;
            }

            // Read the current book content
            let bookContent = await fs.readFile(bookPath, 'utf8');

            // Check if appendix already exists
            if (bookContent.includes('# Appendix: Further Reading on Wardley Mapping')) {
                console.log(`📖 ${bookDirectory}: Wardley Mapping appendix already exists`);
                return false;
            }

            // Check if any appendix already exists
            if (bookContent.includes('# Appendix')) {
                console.log(`📖 ${bookDirectory}: Other appendix found, skipping to avoid conflicts`);
                return false;
            }

            // Add the appendix to the end of the book
            const updatedContent = bookContent + this.appendixContent;

            // Write the updated content back to the file
            await fs.writeFile(bookPath, updatedContent, 'utf8');

            console.log(`✅ ${bookDirectory}: Added Wardley Mapping appendix`);
            return true;

        } catch (error) {
            console.error(`❌ Error updating ${bookDirectory}:`, error.message);
            return false;
        }
    }

    async addAppendixToAllBooks() {
        console.log('🚀 Starting Wardley Mapping appendix addition process...\n');

        try {
            // Get list of all book directories
            const bookDirectories = await fs.readdir(this.booksDirectory);

            console.log(`📚 Found ${bookDirectories.length} book directories\n`);

            let addedCount = 0;
            let skippedCount = 0;

            for (const bookDirectory of bookDirectories) {
                const dirPath = path.join(this.booksDirectory, bookDirectory);
                const stat = await fs.stat(dirPath);

                if (stat.isDirectory()) {
                    const added = await this.addAppendixToBook(bookDirectory);
                    if (added) {
                        addedCount++;
                    } else {
                        skippedCount++;
                    }
                }
            }

            console.log('\n📊 Addition Summary:');
            console.log(`✅ Added: ${addedCount} books`);
            console.log(`⏭️ Skipped: ${skippedCount} books`);
            console.log('\n🎉 Wardley Mapping appendix addition completed successfully!');

        } catch (error) {
            console.error('❌ Fatal error during addition process:', error.message);
            process.exit(1);
        }
    }

    async addAppendixToSingleBook(bookDirectory) {
        console.log(`🚀 Adding Wardley Mapping appendix to: ${bookDirectory}\n`);

        const added = await this.addAppendixToBook(bookDirectory);

        if (added) {
            console.log(`\n✅ Successfully added appendix to ${bookDirectory}`);
        } else {
            console.log(`\n⏭️ No changes needed for ${bookDirectory}`);
        }
    }
}

// Run the adder if this script is executed directly
if (require.main === module) {
    const adder = new WardleyAppendixAdder();

    // Check if a specific book directory was provided as argument
    const bookDirectory = process.argv[2];

    if (bookDirectory) {
        adder.addAppendixToSingleBook(bookDirectory);
    } else {
        adder.addAppendixToAllBooks();
    }
}

module.exports = WardleyAppendixAdder;