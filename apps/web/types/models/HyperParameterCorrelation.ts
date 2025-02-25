/**
 * Decentralized FDA API
 * A platform for quantifying the effects of every drug, supplement, food, and other factor on your health.
 *
 * OpenAPI spec version: 0.0.1
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { DataSource } from "../models/DataSource"
import { StudyHtml } from "../models/StudyHtml"
import { StudyImages } from "../models/StudyImages"
import { StudyLinks } from "../models/StudyLinks"
import { StudyText } from "../models/StudyText"

export class HyperParameterCorrelation {
  /**
   * Ex: 4.19
   */
  "averageDailyHighCause"?: number
  /**
   * Ex: 1.97
   */
  "averageDailyLowCause"?: number
  /**
   * Ex: 3.0791054117396
   */
  "averageEffect"?: number
  /**
   * Ex: 3.55
   */
  "averageEffectFollowingHighCause"?: number
  /**
   * Ex: 2.65
   */
  "averageEffectFollowingLowCause"?: number
  /**
   * Ex: 0.396
   */
  "averageForwardPearsonCorrelationOverOnsetDelays"?: number
  /**
   * Ex: 0.453667
   */
  "averageReversePearsonCorrelationOverOnsetDelays"?: number
  /**
   * Ex: 0.9855
   */
  "averageVote"?: number
  /**
   * Ex: 164
   */
  "causeChanges"?: number
  "causeDataSource"?: DataSource
  /**
   * Ex: 1
   */
  "causeUserVariableShareUserMeasurements"?: number
  /**
   * Ex: 6
   */
  "causeVariableCategoryId"?: number
  /**
   * Ex: Sleep
   */
  "causeVariableCategoryName"?: string
  /**
   * Ex: MEAN
   */
  "causeVariableCombinationOperation"?: string
  /**
   * Ex: /5
   */
  "causeVariableUnitAbbreviatedName"?: string
  /**
   * Ex: 1448
   */
  "causeVariableId"?: number
  /**
   * Ex: 6
   */
  "causeVariableMostCommonConnectorId"?: number
  /**
   * Ex: Sleep Quality
   */
  "causeVariableName": string
  /**
   * Ex: 0.14344467795996
   */
  "confidenceInterval"?: number
  /**
   * Ex: high
   */
  "confidenceLevel"?: string
  /**
   * Ex: 0.538
   */
  "correlationCoefficient"?: number
  /**
   * Ex: false
   */
  "correlationIsContradictoryToOptimalValues"?: boolean
  /**
   * Ex: 2016-12-28 20:47:30 UTC ISO 8601 YYYY-MM-DDThh:mm:ss
   */
  "createdAt"?: string
  /**
   * Calculated Statistic: Ex: 1.646
   */
  "criticalTValue"?: number
  /**
   * Ex: higher
   */
  "direction"?: string
  /**
   * User-Defined Variable Setting: The amount of time over which a predictor/stimulus event can exert an observable influence on an outcome variable value. For instance, aspirin (stimulus/predictor) typically decreases headache severity for approximately four hours (duration of action) following the onset delay.  Unit: Seconds
   */
  "durationOfAction"?: number
  /**
   * User-Defined Variable Setting: The amount of time over which a predictor/stimulus event can exert an observable influence on an outcome variable value. For instance, aspirin (stimulus/predictor) typically decreases headache severity for approximately four hours (duration of action) following the onset delay.  Unit: Hours
   */
  "durationOfActionInHours"?: number
  /**
   * Ex: 200
   */
  "degreesOfFreedom"?: number
  /**
   * Ex: 145
   */
  "effectNumberOfProcessedDailyMeasurements"?: number
  /**
   * Ex: optimalPearsonProduct is not defined
   */
  "error"?: string
  /**
   * Ex: 193
   */
  "effectChanges"?: number
  "effectDataSource"?: DataSource
  /**
   * Ex: moderately positive
   */
  "effectSize"?: string
  /**
   * Ex: /5
   */
  "effectUnit"?: string
  /**
   * Ex: 1
   */
  "effectUserVariableShareUserMeasurements"?: number
  /**
   * Ex: 1
   */
  "effectVariableCategoryId"?: number
  /**
   * Ex: Emotions
   */
  "effectVariableCategoryName"?: string
  /**
   * Ex: MEAN
   */
  "effectVariableCombinationOperation"?: string
  /**
   * Ex: Mood_(psychology)
   */
  "effectVariableCommonAlias"?: string
  /**
   * Ex: /5
   */
  "effectVariableUnitAbbreviatedName"?: string
  /**
   * Ex: 10
   */
  "effectVariableUnitId"?: number
  /**
   * Ex: 1 to 5 Rating
   */
  "effectVariableUnitName"?: string
  /**
   * Ex: 1398
   */
  "effectVariableId"?: number
  /**
   * Ex: 10
   */
  "effectVariableMostCommonConnectorId"?: number
  /**
   * Ex: Overall Mood
   */
  "effectVariableName": string
  /**
   * Ex: 2014-07-30 12:50:00 UTC ISO 8601 YYYY-MM-DDThh:mm:ss
   */
  "experimentEndTime"?: string
  /**
   * Ex: 2012-05-06 21:15:00 UTC ISO 8601 YYYY-MM-DDThh:mm:ss
   */
  "experimentStartTime"?: string
  /**
   * Ex: 0.528359
   */
  "forwardSpearmanCorrelationCoefficient"?: number
  /**
   * Ex: 298
   */
  "numberOfPairs"?: number
  /**
   * Ex: 0
   */
  "onsetDelay"?: number
  /**
   * Ex: 0
   */
  "onsetDelayInHours"?: number
  /**
   * Ex: -86400
   */
  "onsetDelayWithStrongestPearsonCorrelation"?: number
  /**
   * Ex: -24
   */
  "onsetDelayWithStrongestPearsonCorrelationInHours"?: number
  /**
   * Ex: 0.68582816186982
   */
  "optimalPearsonProduct"?: number
  /**
   * User-Defined Variable Setting: Ex: -1. Unit: User-specified or common.
   */
  "outcomeFillingValue"?: number
  /**
   * User-Defined Variable Setting: Ex: 23. Unit: User-specified or common.
   */
  "outcomeMaximumAllowedValue"?: number
  /**
   * User-Defined Variable Setting: Ex: 0.1. Unit: User-specified or common.
   */
  "outcomeMinimumAllowedValue"?: number
  /**
   * Ex: 0.477
   */
  "pearsonCorrelationWithNoOnsetDelay"?: number
  /**
   * Ex: 0.538
   */
  "predictivePearsonCorrelation"?: number
  /**
   * Ex: 0.538
   */
  "predictivePearsonCorrelationCoefficient"?: number
  /**
   * Ex: RescueTime
   */
  "predictorDataSources"?: string
  /**
   * Ex: -1. Unit: User-specified or common.
   */
  "predictorFillingValue"?: number
  /**
   * Ex: 200. Unit: User-specified or common.
   */
  "predictorMaximumAllowedValue"?: number
  /**
   * Ex: 30. Unit: User-specified or common.
   */
  "predictorMinimumAllowedValue"?: number
  /**
   * Ex: 17. Unit: User-specified or common.
   */
  "predictsHighEffectChange"?: number
  /**
   * Ex: -11. Unit: User-specified or common.
   */
  "predictsLowEffectChange"?: number
  /**
   * Ex: 0.39628900511586
   */
  "pValue"?: number
  /**
   * Ex: 0.528
   */
  "qmScore"?: number
  /**
   * Ex: 0.01377184270977
   */
  "reversePearsonCorrelationCoefficient"?: number
  /**
   * Would you like to make this study publicly visible?
   */
  "shareUserMeasurements"?: boolean
  /**
   * Ex: N1 Study: Sleep Quality Predicts Higher Overall Mood
   */
  "sharingDescription"?: string
  /**
   * Ex: N1 Study: Sleep Quality Predicts Higher Overall Mood
   */
  "sharingTitle"?: string
  /**
   * Ex: 1
   */
  "significantDifference"?: boolean
  /**
   * Ex: 0.9813
   */
  "statisticalSignificance"?: number
  /**
   * Ex: moderate
   */
  "strengthLevel"?: string
  /**
   * Ex: 0.613
   */
  "strongestPearsonCorrelationCoefficient"?: number
  "studyHtml"?: StudyHtml
  "studyImages"?: StudyImages
  "studyLinks"?: StudyLinks
  "studyText"?: StudyText
  /**
   * Ex: 9.6986079652717
   */
  "tValue"?: number
  /**
   * Ex: 2017-05-06 15:40:38 UTC ISO 8601 YYYY-MM-DDThh:mm:ss
   */
  "updatedAt"?: string
  /**
   * Ex: 230
   */
  "userId"?: number
  /**
   * Ex: 1
   */
  "userVote"?: number
  /**
   * Ex: 4.14
   */
  "valuePredictingHighOutcome"?: number
  /**
   * Ex: 3.03
   */
  "valuePredictingLowOutcome"?: number
  /**
   * Sources used to collect data for the outcome variable
   */
  "outcomeDataSources"?: string
  /**
   * Mike Sinn
   */
  "principalInvestigator"?: string
  /**
   * User Variable Relationship when cause and effect are reversed. For any causal relationship, the forward correlation should exceed the reverse correlation.
   */
  "reverseCorrelation"?: number
  /**
   * Ex:
   */
  "averagePearsonCorrelationCoefficientOverOnsetDelays"?: number
  /**
   * Ex: 14764
   */
  "causeNumberOfRawMeasurements"?: number
  /**
   * Ex: 1
   */
  "numberOfUsers"?: number
  /**
   * Ex: 1
   */
  "rawCauseMeasurementSignificance"?: number
  /**
   * Ex: 1
   */
  "rawEffectMeasurementSignificance"?: number
  /**
   * Ex: 1
   */
  "reversePairsCount"?: string
  /**
   * Ex: 1
   */
  "voteStatisticalSignificance"?: number
  /**
   * Ex: 0.011598441286655
   */
  "aggregateQMScore"?: number
  /**
   * Ex: 0.0333
   */
  "forwardPearsonCorrelationCoefficient"?: number
  /**
   * Ex: 6
   */
  "numberOfCorrelations"?: number
  /**
   * Ex: 1 or 0
   */
  "vote"?: number

  static readonly discriminator: string | undefined = undefined

  static readonly attributeTypeMap: Array<{
    name: string
    baseName: string
    type: string
    format: string
  }> = [
    {
      name: "averageDailyHighCause",
      baseName: "averageDailyHighCause",
      type: "number",
      format: "double",
    },
    {
      name: "averageDailyLowCause",
      baseName: "averageDailyLowCause",
      type: "number",
      format: "double",
    },
    {
      name: "averageEffect",
      baseName: "averageEffect",
      type: "number",
      format: "double",
    },
    {
      name: "averageEffectFollowingHighCause",
      baseName: "averageEffectFollowingHighCause",
      type: "number",
      format: "double",
    },
    {
      name: "averageEffectFollowingLowCause",
      baseName: "averageEffectFollowingLowCause",
      type: "number",
      format: "double",
    },
    {
      name: "averageForwardPearsonCorrelationOverOnsetDelays",
      baseName: "averageForwardPearsonCorrelationOverOnsetDelays",
      type: "number",
      format: "double",
    },
    {
      name: "averageReversePearsonCorrelationOverOnsetDelays",
      baseName: "averageReversePearsonCorrelationOverOnsetDelays",
      type: "number",
      format: "double",
    },
    {
      name: "averageVote",
      baseName: "averageVote",
      type: "number",
      format: "",
    },
    {
      name: "causeChanges",
      baseName: "causeChanges",
      type: "number",
      format: "",
    },
    {
      name: "causeDataSource",
      baseName: "causeDataSource",
      type: "DataSource",
      format: "",
    },
    {
      name: "causeUserVariableShareUserMeasurements",
      baseName: "causeUserVariableShareUserMeasurements",
      type: "number",
      format: "",
    },
    {
      name: "causeVariableCategoryId",
      baseName: "causeVariableCategoryId",
      type: "number",
      format: "",
    },
    {
      name: "causeVariableCategoryName",
      baseName: "causeVariableCategoryName",
      type: "string",
      format: "",
    },
    {
      name: "causeVariableCombinationOperation",
      baseName: "causeVariableCombinationOperation",
      type: "string",
      format: "",
    },
    {
      name: "causeVariableUnitAbbreviatedName",
      baseName: "causeVariableUnitAbbreviatedName",
      type: "string",
      format: "",
    },
    {
      name: "causeVariableId",
      baseName: "causeVariableId",
      type: "number",
      format: "",
    },
    {
      name: "causeVariableMostCommonConnectorId",
      baseName: "causeVariableMostCommonConnectorId",
      type: "number",
      format: "",
    },
    {
      name: "causeVariableName",
      baseName: "causeVariableName",
      type: "string",
      format: "",
    },
    {
      name: "confidenceInterval",
      baseName: "confidenceInterval",
      type: "number",
      format: "double",
    },
    {
      name: "confidenceLevel",
      baseName: "confidenceLevel",
      type: "string",
      format: "",
    },
    {
      name: "correlationCoefficient",
      baseName: "correlationCoefficient",
      type: "number",
      format: "double",
    },
    {
      name: "correlationIsContradictoryToOptimalValues",
      baseName: "correlationIsContradictoryToOptimalValues",
      type: "boolean",
      format: "",
    },
    {
      name: "createdAt",
      baseName: "createdAt",
      type: "string",
      format: "",
    },
    {
      name: "criticalTValue",
      baseName: "criticalTValue",
      type: "number",
      format: "double",
    },
    {
      name: "direction",
      baseName: "direction",
      type: "string",
      format: "",
    },
    {
      name: "durationOfAction",
      baseName: "durationOfAction",
      type: "number",
      format: "",
    },
    {
      name: "durationOfActionInHours",
      baseName: "durationOfActionInHours",
      type: "number",
      format: "float",
    },
    {
      name: "degreesOfFreedom",
      baseName: "degreesOfFreedom",
      type: "number",
      format: "",
    },
    {
      name: "effectNumberOfProcessedDailyMeasurements",
      baseName: "effectNumberOfProcessedDailyMeasurements",
      type: "number",
      format: "",
    },
    {
      name: "error",
      baseName: "error",
      type: "string",
      format: "",
    },
    {
      name: "effectChanges",
      baseName: "effectChanges",
      type: "number",
      format: "",
    },
    {
      name: "effectDataSource",
      baseName: "effectDataSource",
      type: "DataSource",
      format: "",
    },
    {
      name: "effectSize",
      baseName: "effectSize",
      type: "string",
      format: "",
    },
    {
      name: "effectUnit",
      baseName: "effectUnit",
      type: "string",
      format: "",
    },
    {
      name: "effectUserVariableShareUserMeasurements",
      baseName: "effectUserVariableShareUserMeasurements",
      type: "number",
      format: "",
    },
    {
      name: "effectVariableCategoryId",
      baseName: "effectVariableCategoryId",
      type: "number",
      format: "",
    },
    {
      name: "effectVariableCategoryName",
      baseName: "effectVariableCategoryName",
      type: "string",
      format: "",
    },
    {
      name: "effectVariableCombinationOperation",
      baseName: "effectVariableCombinationOperation",
      type: "string",
      format: "",
    },
    {
      name: "effectVariableCommonAlias",
      baseName: "effectVariableCommonAlias",
      type: "string",
      format: "",
    },
    {
      name: "effectVariableUnitAbbreviatedName",
      baseName: "effectVariableUnitAbbreviatedName",
      type: "string",
      format: "",
    },
    {
      name: "effectVariableUnitId",
      baseName: "effectVariableUnitId",
      type: "number",
      format: "",
    },
    {
      name: "effectVariableUnitName",
      baseName: "effectVariableUnitName",
      type: "string",
      format: "",
    },
    {
      name: "effectVariableId",
      baseName: "effectVariableId",
      type: "number",
      format: "",
    },
    {
      name: "effectVariableMostCommonConnectorId",
      baseName: "effectVariableMostCommonConnectorId",
      type: "number",
      format: "",
    },
    {
      name: "effectVariableName",
      baseName: "effectVariableName",
      type: "string",
      format: "",
    },
    {
      name: "experimentEndTime",
      baseName: "experimentEndTime",
      type: "string",
      format: "",
    },
    {
      name: "experimentStartTime",
      baseName: "experimentStartTime",
      type: "string",
      format: "",
    },
    {
      name: "forwardSpearmanCorrelationCoefficient",
      baseName: "forwardSpearmanCorrelationCoefficient",
      type: "number",
      format: "double",
    },
    {
      name: "numberOfPairs",
      baseName: "numberOfPairs",
      type: "number",
      format: "",
    },
    {
      name: "onsetDelay",
      baseName: "onsetDelay",
      type: "number",
      format: "",
    },
    {
      name: "onsetDelayInHours",
      baseName: "onsetDelayInHours",
      type: "number",
      format: "float",
    },
    {
      name: "onsetDelayWithStrongestPearsonCorrelation",
      baseName: "onsetDelayWithStrongestPearsonCorrelation",
      type: "number",
      format: "",
    },
    {
      name: "onsetDelayWithStrongestPearsonCorrelationInHours",
      baseName: "onsetDelayWithStrongestPearsonCorrelationInHours",
      type: "number",
      format: "float",
    },
    {
      name: "optimalPearsonProduct",
      baseName: "optimalPearsonProduct",
      type: "number",
      format: "double",
    },
    {
      name: "outcomeFillingValue",
      baseName: "outcomeFillingValue",
      type: "number",
      format: "",
    },
    {
      name: "outcomeMaximumAllowedValue",
      baseName: "outcomeMaximumAllowedValue",
      type: "number",
      format: "double",
    },
    {
      name: "outcomeMinimumAllowedValue",
      baseName: "outcomeMinimumAllowedValue",
      type: "number",
      format: "double",
    },
    {
      name: "pearsonCorrelationWithNoOnsetDelay",
      baseName: "pearsonCorrelationWithNoOnsetDelay",
      type: "number",
      format: "double",
    },
    {
      name: "predictivePearsonCorrelation",
      baseName: "predictivePearsonCorrelation",
      type: "number",
      format: "double",
    },
    {
      name: "predictivePearsonCorrelationCoefficient",
      baseName: "predictivePearsonCorrelationCoefficient",
      type: "number",
      format: "double",
    },
    {
      name: "predictorDataSources",
      baseName: "predictorDataSources",
      type: "string",
      format: "",
    },
    {
      name: "predictorFillingValue",
      baseName: "predictorFillingValue",
      type: "number",
      format: "",
    },
    {
      name: "predictorMaximumAllowedValue",
      baseName: "predictorMaximumAllowedValue",
      type: "number",
      format: "double",
    },
    {
      name: "predictorMinimumAllowedValue",
      baseName: "predictorMinimumAllowedValue",
      type: "number",
      format: "double",
    },
    {
      name: "predictsHighEffectChange",
      baseName: "predictsHighEffectChange",
      type: "number",
      format: "",
    },
    {
      name: "predictsLowEffectChange",
      baseName: "predictsLowEffectChange",
      type: "number",
      format: "",
    },
    {
      name: "pValue",
      baseName: "pValue",
      type: "number",
      format: "double",
    },
    {
      name: "qmScore",
      baseName: "qmScore",
      type: "number",
      format: "double",
    },
    {
      name: "reversePearsonCorrelationCoefficient",
      baseName: "reversePearsonCorrelationCoefficient",
      type: "number",
      format: "double",
    },
    {
      name: "shareUserMeasurements",
      baseName: "shareUserMeasurements",
      type: "boolean",
      format: "",
    },
    {
      name: "sharingDescription",
      baseName: "sharingDescription",
      type: "string",
      format: "",
    },
    {
      name: "sharingTitle",
      baseName: "sharingTitle",
      type: "string",
      format: "",
    },
    {
      name: "significantDifference",
      baseName: "significantDifference",
      type: "boolean",
      format: "",
    },
    {
      name: "statisticalSignificance",
      baseName: "statisticalSignificance",
      type: "number",
      format: "double",
    },
    {
      name: "strengthLevel",
      baseName: "strengthLevel",
      type: "string",
      format: "",
    },
    {
      name: "strongestPearsonCorrelationCoefficient",
      baseName: "strongestPearsonCorrelationCoefficient",
      type: "number",
      format: "double",
    },
    {
      name: "studyHtml",
      baseName: "studyHtml",
      type: "StudyHtml",
      format: "",
    },
    {
      name: "studyImages",
      baseName: "studyImages",
      type: "StudyImages",
      format: "",
    },
    {
      name: "studyLinks",
      baseName: "studyLinks",
      type: "StudyLinks",
      format: "",
    },
    {
      name: "studyText",
      baseName: "studyText",
      type: "StudyText",
      format: "",
    },
    {
      name: "tValue",
      baseName: "tValue",
      type: "number",
      format: "double",
    },
    {
      name: "updatedAt",
      baseName: "updatedAt",
      type: "string",
      format: "",
    },
    {
      name: "userId",
      baseName: "userId",
      type: "number",
      format: "",
    },
    {
      name: "userVote",
      baseName: "userVote",
      type: "number",
      format: "",
    },
    {
      name: "valuePredictingHighOutcome",
      baseName: "valuePredictingHighOutcome",
      type: "number",
      format: "double",
    },
    {
      name: "valuePredictingLowOutcome",
      baseName: "valuePredictingLowOutcome",
      type: "number",
      format: "double",
    },
    {
      name: "outcomeDataSources",
      baseName: "outcomeDataSources",
      type: "string",
      format: "",
    },
    {
      name: "principalInvestigator",
      baseName: "principalInvestigator",
      type: "string",
      format: "",
    },
    {
      name: "reverseCorrelation",
      baseName: "reverseCorrelation",
      type: "number",
      format: "",
    },
    {
      name: "averagePearsonCorrelationCoefficientOverOnsetDelays",
      baseName: "averagePearsonCorrelationCoefficientOverOnsetDelays",
      type: "number",
      format: "float",
    },
    {
      name: "causeNumberOfRawMeasurements",
      baseName: "causeNumberOfRawMeasurements",
      type: "number",
      format: "",
    },
    {
      name: "numberOfUsers",
      baseName: "numberOfUsers",
      type: "number",
      format: "",
    },
    {
      name: "rawCauseMeasurementSignificance",
      baseName: "rawCauseMeasurementSignificance",
      type: "number",
      format: "double",
    },
    {
      name: "rawEffectMeasurementSignificance",
      baseName: "rawEffectMeasurementSignificance",
      type: "number",
      format: "double",
    },
    {
      name: "reversePairsCount",
      baseName: "reversePairsCount",
      type: "string",
      format: "",
    },
    {
      name: "voteStatisticalSignificance",
      baseName: "voteStatisticalSignificance",
      type: "number",
      format: "",
    },
    {
      name: "aggregateQMScore",
      baseName: "aggregateQMScore",
      type: "number",
      format: "double",
    },
    {
      name: "forwardPearsonCorrelationCoefficient",
      baseName: "forwardPearsonCorrelationCoefficient",
      type: "number",
      format: "double",
    },
    {
      name: "numberOfCorrelations",
      baseName: "numberOfCorrelations",
      type: "number",
      format: "",
    },
    {
      name: "vote",
      baseName: "vote",
      type: "number",
      format: "",
    },
  ]

  static getAttributeTypeMap() {
    return HyperParameterCorrelation.attributeTypeMap
  }

  public constructor() {}
}
