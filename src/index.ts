import { InstanceBase, SomeCompanionConfigField } from '@companion-module/base'
import { getConfigFields, MilluminConfig } from './config.js'
import { getActions } from './actions.js'
import { FeedbackId, getFeedbacks } from './feedback.js'
import { GetPresetList } from './presets.js'
import { initVariables, updateVariables } from './variables.js'
import { OSC, OSCResponse } from './osc.js'
import { UpgradeV2ToV3 } from './upgrades.js'
import { InstanceBaseExt, MilluminTypes, MediaLayer } from './utils.js'

// API 2.0: export upgrade scripts as named export
export const UpgradeScripts = [UpgradeV2ToV3]

// API 2.0: export default, InstanceBase generic is now MilluminTypes
export default class MilluminInstance extends InstanceBase<MilluminTypes> implements InstanceBaseExt {
	public config: MilluminConfig = {
		label: '',
		host: '',
		tx_port: 0,
		rx_port: 0,
		timeLayerName: '',
		trackMultipleLayers: false,
	}

	public OSC: OSC | null = null
	public currentColumnIndex = 0
	public currentColumnName: string | null = ''
	public previousColumnName: string | null = ''
	public nextColumnName: string | null = ''
	public mediaLayers: { [id: string]: MediaLayer } = {}
	public timeLayerElapsedTime = 0
	public timeLayerDuration = 0
	public timeLayerMediaIndex = 0
	private staleCheckInterval: ReturnType<typeof setInterval> | null = null

	constructor(internal: unknown) {
		super(internal)
		this.instanceOptions.disableVariableValidation = true
	}

	public async configUpdated(config: MilluminConfig): Promise<void> {
		this.config = config
		this.saveConfig(config)
		this.log('info', 'changing config!')
		if (this.OSC) this.OSC.destroy()
		this.OSC = new OSC(this)
		this.updateInstance()
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return getConfigFields()
	}

	public async init(config: MilluminConfig): Promise<void> {
		this.log('info', `Welcome, Millumin module is being initialized`)
		await this.configUpdated(config)

		// Check for stale layers every 500ms — if no /media/time update in 1s, media has stopped
		this.staleCheckInterval = setInterval(() => {
			const now = Date.now()
			let changed = false
			for (const key in this.mediaLayers) {
				const layer = this.mediaLayers[key]
				if (layer.duration > 0 && layer.lastUpdate > 0 && (now - layer.lastUpdate) > 1000) {
					layer.elapsedTime = 0
					layer.duration = 0
					layer.lastUpdate = 0
					changed = true
				}
			}
			if (changed) {
				this.updateVariablesValues()
				this.checkFeedbacks(FeedbackId.PROGRESS_BAR)
			}
		}, 500)
	}

	async destroy() {
		this.log('debug', `Instance destroyed: ${this.id}`)
		if (this.staleCheckInterval) {
			clearInterval(this.staleCheckInterval)
			this.staleCheckInterval = null
		}
		this.OSC?.destroy()
	}

	public updateInstance(): void {
		this.mediaLayers = {
			'firstByIndex': {
				elapsedTime: 0,
				duration: 0,
				mediaIndex: 0,
				lastUpdate: 0,
			}
		}
		if (this.config.timeLayerName !== '') {
			if (this.config.trackMultipleLayers) {
				const names = this.config.timeLayerName.split(',')
				for (const name of names) {
					this.mediaLayers[name] = {
						elapsedTime: 0,
						duration: 0,
						mediaIndex: 0,
						lastUpdate: 0,
					}
				}
			} else {
				this.mediaLayers[this.config.timeLayerName] = {
					elapsedTime: 0,
					duration: 0,
					mediaIndex: 0,
					lastUpdate: 0,
				}
			}
		}
		initVariables(this)
		updateVariables(this)

		this.setActionDefinitions(getActions(this))
		this.setFeedbackDefinitions(getFeedbacks(this))

		// API 2.0: setPresetDefinitions now takes (structure, presets)
		const { structure, presets } = GetPresetList(this)
		this.setPresetDefinitions(structure, presets)
	}

	public initVariables(): void {
		initVariables(this)
	}

	public updateVariablesValues(): void {
		updateVariables(this)
	}

	public receiveOSCResponse(data: OSCResponse): void {
		if (data.address.toString() == '/millumin/board/launchedColumn' && 0 < data.args.length) {
			this.currentColumnIndex = Number(data.args[0].value)
			if (1 < data.args.length) {
				this.currentColumnName = String(data.args[1].value)
			} else {
				this.currentColumnName = ''
			}
			for (const key in this.mediaLayers) {
				this.mediaLayers[key].elapsedTime = 0
			}
			this.updateVariablesValues()
		} else if (data.address.toString() == '/millumin/board/stoppedColumn' && 0 < data.args.length) {
			if (this.currentColumnIndex == Number(data.args[0].value)) {
				this.currentColumnIndex = 0
				this.currentColumnName = ''
				this.previousColumnName = ''
				this.nextColumnName = ''
				this.updateVariablesValues()
			}
		} else if (
			data.address.toString() == '/millumin/info' &&
			6 <= data.args.length &&
			data.args[0].value == 'board/launchedColumn'
		) {
			this.previousColumnName = String(data.args[2].value)
			this.nextColumnName = String(data.args[4].value)
			this.updateVariablesValues()
		} else if (data.address.startsWith('/millumin/index:1/media')) {
			this.updateMediaLayer(data.address, 'firstByIndex', data.args)
		} else if (data.address.startsWith('/millumin/layer')) {
			const addressParts = data.address.split('/')
			const layerName = addressParts[2].split(':', 2)[1]

			if (!this.mediaLayers[layerName]) {
				this.mediaLayers[layerName] = {
					mediaIndex: 0,
					elapsedTime: 0,
					duration: 0,
					lastUpdate: 0,
				}
			}

			this.updateMediaLayer(data.address, layerName, data.args)
		}
	}

	public updateMediaLayer(address: string, layerName: string, args: { type: string, value: string | number | boolean }[]) {
		if (address.endsWith('/media/time')
			&& 2 <= args.length) {
			this.mediaLayers[layerName].elapsedTime = Number(args[0].value)
			this.mediaLayers[layerName].duration = Number(args[1].value)
			this.mediaLayers[layerName].lastUpdate = Date.now()
		} else if (address.endsWith('/mediaStarted')
			&& 1 <= args.length) {
			this.mediaLayers[layerName].mediaIndex = Number(args[1].value)
			if (3 <= args.length) {
				this.mediaLayers[layerName].elapsedTime = 0
				this.mediaLayers[layerName].duration = Number(args[2].value)
			} else {
				this.mediaLayers[layerName].elapsedTime = 0
				this.mediaLayers[layerName].duration = 0
			}
		} else if (address.endsWith('/mediaStopped')) {
			this.mediaLayers[layerName].elapsedTime = 0
			this.mediaLayers[layerName].duration = 0
		}

		this.updateVariablesValues()
		this.checkFeedbacks(FeedbackId.PROGRESS_BAR)
	}
}
