import {CompanionFeedbackDefinitions, CompanionFeedbackDefinition, DropdownChoice} from '@companion-module/base'
import { MilluminConfig } from './config'
import { InstanceBaseExt } from './utils'
import { combineRgb } from "@companion-module/base";
import {graphics} from "companion-module-utils";
import {OptionsBar} from "companion-module-utils/dist/graphics";

export enum FeedbackId {
	PROGRESS_BAR = 'progressBar'
}

const green = combineRgb(0,255,0);
const yellow = combineRgb(255,255,0);

// @ts-ignore
export function getFeedbacks(instance: InstanceBaseExt<MilluminConfig>): CompanionFeedbackDefinitions {
	let trackedLayers: DropdownChoice[] = []

	for (const trackedLayer in instance.mediaLayers) {
		trackedLayers.push({
			id: trackedLayer,
			label: trackedLayer,
		})
	}

	const feedbacks: { [id in FeedbackId]: CompanionFeedbackDefinition | undefined } = {
		[FeedbackId.PROGRESS_BAR]: {
			type: 'advanced',
			name: 'Media on Layer / Progress Bar',
			description: 'Show a progress bar of media currently playing on layer',
			options: [
				{
					id: 'layer',
					type: 'dropdown',
					choices: trackedLayers,
					label: 'Layer on media',
					default: 'Global'
				},
				{
					id: 'hideWhenNotRunning',
					type: 'checkbox',
					label: 'Hide when not running',
					default: true,
				},
				{
					id: 'expiringInSeconds',
					type: 'number',
					label: 'Change to expiring color at remaining seconds',
					default: 15,
					min: 0,
					max: 1000,
				},
				{
					type: 'colorpicker',
					label: 'Running color',
					id: 'runningColor',
					default: green,
				},
				{
					type: 'colorpicker',
					label: 'Expiring color',
					id: 'expiringColor',
					default: yellow,
				},
			],
			callback: async (feedback) => {
				const mediaLayer = instance.mediaLayers[feedback.options.layer!.toString()]

				if (feedback.options.hideWhenNotRunning && mediaLayer.duration === 0) {
					return {};
				}

				const isExpiring = (mediaLayer.duration - mediaLayer.elapsedTime) < feedback.options.expiringInSeconds!
				let colors = [];

				if (isExpiring) {
					colors = [
						{ size: 100, color: +feedback.options.expiringColor!, background: +feedback.options.expiringColor!, backgroundOpacity: 64 },
					]
				} else {
					colors = [
						{ size: 100, color: +feedback.options.runningColor!, background: +feedback.options.runningColor!, backgroundOpacity: 64 },
					]
				}

				const options: OptionsBar = {
					width: feedback.image!.width,
					height: feedback.image!.height,
					colors: colors,
					barLength: 62,
					barWidth: 8,
					value:  100 - (100 / mediaLayer.duration * mediaLayer.elapsedTime),
					type: 'horizontal',
					offsetX: 5,
					offsetY: feedback.image!.height > 58 ? 62 : 48,
					opacity: 255
				}

				return {
					imageBuffer: graphics.bar(options)
				}
			}
		}
	}
	return feedbacks
}
