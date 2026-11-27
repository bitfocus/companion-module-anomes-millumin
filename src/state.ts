import type { OSCResponse } from './osc'
import { targetKey } from './utils'

export type MediaStatus = 'playing' | 'paused' | 'stopped'
export type ElementKind = 'layer' | 'light' | 'index' | 'selectedLayer' | 'selectedLight' | 'element'

export interface MediaInfo {
	status: MediaStatus
	/** Column index of the media (as sent by Millumin) */
	index: number
	name: string
	duration: number
	time: number
	normalizedTime: number
	speed: number
	/** Date.now() of the last time the playhead moved (used to infer playing / paused) */
	lastTimeChange: number
	/** Number of playhead moves seen since the media started (0 = Millumin does not stream the time of this layer) */
	timeUpdates: number
	/** Until this time, the playhead does not override a status set by a command */
	statusLockUntil: number
}

export interface ElementState {
	/** lower case key, e.g. "layer:video" */
	key: string
	/** target as sent by Millumin, e.g. "layer:Video" */
	target: string
	kind: ElementKind
	/** name part, e.g. "Video" (or "3" for index:3) */
	name: string
	selected: boolean
	/** properties keyed by lower case path ("opacity", "x", "mapping/topleft/x", "effect1/red"...) */
	props: Record<string, Array<number | string>>
	media: MediaInfo
	lastUpdate: number
}

export type ChangeKind = 'board' | 'selection' | 'element' | 'media' | 'newElement'

export interface ParseResult {
	handled: boolean
	changes: Set<ChangeKind>
	/** keys of the elements that changed */
	elements: Set<string>
}

function emptyMedia(): MediaInfo {
	return {
		status: 'stopped',
		index: 0,
		name: '',
		duration: 0,
		time: 0,
		normalizedTime: 0,
		speed: 1,
		lastTimeChange: 0,
		timeUpdates: 0,
		statusLockUntil: 0,
	}
}

function argValue(args: OSCResponse['args'], idx: number): any {
	return args && args.length > idx ? args[idx].value : undefined
}

function num(v: any, fallback = 0): number {
	const n = typeof v === 'number' ? v : Number(v)
	return isNaN(n) ? fallback : n
}

function isTruthy(v: any): boolean {
	if (v === undefined) return true // "/millumin/layer:x/selected" without argument = selected
	if (typeof v === 'string') return v !== '0' && v.toLowerCase() !== 'false' && v !== ''
	return !!v
}

export class MilluminState {
	public elements = new Map<string, ElementState>()

	// Board / columns
	public currentColumnIndex = 0
	public currentColumnName = ''
	public previousColumnName = ''
	public nextColumnName = ''
	public lastStoppedColumnIndex = 0
	public lastStoppedColumnName = ''
	public launchedColumns = new Map<number, string>()

	// Selection
	public selectedLayer = ''
	public selectedLight = ''
	public selectedIndex = 0
	/** Index of the selected layer, when known (from a select action or index feedback) */
	public selectedLayerIndex = 0

	/** Same layer known under two targets (e.g. "layer:video" <-> "index:2"), learnt from selection feedback */
	public aliases = new Map<string, string>()
	private pendingSelectedQuery = { path: '', time: 0 }
	private lastLayerSelection = { key: '', time: 0 }
	private lastIndexSelection = { key: '', time: 0 }

	// Connection
	public lastMessageTime = 0
	public messageCount = 0

	public reset(): void {
		this.elements.clear()
		this.aliases.clear()
		this.currentColumnIndex = 0
		this.currentColumnName = ''
		this.previousColumnName = ''
		this.nextColumnName = ''
		this.lastStoppedColumnIndex = 0
		this.lastStoppedColumnName = ''
		this.launchedColumns.clear()
		this.selectedLayer = ''
		this.selectedLight = ''
		this.selectedIndex = 0
		this.selectedLayerIndex = 0
		this.lastMessageTime = 0
		this.messageCount = 0
	}

	/* ------------------------------------------------------------------ */
	/* Lookup                                                              */
	/* ------------------------------------------------------------------ */

	/**
	 * Find an element from a target string ("selectedLayer", "layer:Video", "index:3", "Video").
	 * A plain name is looked up as layer, then light, then element.
	 */
	public getElement(target: string): ElementState | undefined {
		const key = targetKey(target)
		if (key === '') return undefined
		if (key === 'selectedlayer') {
			const el =
				(this.selectedLayer ? this.elements.get(`layer:${this.selectedLayer.toLowerCase()}`) : undefined) ??
				(this.selectedLayerIndex ? this.elements.get(`index:${this.selectedLayerIndex}`) : undefined)
			if (el) return el
		}
		if (key === 'selectedlight' && this.selectedLight) {
			const el = this.elements.get(`light:${this.selectedLight.toLowerCase()}`)
			if (el) return el
		}
		const direct = this.elements.get(key)
		if (direct) return direct
		if (!key.includes(':')) return this.elements.get(`layer:${key}`) ?? this.elements.get(`light:${key}`)
		return undefined
	}

	/** Get a numeric/string property. Accepts aliases (position/x → x...). */
	public getProperty(el: ElementState | undefined, property: string): number | string | undefined {
		if (!el) return undefined
		const p = property
			.trim()
			.toLowerCase()
			.replace(/^\/+|\/+$/g, '')
		switch (p) {
			case 'media/time':
			case 'time':
				return el.media.time
			case 'media/duration':
			case 'duration':
				return el.media.duration
			case 'media/remaining':
			case 'remaining':
				return el.media.duration > 0 ? Math.max(0, el.media.duration - el.media.time) : 0
			case 'media/normalizedtime':
			case 'normalizedtime':
			case 'progress':
				return el.media.duration > 0 ? el.media.time / el.media.duration : el.media.normalizedTime
			case 'media/speed':
			case 'speed':
				return el.media.speed
			case 'media/index':
				return el.media.index
			case 'media/name':
				return el.media.name
			case 'selected':
				return el.selected ? 1 : 0
		}
		const alias = p.replace(/^position\//, '')
		const values = el.props[p] ?? el.props[alias]
		if (!values || values.length === 0) return undefined
		return values[0]
	}

	public launchedColumnList(): string {
		return [...this.launchedColumns.keys()].sort((a, b) => a - b).join(',')
	}

	/* ------------------------------------------------------------------ */
	/* Parsing                                                             */
	/* ------------------------------------------------------------------ */

	public handle(msg: OSCResponse): ParseResult {
		const result: ParseResult = { handled: false, changes: new Set(), elements: new Set() }
		const address = (msg.address || '').toString()
		const args = msg.args || []

		this.lastMessageTime = Date.now()
		this.messageCount++

		let rest = address.replace(/^\/+/, '')
		if (rest.toLowerCase().startsWith('millumin/')) rest = rest.substring('millumin/'.length)
		else if (rest.toLowerCase() === 'millumin') return result

		const parts = rest.split('/').filter((p) => p !== '')
		if (parts.length === 0) return result
		const head = parts[0].toLowerCase()

		// Legacy /millumin/info message: for board/launchedColumn Millumin also sends the previous (arg 2) and next (arg 4) column names (same parsing as module 4.x)
		if (head === 'info' && parts.length === 1) {
			const first = argValue(args, 0)
			if (typeof first === 'string' && first.toLowerCase() === 'board/launchedcolumn' && args.length >= 6) {
				this.previousColumnName = String(argValue(args, 2) ?? '')
				this.nextColumnName = String(argValue(args, 4) ?? '')
				result.handled = true
				result.changes.add('board')
			}
			return result
		}

		if (head === 'board') {
			this.handleBoard(parts.slice(1).join('/').toLowerCase(), args, result)
			return result
		}

		// Element feedback. "selectedLayer/..." feedback is stored on the real layer when the selection is known.
		let target = parts[0]
		const lowerTarget = target.toLowerCase()
		if (lowerTarget === 'selectedlayer' && this.selectedLayer) target = `layer:${this.selectedLayer}`
		else if (lowerTarget === 'selectedlayer' && this.selectedLayerIndex) target = `index:${this.selectedLayerIndex}`
		else if (lowerTarget === 'selectedlight' && this.selectedLight) target = `light:${this.selectedLight}`
		const path = parts.slice(1).join('/').toLowerCase()
		if (path === '') return result

		const el = this.ensureElement(target, result)
		this.learnSelectionFromAnswer(el, path, result)
		this.applyToElement(el, path, args, result)
		if (path !== 'selected') {
			const aliasKey = this.aliases.get(el.key)
			const alias = aliasKey ? this.elements.get(aliasKey) : undefined
			if (alias) this.applyToElement(alias, path, args, result)
		}
		return result
	}

	private handleBoard(path: string, args: OSCResponse['args'], result: ParseResult): void {
		const index = num(argValue(args, 0))
		const name = argValue(args, 1) !== undefined ? String(argValue(args, 1)) : ''
		if ((path === 'launchedcolumn' || path === 'columnlaunched') && args.length > 0) {
			this.currentColumnIndex = index
			this.currentColumnName = name
			this.launchedColumns.set(index, name)
			result.handled = true
			result.changes.add('board')
		} else if ((path === 'stoppedcolumn' || path === 'columnstopped') && args.length > 0) {
			this.launchedColumns.delete(index)
			this.lastStoppedColumnIndex = index
			this.lastStoppedColumnName = name
			if (this.currentColumnIndex === index) {
				this.currentColumnIndex = 0
				this.currentColumnName = ''
				this.previousColumnName = ''
				this.nextColumnName = ''
			}
			result.handled = true
			result.changes.add('board')
		}
	}

	private ensureElement(target: string, result: ParseResult): ElementState {
		const key = targetKey(target)
		let el = this.elements.get(key)
		if (!el) {
			let kind: ElementKind = 'element'
			let name = target
			const colon = target.indexOf(':')
			if (colon > 0) {
				const prefix = target.substring(0, colon).toLowerCase()
				name = target.substring(colon + 1)
				if (prefix === 'layer') kind = 'layer'
				else if (prefix === 'light') kind = 'light'
				else if (prefix === 'index') kind = 'index'
			} else if (key === 'selectedlayer') kind = 'selectedLayer'
			else if (key === 'selectedlight') kind = 'selectedLight'

			el = { key, target, kind, name, selected: false, props: {}, media: emptyMedia(), lastUpdate: 0 }
			this.elements.set(key, el)
			result.changes.add('newElement')
		}
		return el
	}

	private applyToElement(el: ElementState, path: string, args: OSCResponse['args'], result: ParseResult): void {
		el.lastUpdate = Date.now()
		result.handled = true
		result.elements.add(el.key)
		const m = el.media

		switch (path) {
			case 'mediastarted': {
				m.status = 'playing'
				m.index = num(argValue(args, 0))
				m.name = argValue(args, 1) !== undefined ? String(argValue(args, 1)) : ''
				m.duration = num(argValue(args, 2))
				m.time = 0
				m.normalizedTime = 0
				m.lastTimeChange = Date.now()
				m.timeUpdates = 0
				result.changes.add('media')
				return
			}
			case 'mediapaused': {
				const idx = num(argValue(args, 0))
				const name = argValue(args, 1) !== undefined ? String(argValue(args, 1)) : ''
				if (m.name === '' || name === '' || m.name === name) {
					m.status = 'paused'
					m.index = idx
					if (name) m.name = name
				}
				result.changes.add('media')
				return
			}
			case 'mediastopped': {
				const idx = num(argValue(args, 0))
				const name = argValue(args, 1) !== undefined ? String(argValue(args, 1)) : ''
				// Only reset if the stopped media is the current one (a new media may already have started)
				if (m.name === '' || (m.index === idx && m.name === name) || (name !== '' && m.name === name)) {
					m.status = 'stopped'
					m.time = 0
					m.duration = 0
					m.normalizedTime = 0
				}
				result.changes.add('media')
				return
			}
			case 'media/time': {
				const newTime = num(argValue(args, 0))
				if (Math.abs(newTime - m.time) > 0.001) {
					m.lastTimeChange = Date.now()
					m.timeUpdates++
					// The playhead moves: the media plays (Millumin does not always send mediaStarted, e.g. after an OSC resume)
					if (m.status !== 'playing' && newTime > m.time && Date.now() > m.statusLockUntil) {
						m.status = 'playing'
						result.changes.add('media')
					}
				}
				m.time = newTime
				if (args.length > 1) m.duration = num(argValue(args, 1))
				if (m.duration > 0) m.normalizedTime = m.time / m.duration
				result.changes.add('media')
				return
			}
			case 'media/normalizedtime': {
				m.normalizedTime = num(argValue(args, 0))
				result.changes.add('media')
				return
			}
			case 'media/speed': {
				m.speed = num(argValue(args, 0), 1)
				result.changes.add('media')
				return
			}
			case 'selected': {
				this.applySelection(el, isTruthy(argValue(args, 0)), result)
				return
			}
		}

		// Generic property
		const values = args.map((a) => a.value as number | string)
		el.props[path] = values
		if (path === 'xy' || path === 'position/xy' || path === 'position') {
			if (values.length > 0) el.props['x'] = [values[0]]
			if (values.length > 1) el.props['y'] = [values[1]]
			el.props['xy'] = values
		} else if (path === 'position/x' || path === 'position/y') {
			el.props[path.substring('position/'.length)] = values
		} else if (/^mapping\/(topleft|topright|bottomright|bottomleft)$/.test(path)) {
			if (values.length > 0) el.props[`${path}/x`] = [values[0]]
			if (values.length > 1) el.props[`${path}/y`] = [values[1]]
		}
		result.changes.add('element')
	}

	private applySelection(el: ElementState, selected: boolean, result: ParseResult): void {
		result.changes.add('selection')
		if (selected && (el.kind === 'layer' || el.kind === 'index')) {
			// Millumin sends "layer:Name/selected" and "index:N/selected" together: they are the same layer
			const now = Date.now()
			if (el.kind === 'layer') this.lastLayerSelection = { key: el.key, time: now }
			else this.lastIndexSelection = { key: el.key, time: now }
			const a = this.lastLayerSelection
			const b = this.lastIndexSelection
			if (a.key && b.key && Math.abs(a.time - b.time) < 250) {
				this.linkAliases(a.key, b.key)
				this.selectedLayerIndex = num(b.key.substring('index:'.length))
			}
		}
		if (el.kind === 'layer' || el.kind === 'light' || el.kind === 'index') {
			if (selected) {
				for (const other of this.elements.values()) {
					if (other.kind === el.kind && other !== el) other.selected = false
				}
			}
			el.selected = selected
			if (el.kind === 'layer') {
				if (selected) this.selectedLayer = el.name
				else if (this.selectedLayer.toLowerCase() === el.name.toLowerCase()) this.selectedLayer = ''
			} else if (el.kind === 'light') {
				if (selected) this.selectedLight = el.name
				else if (this.selectedLight.toLowerCase() === el.name.toLowerCase()) this.selectedLight = ''
			} else {
				if (selected) this.selectedIndex = num(el.name)
				else if (this.selectedIndex === num(el.name)) this.selectedIndex = 0
			}
		} else {
			el.selected = selected
		}
	}

	private linkAliases(layerKey: string, indexKey: string): void {
		// Remove stale links (layers can be re-ordered)
		for (const [k, v] of [...this.aliases]) {
			if (k === layerKey || k === indexKey || v === layerKey || v === indexKey) this.aliases.delete(k)
		}
		this.aliases.set(layerKey, indexKey)
		this.aliases.set(indexKey, layerKey)
		const a = this.elements.get(layerKey)
		const b = this.elements.get(indexKey)
		// Copy the most recent state on the other one
		if (a && b) {
			const [src, dst] = a.lastUpdate >= b.lastUpdate ? [a, b] : [b, a]
			dst.media = { ...src.media }
			dst.props = { ...dst.props, ...src.props }
		}
	}

	/** Element + its alias (if any) */
	private withAlias(target: string): ElementState[] {
		const el = this.getElement(target)
		if (!el) return []
		const aliasKey = this.aliases.get(el.key)
		const alias = aliasKey ? this.elements.get(aliasKey) : undefined
		return alias ? [el, alias] : [el]
	}

	/* ------------------------------------------------------------------ */
	/* Local (optimistic) updates                                          */
	/* Millumin does not echo the changes it receives over OSC, so the     */
	/* module updates its own state when it sends a command.               */
	/* ------------------------------------------------------------------ */

	public localMediaCommand(target: string, command: 'start' | 'pause' | 'toggle' | 'stop'): boolean {
		const els = this.withAlias(target)
		const now = Date.now()
		for (const el of els) {
			const m = el.media
			if (command === 'start') {
				m.status = 'playing'
				m.time = 0
				m.normalizedTime = 0
			} else if (command === 'pause') {
				if (m.status === 'playing') m.status = 'paused'
			} else if (command === 'toggle') {
				if (m.status === 'playing') m.status = 'paused'
				else if (m.duration > 0 || m.name !== '') m.status = 'playing'
			} else {
				m.status = 'stopped'
				m.time = 0
				m.duration = 0
				m.normalizedTime = 0
			}
			m.lastTimeChange = now
			m.statusLockUntil = now + 700
		}
		return els.length > 0
	}

	public localMediaSpeed(target: string, mode: string, value: number): boolean {
		const els = this.withAlias(target)
		for (const el of els) {
			const cur = el.media.speed
			el.media.speed = mode === '+' ? cur + value : mode === '-' ? cur - value : value
		}
		return els.length > 0
	}

	/** Absolute property set (relative changes are confirmed with a /? request instead) */
	public localProperty(target: string, path: string, values: Array<number | string>): boolean {
		const els = this.withAlias(target)
		const result: ParseResult = { handled: false, changes: new Set(), elements: new Set() }
		const args = values.map((v) => ({ type: typeof v === 'number' ? 'f' : 's', value: v }))
		for (const el of els) this.applyToElement(el, path.toLowerCase(), args, result)
		return els.length > 0
	}

	/**
	 * Infer "paused" when the playhead of a playing media stopped moving, and "stopped" at the end of a media.
	 * Returns true if something changed.
	 */
	public tick(now = Date.now(), timeoutMs = 1500): boolean {
		let changed = false
		for (const el of this.elements.values()) {
			const m = el.media
			if (m.status !== 'playing' || m.lastTimeChange === 0 || m.timeUpdates < 2) continue
			if (now - m.lastTimeChange < timeoutMs) continue
			if (m.duration > 0 && m.time >= m.duration - 0.05) {
				m.status = 'stopped'
			} else {
				m.status = 'paused'
			}
			changed = true
		}
		return changed
	}

	/** A select action was sent: Millumin sends no feedback if the element was already selected */
	public localSelect(kind: 'layer' | 'light', by: 'index' | 'name', value: string | number): void {
		if (kind === 'layer') {
			if (by === 'index') {
				const n = Math.round(Number(value))
				this.selectedLayerIndex = n
				this.selectedIndex = n
				// Name of that layer, if known through an alias
				const aliasKey = this.aliases.get(`index:${n}`)
				this.selectedLayer = aliasKey ? (this.elements.get(aliasKey)?.name ?? '') : ''
			} else {
				this.selectedLayer = String(value)
				const aliasKey = this.aliases.get(`layer:${String(value).toLowerCase()}`)
				this.selectedLayerIndex = aliasKey ? num(aliasKey.substring('index:'.length)) : 0
			}
			for (const el of this.elements.values()) {
				if (el.kind === 'layer') el.selected = el.name.toLowerCase() === this.selectedLayer.toLowerCase()
				if (el.kind === 'index') el.selected = num(el.name) === this.selectedLayerIndex
			}
		} else {
			if (by === 'name') this.selectedLight = String(value)
			else this.selectedIndex = Math.round(Number(value))
			for (const el of this.elements.values()) {
				if (el.kind === 'light') el.selected = by === 'name' && el.name.toLowerCase() === String(value).toLowerCase()
			}
		}
	}

	/**
	 * The module sent "/selectedLayer/<path>/?". Millumin answers with the real layer name
	 * ("/millumin/layer:Name/<path>"), which tells which layer is selected.
	 */
	public expectSelectedLayerAnswer(path: string): void {
		this.pendingSelectedQuery = { path: path.toLowerCase(), time: Date.now() }
	}

	private learnSelectionFromAnswer(el: ElementState, path: string, result: ParseResult): void {
		const q = this.pendingSelectedQuery
		if (!q.path || el.kind !== 'layer' || path !== q.path || Date.now() - q.time > 1000) return
		this.pendingSelectedQuery = { path: '', time: 0 }
		if (this.selectedLayer.toLowerCase() !== el.name.toLowerCase()) {
			this.selectedLayer = el.name
			result.changes.add('selection')
		}
		for (const other of this.elements.values()) {
			if (other.kind === 'layer') other.selected = other === el
		}
		if (this.selectedLayerIndex) this.linkAliases(el.key, `index:${this.selectedLayerIndex}`)
	}
}
