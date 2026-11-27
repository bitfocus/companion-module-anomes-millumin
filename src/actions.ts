import {
	CompanionActionContext,
	CompanionActionDefinition,
	CompanionActionDefinitions,
	CompanionActionEvent,
	CompanionInputFieldNumber,
	CompanionInputFieldTextInput,
	OSCSomeArguments,
	SomeCompanionActionInputField,
} from '@companion-module/base'
import { MilluminConfig } from './config'
import {
	ELEMENT_TARGET_CHOICES,
	InstanceBaseExt,
	LAYER_TARGET_CHOICES,
	LIGHT_TARGET_CHOICES,
	MEDIA_TARGET_CHOICES,
	f,
	i,
	modeField,
	options,
	parseArgList,
	parseNumber,
	parseText,
	resolveTarget,
	s,
	showWhen,
	targetFields,
	timeArg,
	withMode,
} from './utils'

export enum ActionId {
	// Columns
	LAUNCH_OR_STOP_COLUMN_BY_INDEX = 'Action_LaunchOrStopColumn_ByIndex',
	LAUNCH_OR_STOP_COLUMN_BY_NAME = 'Action_LaunchOrStopColumn_ByName',
	LAUNCH_COLUMN_BY_INDEX = 'Action_LaunchColumn_ByIndex',
	LAUNCH_COLUMN_BY_NAME = 'Action_LaunchColumn_ByName',
	STOP_COLUMN = 'Action_StopColumn',
	LAUNCH_PREVIOUS_COLUMN = 'Action_LaunchPreviousColumn',
	LAUNCH_NEXT_COLUMN = 'Action_LaunchNextColumn',
	// Transport (dashboard / timeline)
	PAUSE = 'Action_Pause',
	PLAY = 'Action_Play',
	PLAY_OR_PAUSE = 'Action_PlayOrPause',
	GO_TO_TIME = 'Action_GoToTime',
	GO_TO_TIMECODE = 'Action_GoToTimecode',
	JOG_TIME = 'Action_JogTime',
	GO_TO_TIMELINE_SEGMENT = 'Action_GoToTimelineSegment',
	// Selection
	SELECT_BOARD_BY_INDEX = 'Action_SelectBoard_ByIndex',
	SELECT_BOARD_BY_NAME = 'Action_SelectBoard_ByName',
	SELECT_LAYER_BY_INDEX = 'Action_SelectLayer_ByIndex',
	SELECT_LAYER_BY_NAME = 'Action_SelectLayer_ByName',
	SELECT_LIGHT_BY_INDEX = 'Action_SelectLight_ByIndex',
	SELECT_LIGHT_BY_NAME = 'Action_SelectLight_ByName',
	// Masters
	SET_MASTER_VIDEO = 'Action_SetMasterVideo',
	SET_MASTER_AUDIO = 'Action_SetMasterAudio',
	SET_MASTER_DMX = 'Action_SetMasterDMX',
	// Misc
	BRUSH = 'Action_Brush',
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
	PING = 'Action_Ping',
	// Elements (layers / lights)
	ELEMENT_OPACITY = 'Element_Opacity',
	ELEMENT_POSITION = 'Element_Position',
	ELEMENT_ROTATION = 'Element_Rotation',
	ELEMENT_SCALE = 'Element_Scale',
	ELEMENT_MAPPING = 'Element_MappingCorner',
	ELEMENT_EFFECT = 'Element_EffectParameter',
	LIGHT_INTENSITY = 'Light_Intensity',
	ELEMENT_SELECT = 'Element_Select',
	ELEMENT_PROPERTY = 'Element_CustomProperty',
	ELEMENT_REQUEST_FEEDBACK = 'Element_RequestFeedback',
	// Media
	LAYER_START_MEDIA = 'Layer_StartMedia',
	LAYER_PAUSE_MEDIA = 'Layer_PauseMedia',
	LAYER_START_OR_PAUSE_MEDIA = 'Layer_StartOrPauseMedia',
	LAYER_STOP_MEDIA = 'Layer_StopMedia',
	MEDIA_TIME = 'Media_Time',
	MEDIA_JOG = 'Media_JogTime',
	MEDIA_NORMALIZED_TIME = 'Media_NormalizedTime',
	MEDIA_SPEED = 'Media_Speed',
	MEDIA_TEXT = 'Media_Text',
	MEDIA_QUARTZ_INPUT = 'Media_QuartzInput',
	// Import
	LAYER_IMPORT = 'Layer_Import',
	LAYER_CLEAR_MEDIA = 'Layer_ClearMedia',
	// Raw
	CUSTOM_OSC = 'Action_CustomOSC',
}

/* ------------------------------------------------------------------------ */
/* Field helpers                                                             */
/* ------------------------------------------------------------------------ */

function textValue(id: string, label: string, def: string, extra: Partial<CompanionInputFieldTextInput> = {}) {
	const field: CompanionInputFieldTextInput = {
		type: 'textinput',
		id,
		label,
		default: def,
		useVariables: true,
		...extra,
	}
	return field
}

function masterField(): CompanionInputFieldNumber {
	return {
		type: 'number',
		id: 'value',
		label: 'Level (0.0 – 1.0)',
		default: 1,
		min: 0,
		max: 1,
		step: 0.01,
		range: true,
	}
}

const AXIS_CHOICES = [
	{ id: 'xy', label: 'X and Y' },
	{ id: 'x', label: 'X only' },
	{ id: 'y', label: 'Y only' },
]

const CORNER_CHOICES = [
	{ id: 'topLeft', label: 'Top left' },
	{ id: 'topRight', label: 'Top right' },
	{ id: 'bottomRight', label: 'Bottom right' },
	{ id: 'bottomLeft', label: 'Bottom left' },
]

/* ------------------------------------------------------------------------ */
/* Actions                                                                   */
/* ------------------------------------------------------------------------ */

export function getActions(instance: InstanceBaseExt<MilluminConfig>): CompanionActionDefinitions {
	const send = (path: string, args: OSCSomeArguments = []): void => {
		if (!instance.OSC) {
			instance.log('warn', `Not connected, cannot send ${path}`)
			return
		}
		instance.OSC.sendCommand(path, args)
	}

	const simple = (name: string, path: string, description?: string): CompanionActionDefinition => ({
		name,
		description,
		options: [],
		callback: () => send(path),
	})

	const byIndex = (name: string, path: string): CompanionActionDefinition => ({
		name,
		options: [options.index],
		callback: (action) => send(path, [i(Number(action.options.index))]),
	})

	const byName = (name: string, path: string, label = 'Name'): CompanionActionDefinition => ({
		name,
		options: [{ ...options.name, label }],
		callback: async (action, ctx) => send(path, [s(await parseText(ctx, action.options.name))]),
	})

	/** Resolve target, log and return null if invalid */
	const target = async (action: CompanionActionEvent, ctx: CompanionActionContext): Promise<string | null> => {
		const t = await resolveTarget(ctx, action.options)
		if (t === null) instance.log('warn', `${action.actionId}: invalid target (missing name or index)`)
		return t
	}

	/** Base path for media properties: /<layer>/media/<prop> or /<Movie.mov>/<prop> */
	const mediaPath = (action: CompanionActionEvent, t: string, prop: string): string =>
		action.options.targetType === 'media' ? `/${t}/${prop}` : `/${t}/media/${prop}`

	/** Generic "number property" action (opacity, rotation, scale, intensity...) */
	const numberProperty = (
		name: string,
		prop: string,
		choices: { id: string; label: string }[],
		valueLabel: string,
		def: string,
		description?: string,
	): CompanionActionDefinition => ({
		name,
		description,
		options: [...targetFields(choices, choices[0].id as any), modeField, textValue('value', valueLabel, def)],
		callback: async (action, ctx) => {
			const t = await target(action, ctx)
			const v = await parseNumber(ctx, action.options.value)
			if (t === null) return
			if (v === null) return instance.log('warn', `${name}: invalid value`)
			send(withMode(`/${t}/${prop}`, action.options.mode), [f(v)])
		},
	})

	const actions: { [id in ActionId]: CompanionActionDefinition | undefined } = {
		/* ---------------- Columns ---------------- */
		[ActionId.LAUNCH_OR_STOP_COLUMN_BY_INDEX]: byIndex(
			'Column / Launch or Stop by Index',
			'/action/launchOrStopColumn',
		),
		[ActionId.LAUNCH_OR_STOP_COLUMN_BY_NAME]: byName('Column / Launch or Stop by Name', '/action/launchOrStopColumn'),
		[ActionId.LAUNCH_COLUMN_BY_INDEX]: byIndex('Column / Launch by Index', '/action/launchColumn'),
		[ActionId.LAUNCH_COLUMN_BY_NAME]: byName('Column / Launch by Name', '/action/launchColumn'),
		[ActionId.STOP_COLUMN]: simple('Column / Stop', '/action/stopColumn'),
		[ActionId.LAUNCH_PREVIOUS_COLUMN]: simple('Column / Launch Previous', '/action/launchPreviousColumn'),
		[ActionId.LAUNCH_NEXT_COLUMN]: simple('Column / Launch Next', '/action/launchNextColumn'),

		/* ---------------- Transport ---------------- */
		[ActionId.PLAY]: simple(
			'Transport / Play',
			'/action/play',
			'Play all media of the dashboard, or the edited timeline',
		),
		[ActionId.PAUSE]: simple(
			'Transport / Pause',
			'/action/pause',
			'Pause all media of the dashboard, or the edited timeline',
		),
		[ActionId.PLAY_OR_PAUSE]: simple('Transport / Play or Pause', '/action/playOrPause'),
		[ActionId.GO_TO_TIME]: {
			name: 'Transport / Go to Time (seconds)',
			description: 'Negative value = seconds before the end',
			options: [options.time],
			callback: (action) => send('/action/goToTime', [f(Number(action.options.time))]),
		},
		[ActionId.GO_TO_TIMECODE]: {
			name: 'Transport / Go to Time (timecode or seconds)',
			description: 'Accepts "01:02:03.456", "10" or "-10" (from the end). Variables allowed.',
			options: [textValue('time', 'Time', '00:00:00.000')],
			callback: async (action, ctx) => send('/action/goToTime', [timeArg(await parseText(ctx, action.options.time))]),
		},
		[ActionId.JOG_TIME]: {
			name: 'Transport / Jog Time (relative)',
			description:
				'Moves the playhead relatively. Uses the elapsed time reported for the reference layer (default index:1) to compute an absolute time.',
			options: [
				options.time,
				textValue('reference', 'Reference layer (index:1, layer:Name, selectedLayer)', 'index:1'),
			],
			callback: async (action, ctx) => {
				const ref = (await parseText(ctx, action.options.reference ?? 'index:1')) || 'index:1'
				const el = instance.state.getElement(ref)
				if (!el || el.media.duration === 0) {
					instance.log('warn', `Jog Time: no time feedback received for ${ref}`)
					return
				}
				const newTime = Math.min(Math.max(0, el.media.time + Number(action.options.time)), el.media.duration)
				send('/action/goToTime', [f(newTime)])
			},
		},
		[ActionId.GO_TO_TIMELINE_SEGMENT]: byName(
			'Transport / Go to Timeline Segment',
			'/action/goToTimelineSegment',
			'Segment name',
		),

		/* ---------------- Selection ---------------- */
		[ActionId.SELECT_BOARD_BY_INDEX]: byIndex('Select / Board by Index', '/action/selectBoard'),
		[ActionId.SELECT_BOARD_BY_NAME]: byName('Select / Board by Name', '/action/selectBoard'),
		[ActionId.SELECT_LAYER_BY_INDEX]: byIndex('Select / Layer by Index', '/action/selectLayer'),
		[ActionId.SELECT_LAYER_BY_NAME]: byName('Select / Layer by Name', '/action/selectLayer'),
		[ActionId.SELECT_LIGHT_BY_INDEX]: byIndex('Select / Light by Index', '/action/selectLight'),
		[ActionId.SELECT_LIGHT_BY_NAME]: byName('Select / Light by Name', '/action/selectLight'),

		/* ---------------- Masters ---------------- */
		[ActionId.SET_MASTER_VIDEO]: {
			name: 'Master / Video',
			options: [masterField()],
			callback: (action) => send('/masterVideo', [f(Number(action.options.value))]),
		},
		[ActionId.SET_MASTER_AUDIO]: {
			name: 'Master / Audio',
			options: [masterField()],
			callback: (action) => send('/masterAudio', [f(Number(action.options.value))]),
		},
		[ActionId.SET_MASTER_DMX]: {
			name: 'Master / DMX',
			options: [masterField()],
			callback: (action) => send('/masterDMX', [f(Number(action.options.value))]),
		},

		/* ---------------- Misc ---------------- */
		[ActionId.BRUSH]: {
			name: 'Brush / Move brush tool',
			description: 'Normalized coordinates (0.0 – 1.0)',
			options: [
				textValue('x', 'X (0.0 – 1.0)', '0.5'),
				textValue('y', 'Y (0.0 – 1.0)', '0.5'),
				textValue('pressure', 'Pressure (0.0 – 1.0, empty = maximum)', ''),
			],
			callback: async (action, ctx) => {
				const x = await parseNumber(ctx, action.options.x)
				const y = await parseNumber(ctx, action.options.y)
				const p = await parseNumber(ctx, action.options.pressure)
				if (x === null || y === null) return instance.log('warn', 'Brush: invalid coordinates')
				send('/action/brush', p === null ? [f(x), f(y)] : [f(x), f(y), f(p)])
			},
		},
		[ActionId.ENTER_FULLSCREEN]: simple('Display / Enter Fullscreen', '/action/enterFullscreen'),
		[ActionId.EXIT_FULLSCREEN]: simple('Display / Exit Fullscreen', '/action/exitFullscreen'),
		[ActionId.DISPLAY_TEST_CARD]: simple('Display / Show Test Card', '/action/displayTestCard'),
		[ActionId.HIDE_TEST_CARD]: simple('Display / Hide Test Card', '/action/hideTestCard'),
		[ActionId.DISABLE_WORKSPACE]: simple('Display / Disable Workspace', '/action/disableWorkspace'),
		[ActionId.ENABLE_WORKSPACE]: simple('Display / Enable Workspace', '/action/enableWorkspace'),
		[ActionId.OPEN_PROJECT]: byName(
			'Project / Open',
			'/action/openProject',
			'Project path (/path/to/project.millumin)',
		),
		[ActionId.SAVE_PROJECT]: simple('Project / Save', '/action/saveProject'),
		[ActionId.SAVE_PROJECT_AS]: byName(
			'Project / Save As',
			'/action/saveProject',
			'Project path (/path/to/project.millumin)',
		),
		[ActionId.QUIT]: simple('Project / Quit Millumin', '/action/quit'),
		[ActionId.PING]: simple(
			'Feedback / Ping (request full state)',
			'/ping',
			'Millumin answers with the state of all the layers',
		),

		/* ---------------- Elements ---------------- */
		[ActionId.ELEMENT_OPACITY]: numberProperty(
			'Layer / Opacity',
			'opacity',
			LAYER_TARGET_CHOICES,
			'Opacity (0.0 – 1.0)',
			'1',
		),
		[ActionId.ELEMENT_POSITION]: {
			name: 'Layer / Position',
			options: [
				...targetFields(LAYER_TARGET_CHOICES),
				{ type: 'dropdown', id: 'axis', label: 'Axis', default: 'xy', choices: AXIS_CHOICES },
				modeField,
				textValue('x', 'X (px)', '0', showWhen('axis', ['xy', 'x'])),
				textValue('y', 'Y (px)', '0', showWhen('axis', ['xy', 'y'])),
			],
			callback: async (action, ctx) => {
				const t = await target(action, ctx)
				if (t === null) return
				const axis = (action.options.axis as string) || 'xy'
				const x = await parseNumber(ctx, action.options.x)
				const y = await parseNumber(ctx, action.options.y)
				const args = []
				if (axis !== 'y') {
					if (x === null) return instance.log('warn', 'Position: invalid X')
					args.push(f(x))
				}
				if (axis !== 'x') {
					if (y === null) return instance.log('warn', 'Position: invalid Y')
					args.push(f(y))
				}
				send(withMode(`/${t}/position/${axis}`, action.options.mode), args)
			},
		},
		[ActionId.ELEMENT_ROTATION]: numberProperty(
			'Layer / Rotation',
			'rotation',
			LAYER_TARGET_CHOICES,
			'Rotation (°)',
			'0',
		),
		[ActionId.ELEMENT_SCALE]: numberProperty('Layer / Scale', 'scale', LAYER_TARGET_CHOICES, 'Scale (1 = 100%)', '1'),
		[ActionId.ELEMENT_MAPPING]: {
			name: 'Layer / Mapping Corner',
			options: [
				...targetFields(LAYER_TARGET_CHOICES),
				{ type: 'dropdown', id: 'corner', label: 'Corner', default: 'topLeft', choices: CORNER_CHOICES },
				{ type: 'dropdown', id: 'axis', label: 'Axis', default: 'xy', choices: AXIS_CHOICES },
				modeField,
				textValue('x', 'X (px)', '0', showWhen('axis', ['xy', 'x'])),
				textValue('y', 'Y (px)', '0', showWhen('axis', ['xy', 'y'])),
			],
			callback: async (action, ctx) => {
				const t = await target(action, ctx)
				if (t === null) return
				const axis = (action.options.axis as string) || 'xy'
				const corner = (action.options.corner as string) || 'topLeft'
				const x = await parseNumber(ctx, action.options.x)
				const y = await parseNumber(ctx, action.options.y)
				const args = []
				if (axis !== 'y') {
					if (x === null) return instance.log('warn', 'Mapping: invalid X')
					args.push(f(x))
				}
				if (axis !== 'x') {
					if (y === null) return instance.log('warn', 'Mapping: invalid Y')
					args.push(f(y))
				}
				const base = `/${t}/mapping/${corner}` + (axis === 'xy' ? '' : `/${axis}`)
				send(withMode(base, action.options.mode), args)
			},
		},
		[ActionId.ELEMENT_EFFECT]: {
			name: 'Layer / Effect Parameter',
			description: 'Change a parameter of an effect, the effect being identified by its position (1 = first effect)',
			options: [
				...targetFields(LAYER_TARGET_CHOICES),
				textValue('effect', 'Effect index (1 = first)', '1'),
				textValue('parameter', 'Parameter name (e.g. red)', ''),
				modeField,
				textValue('value', 'Value', '0'),
			],
			callback: async (action, ctx) => {
				const t = await target(action, ctx)
				if (t === null) return
				const effect = await parseNumber(ctx, action.options.effect)
				const param = (await parseText(ctx, action.options.parameter)).trim()
				const v = await parseNumber(ctx, action.options.value)
				if (effect === null || effect < 1 || param === '' || v === null)
					return instance.log('warn', 'Effect parameter: invalid effect index, parameter or value')
				send(withMode(`/${t}/effect${Math.round(effect)}/${param}`, action.options.mode), [f(v)])
			},
		},
		[ActionId.LIGHT_INTENSITY]: numberProperty(
			'Light / Intensity',
			'intensity',
			LIGHT_TARGET_CHOICES,
			'Intensity (0 – 255)',
			'255',
		),
		[ActionId.ELEMENT_SELECT]: {
			name: 'Layer / Light / Select or Deselect',
			description: 'Uses the "selected" property, so it can also deselect',
			options: [
				...targetFields(
					ELEMENT_TARGET_CHOICES.filter((c) => !c.id.startsWith('selected')),
					'layer',
				),
				{
					type: 'dropdown',
					id: 'selected',
					label: 'State',
					default: 1,
					choices: [
						{ id: 1, label: 'Select' },
						{ id: 0, label: 'Deselect' },
					],
				},
			],
			callback: async (action, ctx) => {
				const t = await target(action, ctx)
				if (t === null) return
				send(`/${t}/selected`, [i(Number(action.options.selected ?? 1))])
			},
		},
		[ActionId.ELEMENT_PROPERTY]: {
			name: 'Layer / Light / Any Property',
			description:
				'Set any property of an element (e.g. "opacity", "position/x", "mapping/topLeft/y", "effect2/blue", "media/myQuartzInput")',
			options: [
				...targetFields(ELEMENT_TARGET_CHOICES),
				textValue('property', 'Property path', 'opacity'),
				modeField,
				textValue('values', 'Value(s), comma separated (types: i:1, f:0.5, s:text)', '1'),
			],
			callback: async (action, ctx) => {
				const t = await target(action, ctx)
				if (t === null) return
				const prop = (await parseText(ctx, action.options.property)).trim().replace(/^\/+|\/+$/g, '')
				if (prop === '') return instance.log('warn', 'Property: empty property path')
				const args = parseArgList(await parseText(ctx, action.options.values), (m) => instance.log('warn', m))
				send(withMode(`/${t}/${prop}`, action.options.mode), args)
			},
		},
		[ActionId.ELEMENT_REQUEST_FEEDBACK]: {
			name: 'Feedback / Request Property (/?)',
			description: 'Ask Millumin to send the current value of a property (suffix /?)',
			options: [
				...targetFields(ELEMENT_TARGET_CHOICES),
				{
					type: 'dropdown',
					id: 'property',
					label: 'Property',
					default: 'opacity',
					allowCustom: true,
					choices: [
						{ id: 'opacity', label: 'opacity' },
						{ id: 'position', label: 'position' },
						{ id: 'rotation', label: 'rotation' },
						{ id: 'scale', label: 'scale' },
						{ id: 'intensity', label: 'intensity' },
						{ id: 'mapping/topLeft', label: 'mapping/topLeft' },
						{ id: 'mapping/topRight', label: 'mapping/topRight' },
						{ id: 'mapping/bottomRight', label: 'mapping/bottomRight' },
						{ id: 'mapping/bottomLeft', label: 'mapping/bottomLeft' },
						{ id: 'media/time', label: 'media/time' },
						{ id: 'media/speed', label: 'media/speed' },
					],
				},
			],
			callback: async (action, ctx) => {
				const t = await target(action, ctx)
				if (t === null) return
				const prop = String(action.options.property ?? '')
					.trim()
					.replace(/^\/+|\/+$/g, '')
				if (prop === '') return
				send(`/${t}/${prop}/?`)
			},
		},

		/* ---------------- Media ---------------- */
		[ActionId.LAYER_START_MEDIA]: {
			name: 'Media / Start (restart, by column or by name)',
			options: [
				...targetFields(LAYER_TARGET_CHOICES),
				{
					type: 'dropdown',
					id: 'startMode',
					label: 'Start',
					default: 'restart',
					choices: [
						{ id: 'restart', label: 'Restart current media' },
						{ id: 'index', label: 'Media at column index' },
						{ id: 'name', label: 'Media name or column name' },
					],
				},
				{ ...options.index, label: 'Column index', ...showWhen('startMode', ['index']) },
				{ ...options.name, label: 'Media or column name', ...showWhen('startMode', ['name']) },
			],
			callback: async (action, ctx) => {
				const t = await target(action, ctx)
				if (t === null) return
				const mode = action.options.startMode ?? 'restart'
				if (mode === 'index') send(`/${t}/startMedia`, [i(Number(action.options.index))])
				else if (mode === 'name') send(`/${t}/startMedia`, [s(await parseText(ctx, action.options.name))])
				else send(`/${t}/startMedia`)
			},
		},
		[ActionId.LAYER_PAUSE_MEDIA]: {
			name: 'Media / Pause',
			options: targetFields(LAYER_TARGET_CHOICES),
			callback: async (action, ctx) => {
				const t = await target(action, ctx)
				if (t !== null) send(`/${t}/pauseMedia`)
			},
		},
		[ActionId.LAYER_START_OR_PAUSE_MEDIA]: {
			name: 'Media / Start or Pause (toggle)',
			options: targetFields(LAYER_TARGET_CHOICES),
			callback: async (action, ctx) => {
				const t = await target(action, ctx)
				if (t !== null) send(`/${t}/startOrPauseMedia`)
			},
		},
		[ActionId.LAYER_STOP_MEDIA]: {
			name: 'Media / Stop',
			options: targetFields(LAYER_TARGET_CHOICES),
			callback: async (action, ctx) => {
				const t = await target(action, ctx)
				if (t !== null) send(`/${t}/stopMedia`)
			},
		},
		[ActionId.MEDIA_TIME]: {
			name: 'Media / Go to Time',
			description: 'Seconds ("10") or timecode ("01:02:03.400")',
			options: [...targetFields(MEDIA_TARGET_CHOICES), textValue('time', 'Time', '0')],
			callback: async (action, ctx) => {
				const t = await target(action, ctx)
				if (t === null) return
				send(mediaPath(action, t, 'time'), [timeArg(await parseText(ctx, action.options.time))])
			},
		},
		[ActionId.MEDIA_JOG]: {
			name: 'Media / Jog Time (relative)',
			description:
				'Moves the media playhead by N seconds. Uses the time feedback when available, otherwise the relative suffix /+ or /-.',
			options: [...targetFields(MEDIA_TARGET_CHOICES), textValue('offset', 'Offset (seconds, negative = back)', '5')],
			callback: async (action, ctx) => {
				const t = await target(action, ctx)
				const offset = await parseNumber(ctx, action.options.offset)
				if (t === null) return
				if (offset === null) return instance.log('warn', 'Media jog: invalid offset')
				const el = action.options.targetType === 'media' ? undefined : instance.state.getElement(t)
				if (el && el.media.duration > 0) {
					const newTime = Math.min(Math.max(0, el.media.time + offset), el.media.duration)
					send(mediaPath(action, t, 'time'), [f(newTime)])
				} else {
					send(mediaPath(action, t, `time/${offset < 0 ? '-' : '+'}`), [f(Math.abs(offset))])
				}
			},
		},
		[ActionId.MEDIA_NORMALIZED_TIME]: {
			name: 'Media / Go to Normalized Time',
			description: '0.0 = start, 0.5 = middle, 1.0 = end',
			options: [...targetFields(MEDIA_TARGET_CHOICES), textValue('value', 'Position (0.0 – 1.0)', '0')],
			callback: async (action, ctx) => {
				const t = await target(action, ctx)
				const v = await parseNumber(ctx, action.options.value)
				if (t === null) return
				if (v === null) return instance.log('warn', 'Normalized time: invalid value')
				send(mediaPath(action, t, 'normalizedTime'), [f(v)])
			},
		},
		[ActionId.MEDIA_SPEED]: {
			name: 'Media / Speed',
			options: [...targetFields(MEDIA_TARGET_CHOICES), modeField, textValue('value', 'Speed (1 = 100%)', '1')],
			callback: async (action, ctx) => {
				const t = await target(action, ctx)
				const v = await parseNumber(ctx, action.options.value)
				if (t === null) return
				if (v === null) return instance.log('warn', 'Speed: invalid value')
				send(withMode(mediaPath(action, t, 'speed'), action.options.mode), [f(v)])
			},
		},
		[ActionId.MEDIA_TEXT]: {
			name: 'Media / Set Text',
			description: 'Update the text of a text media',
			options: [...targetFields(MEDIA_TARGET_CHOICES), textValue('text', 'Text', '', { multiline: true })],
			callback: async (action, ctx) => {
				const t = await target(action, ctx)
				if (t === null) return
				send(mediaPath(action, t, 'text'), [s(await parseText(ctx, action.options.text))])
			},
		},
		[ActionId.MEDIA_QUARTZ_INPUT]: {
			name: 'Media / Quartz Composer Input',
			options: [
				...targetFields(MEDIA_TARGET_CHOICES),
				textValue('input', 'Input name', ''),
				{
					type: 'dropdown',
					id: 'valueType',
					label: 'Value type',
					default: 'f',
					choices: [
						{ id: 'f', label: 'Number (float)' },
						{ id: 'i', label: 'Integer' },
						{ id: 's', label: 'Text' },
					],
				},
				textValue('value', 'Value', '0'),
			],
			callback: async (action, ctx) => {
				const t = await target(action, ctx)
				if (t === null) return
				const input = (await parseText(ctx, action.options.input)).trim()
				if (input === '') return instance.log('warn', 'Quartz input: empty input name')
				const raw = await parseText(ctx, action.options.value)
				let arg
				if (action.options.valueType === 's') arg = s(raw)
				else {
					const n = Number(raw.replace(',', '.'))
					if (isNaN(n)) return instance.log('warn', 'Quartz input: invalid number')
					arg = action.options.valueType === 'i' ? i(n) : f(n)
				}
				send(mediaPath(action, t, input), [arg])
			},
		},

		/* ---------------- Import ---------------- */
		[ActionId.LAYER_IMPORT]: {
			name: 'Import / Import File or Folder',
			options: [
				...targetFields(LAYER_TARGET_CHOICES),
				textValue('path', 'Path to file or folder', ''),
				textValue('column', 'Column index (empty = current)', ''),
				{ type: 'checkbox', id: 'start', label: 'Start after import (needs a column)', default: false },
			],
			callback: async (action, ctx) => {
				const t = await target(action, ctx)
				if (t === null) return
				const path = await parseText(ctx, action.options.path)
				const col = await parseNumber(ctx, action.options.column)
				const args: OSCSomeArguments = col === null ? [s(path)] : [s(path), i(col)]
				const cmd = action.options.start && col !== null ? 'importAndStart' : 'import'
				if (action.options.start && col === null)
					instance.log('warn', 'Import and start needs a column index, imported only')
				send(`/${t}/${cmd}`, args)
			},
		},
		[ActionId.LAYER_CLEAR_MEDIA]: {
			name: 'Import / Clear Media',
			description: 'Remove all media of a layer, or only the one at a column',
			options: [...targetFields(LAYER_TARGET_CHOICES), textValue('column', 'Column index (empty = all media)', '')],
			callback: async (action, ctx) => {
				const t = await target(action, ctx)
				if (t === null) return
				const col = await parseNumber(ctx, action.options.column)
				send(`/${t}/import`, col === null ? [s('')] : [s(''), i(col)])
			},
		},

		/* ---------------- Raw ---------------- */
		[ActionId.CUSTOM_OSC]: {
			name: 'Send Custom OSC Command',
			description: 'Send any OSC command to Millumin (e.g. for the Interactions panel)',
			options: [options.oscPath, options.oscArgs] as SomeCompanionActionInputField[],
			callback: async (action, ctx) => {
				const path = await parseText(ctx, action.options.oscPath)
				const args = parseArgList(await parseText(ctx, action.options.oscArgs), (m) => instance.log('warn', m))
				send(path, args)
			},
		},
	}

	return actions
}
