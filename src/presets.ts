import {
	CompanionButtonPresetDefinition,
	CompanionPresetDefinitions,
	combineRgb,
} from '@companion-module/base'
import { ActionId } from './actions'
import { FeedbackId } from './feedback'
import { MilluminConfig } from './config'
import { InstanceBaseExt } from './utils'

interface CompanionPresetExt extends CompanionButtonPresetDefinition {
	steps: Array<{
		down: Array<
			{
				actionId: ActionId
			} & CompanionButtonPresetDefinition['steps'][0]['down'][0]
		>
		up: Array<
			{
				actionId: ActionId
			} & CompanionButtonPresetDefinition['steps'][0]['up'][0]
		>
	}>
}

interface CompanionPresetDefinitionsExt {
	[id: string]: CompanionPresetExt | undefined
}

const White = combineRgb(255, 255, 255)
const Black = combineRgb(0, 0, 0)
const Green = combineRgb(0, 200, 0)
const Red = combineRgb(200, 0, 0)
const Blue = combineRgb(0, 0, 200)
const Orange = combineRgb(255, 165, 0)
const DarkGrey = combineRgb(51, 51, 51)
const Yellow = combineRgb(255, 255, 0)

export function GetPresetList(instance: InstanceBaseExt<MilluminConfig>): CompanionPresetDefinitions {
	const presets: CompanionPresetDefinitionsExt = {}
	const moduleId = instance.label || 'anomes-millumin'

	// =====================
	// Column Control
	// =====================

	presets['column_launch_1'] = {
		type: 'button',
		category: 'Column Control',
		name: 'Launch Column 1',
		style: {
			text: 'Column\n1',
			size: 'auto',
			color: White,
			bgcolor: Blue,
		},
		steps: [
			{
				down: [{ actionId: ActionId.LAUNCH_COLUMN_BY_INDEX, options: { index: '1' } }],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['column_prev'] = {
		type: 'button',
		category: 'Column Control',
		name: 'Previous Column',
		style: {
			text: '◀\nPrevious\nColumn',
			size: 'auto',
			color: White,
			bgcolor: Blue,
		},
		steps: [
			{
				down: [{ actionId: ActionId.LAUNCH_PREVIOUS_COLUMN, options: {} }],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['column_next'] = {
		type: 'button',
		category: 'Column Control',
		name: 'Next Column',
		style: {
			text: '▶\nNext\nColumn',
			size: 'auto',
			color: White,
			bgcolor: Blue,
		},
		steps: [
			{
				down: [{ actionId: ActionId.LAUNCH_NEXT_COLUMN, options: {} }],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['column_stop'] = {
		type: 'button',
		category: 'Column Control',
		name: 'Stop Column',
		style: {
			text: 'STOP\nColumn',
			size: 'auto',
			color: White,
			bgcolor: Red,
		},
		steps: [
			{
				down: [{ actionId: ActionId.STOP_COLUMN, options: {} }],
				up: [],
			},
		],
		feedbacks: [],
	}

	// =====================
	// Transport
	// =====================

	presets['transport_play'] = {
		type: 'button',
		category: 'Transport',
		name: 'Play',
		style: {
			text: '▶\nPlay',
			size: 'auto',
			color: White,
			bgcolor: Green,
		},
		steps: [
			{
				down: [{ actionId: ActionId.PLAY, options: {} }],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['transport_pause'] = {
		type: 'button',
		category: 'Transport',
		name: 'Pause',
		style: {
			text: '⏸\nPause',
			size: 'auto',
			color: White,
			bgcolor: Orange,
		},
		steps: [
			{
				down: [{ actionId: ActionId.PAUSE, options: {} }],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['transport_play_pause'] = {
		type: 'button',
		category: 'Transport',
		name: 'Play or Pause',
		style: {
			text: '▶⏸',
			size: 'auto',
			color: White,
			bgcolor: DarkGrey,
		},
		steps: [
			{
				down: [{ actionId: ActionId.PLAY_OR_PAUSE, options: {} }],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['transport_restart'] = {
		type: 'button',
		category: 'Transport',
		name: 'Go to Time 0 (Restart)',
		style: {
			text: '⏮\nRestart',
			size: 'auto',
			color: White,
			bgcolor: DarkGrey,
		},
		steps: [
			{
				down: [{ actionId: ActionId.GO_TO_TIME, options: { time: '0' } }],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['transport_jog_minus_10'] = {
		type: 'button',
		category: 'Transport',
		name: 'Jog -10s',
		style: {
			text: '◀◀\n10s',
			size: 'auto',
			color: White,
			bgcolor: DarkGrey,
		},
		steps: [
			{
				down: [{ actionId: ActionId.JOG_TIME, options: { time: '-10' } }],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['transport_jog_plus_10'] = {
		type: 'button',
		category: 'Transport',
		name: 'Jog +10s',
		style: {
			text: '▶▶\n10s',
			size: 'auto',
			color: White,
			bgcolor: DarkGrey,
		},
		steps: [
			{
				down: [{ actionId: ActionId.JOG_TIME, options: { time: '10' } }],
				up: [],
			},
		],
		feedbacks: [],
	}

	// Countdown jumps
	const countdownJumps = [
		{ seconds: 60, label: 'GOTO\n1:00' },
		{ seconds: 30, label: 'GOTO\n:30' },
		{ seconds: 15, label: 'GOTO\n:15' },
		{ seconds: 10, label: 'GOTO\n:10' },
	]

	for (const jump of countdownJumps) {
		presets[`transport_goto_end_${jump.seconds}`] = {
			type: 'button',
			category: 'Transport',
			name: `Go to ${jump.seconds}s from End`,
			style: {
				text: jump.label,
				size: 'auto',
				color: White,
				bgcolor: DarkGrey,
			},
			steps: [
				{
					down: [
						{
							actionId: ActionId.GO_TO_SECONDS_FROM_END,
							options: { seconds: String(jump.seconds) },
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}
	}

	// =====================
	// Masters
	// =====================

	presets['master_video_off'] = {
		type: 'button',
		category: 'Masters',
		name: 'Master Video 0% (Blackout)',
		style: {
			text: 'VIDEO\nBLACK',
			size: 'auto',
			color: White,
			bgcolor: Red,
		},
		steps: [
			{
				down: [{ actionId: ActionId.SET_MASTER_VIDEO, options: { value: '0' } }],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['master_video_on'] = {
		type: 'button',
		category: 'Masters',
		name: 'Master Video 100%',
		style: {
			text: 'Video\n100%',
			size: 'auto',
			color: White,
			bgcolor: Green,
		},
		steps: [
			{
				down: [{ actionId: ActionId.SET_MASTER_VIDEO, options: { value: '1' } }],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['master_audio_off'] = {
		type: 'button',
		category: 'Masters',
		name: 'Master Audio 0% (Mute)',
		style: {
			text: 'AUDIO\nMUTE',
			size: 'auto',
			color: White,
			bgcolor: Red,
		},
		steps: [
			{
				down: [{ actionId: ActionId.SET_MASTER_AUDIO, options: { value: '0' } }],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['master_audio_on'] = {
		type: 'button',
		category: 'Masters',
		name: 'Master Audio 100%',
		style: {
			text: 'Audio\n100%',
			size: 'auto',
			color: White,
			bgcolor: Green,
		},
		steps: [
			{
				down: [{ actionId: ActionId.SET_MASTER_AUDIO, options: { value: '1' } }],
				up: [],
			},
		],
		feedbacks: [],
	}

	// =====================
	// Utility
	// =====================

	presets['util_fullscreen_on'] = {
		type: 'button',
		category: 'Utility',
		name: 'Enter Fullscreen',
		style: {
			text: 'Enter\nFull',
			size: 'auto',
			color: White,
			bgcolor: DarkGrey,
		},
		steps: [
			{
				down: [{ actionId: ActionId.ENTER_FULLSCREEN, options: {} }],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['util_fullscreen_off'] = {
		type: 'button',
		category: 'Utility',
		name: 'Exit Fullscreen',
		style: {
			text: 'Exit\nFull',
			size: 'auto',
			color: White,
			bgcolor: DarkGrey,
		},
		steps: [
			{
				down: [{ actionId: ActionId.EXIT_FULLSCREEN, options: {} }],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['util_testcard_on'] = {
		type: 'button',
		category: 'Utility',
		name: 'Display Test Card',
		style: {
			text: 'Test\nCard',
			size: 'auto',
			color: Black,
			bgcolor: Yellow,
		},
		steps: [
			{
				down: [{ actionId: ActionId.DISPLAY_TEST_CARD, options: {} }],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['util_testcard_off'] = {
		type: 'button',
		category: 'Utility',
		name: 'Hide Test Card',
		style: {
			text: 'Hide\nTest',
			size: 'auto',
			color: White,
			bgcolor: DarkGrey,
		},
		steps: [
			{
				down: [{ actionId: ActionId.HIDE_TEST_CARD, options: {} }],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['util_save'] = {
		type: 'button',
		category: 'Utility',
		name: 'Save Project',
		style: {
			text: '💾\nSave',
			size: 'auto',
			color: White,
			bgcolor: DarkGrey,
		},
		steps: [
			{
				down: [{ actionId: ActionId.SAVE_PROJECT, options: {} }],
				up: [],
			},
		],
		feedbacks: [],
	}

	// =====================
	// Per tracked layer presets
	// =====================

	// Always include firstByIndex as "Layer 1", plus any config-based layers
	const trackedLayers: Array<{ varName: string; displayName: string }> = [
		{ varName: 'firstByIndex', displayName: 'Layer 1' },
	]
	if (instance.config.timeLayerName && instance.config.timeLayerName !== '' && instance.config.timeLayerName !== 'firstByIndex') {
		if (instance.config.trackMultipleLayers) {
			const names = instance.config.timeLayerName.split(',')
			for (const name of names) {
				const trimmed = name.trim()
				if (trimmed !== '' && trimmed !== 'firstByIndex') trackedLayers.push({ varName: trimmed, displayName: trimmed })
			}
		} else {
			const trimmed = instance.config.timeLayerName.trim()
			if (trimmed !== 'firstByIndex') trackedLayers.push({ varName: trimmed, displayName: trimmed })
		}
	}

	for (const layer of trackedLayers) {
		const safeId = layer.varName.replace(/[^a-zA-Z0-9]/g, '_')
		const cat = `Layer - ${layer.displayName}`

		presets[`layer_${safeId}_column_name`] = {
			type: 'button',
			category: cat,
			name: `${layer.displayName} / Column Name`,
			style: {
				text: `$(${moduleId}:currentColumnName)`,
				size: '14',
				color: White,
				bgcolor: Black,
			},
			steps: [{ down: [], up: [] }],
			feedbacks: [],
		}

		presets[`layer_${safeId}_column_index`] = {
			type: 'button',
			category: cat,
			name: `${layer.displayName} / Column Index`,
			style: {
				text: `Column\n$(${moduleId}:currentColumnIndex)`,
				size: 'auto',
				color: White,
				bgcolor: Black,
			},
			steps: [{ down: [], up: [] }],
			feedbacks: [],
		}

		presets[`layer_${safeId}_elapsed`] = {
			type: 'button',
			category: cat,
			name: `${layer.displayName} / Elapsed Time`,
			style: {
				text: `${layer.displayName}\n$(${moduleId}:media_${layer.varName}_elapsed_tc)`,
				size: '14',
				color: White,
				bgcolor: Black,
			},
			steps: [{ down: [], up: [] }],
			feedbacks: [],
		}

		presets[`layer_${safeId}_remaining`] = {
			type: 'button',
			category: cat,
			name: `${layer.displayName} / Remaining Time`,
			style: {
				text: `${layer.displayName}\n$(${moduleId}:media_${layer.varName}_remaining_tc)`,
				size: '14',
				color: White,
				bgcolor: Black,
			},
			steps: [{ down: [], up: [] }],
			feedbacks: [],
		}

		presets[`layer_${safeId}_remaining_duration`] = {
			type: 'button',
			category: cat,
			name: `${layer.displayName} / Remaining / Duration`,
			style: {
				text: `$(${moduleId}:media_${layer.varName}_duration_tc)\nTRT\n$(${moduleId}:media_${layer.varName}_remaining_tc)`,
				size: '14',
				color: White,
				bgcolor: Black,
			},
			steps: [{ down: [], up: [] }],
			feedbacks: [
				{
					feedbackId: FeedbackId.PROGRESS_BAR,
					options: {
						layer: layer.varName,
						hideWhenNotRunning: true,
						orangeSeconds: 30,
						redSeconds: 10,
						runningColor: combineRgb(0, 255, 0),
						warningColor: combineRgb(255, 140, 0),
						criticalColor: combineRgb(255, 0, 0),
					},
				},
			],
		}

		presets[`layer_${safeId}_progress_bar`] = {
			type: 'button',
			category: cat,
			name: `${layer.displayName} / Progress Bar`,
			style: {
				text: `$(${moduleId}:media_${layer.varName}_remaining_tc)`,
				size: '14',
				color: White,
				bgcolor: Black,
			},
			steps: [{ down: [], up: [] }],
			feedbacks: [
				{
					feedbackId: FeedbackId.PROGRESS_BAR,
					options: {
						layer: layer.varName,
						hideWhenNotRunning: true,
						orangeSeconds: 30,
						redSeconds: 10,
						runningColor: combineRgb(0, 255, 0),
						warningColor: combineRgb(255, 140, 0),
						criticalColor: combineRgb(255, 0, 0),
					},
				},
			],
		}

		// Build the select-layer action for this tracked layer
		const selectLayerAction = layer.varName === 'firstByIndex'
			? { actionId: ActionId.SELECT_LAYER_BY_INDEX, options: { index: '1' } }
			: { actionId: ActionId.SELECT_LAYER_BY_NAME, options: { name: layer.varName } }

		// Layer transport: Play or Pause
		presets[`layer_${safeId}_play_pause`] = {
			type: 'button',
			category: cat,
			name: `${layer.displayName} / Play or Pause`,
			style: {
				text: `${layer.displayName}\n▶⏸`,
				size: 'auto',
				color: White,
				bgcolor: DarkGrey,
			},
			steps: [
				{
					down: [
						selectLayerAction,
						{ actionId: ActionId.SELECTED_LAYER_PLAY_OR_PAUSE_MEDIA, options: {} },
					],
					up: [],
				},
			],
			feedbacks: [],
		}

		// Layer transport: Pause
		presets[`layer_${safeId}_pause`] = {
			type: 'button',
			category: cat,
			name: `${layer.displayName} / Pause`,
			style: {
				text: `${layer.displayName}\n⏸\nPause`,
				size: 'auto',
				color: White,
				bgcolor: Orange,
			},
			steps: [
				{
					down: [
						selectLayerAction,
						{ actionId: ActionId.SELECTED_LAYER_PAUSE_MEDIA, options: {} },
					],
					up: [],
				},
			],
			feedbacks: [],
		}

		// Layer transport: Restart
		presets[`layer_${safeId}_restart`] = {
			type: 'button',
			category: cat,
			name: `${layer.displayName} / Restart`,
			style: {
				text: `${layer.displayName}\n⏮\nRestart`,
				size: 'auto',
				color: White,
				bgcolor: DarkGrey,
			},
			steps: [
				{
					down: [
						selectLayerAction,
						{ actionId: ActionId.SELECTED_LAYER_RESTART_MEDIA, options: {} },
					],
					up: [],
				},
			],
			feedbacks: [],
		}

		// Layer transport: Stop
		presets[`layer_${safeId}_stop`] = {
			type: 'button',
			category: cat,
			name: `${layer.displayName} / Stop`,
			style: {
				text: `${layer.displayName}\nSTOP`,
				size: 'auto',
				color: White,
				bgcolor: Red,
			},
			steps: [
				{
					down: [
						selectLayerAction,
						{ actionId: ActionId.SELECTED_LAYER_STOP_MEDIA, options: {} },
					],
					up: [],
				},
			],
			feedbacks: [],
		}

		// Layer transport: Jog -10s
		presets[`layer_${safeId}_jog_minus_10`] = {
			type: 'button',
			category: cat,
			name: `${layer.displayName} / Jog -10s`,
			style: {
				text: `${layer.displayName}\n◀◀\n10s`,
				size: 'auto',
				color: White,
				bgcolor: DarkGrey,
			},
			steps: [
				{
					down: [
						selectLayerAction,
						{ actionId: ActionId.SELECTED_LAYER_JOG_MEDIA_TIME, options: { time: '-10', layer: layer.varName } },
					],
					up: [],
				},
			],
			feedbacks: [],
		}

		// Layer transport: Jog +10s
		presets[`layer_${safeId}_jog_plus_10`] = {
			type: 'button',
			category: cat,
			name: `${layer.displayName} / Jog +10s`,
			style: {
				text: `${layer.displayName}\n▶▶\n10s`,
				size: 'auto',
				color: White,
				bgcolor: DarkGrey,
			},
			steps: [
				{
					down: [
						selectLayerAction,
						{ actionId: ActionId.SELECTED_LAYER_JOG_MEDIA_TIME, options: { time: '10', layer: layer.varName } },
					],
					up: [],
				},
			],
			feedbacks: [],
		}

		// Layer countdown jumps
		const layerCountdownJumps = [
			{ seconds: 60, label: `${layer.displayName}\nGOTO\n1:00` },
			{ seconds: 30, label: `${layer.displayName}\nGOTO\n:30` },
			{ seconds: 15, label: `${layer.displayName}\nGOTO\n:15` },
			{ seconds: 10, label: `${layer.displayName}\nGOTO\n:10` },
		]

		for (const jump of layerCountdownJumps) {
			presets[`layer_${safeId}_goto_end_${jump.seconds}`] = {
				type: 'button',
				category: cat,
				name: `${layer.displayName} / Go to ${jump.seconds}s from End`,
				style: {
					text: jump.label,
					size: 'auto',
					color: White,
					bgcolor: DarkGrey,
				},
				steps: [
					{
						down: [
							selectLayerAction,
							{ actionId: ActionId.SELECTED_LAYER_GO_TO_MEDIA_TIME, options: { time: String(-jump.seconds) } },
						],
						up: [],
					},
				],
				feedbacks: [],
			}
		}
	}

	return presets
}
