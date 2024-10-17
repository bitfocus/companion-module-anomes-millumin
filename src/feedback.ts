import { CompanionFeedbackDefinitions, CompanionFeedbackDefinition } from '@companion-module/base'
import { MilluminConfig } from './config'
import { InstanceBaseExt } from './utils'

export enum FeedbackId {}

export function GetFeedbacks(instance: InstanceBaseExt<MilluminConfig>): CompanionFeedbackDefinitions {
	const feedbacks: { [id in FeedbackId]: CompanionFeedbackDefinition | undefined } = {}
	return feedbacks
}
