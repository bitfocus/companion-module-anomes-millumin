const path = require('path').resolve(process.argv[2] || '.')
const osc = require(path + '/node_modules/osc')
const { OSC } = require(path + '/dist/osc')
const { MilluminState } = require(path + '/dist/state')
const state = new MilluminState()
const received = []
const instance = {
  config: { host: '127.0.0.1', tx_port: 15000, rx_port: 18000 },
  log: () => {}, updateStatus: (s) => received.push('status:' + s),
  receiveOSCResponse: (m) => state.handle(m),
}
// fake Millumin listening on 15000, replies to 18000
const fake = new osc.UDPPort({ localAddress: '127.0.0.1', localPort: 15000, metadata: true })
const got = []
fake.on('message', (m) => {
  got.push(m.address + ' ' + JSON.stringify(m.args))
  if (m.address === '/ping') {
    fake.send({ address: '/millumin/board/launchedColumn', args: [{ type: 'i', value: 2 }, { type: 's', value: 'Show' }] }, '127.0.0.1', 18000)
    fake.send({ address: '/millumin/layer:Video/mediaStarted', args: [{ type: 'i', value: 2 }, { type: 's', value: 'a.mov' }, { type: 'f', value: 90 }] }, '127.0.0.1', 18000)
  }
})
fake.on('ready', () => {
  const client = new OSC(instance, () => client.sendCommand('/ping', []))
  setTimeout(() => client.sendCommand('/action/goToTime', [{ type: 's', value: '00:01:00.000' }]), 100)
  setTimeout(() => {
    console.log('fake Millumin received:', got)
    console.log('module state: column', state.currentColumnIndex, state.currentColumnName, '| Video', state.getElement('layer:Video')?.media)
    console.log(received)
    client.destroy(); fake.close(); process.exit(got.length === 2 && state.currentColumnIndex === 2 ? 0 : 1)
  }, 400)
})
fake.open()
