---
description: >-
  The mandate of the dFDA is to promote human health and safety by determining
  the comprehensive positive and negative effects of all foods and drugs.
layout:
  title:
    visible: true
  description:
    visible: true
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: true
---
# 💊 The Decentralized FDA

## 

This [monorepo](https://github.com/FDA-AI/FDAi/blob/develop/docs/contributing/repo-structure.md) contains a set of:

* [FAIR](https://github.com/FDA-AI/FDAi/blob/develop/docs/contributing/fair.md) [libraries](https://github.com/FDA-AI/FDAi/blob/develop/libs)
* [apps](https://github.com/FDA-AI/FDAi/blob/develop/apps)
* autonomous agents to help people and organizations quantify the positive and negative effects of every food, supplement, drug, and treatment on every measurable aspect of human health and happiness.

[![dfda-framework-diagram.png](https://static.crowdsourcingcures.org/dfda/images/dfda-framework-diagram.png)](https://github.com/FDA-AI/FDAi/blob/develop/docs/images/dfda-framework-diagram.png)

# 😕 Why are we doing this?

[](https://github.com/FDA-AI/FDAi#-why-are-we-doing-this)

The current system of clinical research, diagnosis, and treatment is failing the billions of people are suffering from chronic diseases.

[👉 Problems we're trying to fix...](https://github.com/FDA-AI/FDAi/blob/develop/docs/stuff-that-sucks.md)

# 🧪 Our Hypothesis

[](https://github.com/FDA-AI/FDAi#-our-hypothesis)

By harnessing global collective intelligence and oceans of real-world data, we hope to emulate Wikipedia's speed of knowledge generation.

<details open=""><summary>👉 How to generate discoveries 50X faster and 1000X cheaper than current systems...</summary>

## Global Scale Clinical Research + Collective Intelligence = 🤯

[](https://github.com/FDA-AI/FDAi#global-scale-clinical-research--collective-intelligence--)

So in the 90's, Microsoft spent billions hiring thousands of PhDs to create Encarta, the greatest encyclopedia in history. A decade later, when Wikipedia was created, the general consensus was that it was going to be a dumpster fire of lies. Surprisingly, Wikipedia ended up generating information 50X faster than Encarta and was about 1000X cheaper without any loss in accuracy. This is the magical power of crowdsourcing and open collaboration.

Our crazy theory is that we can accomplish the same great feat in the realm of clinical research. By crowdsourcing real-world data and observations from patients, clinicians, and researchers, we hope to generate clinical discoveries 50X faster and 1000X cheaper than current systems.

## The Potential of Real-World Evidence-Based Studies

[](https://github.com/FDA-AI/FDAi#the-potential-of-real-world-evidence-based-studies)

* **Diagnostics** - Data mining and analysis to identify causes of illness
* **Preventative medicine** - Predictive analytics and data analysis of genetic, lifestyle, and social circumstances to prevent disease
* **Precision medicine** - Leveraging aggregate data to drive hyper-personalized care
* **Medical research** - Data-driven medical and pharmacological research to cure disease and discover new treatments and medicines
* **Reduction of adverse medication events** - Harnessing of big data to spot medication errors and flag potential adverse reactions
* **Cost reduction** - Identification of value that drives better patient outcomes for long-term savings
* **Population health** - Monitor big data to identify disease trends and health strategies based on demographics, geography, and socioeconomic

</details>

# 🖥️ FDAi Framework Components

[](https://github.com/FDA-AI/FDAi#%EF%B8%8F-dfda-framework-components)

This is a very high-level overview of the architecture. The three primary primitive components of the FDAi framework are:

1. [Data Silo API Gateway Nodes](https://github.com/FDA-AI/FDAi#1-data-silo-api-gateway-nodes) that facilitate data export from data silos
2. [PersonalFDA Nodes](https://github.com/FDA-AI/FDAi#2-personalfda-nodes) that import, store, and analyze your data to identify how various factors affect your health
3. [Clinipedia](https://github.com/FDA-AI/FDAi#3-clinipediathe-wikipedia-of-clinical-research) that contains the aggregate of all available data on the effects of every food, drug, supplement, and medical intervention on human health.

The core characteristics that define the FDAi are:

* **Modularity** - a set of modular libraries and tools that can be reused in any project
* **Protocols** - an abstract framework of core primitive components rather than a specific implementation
* **Interoperability** - a directory of existing open-source projects that can be used to fulfill the requirements of each primitive or component
* **Collective Intelligence** - a collaborative effort, so please feel free to [contribute or edit anything](https://github.com/FDA-AI/FDAi/blob/develop/docs/contributing.md)!

[![dfda-framework-diagram.png](https://static.crowdsourcingcures.org/img/dfda-framework-diagram.png)](https://static.crowdsourcingcures.org/img/dfda-framework-diagram.png)

## 1. Data Silo API Gateway Nodes

[](https://github.com/FDA-AI/FDAi#1-data-silo-api-gateway-nodes)

[![dfda-gateway-api-node-silo.jpg](https://static.crowdsourcingcures.org/dfda/components/data-silo-gateway-api-nodes/dfda-gateway-api-node-silo.png)](https://static.crowdsourcingcures.org/dfda/components/data-silo-gateway-api-nodes/dfda-gateway-api-node-silo.png)

[FDAi Gateway API Nodes](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/data-silo-gateway-api-nodes) should make it easy for data silos, such as hospitals and digital health apps, to let people export and save their data locally in their [PersonalFDA Nodes](https://github.com/FDA-AI/FDAi#2-personalfda-nodes).

**👉 [Learn More About Gateway APIs](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/data-silo-gateway-api-nodes/data-silo-api-gateways.md)**

## 2. PersonalFDA Nodes

[](https://github.com/FDA-AI/FDAi#2-personalfda-nodes)

[PersonalFDA Nodes](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/personal-fda-nodes/personal-fda-nodes.md) are applications that can run on your phone or computer. They import, store, and analyze your data to identify how various factors affect your health. They can also be used to share anonymous analytical results with the [Clinipedia FDAi Wiki](https://github.com/FDA-AI/FDAi#3-clinipediathe-wikipedia-of-clinical-research) in a secure and privacy-preserving manner.

[PersonalFDA Nodes](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/personal-fda-nodes/personal-fda-nodes.md) are composed of two components, a [Digital Twin Safe](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/digital-twin-safe/digital-twin-safe.md) and a [personal AI agent](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/optimiton-ai-agent/optomitron-ai-agent.md) applies causal inference algorithms to estimate how various factors affect your health.

### 2.1. Digital Twin Safes

[](https://github.com/FDA-AI/FDAi#21-digital-twin-safes)

[![digital-twin-safe-no-text.jpg](https://static.crowdsourcingcures.org/img/digital-twin-safe-no-text.jpg)](https://static.crowdsourcingcures.org/img/digital-twin-safe-no-text.jpg)

A local application for self-sovereign import and storage of personal data.

**👉[Learn More or Contribute to Digital Twin Safe](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/digital-twin-safe/digital-twin-safe.md)**

### 2.2. Personal AI Agents

[](https://github.com/FDA-AI/FDAi#22-personal-ai-agents)

[Personal AI agents](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/optimiton-ai-agent/optomitron-ai-agent.md) that live in your [PersonalFDA nodes](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/personal-fda-nodes/personal-fda-nodes.md) and use [causal inference](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/optimiton-ai-agent/optomitron-ai-agent.md) to estimate how various factors affect your health.

[![data-import-and-analysis.gif](https://static.crowdsourcingcures.org/img/data-import-and-analysis.gif)](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/optimiton-ai-agent/optomitron-ai-agent.md)

**👉[Learn More About Optimitron](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/optimiton-ai-agent/optomitron-ai-agent.md)**

## 3. Clinipedia—The Wikipedia of Clinical Research

[](https://github.com/FDA-AI/FDAi#3-clinipediathe-wikipedia-of-clinical-research)

[![clinipedia_globe_circle.jpg](https://static.crowdsourcingcures.org/dfda/components/clinipedia/clinipedia_globe_circle.png)](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/clinipedia/clinipedia.md)

The [Clinipedia wiki](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/clinipedia/clinipedia.md) should be a global knowledge repository containing the aggregate of all available data on the effects of every food, drug, supplement, and medical intervention on human health.

**[👉 Learn More or Contribute to the Clinipedia](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/clinipedia/clinipedia.md)**

### 3.1 Outcome Labels

[](https://github.com/FDA-AI/FDAi#31-outcome-labels)

A key component of Clinipedia is [**Outcome Labels**](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/outcome-labels/outcome-labels.md) that list the degree to which the product is likely to improve or worsen specific health outcomes or symptoms.

[![outcome-labels.png](https://static.crowdsourcingcures.org/dfda/components/outcome-labels/outcome-labels.png)](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/outcome-labels/outcome-labels.png)

**👉 [Learn More About Outcome Labels](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/outcome-labels/outcome-labels.md)**

## Human-AI Collective Intelligence Platform

[](https://github.com/FDA-AI/FDAi#human-ai-collective-intelligence-platform)

A collective intelligence coordination platform is needed for facilitating cooperation, communication, and collaborative actions among contributors.

**[👉 Learn More or Contribute to the FDAi Collaboration Framework](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/human-ai-collective-intelligence-platform/dfda-collaboration-framework.md)**

# Roadmap

[](https://github.com/FDA-AI/FDAi#roadmap)

We'd love your help and input in determining an optimal roadmap for this project.

**[👉 Click Here for a Detailed Roadmap](https://github.com/FDA-AI/FDAi/blob/develop/docs/roadmap.md)**


# v1 Prototype

[](https://github.com/FDA-AI/FDAi#fdai-v1-prototype)

We've got a monolithic centralized implementation of the FDAi at [apps/dfda-1](https://github.com/FDA-AI/FDAi/blob/develop/apps/dfda-1) that we're wanting to modularize and decentralize into a set of [FAIR](https://github.com/FDA-AI/FDAi/blob/develop/docs/contributing/fair.md) [libraries](https://github.com/FDA-AI/FDAi/blob/develop/libs) and plugins that can be shared with other apps.

Currently, the main apps are the [Demo Data Collection, Import, and Analysis App](https://safe.dfda.earth/) and the [Journal of Citizen Science](https://studies.dfda.earth/).

### Features

[](https://github.com/FDA-AI/FDAi#features)

* [Data Collection](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/data-collection/data-collection.md)
* [Data Import](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/data-import/data-import.md)
* [Data Analysis](https://github.com/FDA-AI/FDAi#data-analysis)
  * [🏷️Outcome Labels](https://github.com/FDA-AI/FDAi#-outcome-labels)
  * [🔮Predictor Search Engine](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/predictor-search-engine/predictor-search-engine.md)
  * [🥕 Root Cause Analysis Reports](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/root-cause-analysis-reports/root-cause-analysis-reports.md)
  * [📜Observational Mega-Studies](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/observational-studies/observational-studies.md)
* [Real-Time Decision Support Notifications](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/decision-support-notifications)
* [No Code Health App Builder](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/no-code-app-builder)
* [Personal AI Agent](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/optimiton-ai-agent/optomitron-ai-agent.md)
* [Browser Extension](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/browser-extension)

[![FDAi screenshots](https://github.com/FDA-AI/FDAi/raw/develop/apps/dfda-1/public/app/public/img/screenshots/record-inbox-import-connectors-analyze-study.png)](https://github.com/FDA-AI/FDAi/blob/develop/apps/dfda-1/public/app/public/img/screenshots/record-inbox-import-connectors-analyze-study.png)

[![Reminder Inbox](https://github.com/FDA-AI/FDAi/raw/develop/apps/dfda-1/public/app/public/img/screenshots/reminder-inbox-screenshot-no-text.png)](https://github.com/FDA-AI/FDAi/blob/develop/apps/dfda-1/public/app/public/img/screenshots/reminder-inbox-screenshot-no-text.png)

Collects and aggregate data on symptoms, diet, sleep, exercise, weather, medication, and anything else from dozens of life-tracking apps and devices. Analyzes data to reveal hidden factors exacerbating or improving symptoms of chronic illness.

### Web Notifications

[](https://github.com/FDA-AI/FDAi#web-notifications)

Web and mobile push notifications with action buttons.

[![web notification action buttons](https://static.crowdsourcingcures.org/dfda/components/data-collection/web-notification-action-buttons.png)](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/data-collection/web-notification-action-buttons.png)

### Browser Extensions

[](https://github.com/FDA-AI/FDAi#browser-extensions)

By using the Browser Extension, you can track your mood, symptoms, or any outcome you want to optimize in a fraction of a second using a unique popup interface.

[![Chrome Extension](https://static.crowdsourcingcures.org/dfda/components/browser-extension/browser-extension.png)](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/browser-extension/browser-extension.png)

### Data Analysis

[](https://github.com/FDA-AI/FDAi#data-analysis)

The Analytics Engine performs temporal precedence accounting, longitudinal data aggregation, erroneous data filtering, unit conversions, ingredient tagging, and variable grouping to quantify correlations between symptoms, treatments, and other factors.

It then pairs every combination of variables and identifies likely causal relationships using correlation mining algorithms in conjunction with a pharmacokinetic model. The algorithms first identify the onset delay and duration of action for each hypothetical factor. It then identifies the optimal daily values for each factor.

[👉 More info about data analysis](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/data-analysis/data-analysis.md)

### 🏷 Outcome Labels

[](https://github.com/FDA-AI/FDAi#-outcome-labels)

[![outcome-labels-plugin.png](https://static.crowdsourcingcures.org/dfda/components/outcome-labels/outcome-labels.png)](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/outcome-labels/outcome-labels.png)

[More info about outcome labels](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/outcome-labels/outcome-labels.md)

### Real-time Decision Support Notifications

[](https://github.com/FDA-AI/FDAi#real-time-decision-support-notifications)

[![](https://static.crowdsourcingcures.org/dfda/components/decision-support-notifications/notifications-screenshot-slide.png)](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/decision-support-notifications/notifications-screenshot-slide.png)

[More info about real time decision support](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/outcome-labels/outcome-labels.md)

### 📈 Predictor Search Engine

[](https://github.com/FDA-AI/FDAi#-predictor-search-engine)

[![Predictor Search Engine](https://static.crowdsourcingcures.org/dfda/components/predictor-search-engine/predictor-search-simple-list-zoom.png)](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/predictor-search-engine/predictor-search-engine.md)

[👉 More info about the predictor search engine...](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/predictor-search-engine/predictor-search-engine.md)

### Auto-Generated Observational Studies

[](https://github.com/FDA-AI/FDAi#auto-generated-observational-studies)

[![](https://static.crowdsourcingcures.org/dfda/components/observational-studies/observational-studies.png)](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/observational-studies/observational-studies.png)

[👉 More info about observational studies...](https://github.com/FDA-AI/FDAi/blob/develop/docs/components/observational-studies/observational-studies.md)

## 🧞Be Careful What You Wish For

Imagine you met a magical genie.  Imagine you wished for it to fulfill the FDA Congressional Mandate to:

> Ensure the safety and efficacy of all drugs and medical devices

**Q: How could the genie PERFECTLY achieve this? 🤔**

**A: Ensure that no one ever takes a new drug again. **

That would 100% guarantee that no one ever takes a medication that may or may not be effective.

In practice, we've seen a less absolutist interpretation of the mandate. So instead of rejecting all new treatments, we have simply exponentially increased the regulatory barrier. Since 1962, when Congress imposed the current efficacy requirement, the cost of bringing a new therapy to market has increased 15X (1521%).

## [](https://why.dfda.earth/#the-real-goal-is-human-health-and-safety)

The Real Goal Is Human Health and Safety

☠️ [60 million](https://www.theworldcounts.com/populations/world/deaths) people die every year because we don't have adequate treatments for them.

🤒 [2.5 billion](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6214883/) people suffer from chronic diseases for which we have no cures.

Congress created the FDA to protect and promote human health and safety. Unfortunately, the 1962 efficacy amendment has **become a significant obstacle to the work of scientists who are trying to discover new cures.**

### [](https://why.dfda.earth/#problems-that-could-be-solved-with-a-decentralized-fda)

Problems that Could be Solved with a Decentralized FDA

It takes over [10 years and \$2.6 billion](https://www.semanticscholar.org/paper/Innovation-in-the-pharmaceutical-industry%3A-New-of-DiMasiGrabowski/3275f31c072ac11c6ca7a5260bd535720f07df41) to bring a drug to market (including failed attempts). It costs [\$41k](https://www.clinicalleader.com/doc/getting-a-handle-on-clinical-trial-costs-0001) per subject in Phase III clinical trials.

The high costs lead to:

**1. No Data on Unpatentable Molecules**

[🥫**No Data on Unpatentable Molecules**](https://why.dfda.earth/1-introduction-and-challenges/no-data-on-unpatentable-molecules)We still know next to nothing about the long-term effects of 99.9% of the 4 pounds of over [7,000](https://www.dailymail.co.uk/health/article-8757191/Are-additives-food-making-ill.html) different synthetic or natural compounds. This is because there's only sufficient incentive to research patentable molecules.

![](https://why.dfda.earth/~gitbook/image?url=https%3A%2F%2F2775799074-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FgAWf5oBWdPgEKHRT7zcm%252Fuploads%252Fgit-blob-85b02a7606536e4c41115ae363dda1b916c66fd8%252Fchemicals-in-our-diet.png%3Falt%3Dmedia&width=768&dpr=4&quality=100&sign=3912abb6&sv=1)

Number of Food Additives for Which We Have Long-Term Toxicology Data

**2. Lack of Incentive to Discover Every Application of Off-Patent Treatments**

Most of the known diseases (approximately 95%) are classified as rare diseases. Currently, a pharmaceutical company must predict particular conditions to treat before running a clinical trial. Suppose a drug is effective for other diseases after the patent expires. In that case, there isn't a financial incentive to get it approved for the different conditions.

**3. No Long-Term Outcome Data**

It's not financially feasible to collect a participant's data for years or decades. Thus, we don't know if the long-term effects of a drug are worse than the initial benefits.

**4. Negative Results Aren't Published**

Pharmaceutical companies tend to only report "positive" results. That leads to other companies wasting money repeating research on the same dead ends.

**5. Trials Exclude a Vast Majority of The Population**

One investigation found that only [14.5%](https://www.ncbi.nlm.nih.gov/pubmed/14628985) of patients with major depressive disorder fulfilled the eligibility requirements for enrollment in an antidepressant trial. Furthermore, most patient sample sizes are very small and sometimes include only 20 people.

**6. We Only Know 0.000000002% of What is Left to be Researched**

The more research studies we read, the more we realize we don't know. Nearly every study ends with the phrase "more research is needed".

If you multiply the [166 billion](https://www.nature.com/articles/549445a) molecules with drug-like properties by the [10,000](https://www.washingtonpost.com/news/fact-checker/wp/2016/11/17/are-there-really-10000-diseases-and-500-cures/) known diseases, that's 1,162,000,000,000,000 combinations. So far, we've studied [21,000 compounds](https://www.centerwatch.com/articles/12702-new-mit-study-puts-clinical-research-success-rate-at-14-percent). That means we only know 0.000000002% of the effects left to be discovered.

![](https://why.dfda.earth/~gitbook/image?url=https%3A%2F%2F2775799074-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FgAWf5oBWdPgEKHRT7zcm%252Fuploads%252Fgit-blob-2445afa966b10f78567b89d51b12a4fee9d8edb4%252Fstudied-molecules-chart-no-background.png%3Falt%3Dmedia&width=768&dpr=4&quality=100&sign=84a999cc&sv=1)

[](https://why.dfda.earth/#how-a-decentralized-fda-could-overcome-perverse-incentives)

How a Decentralized FDA Could Overcome Perverse Incentives

**Overcoming Cognitive Bias Against Acts of Commission**

Humans have a cognitive bias towards weighting harmful acts of commission to be worse than acts of omission even if the act of omission causes greater harm. It's seen in the trolley problem where people generally aren't willing to push a fat man in front of a train to save a family even though more lives would be saved.

Medical researcher Dr. Henry I. Miller, MS, MD described his experience working at the FDA, “In the early 1980s,” Miller wrote, “when I headed the team at the FDA that was reviewing the NDA [application] for recombinant human insulin…my supervisor refused to sign off on the approval,” despite ample evidence of the drug’s ability to safely and effectively treat patients. His supervisor rationally concluded that, if there was a death or complication due to the medication, heads would roll at the FDA—including his own. So the personal risk of approving a drug is magnitudes larger than the risk of rejecting it.

In a DAO comprised of a large number of prominent experts, no individual could be blamed or have their career destroyed for making a correct decision to save the invisible lives of the many at the risk of the lives of the few.

**It's Impossible to Report on Deaths That Occurred Due to Unavailable Treatments**

Here's a news story from the Non-Existent Times by No One Ever without a picture of all the people that die from lack of access to life-saving treatments that might have been.

![](https://why.dfda.earth/~gitbook/image?url=https%3A%2F%2F2775799074-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FgAWf5oBWdPgEKHRT7zcm%252Fuploads%252Fgit-blob-3cdae51e77f6a2cbb4c8087d9a67fbbe0aeadc33%252Fnon-existent-times.png%3Falt%3Dmedia&width=768&dpr=4&quality=100&sign=c4309f23&sv=1)

This means that it's only logical for regulators to reject drug applications by default. The personal risks of approving a drug with any newsworthy side effect far outweigh the personal risk of preventing access to life-saving treatment.

**Types of Error in FDA Approval Decision**


|                             | Drug Is Beneficial                            | Drug Is Harmful                                     |
| --------------------------- | --------------------------------------------- | --------------------------------------------------- |
| FDA Allows the Drug         | Correct Decision                              | Victims are identifiable and might appear on Oprah. |
| FDA Does Not Allow the Drug | Victims are not identifiable or acknowledged. | Correct Decision                                    |

#### [](https://why.dfda.earth/#undefined)

[🔮**Pre-Determining Clinical Endpoints Requires Psychic Powers**](https://why.dfda.earth/1-introduction-and-challenges/pre-determining-clinical-endpoints-requires-psychic-powers)[❓**We Know Next to Nothing**](https://why.dfda.earth/1-introduction-and-challenges/page-1)### [](https://why.dfda.earth/#undefined-1)

[🌎**Cost Savings from Decentralized Clinical Trials**](https://why.dfda.earth/2-solution/cost-savings-from-decentralized-clinical-trials)

### [](https://why.dfda.earth/#historical-evidence-suggesting-that-crowdsourcing-clinical-research-works)



[Next **Historical Evidence Supporting Decentralized Efficacy Trials**](https://why.dfda.earth/historical-evidence-supporting-decentralized-efficacy-trials)
