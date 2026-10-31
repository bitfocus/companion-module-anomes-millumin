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
const orange = combineRgb(255,140,0);
const red = combineRgb(255,0,0);


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
			description: 'Show a progress bar of media currently playing on layer. Green → Orange (≤30s) → Red (≤10s)',
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
					id: 'orangeSeconds',
					type: 'textinput',
					label: 'Change to orange at remaining seconds',
					default: '30',
					useVariables: true,
				},
				{
					id: 'redSeconds',
					type: 'textinput',
					label: 'Change to red at remaining seconds',
					default: '10',
					useVariables: true,
				},
				{
					type: 'colorpicker',
					label: 'Running color (green)',
					id: 'runningColor',
					default: green,
				},
				{
					type: 'colorpicker',
					label: 'Warning color (orange)',
					id: 'warningColor',
					default: orange,
				},
				{
					type: 'colorpicker',
					label: 'Critical color (red)',
					id: 'criticalColor',
					default: red,
				},
			],
			callback: async (feedback) => {
				const mediaLayer = instance.mediaLayers[feedback.options.layer!.toString()]

				if (feedback.options.hideWhenNotRunning && mediaLayer.duration === 0) {
					return {};
				}

				const remainingSeconds = mediaLayer.duration - mediaLayer.elapsedTime

				// Parse variable-aware threshold values
				const orangeResolved = await instance.parseVariablesInString(String(feedback.options.orangeSeconds ?? '30'))
				const redResolved = await instance.parseVariablesInString(String(feedback.options.redSeconds ?? '10'))
				const orangeThreshold = parseFloat(orangeResolved) || 30
				const redThreshold = parseFloat(redResolved) || 10

				// Determine bar color: green → orange → red
				let barColor: number
				if (remainingSeconds <= redThreshold) {
					barColor = +feedback.options.criticalColor!
				} else if (remainingSeconds <= orangeThreshold) {
					barColor = +feedback.options.warningColor!
				} else {
					barColor = +feedback.options.runningColor!
				}

				const colors = [
					{ size: 100, color: barColor, background: barColor, backgroundOpacity: 64 },
				]

				// Progress goes left-to-right: 0% at start, 100% at end
				const progressPercent = mediaLayer.duration > 0
					? (100 / mediaLayer.duration * mediaLayer.elapsedTime)
					: 0

				const options: OptionsBar = {
					width: feedback.image!.width,
					height: feedback.image!.height,
					colors: colors,
					barLength: 62,
					barWidth: 8,
					value: progressPercent,
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
