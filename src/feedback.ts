import { CompanionFeedbackDefinitions, CompanionFeedbackDefinition, CompanionAdvancedFeedbackResult, DropdownChoice } from '@companion-module/base'
import { InstanceBaseExt } from './utils.js'
import { combineRgb } from '@companion-module/base'
import { graphics } from 'companion-module-utils'
type OptionsBar = Parameters<typeof graphics.bar>[0]

export enum FeedbackId {
	PROGRESS_BAR = 'progressBar'
}

const green = combineRgb(0, 255, 0)
const orange = combineRgb(255, 140, 0)
const red = combineRgb(255, 0, 0)

export function getFeedbacks(instance: InstanceBaseExt): CompanionFeedbackDefinitions {
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
					default: 'Global',
					disableAutoExpression: true,
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
			callback: async (feedback): Promise<CompanionAdvancedFeedbackResult> => {
				const mediaLayer = instance.mediaLayers[feedback.options.layer!.toString()]

				if (feedback.options.hideWhenNotRunning && mediaLayer.duration === 0) {
					return {}
				}

				const remainingSeconds = mediaLayer.duration - mediaLayer.elapsedTime

				const orangeThreshold = parseFloat(String(feedback.options.orangeSeconds ?? '30')) || 30
				const redThreshold = parseFloat(String(feedback.options.redSeconds ?? '10')) || 10

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

				const imgBuf = graphics.bar(options)

				return {
					imageBuffer: Buffer.from(imgBuf).toString('base64'),
				}
			}
		}
	}
	return feedbacks
}
