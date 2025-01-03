import { ModelParameter } from '../types';

export const muscleMassParameters: Record<string, ModelParameter> = {
    resting_metabolic_rate: {
        displayName: "Resting Metabolic Rate",
        defaultValue: 1800,
        unitName: "calories/day",
        description: "Average number of calories burned at rest per day, influenced by total muscle mass",
        sourceUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4535334/",
        emoji: "🔥"
    },
    insulin_sensitivity: {
        displayName: "Baseline Insulin Sensitivity",
        defaultValue: 1.0,
        unitName: "relative scale",
        description: "Baseline measure of how effectively cells respond to insulin, with skeletal muscle accounting for 75-90% of insulin-stimulated glucose uptake",
        sourceUrl: "https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2021.656909/full",
        emoji: "📊"
    },
    fall_risk: {
        displayName: "Annual Fall Risk",
        defaultValue: 0.15,
        unitName: "probability",
        description: "Probability of experiencing a fall within a year, significantly impacted by muscle mass",
        sourceUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8775372/",
        emoji: "⚠️"
    },
    healthcare_costs: {
        displayName: "Annual Healthcare Costs",
        defaultValue: 11000,
        unitName: "USD/person/year",
        description: "Average annual healthcare costs per person, influenced by muscle-related health outcomes",
        sourceUrl: "https://aspe.hhs.gov/sites/default/files/documents/e2b650cd64cf84aae8ff0fae7474af82/SDOH-Evidence-Review.pdf",
        emoji: "💰"
    },
    disability_risk: {
        displayName: "Annual Disability Risk",
        defaultValue: 0.10,
        unitName: "probability",
        description: "Annual probability of developing a disability, modifiable through muscle mass maintenance",
        sourceUrl: "https://www.nia.nih.gov/about/aging-strategic-directions-research/goal-society-policy",
        emoji: "🦽"
    },
    mortality_risk: {
        displayName: "Annual Mortality Risk",
        defaultValue: 0.02,
        unitName: "probability",
        description: "Annual probability of death in the target population, significantly influenced by muscle mass levels",
        sourceUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9209691/",
        emoji: "📉"
    },
    muscle_calorie_burn: {
        displayName: "Muscle Calorie Burn Rate",
        defaultValue: 8,
        unitName: "calories/lb/day",
        description: "Number of calories burned per pound of muscle per day at rest, based on clinical studies",
        sourceUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4535334/",
        emoji: "💪"
    },
    insulin_sensitivity_per_lb: {
        displayName: "Insulin Sensitivity Improvement per Pound",
        defaultValue: 0.02,
        unitName: "relative improvement/lb",
        description: "Improvement in insulin sensitivity per pound of muscle gained, based on clinical trials",
        sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/34054574/",
        emoji: "📈"
    },
    fall_risk_reduction_per_lb: {
        displayName: "Fall Risk Reduction per Pound",
        defaultValue: 0.015,
        unitName: "reduction/lb",
        description: "Reduction in fall risk per pound of muscle gained, supported by meta-analysis showing up to 30% maximum reduction",
        sourceUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8775372/",
        emoji: "🛡️"
    },
    mortality_reduction_per_lb: {
        displayName: "Mortality Reduction per Pound",
        defaultValue: 0.01,
        unitName: "reduction/lb",
        description: "Reduction in mortality risk per pound of muscle gained, with maximum reduction of 20% based on meta-analysis",
        sourceUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9209691/",
        emoji: "❤️"
    },
    fall_cost: {
        displayName: "Cost per Fall",
        defaultValue: 10000,
        unitName: "USD/fall",
        description: "Average healthcare cost associated with a fall incident based on comprehensive economic analyses",
        sourceUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6089380/",
        emoji: "🏥"
    },
    productivity_gain_per_lb: {
        displayName: "Productivity Gain per Pound",
        defaultValue: 100,
        unitName: "USD/lb/year",
        description: "Estimated annual productivity gain per pound of muscle mass based on health outcomes research",
        sourceUrl: "https://www.hhs.gov/sites/default/files/surgeon-general-social-connection-advisory.pdf",
        emoji: "💼"
    },
    qaly_gain_per_lb: {
        displayName: "QALY Gain per Pound",
        defaultValue: 0.02,
        unitName: "QALY/lb",
        description: "Quality-adjusted life years gained per pound of muscle mass, based on mortality and health outcome studies",
        sourceUrl: "https://www.ahajournals.org/doi/10.1161/CIR.0000000000000973",
        emoji: "✨"
    },
    discount_rate: {
        displayName: "Annual Discount Rate",
        defaultValue: 0.03,
        unitName: "rate",
        description: "Annual rate used for discounting future economic benefits",
        sourceUrl: "https://www.whitehouse.gov/wp-content/uploads/2023/01/M-23-05-2023-Discount-Rates.pdf",
        emoji: "📅"
    }
}; 