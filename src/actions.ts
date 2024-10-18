import { CompanionActionDefinition, CompanionActionDefinitions } from '@companion-module/base'
import { MilluminConfig } from './config'
import { InstanceBaseExt, options } from './utils'

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
}

export function getActions(instance: InstanceBaseExt<MilluminConfig>): CompanionActionDefinitions {
	const actions: { [id in ActionId]: CompanionActionDefinition | undefined } = {
		[ActionId.LAUNCH_OR_STOP_COLUMN_BY_INDEX]: {
			name: 'Launch or Stop Column by Index',
			options: [options.index],
			callback: (action): void => {
				if (instance.OSC)
					instance.OSC.sendCommand('/action/launchOrStopColumn', [{ type: 'i', value: action.options.index }])
			},
		},
		[ActionId.LAUNCH_OR_STOP_COLUMN_BY_NAME]: {
			name: 'Launch or Stop Column by Name',
			options: [options.name],
			callback: (action): void => {
				if (instance.OSC)
					instance.OSC.sendCommand('/action/launchOrStopColumn', [{ type: 's', value: action.options.name }])
			},
		},
		[ActionId.LAUNCH_COLUMN_BY_INDEX]: {
			name: 'Launch Column by Index',
			options: [options.index],
			callback: (action): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/launchColumn', [{ type: 'i', value: action.options.index }])
			},
		},
		[ActionId.LAUNCH_COLUMN_BY_NAME]: {
			name: 'Launch Column by Name',
			options: [options.name],
			callback: (action): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/launchColumn', [{ type: 's', value: action.options.name }])
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
			options: [options.time],
			callback: (action): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/goToTime', [{ type: 'f', value: action.options.time }])
			},
		},
		[ActionId.GO_TO_TIMELINE_SEGMENT]: {
			name: 'Go to Timeline Segment',
			options: [options.name],
			callback: (action): void => {
				if (instance.OSC)
					instance.OSC.sendCommand('/action/goToTimelineSegment', [{ type: 's', value: action.options.name }])
			},
		},
		[ActionId.SELECT_BOARD_BY_INDEX]: {
			name: 'Select Board By Index',
			options: [options.index],
			callback: (action): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/selectBoard', [{ type: 'i', value: action.options.index }])
			},
		},
		[ActionId.SELECT_BOARD_BY_NAME]: {
			name: 'Select Board By Index',
			options: [options.name],
			callback: (action): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/selectBoard', [{ type: 's', value: action.options.name }])
			},
		},
		[ActionId.SELECT_LAYER_BY_INDEX]: {
			name: 'Select Layer By Index',
			options: [options.index],
			callback: (action): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/selectLayer', [{ type: 'i', value: action.options.index }])
			},
		},
		[ActionId.SELECT_LAYER_BY_NAME]: {
			name: 'Select Layer By Index',
			options: [options.name],
			callback: (action): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/selectLayer', [{ type: 's', value: action.options.name }])
			},
		},
		[ActionId.SELECT_LIGHT_BY_INDEX]: {
			name: 'Select Light By Index',
			options: [options.index],
			callback: (action): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/selectLight', [{ type: 'i', value: action.options.index }])
			},
		},
		[ActionId.SELECT_LIGHT_BY_NAME]: {
			name: 'Select Light By Index',
			options: [options.name],
			callback: (action): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/selectLight', [{ type: 's', value: action.options.name }])
			},
		},
		[ActionId.SET_MASTER_VIDEO]: {
			name: 'Set Master Video',
			options: [options.value],
			callback: (action): void => {
				if (instance.OSC) instance.OSC.sendCommand('/masterVideo', [{ type: 'f', value: action.options.value }])
			},
		},
		[ActionId.SET_MASTER_AUDIO]: {
			name: 'Set Master Audio',
			options: [options.value],
			callback: (action): void => {
				if (instance.OSC) instance.OSC.sendCommand('/masterAudio', [{ type: 'f', value: action.options.value }])
			},
		},
		[ActionId.SET_MASTER_DMX]: {
			name: 'Set Master MDX',
			options: [options.value],
			callback: (action): void => {
				if (instance.OSC) instance.OSC.sendCommand('/masterDMX', [{ type: 'f', value: action.options.value }])
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
			callback: (action): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/openProject', [{ type: 's', value: action.options.name }])
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
			callback: (action): void => {
				if (instance.OSC) instance.OSC.sendCommand('/action/saveProject', [{ type: 's', value: action.options.name }])
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
			name: 'Selected Layer / Restart Media',
			options: [],
			callback: (): void => {
				if (instance.OSC) instance.OSC.sendCommand('/selectedLayer/startMedia', [])
			},
		},
		[ActionId.SELECTED_LAYER_START_MEDIA_BY_INDEX]: {
			name: 'Selected Layer / Start Media by Index',
			options: [options.index],
			callback: (action): void => {
				if (instance.OSC)
					instance.OSC.sendCommand('/selectedLayer/startMedia', [{ type: 'i', value: action.options.index }])
			},
		},
		[ActionId.SELECTED_LAYER_START_MEDIA_BY_NAME]: {
			name: 'Selected Layer / Start Media by Name',
			options: [options.name],
			callback: (action): void => {
				if (instance.OSC)
					instance.OSC.sendCommand('/selectedLayer/startMedia', [{ type: 's', value: action.options.name }])
			},
		},
		[ActionId.SELECTED_LAYER_PAUSE_MEDIA]: {
			name: 'Selected Layer / Pause Media',
			options: [],
			callback: (): void => {
				if (instance.OSC) instance.OSC.sendCommand('/selectedLayer/pauseMedia', [])
			},
		},
		[ActionId.SELECTED_LAYER_PLAY_OR_PAUSE_MEDIA]: {
			name: 'Selected Layer / Start or Pause Media',
			options: [],
			callback: (): void => {
				if (instance.OSC) instance.OSC.sendCommand('/selectedLayer/startOrPauseMedia', [])
			},
		},
		[ActionId.SELECTED_LAYER_STOP_MEDIA]: {
			name: 'Selected Layer / Stop Media',
			options: [],
			callback: (): void => {
				if (instance.OSC) instance.OSC.sendCommand('/selectedLayer/stopMedia', [])
			},
		},
		[ActionId.SELECTED_LAYER_GO_TO_MEDIA_TIME]: {
			name: 'Selected Layer / Go to Media Time',
			options: [options.time],
			callback: (action): void => {
				if (instance.OSC)
					instance.OSC.sendCommand('/selectedLayer/media/time', [{ type: 'f', value: action.options.time }])
			},
		},
		[ActionId.SELECTED_LAYER_GO_TO_NORMALIZED_TIME]: {
			name: 'Selected Layer / Go to Media Normalized Time',
			options: [options.value],
			callback: (action): void => {
				if (instance.OSC)
					instance.OSC.sendCommand('/selectedLayer/media/normalizedTime', [{ type: 'f', value: action.options.value }])
			},
		},
		[ActionId.SELECTED_LAYER_SET_MEDIA_SPEED]: {
			name: 'Selected Layer / Set Media Speed',
			options: [options.value],
			callback: (action): void => {
				if (instance.OSC)
					instance.OSC.sendCommand('/selectedLayer/media/speed', [{ type: 'f', value: action.options.value }])
			},
		},
	}

	return actions
}
