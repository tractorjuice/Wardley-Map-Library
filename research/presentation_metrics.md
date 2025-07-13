Below is a concise “quick-look” table of **presentation-quality metrics**—visual, cognitive and usability—arranged much like the earlier readability tables.  Each row shows what the metric measures, the era it came from, the scale it outputs and typical use-cases.  (Because many of these are still active research topics, names and years refer to the best-known or most-cited version.)

| Category                        | Metric / Method                                  | Year (origin)       | Core Inputs / Features                                         | Output Scale                               | Typical Use                            | Key source              |
| ------------------------------- | ------------------------------------------------ | ------------------- | -------------------------------------------------------------- | ------------------------------------------ | -------------------------------------- | ----------------------- |
| **Data-visualisation economy**  | Data-Ink Ratio (Tufte)                           | 1983                | “Data ink” ÷ total ink in a chart                              | 0 – 1 (higher = leaner)                    | Simplifying charts & infographics      | ([Holistics][1])        |
| **Visual clutter / complexity** | Feature Congestion                               | 2007                | Local variance of colour, orientation & intensity across image | Scalar clutter score                       | Screen / cockpit / UI clutter studies  | ([ResearchGate][2])     |
|                                 | Subband Entropy                                  | 2007                | Wavelet-band entropy across image                              | Scalar clutter score                       | Same as above; often paired with FC    | ([DSpace][3])           |
|                                 | Edge Density                                     | 2004                | % pixels classified as edges                                   | Complexity score                           | Early scene & webpage complexity       | ([ResearchGate][2])     |
| **Diagram / graph readability** | Edge-Crossing & Angle metrics                    | 1988 → 2023 updates | No. of crossings, crossing angle, bends                        | “Fewer/bigger = better” heuristic or score | Network & flow-chart layout            | ([yun-vis.net][4])      |
| **Cognitive workload**          | NASA-TLX                                         | 1986                | 6 self-rated workload sub-scales                               | 0 – 100 weighted workload                  | UI prototypes, ATC, med-tech           | ([NASA][5])             |
| **Visual aesthetics**           | VisAWI (Visual Aesthetics of Websites Inventory) | 2009                | 18-item user questionnaire (symmetry, colourfulness, etc.)     | Mean 1 – 7 aesthetic score                 | Comparing website “look & feel”        | ([thielsch.org][6])     |
| **General usability**           | SUS (System Usability Scale)                     | 1986                | 10 Likert items on ease of use                                 | 0 – 100 usability score                    | Web, app & hardware UX                 | ([digital.ahrq.gov][7]) |
| **Web-page element load**       | WebAIM Home-Page Complexity                      | 2019-25             | DOM element count per home page                                | Raw count (avg. 1257 in 2025)              | Tracking rising site complexity & a11y | ([webaim.org][8])       |

---

### How these metrics complement each other

* **What they quantify:**

  * *Economy* (Data-Ink) asks *“How much of what you show is actual information?”*
  * *Clutter* metrics (Feature Congestion, Subband Entropy, Edge Density) estimate how visually “busy” a display is—important for quick visual search and situation awareness.
  * *Graph aesthetics* (edge crossings, angular resolution) improve the legibility of networks and flow-charts, much like reducing long sentences in text.
  * *Cognitive load* (NASA-TLX) captures mental effort imposed by the presentation, even when the visuals themselves look clean—analogous to testing comprehension, not just reading ease.
  * *Aesthetics & usability* (VisAWI, SUS) measure the more holistic, subjective side of presentation quality—people’s gut reaction and ease of action.
  * *Element-count complexity* from WebAIM highlights how sheer **volume** of on-screen items can erode accessibility and overwhelm users, a modern web parallel to “too many long words.”

* **Why no single magic number:**  Like text readability, presentation quality is multi-faceted.  Designers often use *several* of these metrics together—e.g. pairing Feature Congestion to flag busy layouts, VisAWI to check visual appeal, and SUS to confirm overall usability.

* **Research trends:**

  * New work is merging **visual-clutter scores with eye-tracking and neural-net predictors** (e.g. deep-learning saliency models) to forecast user attention more accurately.
  * For diagrams, recent algorithms automatically **rewire or “vertex-split”** graphs until they meet target crossing-angle thresholds, directly optimising the readability metrics.
  * User-scale instruments such as **TLX and SUS are being shortened or embedded in in-app micro-surveys** to give continuous, lightweight feedback during agile design cycles.

Taken together, these metrics play the same role for *layout and visual delivery* that Flesch–Kincaid or Speech Transmission Index play for text and voice: they give **quantitative checkpoints** designers can watch while iterating, ensuring that information *looks* and *feels* as approachable as it *sounds* or *reads*.

[1]: https://www.holistics.io/blog/data-ink-ratio/?utm_source=chatgpt.com "Data-ink Ratio: How to Simplify Data Visualization - Holistics"
[2]: https://www.researchgate.net/publication/239450341_Feature_congestion_A_measure_of_visual_clutter?utm_source=chatgpt.com "(PDF) Feature congestion: A measure of visual clutter - ResearchGate"
[3]: https://dspace.mit.edu/handle/1721.1/37593?utm_source=chatgpt.com "Feature Congestion and Subband Entropy measures of visual clutter"
[4]: https://yun-vis.net/projects/graph/cg2023-preprint.pdf?utm_source=chatgpt.com "[PDF] Improving readability of static, straight-line graph drawings"
[5]: https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-032-cognitive-workload.pdf?utm_source=chatgpt.com "[PDF] Cognitive Workload Assessment Methods OCHMO-TB-032 Rev C"
[6]: https://www.thielsch.org/download/VisAWI/VisAWI_Manual_EN.pdf?utm_source=chatgpt.com "[PDF] VisAWI Manual (Visual Aesthetics of Websites Inventory)"
[7]: https://digital.ahrq.gov/sites/default/files/docs/survey/systemusabilityscale%2528sus%2529_comp%255B1%255D.pdf?utm_source=chatgpt.com "[PDF] SUS - A quick and dirty usability scale - Digital Healthcare Research"
[8]: https://webaim.org/projects/million/?utm_source=chatgpt.com "The WebAIM Million - The 2025 report on the accessibility of the top ..."
