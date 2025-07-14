# Report: Assessing Interface *Aesthetics* and *Usability* with **VisAWI** and **SUS**

---

## 1  Overview

Designers often need a **quick, reliable “pulse check”** on two complementary facets of user experience:

| Facet                                                                      | What it captures                                                             | Recommended scale                                              |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **Visual aesthetics** – the immediate, affective impression a screen makes | Formal beauty (simplicity, colorfulness, craftsmanship …) and hedonic appeal | **VisAWI** (18 items) or its short form **VisAWI-S** (8 items) |
| **Usability** – the perceived ease, efficiency and satisfaction of use     | Global ease-of-use across tasks and contexts                                 | **SUS** (10 items)                                             |

Both instruments are free, technology-agnostic, and validated across hundreds of studies. They are often administered together to tease apart *hedonic* (looks) and *pragmatic* (use) qualities of an interface.

---

## 2  Conceptual Foundations

### 2.1 VisAWI – Visual Aesthetics of Websites Inventory

VisAWI is grounded in the **interactionist view** that users perceive a *general aesthetics factor* composed of four facets: **Simplicity, Diversity, Colorfulness,** and **Craftsmanship**.([ResearchGate][1])  These facets were derived from seven empirical studies (N = 2,027) and align with Gestalt principles (unity, balance) as well as novelty and design skill.

### 2.2 SUS – System Usability Scale

Created by John Brooke at Digital Equipment Corp. in 1986, SUS was designed as a **“quick-and-dirty” global usability score** applicable to any interactive product.([Digital Healthcare Research][2])  It captures a user’s holistic sense of *effectiveness, efficiency,* and *satisfaction* after task completion.

---

## 3  Scale Structure

|                   | VisAWI                                                      | VisAWI-S                     | SUS                                                  |
| ----------------- | ----------------------------------------------------------- | ---------------------------- | ---------------------------------------------------- |
| Items             | 18 statements                                               | 8 statements (single-factor) | 10 statements                                        |
| Response scale    | 7-point Likert (1 = strongly disagree … 7 = strongly agree) | same                         | 5-point Likert                                       |
| Sub-scales        | 4 facets + global                                           | global only                  | none (alternating +/– wording)                       |
| Typical threshold | Mean ≥ 4.5 ≈ “positive aesthetics”([ResearchGate][1])       | –                            | Score ≥ 68 ≈ “average usability” benchmark([PMC][3]) |
| Completion time   | ≈ 3 min                                                     | < 1 min                      | 1–2 min                                              |

**Scoring:**

* VisAWI / VisAWI-S → average the items (or each facet) to obtain 1–7 scores; higher = more attractive.
* SUS → convert each item to 0–4, sum and × 2.5 → **0–100**; 68 ≈ 50th percentile, 80 ≈ “good+” usability.([JUX - The Journal of User Experience][4])

---

## 4  Psychometric Properties

| Property               | VisAWI / VisAWI-S                                                                                | SUS                                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| **Reliability (α)**    | .92 full; .91 short – excellent internal consistency([ResearchGate][1])                          | .91 across > 2,000 surveys([JUX - The Journal of User Experience][4])                                                             |
| **Construct validity** | Strong convergence with overall appeal; weaker with usability/content quality([ResearchGate][1]) | Correlates with task success & other usability scales; discriminates among UI versions([JUX - The Journal of User Experience][4]) |
| **Sensitivity**        | Detects aesthetic differences in as little as one color-scheme change                            | Stable with samples ≥ 8 and across modalities; robust even in small-sample tests                                                  |
| **Cross-cultural use** | Official German & English versions; other languages via forward–back translation                 | Translated into 30+ languages; adjective anchors aid interpretation                                                               |

---

## 5  Administration & Interpretation

### 5.1 When to Use

* **Early concept tests:** gauge first-impression beauty (VisAWI) before coding.
* **Formative usability studies:** add SUS after tasks to track iterative improvements.
* **Benchmarking**: gather both scores to position a product in a 2-D quadrant (High Aesthetics / High Usability, etc.).

### 5.2 Good Practice Tips

1. **Separate the concepts.** VisAWI measures *looks*, SUS measures *use*—do *not* treat one as a surrogate for the other.
2. **Collect immediately post-task/page.** Delay increases recall bias.
3. **Explain the SUS score.** Pair it with the **adjective rating scale** (“Excellent”, “Poor” …) or letter grades to help stakeholders grasp what 62 vs 84 means.([JUX - The Journal of User Experience][4])
4. **Use VisAWI-S under time pressure.** It provides ≈ 90 % of the information with < 50 % of the burden.([ResearchGate][1])
5. **Target thresholds thoughtfully.** For consumer apps aim for SUS ≥ 80 and VisAWI ≥ 5.0; internal enterprise tools may accept lower aesthetics if usability is high.

---

## 6  Strengths and Limitations

|            | Strengths                                                        | Limitations                                                                                                 |
| ---------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **VisAWI** | Multidimensional view of beauty; predictive of revisit intention | Focuses on static visual layer—ignores motion, sound, brand affect                                          |
| **SUS**    | Ultra-fast, language-agnostic, massive comparative norms         | Single global number: cannot pinpoint *where* usability fails; assumes users performed representative tasks |

---

## 7  Recent Developments & Research Directions

* **Positive-item VisAWI-P:** all items phrased positively to reduce careless responding, validated in 2023.([Taylor & Francis Online][5])
* **Item-level SUS benchmarks:** regression equations map each of the 10 items to expected values for a given overall score, helping diagnose weak areas.([JUX - The Journal of User Experience][6])
* **Combined dashboards:** modern UX platforms embed VisAWI-S + SUS alongside task analytics, giving teams live aesthetics/usability telemetry.
* **AI-assisted prediction:** early work uses computer-vision features to estimate VisAWI scores from screenshots, and interaction logs to infer SUS-like usability ratings—mirroring the machine-learning leap seen in readability research.

---

## 8  Conclusion

**VisAWI** and **SUS** remain the gold-standard, low-friction questionnaires for **“Does it *delight*?”** and **“Is it *easy*?”** respectively. Together they provide a **two-axis diagnostic** that quickly flags whether a digital product is merely beautiful, merely usable, both—or neither. Their psychometric robustness, tiny footprint, and huge body of comparative data make them indispensable in evidence-based UX practice. When time is scarce, use VisAWI-S + SUS and you’ll still capture the lion’s share of user sentiment; when stakes are high, run the full VisAWI and triangulate SUS with analytics and task metrics for a deeper, more actionable view.

---

[1]: https://www.researchgate.net/publication/254220651_A_short_version_of_the_visual_aesthetics_of_websites_inventory "(PDF) A short version of the visual aesthetics of websites inventory"
[2]: https://digital.ahrq.gov/sites/default/files/docs/survey/systemusabilityscale%2528sus%2529_comp%255B1%255D.pdf "SUS - A quick and dirty usability scale"
[3]: https://pmc.ncbi.nlm.nih.gov/articles/PMC10909179/?utm_source=chatgpt.com "Validation of system usability scale as a usability metric to evaluate ..."
[4]: https://uxpajournal.org/determining-what-individual-sus-scores-mean-adding-an-adjective-rating-scale/ "Determining What Individual SUS Scores Mean: Adding an Adjective Rating Scale - JUX"
[5]: https://www.tandfonline.com/doi/full/10.1080/10447318.2023.2258634?utm_source=chatgpt.com "Development and Validation of a Positive-Item Version of the Visual ..."
[6]: https://uxpajournal.org/item-benchmarks-system-usability-scale-sus/?utm_source=chatgpt.com "Item Benchmarks for the System Usability Scale - JUX"
