import { InstanceBase, runEntrypoint, SomeCompanionConfigField } from '@companion-module/base'
import { getConfigFields, MilluminConfig } from './config'
import { getActions } from './actions'
import { FeedbackId, getFeedbacks } from './feedback'
import { GetPresetList } from './presets'
import { initVariables, updateVariables } from './variables'
import { OSC, OSCResponse } from './osc'
import { UpgradeV2ToV3, UpgradeV4ToV5 } from './upgrades'
import { InstanceBaseExt, sanitizeId } from './utils'
import { ChangeKind, MilluminState } from './state'

/** Max refresh rate of variables / feedbacks (Millumin may send time feedback at frame rate) */
const REFRESH_INTERVAL_MS = 50

class MilluminInstance extends InstanceBase<MilluminConfig> implements InstanceBaseExt<MilluminConfig> {
	public config: MilluminConfig = {
		label: '',
		host: '',
		tx_port: 0,
		rx_port: 0,
		timeLayerName: '',
		trackMultipleLayers: false,
		pingOnConnect: true,
		autoVariables: true,
		presetColumns: 16,
	}

	public OSC: OSC | null = null
	public state = new MilluminState()

	private pendingChanges = new Set<ChangeKind>()
	private refreshTimer: NodeJS.Timeout | null = null
	private aliveTimer: NodeJS.Timeout | null = null
	private lastAliveState = false

	constructor(internal: unknown) {
		super(internal)
		this.instanceOptions.disableVariableValidation = true
	}

	public async configUpdated(config: MilluminConfig): Promise<void> {
		this.config = config
		this.log('info', 'Applying Millumin configuration')
		if (this.OSC) this.OSC.destroy()
		this.state.reset()
		this.OSC = new OSC(this, () => this.onConnected())
		this.updateInstance()
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return getConfigFields()
	}

	public async init(config: MilluminConfig): Promise<void> {
		this.log('info', `Welcome, Millumin module is being initialized`)
		this.aliveTimer = setInterval(() => this.aliveTick(), 1000)
		await this.configUpdated(config)
	}

	async destroy(): Promise<void> {
		this.log('debug', `Instance destroyed: ${this.id}`)
		if (this.refreshTimer) clearTimeout(this.refreshTimer)
		if (this.aliveTimer) clearInterval(this.aliveTimer)
		this.OSC?.destroy()
		this.OSC = null
	}

	public trackedLayers(): { id: string; label: string; target: string }[] {
		const list = [{ id: 'firstByIndex', label: 'index:1', target: 'index:1' }]
		const raw = (this.config.timeLayerName ?? '').trim()
		if (raw !== '') {
			const names = this.config.trackMultipleLayers ? raw.split(',') : [raw]
			for (const n of names) {
				const name = n.trim()
				if (name === '') continue
				const target =
					/^(layer|light|index):/i.test(name) || /^selected(layer|light)$/i.test(name) ? name : `layer:${name}`
				const id = sanitizeId(name)
				if (!list.some((l) => l.id === id)) list.push({ id, label: name, target })
			}
		}
		return list
	}

	public updateInstance(): void {
		initVariables(this, true)
		updateVariables(this)
		this.setActionDefinitions(getActions(this))
		this.setFeedbackDefinitions(getFeedbacks(this))
		this.setPresetDefinitions(GetPresetList(this))
		this.checkFeedbacks()
	}

	public initVariables(): void {
		initVariables(this)
	}

	public updateVariablesValues(): void {
		updateVariables(this)
	}

	private onConnected(): void {
		if (this.config.pingOnConnect !== false) this.OSC?.sendCommand('/ping', [])
	}

	public receiveOSCResponse(data: OSCResponse): void {
		const result = this.state.handle(data)
		if (!result.handled) return
		for (const c of result.changes) this.pendingChanges.add(c)
		if (!this.lastAliveState) {
			this.lastAliveState = true
			this.checkFeedbacks(FeedbackId.FEEDBACK_ALIVE)
		}
		this.scheduleRefresh()
	}

	private scheduleRefresh(): void {
		if (this.refreshTimer) return
		this.refreshTimer = setTimeout(() => {
			this.refreshTimer = null
			this.flush()
		}, REFRESH_INTERVAL_MS)
	}

	private flush(): void {
		const changes = this.pendingChanges
		this.pendingChanges = new Set()
		if (changes.has('newElement') || changes.has('selection')) initVariables(this)
		updateVariables(this)

		const ids: FeedbackId[] = []
		if (changes.has('board')) ids.push(FeedbackId.COLUMN_LAUNCHED)
		if (changes.has('media')) ids.push(FeedbackId.PROGRESS_BAR, FeedbackId.MEDIA_STATUS, FeedbackId.REMAINING_TIME)
		if (changes.has('selection') || changes.has('newElement')) ids.push(FeedbackId.ELEMENT_SELECTED)
		if (changes.has('selection')) ids.push(FeedbackId.MEDIA_STATUS, FeedbackId.PROGRESS_BAR)
		if (changes.has('element') || changes.has('media') || changes.has('selection'))
			ids.push(FeedbackId.PROPERTY_COMPARE)
		if (ids.length > 0) this.checkFeedbacks(...new Set(ids))
	}

	private aliveTick(): void {
		const last = this.state.lastMessageTime
		this.setVariableValues({ lastFeedbackAge: last ? Math.round((Date.now() - last) / 1000) : -1 })
		this.checkFeedbacks(FeedbackId.FEEDBACK_ALIVE)
		this.lastAliveState = last > 0 && Date.now() - last < 1000
	}
}

runEntrypoint(MilluminInstance, [UpgradeV2ToV3, UpgradeV4ToV5])
