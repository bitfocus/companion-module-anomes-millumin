import {
	CompanionButtonPresetDefinition,
	CompanionOptionValues,
	CompanionPresetDefinitions,
	CompanionPresetFeedback,
} from '@companion-module/base'
import { ActionId } from './actions'
import { MilluminConfig } from './config'
import { Colors, FeedbackId } from './feedback'
import { InstanceBaseExt } from './utils'

interface PresetAction {
	actionId: ActionId
	options: CompanionOptionValues
	delay?: number
}

interface PresetFeedback extends CompanionPresetFeedback {
	feedbackId: FeedbackId
}

interface ButtonOptions {
	bgcolor?: number
	color?: number
	size?: CompanionButtonPresetDefinition['style']['size']
	feedbacks?: PresetFeedback[]
	up?: PresetAction[]
}

const SELECTED_LAYER = { targetType: 'selectedLayer', targetName: '', targetIndex: '1' }
const SELECTED_LIGHT = { targetType: 'selectedLight', targetName: '', targetIndex: '1' }

function button(
	category: string,
	name: string,
	text: string,
	down: PresetAction[],
	opts: ButtonOptions = {},
): CompanionButtonPresetDefinition {
	return {
		type: 'button',
		category,
		name,
		style: {
			text,
			size: opts.size ?? '14',
			color: opts.color ?? Colors.white,
			bgcolor: opts.bgcolor ?? Colors.black,
		},
		feedbacks: opts.feedbacks ?? [],
		steps: [{ down, up: opts.up ?? [] }],
	}
}

export function GetPresetList(instance: InstanceBaseExt<MilluminConfig>): CompanionPresetDefinitions {
	const presets: CompanionPresetDefinitions = {}
	const label = instance.label
	const v = (id: string): string => `$(${label}:${id})`
	const add = (id: string, p: CompanionButtonPresetDefinition): void => {
		presets[id] = p
	}

	/* ---------------- Columns ---------------- */
	const cat = 'Columns'
	const columns = Math.max(1, Math.min(128, Number(instance.config.presetColumns) || 16))
	for (let c = 1; c <= columns; c++) {
		add(
			`column_launch_${c}`,
			button(
				cat,
				`Launch column ${c}`,
				`COL\\n${c}`,
				[{ actionId: ActionId.LAUNCH_COLUMN_BY_INDEX, options: { index: c } }],
				{
					size: '18',
					bgcolor: Colors.grey,
					feedbacks: [
						{
							feedbackId: FeedbackId.COLUMN_LAUNCHED,
							options: { by: 'index', index: String(c), name: '' },
							style: { bgcolor: Colors.green, color: Colors.black },
						},
					],
				},
			),
		)
	}
	for (let c = 1; c <= columns; c++) {
		add(
			`column_toggle_${c}`,
			button(
				'Columns (launch/stop)',
				`Launch or stop column ${c}`,
				`TOGGLE\\nCOL ${c}`,
				[{ actionId: ActionId.LAUNCH_OR_STOP_COLUMN_BY_INDEX, options: { index: c } }],
				{
					bgcolor: Colors.grey,
					feedbacks: [
						{
							feedbackId: FeedbackId.COLUMN_LAUNCHED,
							options: { by: 'index', index: String(c), name: '' },
							style: { bgcolor: Colors.green, color: Colors.black },
						},
					],
				},
			),
		)
	}
	add(
		'column_previous',
		button(
			cat,
			'Launch previous column',
			`◀ PREV\\n${v('previousColumnName')}`,
			[{ actionId: ActionId.LAUNCH_PREVIOUS_COLUMN, options: {} }],
			{ size: 'auto', bgcolor: Colors.darkBlue },
		),
	)
	add(
		'column_next',
		button(
			cat,
			'Launch next column',
			`NEXT ▶\\n${v('nextColumnName')}`,
			[{ actionId: ActionId.LAUNCH_NEXT_COLUMN, options: {} }],
			{ size: 'auto', bgcolor: Colors.blue },
		),
	)
	add(
		'column_stop',
		button(cat, 'Stop column', 'STOP\\nCOLUMN', [{ actionId: ActionId.STOP_COLUMN, options: {} }], {
			bgcolor: Colors.darkRed,
		}),
	)
	add(
		'column_current',
		button(cat, 'Current column (display)', `NOW\\n${v('currentColumnIndex')}\\n${v('currentColumnName')}`, [], {
			size: 'auto',
			bgcolor: Colors.black,
			color: Colors.green,
		}),
	)

	/* ---------------- Transport ---------------- */
	const tr = 'Transport'
	add(
		'transport_play',
		button(tr, 'Play', '▶\\nPLAY', [{ actionId: ActionId.PLAY, options: {} }], { bgcolor: Colors.darkGreen }),
	)
	add(
		'transport_pause',
		button(tr, 'Pause', '❚❚\\nPAUSE', [{ actionId: ActionId.PAUSE, options: {} }], { bgcolor: Colors.grey }),
	)
	add(
		'transport_playpause',
		button(tr, 'Play or pause', '▶ / ❚❚', [{ actionId: ActionId.PLAY_OR_PAUSE, options: {} }], { size: '18' }),
	)
	add(
		'transport_start',
		button(tr, 'Go to start', '⏮\\nSTART', [{ actionId: ActionId.GO_TO_TIME, options: { time: 0 } }]),
	)
	add(
		'transport_end10',
		button(tr, 'Go to 10 s before end', 'END\\n-10s', [{ actionId: ActionId.GO_TO_TIME, options: { time: -10 } }]),
	)
	for (const offset of [-30, -10, -5, 5, 10, 30]) {
		add(
			`transport_jog_${offset < 0 ? 'm' : 'p'}${Math.abs(offset)}`,
			button(tr, `Jog ${offset > 0 ? '+' : ''}${offset} s`, `JOG\\n${offset > 0 ? '+' : ''}${offset}s`, [
				{ actionId: ActionId.JOG_TIME, options: { time: offset, reference: 'index:1' } },
			]),
		)
	}
	add(
		'transport_segment',
		button(
			tr,
			'Go to timeline segment',
			'SEGMENT\\n(name)',
			[{ actionId: ActionId.GO_TO_TIMELINE_SEGMENT, options: { name: 'Segment' } }],
			{ bgcolor: Colors.purple },
		),
	)

	/* ---------------- Selected layer - media ---------------- */
	const sm = 'Selected layer: media'
	const playingFb = (target: CompanionOptionValues): PresetFeedback[] => [
		{
			feedbackId: FeedbackId.MEDIA_STATUS,
			options: { ...target, status: 'playing', media: '' },
			style: { bgcolor: Colors.green, color: Colors.black },
		},
		{
			feedbackId: FeedbackId.MEDIA_STATUS,
			options: { ...target, status: 'paused', media: '' },
			style: { bgcolor: Colors.orange, color: Colors.black },
		},
	]
	add(
		'sel_media_restart',
		button(
			sm,
			'Restart media',
			'⏮ RESTART\\nMEDIA',
			[{ actionId: ActionId.LAYER_START_MEDIA, options: { ...SELECTED_LAYER, startMode: 'restart' } }],
			{ feedbacks: playingFb(SELECTED_LAYER) },
		),
	)
	add(
		'sel_media_toggle',
		button(
			sm,
			'Start or pause media',
			`▶ / ❚❚\\n${v('selectedLayer_media_name')}`,
			[{ actionId: ActionId.LAYER_START_OR_PAUSE_MEDIA, options: { ...SELECTED_LAYER } }],
			{ size: 'auto', feedbacks: playingFb(SELECTED_LAYER) },
		),
	)
	add(
		'sel_media_pause',
		button(
			sm,
			'Pause media',
			'❚❚\\nPAUSE MEDIA',
			[{ actionId: ActionId.LAYER_PAUSE_MEDIA, options: { ...SELECTED_LAYER } }],
			{
				feedbacks: [
					{
						feedbackId: FeedbackId.MEDIA_STATUS,
						options: { ...SELECTED_LAYER, status: 'paused', media: '' },
						style: { bgcolor: Colors.orange, color: Colors.black },
					},
				],
			},
		),
	)
	add(
		'sel_media_stop',
		button(
			sm,
			'Stop media',
			'■\\nSTOP MEDIA',
			[{ actionId: ActionId.LAYER_STOP_MEDIA, options: { ...SELECTED_LAYER } }],
			{
				bgcolor: Colors.darkRed,
			},
		),
	)
	for (let c = 1; c <= Math.min(columns, 8); c++) {
		add(
			`sel_media_start_col_${c}`,
			button(
				sm,
				`Start media at column ${c}`,
				`MEDIA\\nCOL ${c}`,
				[
					{
						actionId: ActionId.LAYER_START_MEDIA,
						options: { ...SELECTED_LAYER, startMode: 'index', index: c, name: '' },
					},
				],
				{
					feedbacks: [
						{
							feedbackId: FeedbackId.MEDIA_STATUS,
							options: { ...SELECTED_LAYER, status: 'active', media: String(c) },
							style: { bgcolor: Colors.green, color: Colors.black },
						},
					],
				},
			),
		)
	}
	for (const speed of [0.5, 1, 2]) {
		add(
			`sel_media_speed_${speed * 100}`,
			button(
				sm,
				`Speed ${speed * 100}%`,
				`SPEED\\n${speed * 100}%`,
				[{ actionId: ActionId.MEDIA_SPEED, options: { ...SELECTED_LAYER, mode: 'set', value: String(speed) } }],
				{
					feedbacks: [
						{
							feedbackId: FeedbackId.PROPERTY_COMPARE,
							options: { ...SELECTED_LAYER, property: 'media/speed', operator: 'eq', value: String(speed) },
							style: { bgcolor: Colors.blue, color: Colors.white },
						},
					],
				},
			),
		)
	}
	for (const offset of [-10, 10]) {
		add(
			`sel_media_jog_${offset < 0 ? 'm' : 'p'}${Math.abs(offset)}`,
			button(sm, `Media jog ${offset > 0 ? '+' : ''}${offset} s`, `MEDIA\\n${offset > 0 ? '+' : ''}${offset}s`, [
				{ actionId: ActionId.MEDIA_JOG, options: { ...SELECTED_LAYER, offset: String(offset) } },
			]),
		)
	}
	add(
		'sel_media_middle',
		button(sm, 'Go to middle of media', 'MEDIA\\n50%', [
			{ actionId: ActionId.MEDIA_NORMALIZED_TIME, options: { ...SELECTED_LAYER, value: '0.5' } },
		]),
	)
	add(
		'sel_media_timer',
		button(
			sm,
			'Selected layer timer',
			`${v('selectedLayer_media_name')}\\n-${v('selectedLayer_media_remaining_MMSS')}`,
			[{ actionId: ActionId.LAYER_START_OR_PAUSE_MEDIA, options: { ...SELECTED_LAYER } }],
			{
				size: 'auto',
				feedbacks: [
					{
						feedbackId: FeedbackId.REMAINING_TIME,
						options: { ...SELECTED_LAYER, seconds: 10, onlyPlaying: true },
						style: { bgcolor: Colors.red, color: Colors.white },
					},
					{
						feedbackId: FeedbackId.PROGRESS_BAR,
						options: {
							layer: 'selectedLayer',
							hideWhenNotRunning: true,
							expiringInSeconds: 10,
							runningColor: Colors.green,
							expiringColor: Colors.yellow,
						},
					},
				],
			},
		),
	)

	/* ---------------- Selected layer - properties ---------------- */
	const sp = 'Selected layer: properties'
	const prop = (id: string, name: string, text: string, actionId: ActionId, options: CompanionOptionValues): void =>
		add(
			id,
			button(sp, name, text, [{ actionId, options: { ...SELECTED_LAYER, ...options } }], { bgcolor: Colors.darkBlue }),
		)

	prop('sel_opacity_0', 'Opacity 0%', 'OPACITY\\n0%', ActionId.ELEMENT_OPACITY, { mode: 'set', value: '0' })
	prop('sel_opacity_50', 'Opacity 50%', 'OPACITY\\n50%', ActionId.ELEMENT_OPACITY, { mode: 'set', value: '0.5' })
	prop('sel_opacity_100', 'Opacity 100%', 'OPACITY\\n100%', ActionId.ELEMENT_OPACITY, { mode: 'set', value: '1' })
	prop('sel_opacity_down', 'Opacity -10%', 'OPACITY\\n-10%', ActionId.ELEMENT_OPACITY, { mode: '-', value: '0.1' })
	prop('sel_opacity_up', 'Opacity +10%', 'OPACITY\\n+10%', ActionId.ELEMENT_OPACITY, { mode: '+', value: '0.1' })
	add(
		'sel_opacity_display',
		button(sp, 'Opacity (display)', `OPACITY\\n${v('selectedLayer_opacity')}`, [], { size: 'auto' }),
	)
	prop('sel_scale_down', 'Scale -10%', 'SCALE\\n-10%', ActionId.ELEMENT_SCALE, { mode: '-', value: '0.1' })
	prop('sel_scale_up', 'Scale +10%', 'SCALE\\n+10%', ActionId.ELEMENT_SCALE, { mode: '+', value: '0.1' })
	prop('sel_scale_reset', 'Scale 100%', 'SCALE\\n100%', ActionId.ELEMENT_SCALE, { mode: 'set', value: '1' })
	prop('sel_rot_ccw', 'Rotation -15°', 'ROTATE\\n-15°', ActionId.ELEMENT_ROTATION, { mode: '-', value: '15' })
	prop('sel_rot_cw', 'Rotation +15°', 'ROTATE\\n+15°', ActionId.ELEMENT_ROTATION, { mode: '+', value: '15' })
	prop('sel_rot_reset', 'Rotation 0°', 'ROTATE\\n0°', ActionId.ELEMENT_ROTATION, { mode: 'set', value: '0' })
	prop('sel_pos_left', 'Move left 10 px', '◀\\n10 px', ActionId.ELEMENT_POSITION, {
		axis: 'x',
		mode: '-',
		x: '10',
		y: '0',
	})
	prop('sel_pos_right', 'Move right 10 px', '▶\\n10 px', ActionId.ELEMENT_POSITION, {
		axis: 'x',
		mode: '+',
		x: '10',
		y: '0',
	})
	prop('sel_pos_up', 'Move up 10 px', '▲\\n10 px', ActionId.ELEMENT_POSITION, { axis: 'y', mode: '-', x: '0', y: '10' })
	prop('sel_pos_down', 'Move down 10 px', '▼\\n10 px', ActionId.ELEMENT_POSITION, {
		axis: 'y',
		mode: '+',
		x: '0',
		y: '10',
	})
	prop('sel_pos_center', 'Position 0,0', 'POSITION\\n0,0', ActionId.ELEMENT_POSITION, {
		axis: 'xy',
		mode: 'set',
		x: '0',
		y: '0',
	})

	/* ---------------- Layer selection ---------------- */
	const ls = 'Layer selection'
	for (let n = 1; n <= 8; n++) {
		add(
			`select_layer_${n}`,
			button(
				ls,
				`Select layer index ${n}`,
				`SELECT\\nLAYER ${n}`,
				[{ actionId: ActionId.SELECT_LAYER_BY_INDEX, options: { index: n } }],
				{
					bgcolor: Colors.grey,
					feedbacks: [
						{
							feedbackId: FeedbackId.ELEMENT_SELECTED,
							options: { targetType: 'index', targetName: '', targetIndex: String(n) },
							style: { bgcolor: Colors.milluminOrange, color: Colors.black },
						},
					],
				},
			),
		)
	}
	add(
		'selected_layer_display',
		button(ls, 'Selected layer (display)', `SELECTED\\n${v('selectedLayer')}`, [], {
			size: 'auto',
			color: Colors.milluminOrange,
		}),
	)

	/* ---------------- Lights ---------------- */
	const li = 'Lights'
	for (const level of [0, 64, 127, 191, 255]) {
		add(
			`light_intensity_${level}`,
			button(
				li,
				`Selected light ${Math.round((level / 255) * 100)}%`,
				`LIGHT\\n${Math.round((level / 255) * 100)}%`,
				[{ actionId: ActionId.LIGHT_INTENSITY, options: { ...SELECTED_LIGHT, mode: 'set', value: String(level) } }],
				{ bgcolor: Colors.purple },
			),
		)
	}
	add(
		'light_intensity_down',
		button(
			li,
			'Selected light -10',
			'LIGHT\\n-10',
			[{ actionId: ActionId.LIGHT_INTENSITY, options: { ...SELECTED_LIGHT, mode: '-', value: '10' } }],
			{ bgcolor: Colors.purple },
		),
	)
	add(
		'light_intensity_up',
		button(
			li,
			'Selected light +10',
			'LIGHT\\n+10',
			[{ actionId: ActionId.LIGHT_INTENSITY, options: { ...SELECTED_LIGHT, mode: '+', value: '10' } }],
			{ bgcolor: Colors.purple },
		),
	)
	for (let n = 1; n <= 4; n++) {
		add(
			`select_light_${n}`,
			button(
				li,
				`Select light index ${n}`,
				`SELECT\\nLIGHT ${n}`,
				[{ actionId: ActionId.SELECT_LIGHT_BY_INDEX, options: { index: n } }],
				{ bgcolor: Colors.grey },
			),
		)
	}

	/* ---------------- Masters ---------------- */
	const ma = 'Masters'
	const masters: [ActionId, string][] = [
		[ActionId.SET_MASTER_VIDEO, 'VIDEO'],
		[ActionId.SET_MASTER_AUDIO, 'AUDIO'],
		[ActionId.SET_MASTER_DMX, 'DMX'],
	]
	for (const [actionId, name] of masters) {
		for (const level of [0, 0.5, 1]) {
			add(
				`master_${name.toLowerCase()}_${level * 100}`,
				button(
					ma,
					`Master ${name.toLowerCase()} ${level * 100}%`,
					`${name}\\n${level * 100}%`,
					[{ actionId, options: { value: level } }],
					{ bgcolor: level === 0 ? Colors.darkRed : Colors.grey },
				),
			)
		}
	}

	/* ---------------- Display ---------------- */
	const di = 'Display'
	const simple = (
		id: string,
		cat2: string,
		name: string,
		text: string,
		actionId: ActionId,
		bgcolor = Colors.grey,
	): void => add(id, button(cat2, name, text, [{ actionId, options: {} }], { bgcolor }))
	simple(
		'display_fullscreen_on',
		di,
		'Enter fullscreen',
		'FULL\\nSCREEN\\nON',
		ActionId.ENTER_FULLSCREEN,
		Colors.darkGreen,
	)
	simple('display_fullscreen_off', di, 'Exit fullscreen', 'FULL\\nSCREEN\\nOFF', ActionId.EXIT_FULLSCREEN)
	simple('display_testcard_on', di, 'Show test card', 'TEST\\nCARD\\nON', ActionId.DISPLAY_TEST_CARD, Colors.orange)
	simple('display_testcard_off', di, 'Hide test card', 'TEST\\nCARD\\nOFF', ActionId.HIDE_TEST_CARD)
	simple(
		'display_workspace_on',
		di,
		'Enable workspace',
		'WORK\\nSPACE\\nON',
		ActionId.ENABLE_WORKSPACE,
		Colors.darkGreen,
	)
	simple(
		'display_workspace_off',
		di,
		'Disable workspace',
		'WORK\\nSPACE\\nOFF',
		ActionId.DISABLE_WORKSPACE,
		Colors.darkRed,
	)

	/* ---------------- Project & connection ---------------- */
	const pr = 'Project & connection'
	simple('project_save', pr, 'Save project', 'SAVE\\nPROJECT', ActionId.SAVE_PROJECT, Colors.darkBlue)
	add(
		'project_ping',
		button(pr, 'Ping / feedback status', 'MILLUMIN\\nPING', [{ actionId: ActionId.PING, options: {} }], {
			bgcolor: Colors.darkRed,
			feedbacks: [
				{
					feedbackId: FeedbackId.FEEDBACK_ALIVE,
					options: { seconds: 10 },
					style: { bgcolor: Colors.darkGreen, color: Colors.white },
				},
			],
		}),
	)

	/* ---------------- Timers (tracked layers) ---------------- */
	const ti = 'Timers'
	for (const layer of instance.trackedLayers()) {
		const prefix = `media_${layer.id}`
		const progress = {
			feedbackId: FeedbackId.PROGRESS_BAR,
			options: {
				layer: layer.id,
				hideWhenNotRunning: true,
				expiringInSeconds: 15,
				runningColor: Colors.green,
				expiringColor: Colors.yellow,
			},
		}
		const tgt = layer.target.toLowerCase().startsWith('index:')
			? { targetType: 'index', targetName: '', targetIndex: layer.target.substring(6) }
			: layer.target.toLowerCase().startsWith('layer:')
				? { targetType: 'layer', targetName: layer.target.substring(6), targetIndex: '1' }
				: { targetType: 'selectedLayer', targetName: '', targetIndex: '1' }
		const expiring: PresetFeedback = {
			feedbackId: FeedbackId.REMAINING_TIME,
			options: { ...tgt, seconds: 15, onlyPlaying: true },
			style: { bgcolor: Colors.darkRed },
		}
		add(
			`timer_${layer.id}_remaining`,
			button(ti, `${layer.label}: remaining time`, `${layer.label}\\n-${v(`${prefix}_remainingTime_HHMMSS`)}`, [], {
				size: 'auto',
				feedbacks: [expiring, progress],
			}),
		)
		add(
			`timer_${layer.id}_elapsed`,
			button(ti, `${layer.label}: elapsed time`, `${layer.label}\\n${v(`${prefix}_elapsedTime_HHMMSS`)}`, [], {
				size: 'auto',
				feedbacks: [progress],
			}),
		)
		add(
			`timer_${layer.id}_media`,
			button(
				ti,
				`${layer.label}: media name & progress`,
				`${v(`${prefix}_name`)}\\n${v(`${prefix}_progressPercent`)}%`,
				[{ actionId: ActionId.LAYER_START_OR_PAUSE_MEDIA, options: { ...tgt } }],
				{ size: 'auto', feedbacks: [...playingFb(tgt), progress] },
			),
		)
	}

	return presets
}
