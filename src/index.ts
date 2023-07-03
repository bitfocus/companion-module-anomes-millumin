import { InstanceBase, runEntrypoint, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, MilluminConfig } from './config'
import { GetActions } from './actions'
import { GetFeedbacks } from './feedback'
import { GetPresetList } from './presets'
import { initVariables, updateVariables } from './variables'
import { OSC, OSCResponse } from './osc'
import { UpgradeV2ToV3 } from './upgrades'




class MilluminInstance extends InstanceBase<MilluminConfig> {
	public config: MilluminConfig = {
		label: '',
		host: '',
		tx_port: 0,
		rx_port: 0,
		timeLayerName: ''
	}

	public OSC: OSC | null = null
	public currentColumnIndex = 0
	public currentColumnName: string | null = ''
	public previousColumnName: string | null = ''
	public nextColumnName: string | null = ''
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
		return GetConfigFields()
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
		initVariables(this)
		updateVariables(this)

		this.setActionDefinitions(GetActions(this))
		this.setFeedbackDefinitions(GetFeedbacks(this))
		this.setPresetDefinitions(GetPresetList())
	}

	public InitVariables(): void {
		initVariables(this)
	}

	public UpdateVariablesValues(): void {
		updateVariables(this)
	}

	public ReceiveOSCResponse(data: OSCResponse): void {
		if (data.address.toString() == '/millumin/board/launchedColumn' && 0 < data.args.length) {
			this.currentColumnIndex = data.args[0].value
			if (1 < data.args.length) {
				this.currentColumnName = data.args[1].value
			}
			else {
				this.currentColumnName = ''
			}
			this.UpdateVariablesValues()
		}
		else if (data.address.toString() == '/millumin/board/stoppedColumn' && 0 < data.args.length) {
			if (this.currentColumnIndex == data.args[0].value) {
				this.currentColumnIndex = 0
				this.currentColumnName = ''
				this.previousColumnName = ''
				this.nextColumnName = ''
				this.UpdateVariablesValues()
			}
		}
		else if (data.address.toString() == '/millumin/info' && 6 <= data.args.length && data.args[0].value == 'board/launchedColumn') {
			this.previousColumnName = data.args[2].value
			this.nextColumnName = data.args[4].value
			this.UpdateVariablesValues()
		}
		else if(data.address.toString() == `/millumin/layer:${this.config.timeLayerName.toLowerCase()}/media/time` && 2 <= data.args.length) {
			this.timeLayerElapsedTime = data.args[0].value
			this.timeLayerDuration = data.args[1].value
			this.UpdateVariablesValues()
		}
		else if(data.address.toString() == `/millumin/layer:${this.config.timeLayerName.toLowerCase()}/mediaStarted` && 1 <= data.args.length) {
			this.timeLayerMediaIndex = data.args[1].value
			if(3 <= data.args.length) {
				this.timeLayerElapsedTime = 0
				this.timeLayerDuration = data.args[2].value
			}
			else {
				this.timeLayerElapsedTime = 0
				this.timeLayerDuration = 0
			}
			this.UpdateVariablesValues()
		}
		else if(data.address.toString() == `/millumin/layer:${this.config.timeLayerName.toLowerCase()}/mediaStopped` && 1 <= data.args.length) {
			if(this.timeLayerMediaIndex == data.args[1].value) {
				this.timeLayerElapsedTime = 0
				this.timeLayerDuration = 0
			}
			this.UpdateVariablesValues()
		}
	}
}

runEntrypoint(MilluminInstance, [UpgradeV2ToV3])
	