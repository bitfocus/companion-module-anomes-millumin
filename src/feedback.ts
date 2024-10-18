import { CompanionFeedbackDefinitions, CompanionFeedbackDefinition } from '@companion-module/base'
import { MilluminConfig } from './config'
import { InstanceBaseExt } from './utils'

export enum FeedbackId {}

// @ts-ignore
export function getFeedbacks(instance: InstanceBaseExt<MilluminConfig>): CompanionFeedbackDefinitions {
	const feedbacks: { [id in FeedbackId]: CompanionFeedbackDefinition | undefined } = {}
	return feedbacks
}
