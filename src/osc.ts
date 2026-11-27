import { InstanceBaseExt } from './utils'
import { InstanceStatus, OSCSomeArguments } from '@companion-module/base'
import { MilluminConfig } from './config'
const osc = require('osc') // eslint-disable-line

export interface OSCResponse {
	address: string
	args: {
		type: string
		value: any
	}[]
}

export class OSC {
	private readonly instance: InstanceBaseExt<MilluminConfig>
	private oscHost = ''
	private oscTXPort = 5000
	private oscRXPort = 8000
	private udpPort: any

	private readonly onReady?: () => void

	constructor(instance: InstanceBaseExt<MilluminConfig>, onReady?: () => void) {
		this.instance = instance
		this.onReady = onReady
		this.Connect()
	}

	public readonly destroy = (): void => {
		if (this.udpPort) {
			try {
				this.udpPort.close()
			} catch (_e) {
				// already closed
			}
		}
		return
	}

	public readonly Connect = (): void => {
		this.oscHost = this.instance.config.host || '127.0.0.1'
		this.oscTXPort = this.instance.config.tx_port || 5000
		this.oscRXPort = this.instance.config.rx_port || 8000

		this.instance.updateStatus(InstanceStatus.Connecting)

		this.udpPort = new osc.UDPPort({
			localAddress: '0.0.0.0',
			localPort: this.oscRXPort,
			metadata: true,
		})

		// Listen for incoming OSC messages.
		this.udpPort.on('message', (oscMsg: OSCResponse) => {
			// this.instance.log('info', JSON.stringify(oscMsg))
			// eslint-disable-next-line  @typescript-eslint/no-floating-promises
			this.processData(oscMsg)
		})

		this.udpPort.on('error', (err: { code: string; message: string }) => {
			if (err.code === 'EADDRINUSE') {
				this.instance.log('error', 'Error: Selected port in use.' + err.message)
				this.instance.updateStatus(InstanceStatus.ConnectionFailure, `Receive port ${this.oscRXPort} in use`)
			} else {
				this.instance.log('warn', `OSC error: ${err.message}`)
			}
		})

		// Open the socket.
		this.udpPort.open()

		// When the port is read
		this.udpPort.on('ready', () => {
			this.instance.log('info', `Listening to Millumin on port: ${this.oscRXPort}`)
			this.instance.updateStatus(InstanceStatus.Ok)
			if (this.onReady) this.onReady()
		})

		return
	}

	private processData = async (data: OSCResponse) => {
		this.instance.receiveOSCResponse(data)
	}

	public readonly sendCommand = (path: string, args?: OSCSomeArguments): void => {
		// this.instance.log('debug', `sending ${JSON.stringify(path)} ${args ? JSON.stringify(args) : ''}`)
		try {
			this.udpPort.send(
				{
					address: path,
					args: args ? args : [],
				},
				this.oscHost,
				this.oscTXPort,
			)
		} catch (e: any) {
			this.instance.log('warn', `Could not send ${path}: ${e?.message ?? e}`)
		}
	}
}
