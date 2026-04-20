import { combineRgb } from '@companion-module/base'
import { ActionId } from './actions.js'
import { FeedbackId } from './feedback.js'
import { InstanceBaseExt } from './utils.js'

/**
 * API 2.0 Preset Migration:
 * - type: 'button' → type: 'simple'
 * - category property removed (replaced by structure sections/groups)
 * - setPresetDefinitions(presets) → setPresetDefinitions(structure, presets)
 * - Per-layer presets use template groups to avoid generating dozens of near-identical presets
 */

const White = combineRgb(255, 255, 255)
const Black = combineRgb(0, 0, 0)
const Green = combineRgb(0, 200, 0)
const Red = combineRgb(200, 0, 0)
const Blue = combineRgb(0, 0, 200)
const Orange = combineRgb(255, 165, 0)
const DarkGrey = combineRgb(51, 51, 51)

export function GetPresetList(instance: InstanceBaseExt): { structure: any[], presets: Record<string, any> } {
	const presets: Record<string, any> = {}
	const moduleId = instance.label || 'anomes-millumin'

	// =====================
	// Column Control Presets
	// =====================

	presets['column_launch_1'] = {
		type: 'simple',
		name: 'Launch Column 1',
		style: { text: 'Column\n1', size: '18', color: White, bgcolor: Blue },
		steps: [{ down: [{ actionId: ActionId.LAUNCH_COLUMN_BY_INDEX, options: { index: '1' } }], up: [] }],
		feedbacks: [],
	}

	presets['column_prev'] = {
		type: 'simple',
		name: 'Previous Column',
		style: { text: '◀\nPrevious\nColumn', size: 'auto', color: White, bgcolor: Blue },
		steps: [{ down: [{ actionId: ActionId.LAUNCH_PREVIOUS_COLUMN, options: {} }], up: [] }],
		feedbacks: [],
	}

	presets['column_next'] = {
		type: 'simple',
		name: 'Next Column',
		style: { text: '▶\nNext\nColumn', size: 'auto', color: White, bgcolor: Blue },
		steps: [{ down: [{ actionId: ActionId.LAUNCH_NEXT_COLUMN, options: {} }], up: [] }],
		feedbacks: [],
	}

	presets['column_stop'] = {
		type: 'simple',
		name: 'Stop Column',
		style: { text: 'STOP\nColumn', size: '18', color: White, bgcolor: Red },
		steps: [{ down: [{ actionId: ActionId.STOP_COLUMN, options: {} }], up: [] }],
		feedbacks: [],
	}

	// =====================
	// Transport Presets
	// =====================

	presets['transport_play'] = {
		type: 'simple',
		name: 'Play',
		style: { text: '▶\nPlay', size: 'auto', color: White, bgcolor: Green },
		steps: [{ down: [{ actionId: ActionId.PLAY, options: {} }], up: [] }],
		feedbacks: [],
	}

	presets['transport_pause'] = {
		type: 'simple',
		name: 'Pause',
		style: { text: '⏸\nPause', size: 'auto', color: White, bgcolor: Orange },
		steps: [{ down: [{ actionId: ActionId.PAUSE, options: {} }], up: [] }],
		feedbacks: [],
	}

	presets['transport_play_pause'] = {
		type: 'simple',
		name: 'Play or Pause',
		style: { text: '▶⏸', size: 'auto', color: White, bgcolor: DarkGrey },
		steps: [{ down: [{ actionId: ActionId.PLAY_OR_PAUSE, options: {} }], up: [] }],
		feedbacks: [],
	}

	presets['transport_restart'] = {
		type: 'simple',
		name: 'Go to Time 0 (Restart)',
		style: { text: '⏮\nRestart', size: 'auto', color: White, bgcolor: DarkGrey },
		steps: [{ down: [{ actionId: ActionId.GO_TO_TIME, options: { time: '0' } }], up: [] }],
		feedbacks: [],
	}

	presets['transport_jog_minus_10'] = {
		type: 'simple',
		name: 'Jog -10s',
		style: { text: '◀◀\n10s', size: 'auto', color: White, bgcolor: DarkGrey },
		steps: [{ down: [{ actionId: ActionId.JOG_TIME, options: { time: '-10' } }], up: [] }],
		feedbacks: [],
	}

	presets['transport_jog_plus_10'] = {
		type: 'simple',
		name: 'Jog +10s',
		style: { text: '▶▶\n10s', size: 'auto', color: White, bgcolor: DarkGrey },
		steps: [{ down: [{ actionId: ActionId.JOG_TIME, options: { time: '10' } }], up: [] }],
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
			type: 'simple',
			name: `Go to ${jump.seconds}s from End`,
			style: { text: jump.label, size: 'auto', color: White, bgcolor: DarkGrey },
			steps: [{ down: [{ actionId: ActionId.GO_TO_SECONDS_FROM_END, options: { seconds: String(jump.seconds) } }], up: [] }],
			feedbacks: [],
		}
	}

	// =====================
	// Master Presets
	// =====================

	presets['master_video_off'] = {
		type: 'simple',
		name: 'Master Video 0% (Blackout)',
		style: { text: 'VIDEO\nBLACK', size: 'auto', color: White, bgcolor: Red },
		steps: [{ down: [{ actionId: ActionId.SET_MASTER_VIDEO, options: { value: '0' } }], up: [] }],
		feedbacks: [],
	}

	presets['master_video_on'] = {
		type: 'simple',
		name: 'Master Video 100%',
		style: { text: 'Video\n100%', size: 'auto', color: White, bgcolor: Green },
		steps: [{ down: [{ actionId: ActionId.SET_MASTER_VIDEO, options: { value: '1' } }], up: [] }],
		feedbacks: [],
	}

	presets['master_audio_off'] = {
		type: 'simple',
		name: 'Master Audio 0% (Mute)',
		style: { text: 'AUDIO\nMUTE', size: 'auto', color: White, bgcolor: Red },
		steps: [{ down: [{ actionId: ActionId.SET_MASTER_AUDIO, options: { value: '0' } }], up: [] }],
		feedbacks: [],
	}

	presets['master_audio_on'] = {
		type: 'simple',
		name: 'Master Audio 100%',
		style: { text: 'Audio\n100%', size: 'auto', color: White, bgcolor: Green },
		steps: [{ down: [{ actionId: ActionId.SET_MASTER_AUDIO, options: { value: '1' } }], up: [] }],
		feedbacks: [],
	}

	// =====================
	// Utility Presets
	// =====================

	presets['util_fullscreen_on'] = {
		type: 'simple',
		name: 'Enter Fullscreen',
		style: { text: 'Enter\nFull', size: 'auto', color: White, bgcolor: DarkGrey },
		steps: [{ down: [{ actionId: ActionId.ENTER_FULLSCREEN, options: {} }], up: [] }],
		feedbacks: [],
	}

	presets['util_fullscreen_off'] = {
		type: 'simple',
		name: 'Exit Fullscreen',
		style: { text: 'Exit\nFull', size: 'auto', color: White, bgcolor: DarkGrey },
		steps: [{ down: [{ actionId: ActionId.EXIT_FULLSCREEN, options: {} }], up: [] }],
		feedbacks: [],
	}

	presets['util_testcard_on'] = {
		type: 'simple',
		name: 'Show Test Card',
		style: { text: 'Show\nTest', size: 'auto', color: White, bgcolor: DarkGrey },
		steps: [{ down: [{ actionId: ActionId.DISPLAY_TEST_CARD, options: {} }], up: [] }],
		feedbacks: [],
	}

	presets['util_testcard_off'] = {
		type: 'simple',
		name: 'Hide Test Card',
		style: { text: 'Hide\nTest', size: 'auto', color: White, bgcolor: DarkGrey },
		steps: [{ down: [{ actionId: ActionId.HIDE_TEST_CARD, options: {} }], up: [] }],
		feedbacks: [],
	}

	presets['util_save'] = {
		type: 'simple',
		name: 'Save Project',
		style: { text: '💾\nSave', size: 'auto', color: White, bgcolor: DarkGrey },
		steps: [{ down: [{ actionId: ActionId.SAVE_PROJECT, options: {} }], up: [] }],
		feedbacks: [],
	}

	// =====================
	// Per-Layer Presets (generated per tracked layer)
	// =====================

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

	// Generate per-layer presets
	const layerSections: any[] = []

	for (const layer of trackedLayers) {
		const safeId = layer.varName.replace(/[^a-zA-Z0-9]/g, '_')
		const safeVarName = layer.varName.replace(/\s+/g, '_')
		const displayIds: string[] = []
		const transportIds: string[] = []
		const countdownIds: string[] = []
		const gotoIds: string[] = []

		// Column info
		presets[`layer_${safeId}_column_name`] = {
			type: 'simple',
			name: `${layer.displayName} / Column Name`,
			style: { text: `$(${moduleId}:currentColumnName)`, size: '14', color: White, bgcolor: Black },
			steps: [{ down: [], up: [] }],
			feedbacks: [],
		}
		displayIds.push(`layer_${safeId}_column_name`)

		presets[`layer_${safeId}_column_index`] = {
			type: 'simple',
			name: `${layer.displayName} / Column Index`,
			style: { text: `Column\n$(${moduleId}:currentColumnIndex)`, size: '18', color: White, bgcolor: Black },
			steps: [{ down: [], up: [] }],
			feedbacks: [],
		}
		displayIds.push(`layer_${safeId}_column_index`)

		// Time displays
		presets[`layer_${safeId}_elapsed`] = {
			type: 'simple',
			name: `${layer.displayName} / Elapsed Time`,
			style: { text: `${layer.displayName}\n$(${moduleId}:media_${safeVarName}_elapsed_tc)`, size: '14', color: White, bgcolor: Black },
			steps: [{ down: [], up: [] }],
			feedbacks: [],
		}
		displayIds.push(`layer_${safeId}_elapsed`)

		presets[`layer_${safeId}_remaining`] = {
			type: 'simple',
			name: `${layer.displayName} / Remaining Time`,
			style: { text: `${layer.displayName}\n$(${moduleId}:media_${safeVarName}_remaining_tc)`, size: '14', color: White, bgcolor: Black },
			steps: [{ down: [], up: [] }],
			feedbacks: [],
		}
		displayIds.push(`layer_${safeId}_remaining`)

		presets[`layer_${safeId}_remaining_duration`] = {
			type: 'simple',
			name: `${layer.displayName} / Remaining / Duration`,
			style: {
				text: `$(${moduleId}:media_${safeVarName}_duration_tc)\nTRT\n$(${moduleId}:media_${safeVarName}_remaining_tc)`,
				size: '14', color: White, bgcolor: Black,
			},
			steps: [{ down: [], up: [] }],
			feedbacks: [{
				feedbackId: FeedbackId.PROGRESS_BAR,
				options: {
					layer: layer.varName, hideWhenNotRunning: true, orangeSeconds: 30, redSeconds: 10,
					runningColor: combineRgb(0, 255, 0), warningColor: combineRgb(255, 140, 0), criticalColor: combineRgb(255, 0, 0),
				},
			}],
		}
		displayIds.push(`layer_${safeId}_remaining_duration`)

		presets[`layer_${safeId}_progress_bar`] = {
			type: 'simple',
			name: `${layer.displayName} / Progress Bar`,
			style: { text: `$(${moduleId}:media_${safeVarName}_remaining_tc)`, size: '14', color: White, bgcolor: Black },
			steps: [{ down: [], up: [] }],
			feedbacks: [{
				feedbackId: FeedbackId.PROGRESS_BAR,
				options: {
					layer: layer.varName, hideWhenNotRunning: true, orangeSeconds: 30, redSeconds: 10,
					runningColor: combineRgb(0, 255, 0), warningColor: combineRgb(255, 140, 0), criticalColor: combineRgb(255, 0, 0),
				},
			}],
		}
		displayIds.push(`layer_${safeId}_progress_bar`)

		// Build the select-layer action for this tracked layer
		const selectLayerAction = layer.varName === 'firstByIndex'
			? { actionId: ActionId.SELECT_LAYER_BY_INDEX, options: { index: '1' } }
			: { actionId: ActionId.SELECT_LAYER_BY_NAME, options: { name: layer.varName } }

		// Transport controls
		presets[`layer_${safeId}_play_pause`] = {
			type: 'simple',
			name: `${layer.displayName} / Play or Pause`,
			style: { text: `${layer.displayName}\n▶⏸`, size: 'auto', color: White, bgcolor: DarkGrey },
			steps: [{ down: [selectLayerAction, { actionId: ActionId.SELECTED_LAYER_PLAY_OR_PAUSE_MEDIA, options: {} }], up: [] }],
			feedbacks: [],
		}
		transportIds.push(`layer_${safeId}_play_pause`)

		presets[`layer_${safeId}_pause`] = {
			type: 'simple',
			name: `${layer.displayName} / Pause`,
			style: { text: `${layer.displayName}\n⏸\nPause`, size: 'auto', color: White, bgcolor: Orange },
			steps: [{ down: [selectLayerAction, { actionId: ActionId.SELECTED_LAYER_PAUSE_MEDIA, options: {} }], up: [] }],
			feedbacks: [],
		}
		transportIds.push(`layer_${safeId}_pause`)

		presets[`layer_${safeId}_restart`] = {
			type: 'simple',
			name: `${layer.displayName} / Restart`,
			style: { text: `${layer.displayName}\n⏮\nRestart`, size: 'auto', color: White, bgcolor: DarkGrey },
			steps: [{ down: [selectLayerAction, { actionId: ActionId.SELECTED_LAYER_RESTART_MEDIA, options: {} }], up: [] }],
			feedbacks: [],
		}
		transportIds.push(`layer_${safeId}_restart`)

		presets[`layer_${safeId}_stop`] = {
			type: 'simple',
			name: `${layer.displayName} / Stop`,
			style: { text: `${layer.displayName}\nSTOP`, size: 'auto', color: White, bgcolor: Red },
			steps: [{ down: [selectLayerAction, { actionId: ActionId.SELECTED_LAYER_STOP_MEDIA, options: {} }], up: [] }],
			feedbacks: [],
		}
		transportIds.push(`layer_${safeId}_stop`)

		presets[`layer_${safeId}_jog_minus_10`] = {
			type: 'simple',
			name: `${layer.displayName} / Jog -10s`,
			style: { text: `${layer.displayName}\n◀◀\n10s`, size: 'auto', color: White, bgcolor: DarkGrey },
			steps: [{ down: [selectLayerAction, { actionId: ActionId.SELECTED_LAYER_JOG_MEDIA_TIME, options: { time: '-10', layer: layer.varName } }], up: [] }],
			feedbacks: [],
		}
		transportIds.push(`layer_${safeId}_jog_minus_10`)

		presets[`layer_${safeId}_jog_plus_10`] = {
			type: 'simple',
			name: `${layer.displayName} / Jog +10s`,
			style: { text: `${layer.displayName}\n▶▶\n10s`, size: 'auto', color: White, bgcolor: DarkGrey },
			steps: [{ down: [selectLayerAction, { actionId: ActionId.SELECTED_LAYER_JOG_MEDIA_TIME, options: { time: '10', layer: layer.varName } }], up: [] }],
			feedbacks: [],
		}
		transportIds.push(`layer_${safeId}_jog_plus_10`)

		// Countdown jumps
		const layerCountdownJumps = [
			{ seconds: 60, label: `${layer.displayName}\nGOTO\n1:00` },
			{ seconds: 30, label: `${layer.displayName}\nGOTO\n:30` },
			{ seconds: 15, label: `${layer.displayName}\nGOTO\n:15` },
			{ seconds: 10, label: `${layer.displayName}\nGOTO\n:10` },
		]

		for (const jump of layerCountdownJumps) {
			const id = `layer_${safeId}_goto_end_${jump.seconds}`
			presets[id] = {
				type: 'simple',
				name: `${layer.displayName} / Go to ${jump.seconds}s from End`,
				style: { text: jump.label, size: 'auto', color: White, bgcolor: DarkGrey },
				steps: [{ down: [selectLayerAction, { actionId: ActionId.SELECTED_LAYER_GO_TO_MEDIA_TIME, options: { time: String(-jump.seconds) } }], up: [] }],
				feedbacks: [],
			}
			countdownIds.push(id)
		}

		// Go to time
		presets[`layer_${safeId}_goto_time`] = {
			type: 'simple',
			name: `${layer.displayName} / Go to Time`,
			style: { text: `${layer.displayName}\nGOTO\nTime`, size: 'auto', color: White, bgcolor: DarkGrey },
			steps: [{ down: [selectLayerAction, { actionId: ActionId.SELECTED_LAYER_GO_TO_MEDIA_TIME, options: { time: '0' } }], up: [] }],
			feedbacks: [],
		}
		gotoIds.push(`layer_${safeId}_goto_time`)

		// Build this layer's section: four sub-groups mirroring the global layout
		const layerGroups: any[] = []
		if (displayIds.length) layerGroups.push({ id: `layer_${safeId}_displays`, type: 'simple', name: 'Displays', presets: displayIds })
		if (transportIds.length) layerGroups.push({ id: `layer_${safeId}_transport`, type: 'simple', name: 'Transport', presets: transportIds })
		if (countdownIds.length) layerGroups.push({ id: `layer_${safeId}_countdown`, type: 'simple', name: 'Countdown Jumps', presets: countdownIds })
		if (gotoIds.length) layerGroups.push({ id: `layer_${safeId}_goto`, type: 'simple', name: 'Go To', presets: gotoIds })

		layerSections.push({
			id: `layer_${safeId}`,
			name: `Layer - ${layer.displayName}`,
			definitions: layerGroups,
		})
	}

	// =====================
	// Structure (sections → groups → preset references)
	// =====================

	const structure: any[] = [
		{
			id: 'column_control',
			name: 'Column Control',
			definitions: [{
				id: 'column_group',
				type: 'simple',
				name: 'Column Actions',
				presets: ['column_launch_1', 'column_prev', 'column_next', 'column_stop'],
			}],
		},
		{
			id: 'transport',
			name: 'Transport',
			definitions: [
				{
					id: 'transport_basic',
					type: 'simple',
					name: 'Playback Controls',
					presets: ['transport_play', 'transport_pause', 'transport_play_pause', 'transport_restart', 'transport_jog_minus_10', 'transport_jog_plus_10'],
				},
				{
					id: 'transport_countdown',
					type: 'simple',
					name: 'Countdown Jumps',
					presets: countdownJumps.map(j => `transport_goto_end_${j.seconds}`),
				},
			],
		},
		{
			id: 'masters',
			name: 'Masters',
			definitions: [{
				id: 'masters_group',
				type: 'simple',
				name: 'Master Controls',
				presets: ['master_video_off', 'master_video_on', 'master_audio_off', 'master_audio_on'],
			}],
		},
		{
			id: 'utility',
			name: 'Utility',
			definitions: [{
				id: 'utility_group',
				type: 'simple',
				name: 'Utility Actions',
				presets: ['util_fullscreen_on', 'util_fullscreen_off', 'util_testcard_on', 'util_testcard_off', 'util_save'],
			}],
		},
		...layerSections,
	]

	return { structure, presets }
}
