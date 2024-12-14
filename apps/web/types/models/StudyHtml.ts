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

export class StudyHtml {
  /**
   * Embeddable chart html
   */
  "chartHtml": string
  /**
   * Play Store, App Store, Chrome Web Store
   */
  "downloadButtonsHtml"?: string
  /**
   * Embeddable study including HTML head section charts.  Modifiable css classes are study-title, study-section-header, study-section-body
   */
  "fullPageWithHead"?: string
  /**
   * Embeddable study text html including charts.  Modifiable css classes are study-title, study-section-header, study-section-body
   */
  "fullStudyHtml": string
  /**
   * Embeddable study html including charts and css styling
   */
  "fullStudyHtmlWithCssStyles"?: string
  /**
   * Instructions for study participation
   */
  "participantInstructionsHtml"?: string
  /**
   * Embeddable table with statistics
   */
  "statisticsTableHtml"?: string
  /**
   * Text summary
   */
  "studyAbstractHtml"?: string
  /**
   * Title, study image, abstract with CSS styling
   */
  "studyHeaderHtml"?: string
  /**
   * PNG image
   */
  "studyImageHtml"?: string
  /**
   * Facebook, Twitter, Google+
   */
  "studyMetaHtml"?: string
  /**
   * Formatted study text sections
   */
  "studyTextHtml"?: string
  "socialSharingButtonHtml"?: string
  "studySummaryBoxHtml"?: string

  static readonly discriminator: string | undefined = undefined

  static readonly attributeTypeMap: Array<{
    name: string
    baseName: string
    type: string
    format: string
  }> = [
    {
      name: "chartHtml",
      baseName: "chartHtml",
      type: "string",
      format: "",
    },
    {
      name: "downloadButtonsHtml",
      baseName: "downloadButtonsHtml",
      type: "string",
      format: "",
    },
    {
      name: "fullPageWithHead",
      baseName: "fullPageWithHead",
      type: "string",
      format: "",
    },
    {
      name: "fullStudyHtml",
      baseName: "fullStudyHtml",
      type: "string",
      format: "",
    },
    {
      name: "fullStudyHtmlWithCssStyles",
      baseName: "fullStudyHtmlWithCssStyles",
      type: "string",
      format: "",
    },
    {
      name: "participantInstructionsHtml",
      baseName: "participantInstructionsHtml",
      type: "string",
      format: "",
    },
    {
      name: "statisticsTableHtml",
      baseName: "statisticsTableHtml",
      type: "string",
      format: "",
    },
    {
      name: "studyAbstractHtml",
      baseName: "studyAbstractHtml",
      type: "string",
      format: "",
    },
    {
      name: "studyHeaderHtml",
      baseName: "studyHeaderHtml",
      type: "string",
      format: "",
    },
    {
      name: "studyImageHtml",
      baseName: "studyImageHtml",
      type: "string",
      format: "",
    },
    {
      name: "studyMetaHtml",
      baseName: "studyMetaHtml",
      type: "string",
      format: "",
    },
    {
      name: "studyTextHtml",
      baseName: "studyTextHtml",
      type: "string",
      format: "",
    },
    {
      name: "socialSharingButtonHtml",
      baseName: "socialSharingButtonHtml",
      type: "string",
      format: "",
    },
    {
      name: "studySummaryBoxHtml",
      baseName: "studySummaryBoxHtml",
      type: "string",
      format: "",
    },
  ]

  static getAttributeTypeMap() {
    return StudyHtml.attributeTypeMap
  }

  public constructor() {}
}