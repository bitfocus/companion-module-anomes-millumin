import { CompanionActionDefinition, CompanionActionDefinitions } from '@companion-module/base'
import { MilluminConfig } from './config'
import { InstanceBaseExt, options, layerTargetOptions, resolveLayerPath, parseVariableInt, parseVariableNumber, parseVariableString } from './utils'

export enum ActionId {
	LAUNCH_OR_STOP_COLUMN_BY_INDEX = 'Action_LaunchOrStopColumn_ByIndex',
	LAUNCH_OR_STOP_COLUMN_BY_NAME = 'Action_LaunchOrStopColumn_ByName',
	LAUNCH_COLUMN_BY_INDEX = 'Action_LaunchColumn_ByIndex',
	LAUNCH_COLUMN_BY_NAME = 'Action_LaunchColumn_ByName',
	STOP_COLUMN = 'Action_StopColumn',
	LAUNCH_PREVIOUS_COLUMN = 'Action_LaunchPreviousColumn',
	LAUNCH_NEXT_COLUMN = 'Action_LaunchNextColumn',
	PAUSE = 'Action_Pause',
	PLAY = 'Action_Play',
	PLAY_OR_PAUSE = 'Action_PlayOrPause',
	GO_TO_TIME = 'Action_GoToTime',
	JOG_TIME = 'Action_JogTime',
	GO_TO_SECONDS_FROM_END = 'Action_GoToSecondsFromEnd',
	GO_TO_TIMELINE_SEGMENT = 'Action_GoToTimelineSegment',
	SELECT_BOARD_BY_INDEX = 'Action_SelectBoard_ByIndex',
	SELECT_BOARD_BY_NAME = 'Action_SelectBoard_ByName',
	SELECT_LAYER_BY_INDEX = 'Action_SelectLayer_ByIndex',
	SELECT_LAYER_BY_NAME = 'Action_SelectLayer_ByName',
	SELECT_LIGHT_BY_INDEX = 'Action_SelectLight_ByIndex',
	SELECT_LIGHT_BY_NAME = 'Action_SelectLight_ByName',
	SET_MASTER_VIDEO = 'Action_SetMasterVideo',
	SET_MASTER_AUDIO = 'Action_SetMasterAudio',
	SET_MASTER_DMX = 'Action_SetMasterDMX',
	ENTER_FULLSCREEN = 'Action_EnterFullscreen',
	EXIT_FULLSCREEN = 'Action_ExitFullscreen',
	DISPLAY_TEST_CARD = 'Action_DisplayTestCard',
	HIDE_TEST_CARD = 'Action_HideTestCard',
	DISABLE_WORKSPACE = 'Action_DisableWorkspace',
	ENABLE_WORKSPACE = 'Action_EnableWorkspace',
	OPEN_PROJECT = 'Action_OpenProject',
	SAVE_PROJECT = 'Action_SaveProject',
	SAVE_PROJECT_AS = 'Action_SaveProjectAs',
	QUIT = 'Action_Quit',
	SELECTED_LAYER_RESTART_MEDIA = 'Action_SelectedLayer_RestartMedia',
	SELECTED_LAYER_START_MEDIA_BY_INDEX = 'Action_SelectedLayer_StartMedia_ByIndex',
	SELECTED_LAYER_START_MEDIA_BY_NAME = 'Action_SelectedLayer_StartMedia_ByName',
	SELECTED_LAYER_PAUSE_MEDIA = 'Action_SelectedLayer_PauseMedia',
	SELECTED_LAYER_PLAY_OR_PAUSE_MEDIA = 'Action_SelectedLayer_PlayOrPauseMedia',
	SELECTED_LAYER_STOP_MEDIA = 'Action_SelectedLayer_StartOrPauseMedia',
	SELECTED_LAYER_GO_TO_MEDIA_TIME = 'Action_SelectedLayer_GoToMediaTime',
	SELECTED_LAYER_GO_TO_NORMALIZED_TIME = 'Action_SelectedLayer_GoToMediaNormalizedTime',
	SELECTED_LAYER_SET_MEDIA_SPEED = 'Action_SelectedLayer_SetMediaSpeed',
	SELECTED_LAYER_JOG_MEDIA_TIME = 'Action_SelectedLayer_JogMediaTime',
	CUSTOM_OSC = 'Action_CustomOSC',
}

export function getActions(instance: InstanceBaseExt<MilluminConfig>): CompanionActionDefinitions {
	const actions: { [id in ActionId]: CompanionActionDefinition | undefined } = {
		[ActionId.LAUNCH_OR_STOP_COLUMN_BY_INDEX]: {
			name: 'Launch or Stop Column by Index',
			options: [options.indexVar],
			callback: async (action): Promise<void> => {
				const idx = await parseVariableInt(instance, action, 'index')
				if (!isNaN(idx) && instance.OSC)
					instance.OSC.sendCommand('/action/launchOrStopColumn', [{ type: 'i', value: idx }])
			},
		},
		[ActionId.LAUNCH_OR_STOP_COLUMN_BY_NAME]: {
			name: 'Launch or Stop Column by Name',
			options: [options.name],
			callback: async (action): Promise<void> => {
				const name = await parseVariableString(instance, action, 'name')
				if (instance.OSC)
					instance.OSC.sendCommand('/action/launchOrStopColumn', [{ type: 's', value: name }])
			},
		},
		[ActionId.LAUNCH_COLUMN_BY_INDEX]: {
			name: 'Launch Column by Index',
			options: [options.indexVar],
			callback: async (action): Promise<void> => {
				const idx = await parseVariableInt(instance, action, 'index')
				if (!isNaN(idx) && instance.OSC)
					instance.OSC.sendCommand('/action/launchColumn', [{ type: 'i', value: idx }])
			},
		},
		[ActionId.LAUNCH_COLUMN_BY_NAME]: {
			name: 'Launch Column by Name',
			options: [options.name],
			callback: async (action): Promise<void> => {
				const name = await parseVariableString(instance, action, 'name')
				if (instance.OSC) instance.OSC.sendCommand('/action/launchColumn', [{ type: 's', value: name }])
			},
		},
		[ActionId.STOP_COLUMN]: {
			name: 'Stop Column',
			options: [],
			callback: (): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/stopColumn', [])
			},
		},
		[ActionId.LAUNCH_PREVIOUS_COLUMN]: {
			name: 'Launch Previous Column',
			options: [],
			callback: (): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/launchPreviousColumn', [])
			},
		},
		[ActionId.LAUNCH_NEXT_COLUMN]: {
			name: 'Launch Next Column',
			options: [],
			callback: (): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/launchNextColumn', [])
			},
		},
		[ActionId.PAUSE]: {
			name: 'Pause',
			options: [],
			callback: (): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/pause', [])
			},
		},
		[ActionId.PLAY]: {
			name: 'Play',
			options: [],
			callback: (): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/play', [])
			},
		},
		[ActionId.PLAY_OR_PAUSE]: {
			name: 'Play or Pause',
			options: [],
			callback: (): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/playOrPause', [])
			},
		},
		[ActionId.GO_TO_TIME]: {
			name: 'Go to Time',
			description: 'Supports seconds (e.g. 10, -10) or timecode (e.g. 01:02:03.456). Negative values jump from end.',
			options: [options.timeVar],
			callback: async (action): Promise<void> => {
				const raw = await parseVariableString(instance, action, 'time')
				if (instance.OSC) {
					// If it looks like a timecode string (contains :), send as string
					if (raw.includes(':')) {
						instance.OSC.sendCommand('/action/goToTime', [{ type: 's', value: raw }])
					} else {
						const val = parseFloat(raw)
						if (!isNaN(val))
							instance.OSC.sendCommand('/action/goToTime', [{ type: 'f', value: val }])
					}
				}
			},
		},
		[ActionId.JOG_TIME]: {
			name: 'Jog Time',
			description: 'This action uses media index:1 elapsed time to calculate an absolute value',
			options: [options.timeVar],
			callback: async (action): Promise<void> => {
				const time = await parseVariableNumber(instance, action, 'time')
				if (isNaN(time)) return
				const mediaLayer = instance.mediaLayers['firstByIndex']
				if (mediaLayer.duration === 0) return
				const newTime = mediaLayer.elapsedTime + time

				if (instance.OSC) instance.OSC.sendCommand('/action/goToTime', [{ type: 'f', value: newTime }])
			},
		},
		[ActionId.GO_TO_SECONDS_FROM_END]: {
			name: 'Go to Seconds from End',
			description: 'Jump to a specific number of seconds before the end of the current media (Millumin V5+)',
			options: [
				{
					type: 'textinput',
					label: 'Seconds from End',
					id: 'seconds',
					default: '30',
					useVariables: true,
				},
			],
			callback: async (action): Promise<void> => {
				const seconds = await parseVariableNumber(instance, action, 'seconds')
				if (isNaN(seconds) || seconds < 0) return
				if (instance.OSC)
					instance.OSC.sendCommand('/action/goToTime', [{ type: 'f', value: -seconds }])
			},
		},
		[ActionId.GO_TO_TIMELINE_SEGMENT]: {
			name: 'Go to Timeline Segment',
			options: [options.name],
			callback: async (action): Promise<void> => {
				const name = await parseVariableString(instance, action, 'name')
				if (instance.OSC)
					instance.OSC.sendCommand('/action/goToTimelineSegment', [{ type: 's', value: name }])
			},
		},
		[ActionId.SELECT_BOARD_BY_INDEX]: {
			name: 'Select Board By Index',
			options: [options.indexVar],
			callback: async (action): Promise<void> => {
				const idx = await parseVariableInt(instance, action, 'index')
				if (!isNaN(idx) && instance.OSC)
					instance.OSC.sendCommand('/action/selectBoard', [{ type: 'i', value: idx }])
			},
		},
		[ActionId.SELECT_BOARD_BY_NAME]: {
			name: 'Select Board By Name',
			options: [options.name],
			callback: async (action): Promise<void> => {
				const name = await parseVariableString(instance, action, 'name')
				if (instance.OSC) instance.OSC.sendCommand('/action/selectBoard', [{ type: 's', value: name }])
			},
		},
		[ActionId.SELECT_LAYER_BY_INDEX]: {
			name: 'Select Layer By Index',
			options: [options.indexVar],
			callback: async (action): Promise<void> => {
				const idx = await parseVariableInt(instance, action, 'index')
				if (!isNaN(idx) && instance.OSC)
					instance.OSC.sendCommand('/action/selectLayer', [{ type: 'i', value: idx }])
			},
		},
		[ActionId.SELECT_LAYER_BY_NAME]: {
			name: 'Select Layer By Name',
			options: [options.name],
			callback: async (action): Promise<void> => {
				const name = await parseVariableString(instance, action, 'name')
				if (instance.OSC) instance.OSC.sendCommand('/action/selectLayer', [{ type: 's', value: name }])
			},
		},
		[ActionId.SELECT_LIGHT_BY_INDEX]: {
			name: 'Select Light By Index',
			options: [options.indexVar],
			callback: async (action): Promise<void> => {
				const idx = await parseVariableInt(instance, action, 'index')
				if (!isNaN(idx) && instance.OSC)
					instance.OSC.sendCommand('/action/selectLight', [{ type: 'i', value: idx }])
			},
		},
		[ActionId.SELECT_LIGHT_BY_NAME]: {
			name: 'Select Light By Name',
			options: [options.name],
			callback: async (action): Promise<void> => {
				const name = await parseVariableString(instance, action, 'name')
				if (instance.OSC) instance.OSC.sendCommand('/action/selectLight', [{ type: 's', value: name }])
			},
		},
		[ActionId.SET_MASTER_VIDEO]: {
			name: 'Set Master Video',
			options: [options.valueVar],
			callback: async (action): Promise<void> => {
				const val = await parseVariableNumber(instance, action, 'value')
				if (!isNaN(val) && instance.OSC)
					instance.OSC.sendCommand('/masterVideo', [{ type: 'f', value: val }])
			},
		},
		[ActionId.SET_MASTER_AUDIO]: {
			name: 'Set Master Audio',
			options: [options.valueVar],
			callback: async (action): Promise<void> => {
				const val = await parseVariableNumber(instance, action, 'value')
				if (!isNaN(val) && instance.OSC)
					instance.OSC.sendCommand('/masterAudio', [{ type: 'f', value: val }])
			},
		},
		[ActionId.SET_MASTER_DMX]: {
			name: 'Set Master DMX',
			options: [options.valueVar],
			callback: async (action): Promise<void> => {
				const val = await parseVariableNumber(instance, action, 'value')
				if (!isNaN(val) && instance.OSC)
					instance.OSC.sendCommand('/masterDMX', [{ type: 'f', value: val }])
			},
		},
		[ActionId.ENTER_FULLSCREEN]: {
			name: 'Enter Fullscreen',
			options: [],
			callback: (): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/enterFullscreen', [])
			},
		},
		[ActionId.EXIT_FULLSCREEN]: {
			name: 'Exit Fullscreen',
			options: [],
			callback: (): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/exitFullscreen', [])
			},
		},
		[ActionId.DISPLAY_TEST_CARD]: {
			name: 'Display TestCard',
			options: [],
			callback: (): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/displayTestCard', [])
			},
		},
		[ActionId.HIDE_TEST_CARD]: {
			name: 'Hide TestCard',
			options: [],
			callback: (): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/hideTestCard', [])
			},
		},
		[ActionId.DISABLE_WORKSPACE]: {
			name: 'Disable Workspace',
			options: [],
			callback: (): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/disableWorkspace', [])
			},
		},
		[ActionId.ENABLE_WORKSPACE]: {
			name: 'Enable Workspace',
			options: [],
			callback: (): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/enableWorkspace', [])
			},
		},
		[ActionId.OPEN_PROJECT]: {
			name: 'Open Project',
			options: [options.name],
			callback: async (action): Promise<void> => {
				const name = await parseVariableString(instance, action, 'name')
				if (instance.OSC) instance.OSC.sendCommand('/action/openProject', [{ type: 's', value: name }])
			},
		},
		[ActionId.SAVE_PROJECT]: {
			name: 'Save Project',
			options: [],
			callback: (): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/saveProject', [])
			},
		},
		[ActionId.SAVE_PROJECT_AS]: {
			name: 'Save Project As',
			options: [options.name],
			callback: async (action): Promise<void> => {
				const name = await parseVariableString(instance, action, 'name')
				if (instance.OSC) instance.OSC.sendCommand('/action/saveProject', [{ type: 's', value: name }])
			},
		},
		[ActionId.QUIT]: {
			name: 'Quit',
			options: [],
			callback: (): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/quit', [])
			},
		},

		[ActionId.SELECTED_LAYER_RESTART_MEDIA]: {
			name: 'Layer / Restart Media',
			options: [...layerTargetOptions],
			callback: async (action): Promise<void> => {
				const layerPath = await resolveLayerPath(instance, action)
				if (instance.OSC) instance.OSC.sendCommand(`/${layerPath}/startMedia`, [])
			},
		},
		[ActionId.SELECTED_LAYER_START_MEDIA_BY_INDEX]: {
			name: 'Layer / Start Media by Index',
			options: [...layerTargetOptions, options.indexVar],
			callback: async (action): Promise<void> => {
				const layerPath = await resolveLayerPath(instance, action)
				const idx = await parseVariableInt(instance, action, 'index')
				if (!isNaN(idx) && instance.OSC)
					instance.OSC.sendCommand(`/${layerPath}/startMedia`, [{ type: 'i', value: idx }])
			},
		},
		[ActionId.SELECTED_LAYER_START_MEDIA_BY_NAME]: {
			name: 'Layer / Start Media by Name',
			options: [...layerTargetOptions, options.name],
			callback: async (action): Promise<void> => {
				const layerPath = await resolveLayerPath(instance, action)
				const name = await parseVariableString(instance, action, 'name')
				if (instance.OSC)
					instance.OSC.sendCommand(`/${layerPath}/startMedia`, [{ type: 's', value: name }])
			},
		},
		[ActionId.SELECTED_LAYER_PAUSE_MEDIA]: {
			name: 'Layer / Pause Media',
			options: [...layerTargetOptions],
			callback: async (action): Promise<void> => {
				const layerPath = await resolveLayerPath(instance, action)
				if (instance.OSC) instance.OSC.sendCommand(`/${layerPath}/pauseMedia`, [])
			},
		},
		[ActionId.SELECTED_LAYER_PLAY_OR_PAUSE_MEDIA]: {
			name: 'Layer / Start or Pause Media',
			options: [...layerTargetOptions],
			callback: async (action): Promise<void> => {
				const layerPath = await resolveLayerPath(instance, action)
				if (instance.OSC) instance.OSC.sendCommand(`/${layerPath}/startOrPauseMedia`, [])
			},
		},
		[ActionId.SELECTED_LAYER_STOP_MEDIA]: {
			name: 'Layer / Stop Media',
			options: [...layerTargetOptions],
			callback: async (action): Promise<void> => {
				const layerPath = await resolveLayerPath(instance, action)
				if (instance.OSC) instance.OSC.sendCommand(`/${layerPath}/stopMedia`, [])
			},
		},
		[ActionId.SELECTED_LAYER_GO_TO_MEDIA_TIME]: {
			name: 'Layer / Go to Media Time',
			options: [...layerTargetOptions, options.timeVar],
			callback: async (action): Promise<void> => {
				const layerPath = await resolveLayerPath(instance, action)
				const time = await parseVariableNumber(instance, action, 'time')
				if (!isNaN(time) && instance.OSC)
					instance.OSC.sendCommand(`/${layerPath}/media/time`, [{ type: 'f', value: time }])
			},
		},
		[ActionId.SELECTED_LAYER_GO_TO_NORMALIZED_TIME]: {
			name: 'Layer / Go to Media Normalized Time',
			options: [...layerTargetOptions, options.valueVar],
			callback: async (action): Promise<void> => {
				const layerPath = await resolveLayerPath(instance, action)
				const val = await parseVariableNumber(instance, action, 'value')
				if (!isNaN(val) && instance.OSC)
					instance.OSC.sendCommand(`/${layerPath}/media/normalizedTime`, [{ type: 'f', value: val }])
			},
		},
		[ActionId.SELECTED_LAYER_SET_MEDIA_SPEED]: {
			name: 'Layer / Set Media Speed',
			options: [...layerTargetOptions, options.valueVar],
			callback: async (action): Promise<void> => {
				const layerPath = await resolveLayerPath(instance, action)
				const val = await parseVariableNumber(instance, action, 'value')
				if (!isNaN(val) && instance.OSC)
					instance.OSC.sendCommand(`/${layerPath}/media/speed`, [{ type: 'f', value: val }])
			},
		},
		[ActionId.SELECTED_LAYER_JOG_MEDIA_TIME]: {
			name: 'Layer / Jog Media Time',
			description: 'Jog the layer media time by a relative number of seconds using tracked layer data',
			options: [
				...layerTargetOptions,
				options.timeVar,
				{
					type: 'textinput',
					label: 'Tracked Layer',
					id: 'layer',
					default: 'firstByIndex',
					useVariables: true,
				},
			],
			callback: async (action): Promise<void> => {
				const layerPath = await resolveLayerPath(instance, action)
				const time = await parseVariableNumber(instance, action, 'time')
				if (isNaN(time)) return
				const layerKey = await parseVariableString(instance, action, 'layer')
				const mediaLayer = instance.mediaLayers[layerKey]
				if (!mediaLayer || mediaLayer.duration === 0) return
				const newTime = mediaLayer.elapsedTime + time
				if (instance.OSC)
					instance.OSC.sendCommand(`/${layerPath}/media/time`, [{ type: 'f', value: newTime }])
			},
		},
		[ActionId.CUSTOM_OSC]: {
			name: 'Send Custom OSC Command',
			description: 'Send a custom OSC command to Millumin (e.g. for the Interactions panel)',
			options: [options.oscPath, options.oscArgs],
			callback: async (action): Promise<void> => {
				if (!instance.OSC) return

				const path = await parseVariableString(instance, action, 'oscPath')
				const argsString = await parseVariableString(instance, action, 'oscArgs')

				// Parse the arguments string if provided
				const args: Array<{ type: 'i' | 'f'; value: number } | { type: 's'; value: string }> = []
				if (argsString && argsString.trim() !== '') {
					const argParts = argsString.split(',')
					for (const part of argParts) {
						const trimmed = part.trim()
						if (trimmed === '') continue

						// Check if the argument has a type prefix (e.g., "i:1", "s:hello", "f:0.5")
						const colonIndex = trimmed.indexOf(':')
						if (colonIndex > 0) {
							const type = trimmed.substring(0, colonIndex).toLowerCase()
							const valueStr = trimmed.substring(colonIndex + 1)

							if (type === 'i') {
								args.push({ type: 'i', value: parseInt(valueStr, 10) })
							} else if (type === 's') {
								args.push({ type: 's', value: valueStr })
							} else if (type === 'f') {
								args.push({ type: 'f', value: parseFloat(valueStr) })
							} else {
								instance.log('warn', `Custom OSC: unknown argument type '${type}'`)
							}
						} else {
							// No type prefix — infer type
							if (!isNaN(Number(trimmed))) {
								if (trimmed.includes('.')) {
									args.push({ type: 'f', value: parseFloat(trimmed) })
								} else {
									args.push({ type: 'i', value: parseInt(trimmed, 10) })
								}
							} else {
								args.push({ type: 's', value: trimmed })
							}
						}
					}
				}

				instance.OSC.sendCommand(path, args)
			},
		},
	}

	return actions
}
