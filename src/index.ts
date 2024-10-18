import { InstanceBase, runEntrypoint, SomeCompanionConfigField } from '@companion-module/base'
import { getConfigFields, MilluminConfig } from './config'
import { getActions } from './actions'
import { getFeedbacks } from './feedback'
import { GetPresetList } from './presets'
import { initVariables, updateVariables } from './variables'
import { OSC, OSCResponse } from './osc'
import { UpgradeV2ToV3 } from './upgrades'
import {InstanceBaseExt, MediaLayer} from "./utils";

class MilluminInstance extends InstanceBase<MilluminConfig> implements InstanceBaseExt<MilluminConfig>{
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
	}

	async destroy() {
		this.log('debug', `Instance destroyed: ${this.id}`)
		this.OSC?.destroy()
	}

	public updateInstance(): void {
		this.mediaLayers = {}
		if (this.config.trackMultipleLayers) {
			const names = this.config.timeLayerName.split(',')
			for (const name of names) {
				this.mediaLayers[name] = {
					timeLayerElapsedTime: 0,
					timeLayerDuration: 0,
					timeLayerMediaIndex: 0,
				}
			}
		} else {
			this.mediaLayers[this.config.timeLayerName] = {
				timeLayerElapsedTime: 0,
				timeLayerDuration: 0,
				timeLayerMediaIndex: 0,
			}
		}
		initVariables(this)
		updateVariables(this)

		this.setActionDefinitions(getActions(this))
		this.setFeedbackDefinitions(getFeedbacks(this))
		this.setPresetDefinitions(GetPresetList())
	}

	public initVariables(): void {
		initVariables(this)
	}

	public updateVariablesValues(): void {
		updateVariables(this)
	}

	public receiveOSCResponse(data: OSCResponse): void {
		if (data.address.toString() == '/millumin/board/launchedColumn' && 0 < data.args.length) {
			this.currentColumnIndex = data.args[0].value
			if (1 < data.args.length) {
				this.currentColumnName = data.args[1].value
			} else {
				this.currentColumnName = ''
			}
			this.updateVariablesValues()
		} else if (data.address.toString() == '/millumin/board/stoppedColumn' && 0 < data.args.length) {
			if (this.currentColumnIndex == data.args[0].value) {
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
			this.previousColumnName = data.args[2].value
			this.nextColumnName = data.args[4].value
			this.updateVariablesValues()
		} else if (data.address.startsWith('/millumin/layer')) {
			const addressParts = data.address.split('/')
			const layerName = addressParts[2].split(':', 2)[1]
			this.log('info', `Media layer: ${layerName}`)

			if (!this.mediaLayers[layerName]) {
				this.mediaLayers[layerName] = {
					timeLayerMediaIndex: 0,
					timeLayerElapsedTime: 0,
					timeLayerDuration: 0,
				}
			}

			if (data.address.endsWith('/media/time')
				&& 2 <= data.args.length) {
				this.mediaLayers[layerName].timeLayerElapsedTime = data.args[0].value
				this.mediaLayers[layerName].timeLayerDuration = data.args[1].value
			} else if (data.address.endsWith('/mediaStarted')
				&& 1 <= data.args.length) {
				this.mediaLayers[layerName].timeLayerMediaIndex = data.args[1].value
				if (3 <= data.args.length) {
					this.mediaLayers[layerName].timeLayerElapsedTime = 0
					this.mediaLayers[layerName].timeLayerDuration = data.args[2].value
				} else {
					this.mediaLayers[layerName].timeLayerElapsedTime = 0
					this.mediaLayers[layerName].timeLayerDuration = 0
				}
			} else if (data.address.endsWith('/mediaStopped')&&
				1 <= data.args.length) {
				if (this.mediaLayers[layerName].timeLayerMediaIndex == data.args[1].value) {
					this.mediaLayers[layerName].timeLayerElapsedTime = 0
					this.mediaLayers[layerName].timeLayerDuration = 0
				}
			}

			this.log('debug', JSON.stringify(this.mediaLayers))

			this.updateVariablesValues()
		}
	}
}

runEntrypoint(MilluminInstance, [UpgradeV2ToV3])
