const path = require('path').resolve(process.argv[2] || '.')
const assert = require('assert')
const { getActions, ActionId } = require(path + '/dist/actions')
const { getFeedbacks } = require(path + '/dist/feedback')
const { GetPresetList } = require(path + '/dist/presets')
const { getVariableDefinitions, getVariableValues } = require(path + '/dist/variables')
const { MilluminState } = require(path + '/dist/state')
const { UpgradeV4ToV5 } = require(path + '/dist/upgrades')

const sent = []
const logs = []
const state = new MilluminState()
const config = { timeLayerName: 'Video,Sound', trackMultipleLayers: true, autoVariables: true, presetColumns: 8, requeryAfterCommand: false }
const instance = {
  label: 'millumin', config, state,
  OSC: { sendCommand: (p, a) => sent.push([p, (a || []).map((x) => `${x.type}:${x.value}`).join(',')]) },
  log: (l, m) => logs.push(`${l}: ${m}`),
  notifyLocalChange: () => {},
  querySelectedLayer() { state.expectSelectedLayerAnswer('opacity') },
  trackedLayers() {
    const list = [{ id: 'firstByIndex', label: 'index:1', target: 'index:1' }]
    for (const n of config.timeLayerName.split(',')) list.push({ id: n, label: n, target: `layer:${n}` })
    return list
  },
}
const ctx = { parseVariablesInString: async (s) => s.replace(/\$\(test:col\)/g, '7').replace(/\$\(test:name\)/g, 'Intro') }

const actions = getActions(instance)
const run = async (id, options) => { sent.length = 0; await actions[id].callback({ actionId: id, options }, ctx); return sent.map((x) => x.join(' ')).join(' | ') }
const T = (o) => ({ targetType: 'selectedLayer', targetName: '', targetIndex: '1', ...o })

;(async () => {
  const cases = [
    [ActionId.LAUNCH_COLUMN_BY_INDEX, { index: 3 }, '/action/launchColumn i:3'],
    [ActionId.LAUNCH_COLUMN_BY_NAME, { name: '$(test:name)' }, '/action/launchColumn s:Intro'],
    [ActionId.LAUNCH_OR_STOP_COLUMN_BY_INDEX, { index: 2 }, '/action/launchOrStopColumn i:2'],
    [ActionId.STOP_COLUMN, {}, '/action/stopColumn '],
    [ActionId.LAUNCH_NEXT_COLUMN, {}, '/action/launchNextColumn '],
    [ActionId.LAUNCH_PREVIOUS_COLUMN, {}, '/action/launchPreviousColumn '],
    [ActionId.PLAY, {}, '/action/play '],
    [ActionId.PAUSE, {}, '/action/pause '],
    [ActionId.PLAY_OR_PAUSE, {}, '/action/playOrPause '],
    [ActionId.GO_TO_TIME, { time: -10 }, '/action/goToTime f:-10'],
    [ActionId.GO_TO_TIMECODE, { time: '01:02:03.456' }, '/action/goToTime s:01:02:03.456'],
    [ActionId.GO_TO_TIMECODE, { time: '12.5' }, '/action/goToTime f:12.5'],
    [ActionId.GO_TO_TIMELINE_SEGMENT, { name: 'Act 2' }, '/action/goToTimelineSegment s:Act 2'],
    [ActionId.SELECT_BOARD_BY_INDEX, { index: 2 }, '/action/selectBoard i:2'],
    [ActionId.SELECT_BOARD_BY_NAME, { name: 'Main' }, '/action/selectBoard s:Main'],
    [ActionId.SELECT_LAYER_BY_INDEX, { index: 4 }, '/action/selectLayer i:4'],
    [ActionId.SELECT_LAYER_BY_NAME, { name: 'Video' }, '/action/selectLayer s:Video'],
    [ActionId.SELECT_LIGHT_BY_INDEX, { index: 1 }, '/action/selectLight i:1'],
    [ActionId.SELECT_LIGHT_BY_NAME, { name: 'Par' }, '/action/selectLight s:Par'],
    [ActionId.SET_MASTER_VIDEO, { value: 0.5 }, '/masterVideo f:0.5'],
    [ActionId.SET_MASTER_AUDIO, { value: 0.7 }, '/masterAudio f:0.7'],
    [ActionId.SET_MASTER_DMX, { value: 0.9 }, '/masterDMX f:0.9'],
    [ActionId.BRUSH, { x: '0.5', y: '0.5', pressure: '' }, '/action/brush f:0.5,f:0.5'],
    [ActionId.BRUSH, { x: '0.1', y: '0.1', pressure: '0.7' }, '/action/brush f:0.1,f:0.1,f:0.7'],
    [ActionId.ENTER_FULLSCREEN, {}, '/action/enterFullscreen '],
    [ActionId.EXIT_FULLSCREEN, {}, '/action/exitFullscreen '],
    [ActionId.DISPLAY_TEST_CARD, {}, '/action/displayTestCard '],
    [ActionId.HIDE_TEST_CARD, {}, '/action/hideTestCard '],
    [ActionId.DISABLE_WORKSPACE, {}, '/action/disableWorkspace '],
    [ActionId.ENABLE_WORKSPACE, {}, '/action/enableWorkspace '],
    [ActionId.OPEN_PROJECT, { name: '/p/a.millumin' }, '/action/openProject s:/p/a.millumin'],
    [ActionId.SAVE_PROJECT, {}, '/action/saveProject '],
    [ActionId.SAVE_PROJECT_AS, { name: '/p/b.millumin' }, '/action/saveProject s:/p/b.millumin'],
    [ActionId.QUIT, {}, '/action/quit '],
    [ActionId.PING, {}, '/ping '],
    [ActionId.ELEMENT_OPACITY, T({ mode: 'set', value: '0.75' }), '/selectedLayer/opacity f:0.75'],
    [ActionId.ELEMENT_OPACITY, T({ targetType: 'layer', targetName: 'test', mode: '-', value: '0.1' }), '/layer:test/opacity/- f:0.1'],
    [ActionId.ELEMENT_OPACITY, T({ targetType: 'element', targetName: 'test', mode: 'set', value: '1' }), '/test/opacity f:1'],
    [ActionId.ELEMENT_OPACITY, T({ targetType: 'index', targetIndex: '$(test:col)', mode: 'set', value: '1' }), '/index:7/opacity f:1'],
    [ActionId.ELEMENT_POSITION, T({ axis: 'xy', mode: 'set', x: '12', y: '21' }), '/selectedLayer/position/xy f:12,f:21'],
    [ActionId.ELEMENT_POSITION, T({ axis: 'x', mode: '+', x: '10', y: '0' }), '/selectedLayer/position/x/+ f:10'],
    [ActionId.ELEMENT_POSITION, T({ axis: 'y', mode: 'set', x: '0', y: '21' }), '/selectedLayer/position/y f:21'],
    [ActionId.ELEMENT_ROTATION, T({ mode: 'set', value: '90' }), '/selectedLayer/rotation f:90'],
    [ActionId.ELEMENT_SCALE, T({ mode: '-', value: '0.01' }), '/selectedLayer/scale/- f:0.01'],
    [ActionId.ELEMENT_MAPPING, T({ corner: 'topLeft', axis: 'xy', mode: 'set', x: '12', y: '21' }), '/selectedLayer/mapping/topLeft f:12,f:21'],
    [ActionId.ELEMENT_MAPPING, T({ corner: 'bottomRight', axis: 'y', mode: 'set', x: '0', y: '21' }), '/selectedLayer/mapping/bottomRight/y f:21'],
    [ActionId.ELEMENT_EFFECT, T({ effect: '3', parameter: 'blue', mode: 'set', value: '0.1' }), '/selectedLayer/effect3/blue f:0.1'],
    [ActionId.LIGHT_INTENSITY, T({ targetType: 'selectedLight', mode: 'set', value: '127' }), '/selectedLight/intensity f:127'],
    [ActionId.LIGHT_INTENSITY, T({ targetType: 'light', targetName: '1', mode: 'set', value: '255' }), '/light:1/intensity f:255'],
    [ActionId.ELEMENT_SELECT, T({ targetType: 'layer', targetName: 'myLayerName', selected: 1 }), '/layer:myLayerName/selected i:1'],
    [ActionId.ELEMENT_SELECT, T({ targetType: 'layer', targetName: 'myLayerName', selected: 0 }), '/layer:myLayerName/selected i:0'],
    [ActionId.ELEMENT_PROPERTY, T({ property: 'media/myQuartzInput', mode: 'set', values: 'f:0.5' }), '/selectedLayer/media/myQuartzInput f:0.5'],
    [ActionId.ELEMENT_REQUEST_FEEDBACK, T({ targetType: 'element', targetName: 'myElementName', property: 'opacity' }), '/myElementName/opacity/? '],
    [ActionId.ELEMENT_REQUEST_FEEDBACK, T({ property: 'mapping/topLeft' }), '/selectedLayer/mapping/topLeft/? '],
    [ActionId.LAYER_START_MEDIA, T({ startMode: 'restart' }), '/selectedLayer/startMedia '],
    [ActionId.LAYER_START_MEDIA, T({ startMode: 'index', index: 7 }), '/selectedLayer/startMedia i:7'],
    [ActionId.LAYER_START_MEDIA, T({ startMode: 'name', name: 'Movie.mov' }), '/selectedLayer/startMedia s:Movie.mov'],
    [ActionId.LAYER_START_MEDIA, T({ targetType: 'layer', targetName: 'Video', startMode: 'name', name: 'Beginning' }), '/layer:Video/startMedia s:Beginning'],
    [ActionId.LAYER_PAUSE_MEDIA, T({}), '/selectedLayer/pauseMedia '],
    [ActionId.LAYER_START_OR_PAUSE_MEDIA, T({}), '/selectedLayer/startOrPauseMedia '],
    [ActionId.LAYER_STOP_MEDIA, T({}), '/selectedLayer/stopMedia '],
    [ActionId.MEDIA_TIME, T({ time: '10' }), '/selectedLayer/media/time f:10'],
    [ActionId.MEDIA_TIME, T({ time: '01:02:03.400' }), '/selectedLayer/media/time s:01:02:03.400'],
    [ActionId.MEDIA_TIME, T({ targetType: 'media', targetName: 'Movie.mov', time: '10' }), '/Movie.mov/time f:10'],
    [ActionId.MEDIA_NORMALIZED_TIME, T({ value: '0.5' }), '/selectedLayer/media/normalizedTime f:0.5'],
    [ActionId.MEDIA_SPEED, T({ mode: 'set', value: '0.5' }), '/selectedLayer/media/speed f:0.5'],
    [ActionId.MEDIA_TEXT, T({ text: 'my new blabla' }), '/selectedLayer/media/text s:my new blabla'],
    [ActionId.MEDIA_QUARTZ_INPUT, T({ input: 'myQuartzInput', valueType: 'f', value: '0.5' }), '/selectedLayer/media/myQuartzInput f:0.5'],
    [ActionId.MEDIA_JOG, T({ offset: '-5' }), '/selectedLayer/media/time/- f:5'],
    [ActionId.LAYER_IMPORT, T({ path: '/f/a.mov', column: '', start: false }), '/selectedLayer/import s:/f/a.mov'],
    [ActionId.LAYER_IMPORT, T({ path: '/f/a.mov', column: '7', start: false }), '/selectedLayer/import s:/f/a.mov,i:7'],
    [ActionId.LAYER_IMPORT, T({ path: '/f/a.mov', column: '7', start: true }), '/selectedLayer/importAndStart s:/f/a.mov,i:7'],
    [ActionId.LAYER_CLEAR_MEDIA, T({ column: '' }), '/selectedLayer/import s:'],
    [ActionId.LAYER_CLEAR_MEDIA, T({ column: '7' }), '/selectedLayer/import s:,i:7'],
    [ActionId.CUSTOM_OSC, { oscPath: '/foo/bar', oscArgs: 'i:1, 0.5, hello, s:12' }, '/foo/bar i:1,f:0.5,s:hello,s:12'],
  ]
  let fails = 0
  for (const [id, opts, expected] of cases) {
    const got = await run(id, opts)
    if (got !== expected) { fails++; console.log(`FAIL ${id}: got "${got}" expected "${expected}"`) }
  }
  const covered = new Set(cases.map((c) => c[0]))
  const untested = Object.values(ActionId).filter((id) => !covered.has(id))
  console.log(`actions: ${cases.length - fails}/${cases.length} ok; untested: ${untested.join(',')}`)

  // invalid target must not send
  assert.strictEqual(await run(ActionId.ELEMENT_OPACITY, T({ targetType: 'layer', targetName: '', mode: 'set', value: '1' })), '')

  // ---------- State / feedback parsing ----------
  const msg = (address, ...args) => state.handle({ address, args: args.map((v) => ({ type: typeof v === 'number' ? 'f' : 's', value: v })) })
  msg('/millumin/board/launchedColumn', 3, 'Intro')
  msg('/millumin/info', 'board/launchedColumn', 3, 'Prev', 0, 'Next', 0)
  msg('/millumin/layer:Video/selected')
  msg('/millumin/layer:Video/mediaStarted', 3, 'clip.mov', 120)
  msg('/millumin/layer:Video/media/time', 30, 120)
  msg('/millumin/selectedLayer/media/time', 40, 120)
  msg('/millumin/selectedLayer/media/speed', 0.5)
  msg('/millumin/layer:Video/opacity', 0.8)
  msg('/millumin/layer:Video/xy', 12, 21)
  msg('/millumin/layer:Video/mapping/topLeft', 5, 6)
  msg('/millumin/light:Par1/intensity', 0.5)
  msg('/millumin/index:1/mediaStarted', 1, 'bg.mov', 60)
  msg('/millumin/index:1/media/time', 55, 60)
  msg('/millumin/layer:Sound/mediaStarted', 2, 'music.wav', 200)
  msg('/millumin/layer:Sound/mediaPaused', 2, 'music.wav')
  const video = state.getElement('layer:video')
  assert.strictEqual(state.currentColumnName, 'Intro')
  assert.strictEqual(state.previousColumnName, 'Prev')
  assert.strictEqual(state.nextColumnName, 'Next')
  assert.strictEqual(state.selectedLayer, 'Video')
  assert.strictEqual(video.media.time, 40, 'selectedLayer feedback mirrored on layer:Video')
  assert.strictEqual(video.media.speed, 0.5)
  assert.strictEqual(state.getProperty(state.getElement('selectedLayer'), 'opacity'), 0.8, 'mirror selectedLayer props')
  assert.strictEqual(state.getProperty(video, 'x'), 12)
  assert.strictEqual(state.getProperty(video, 'position/y'), 21)
  assert.strictEqual(state.getProperty(video, 'mapping/topLeft/y'), 6)
  assert.strictEqual(state.getProperty(state.getElement('Par1'), 'intensity'), 0.5)

  const fbs = getFeedbacks(instance)
  const fb = (id, options) => fbs[id].callback({ id: 'x', feedbackId: id, options, image: { width: 72, height: 72 } }, ctx)
  assert.strictEqual(await fb('columnLaunched', { by: 'index', index: '3' }), true)
  assert.strictEqual(await fb('columnLaunched', { by: 'index', index: '4' }), false)
  assert.strictEqual(await fb('columnLaunched', { by: 'name', name: 'intro' }), true)
  assert.strictEqual(await fb('mediaStatus', T({ status: 'playing', media: '' })), true)
  assert.strictEqual(await fb('mediaStatus', T({ status: 'playing', media: 'clip.mov' })), true)
  assert.strictEqual(await fb('mediaStatus', T({ status: 'active', media: '3' })), true)
  assert.strictEqual(await fb('mediaStatus', T({ targetType: 'layer', targetName: 'Sound', status: 'paused', media: '' })), true)
  assert.strictEqual(await fb('mediaStatus', T({ targetType: 'layer', targetName: 'Sound', status: 'playing', media: '' })), false)
  assert.strictEqual(await fb('elementSelected', T({ targetType: 'layer', targetName: 'video' })), true)
  assert.strictEqual(await fb('elementSelected', T({ targetType: 'layer', targetName: 'Sound' })), false)
  assert.strictEqual(await fb('propertyCompare', T({ property: 'opacity', operator: 'gt', value: '0.5' })), true)
  assert.strictEqual(await fb('propertyCompare', T({ property: 'media/speed', operator: 'eq', value: '0.5' })), true)
  assert.strictEqual(await fb('propertyCompare', T({ property: 'media/name', operator: 'eq', value: 'CLIP.mov' })), true)
  assert.strictEqual(await fb('remainingTime', T({ targetType: 'index', targetIndex: '1', seconds: 10, onlyPlaying: true })), true)
  assert.strictEqual(await fb('remainingTime', T({ seconds: 10, onlyPlaying: true })), false)
  assert.strictEqual(await fb('feedbackAlive', { seconds: 10 }), true)
  const bar = await fb('progressBar', { layer: 'firstByIndex', hideWhenNotRunning: true, expiringInSeconds: 15, runningColor: 0xff00, expiringColor: 0xffff00 })
  assert.ok(bar.imageBuffer && bar.imageBuffer.length > 0, 'progress bar image')

  // selection change: Sound selected -> selectedLayer view follows
  msg('/millumin/layer:Sound/selected', 1)
  assert.strictEqual(state.selectedLayer, 'Sound')
  assert.strictEqual(state.getElement('layer:video').selected, false)
  assert.strictEqual(await fb('mediaStatus', T({ status: 'paused', media: '' })), true, 'selectedLayer now Sound (paused)')

  // stopped / new media ordering
  msg('/millumin/layer:Video/mediaStarted', 4, 'next.mov', 10)
  msg('/millumin/layer:Video/mediaStopped', 3, 'clip.mov')
  assert.strictEqual(state.getElement('layer:Video').media.status, 'playing', 'late stop of old media ignored')
  msg('/millumin/layer:Video/mediaStopped', 4, 'next.mov')
  assert.strictEqual(state.getElement('layer:Video').media.status, 'stopped')
  msg('/millumin/board/stoppedColumn', 3, 'Intro')
  assert.strictEqual(state.currentColumnIndex, 0)
  assert.strictEqual(await fb('columnLaunched', { by: 'index', index: '3' }), false)

  // ---------- Variables ----------
  const defs = getVariableDefinitions(instance)
  const vals = getVariableValues(instance)
  const defIds = new Set(defs.map((d) => d.variableId))
  for (const k of Object.keys(vals)) assert.ok(defIds.has(k), 'value without definition: ' + k)
  for (const legacy of ['currentColumnIndex', 'currentColumnName', 'previousColumnName', 'nextColumnName', 'media_firstByIndex_elapsedTime', 'media_Video_remainingTime_HHMMSS', 'media_Video_progress', 'media_Video_duration_HHMMSS'])
    assert.ok(defIds.has(legacy), 'legacy var missing ' + legacy)
  assert.strictEqual(vals['media_firstByIndex_remainingTime'], 5)
  assert.strictEqual(vals['layer_Video_opacity'], 0.8)
  assert.strictEqual(vals['selectedLayer'], 'Sound')
  assert.strictEqual(vals['selectedLayer_media_status'], 'paused')
  assert.strictEqual(vals['light_Par1_intensity'], 0.5)
  for (const id of defIds) assert.ok(/^[A-Za-z0-9_-]+$/.test(id), 'bad var id ' + id)
  console.log(`variables: ${defs.length} definitions`)

  // ---------- Presets reference valid actions / feedbacks / options ----------
  const presets = GetPresetList(instance)
  let n = 0
  const optionIds = (def) => new Set(def.options.map((o) => o.id))
  for (const [pid, p] of Object.entries(presets)) {
    n++
    for (const step of p.steps) for (const a of [...step.down, ...step.up]) {
      const def = actions[a.actionId]
      assert.ok(def, `${pid}: unknown action ${a.actionId}`)
      const ids = optionIds(def)
      for (const k of Object.keys(a.options)) assert.ok(ids.has(k), `${pid}: action ${a.actionId} has no option ${k}`)
      sent.length = 0
      await def.callback({ actionId: a.actionId, options: a.options }, ctx)
    }
    for (const f of p.feedbacks) {
      const def = fbs[f.feedbackId]
      assert.ok(def, `${pid}: unknown feedback ${f.feedbackId}`)
      const ids = optionIds(def)
      for (const k of Object.keys(f.options)) assert.ok(ids.has(k), `${pid}: feedback ${f.feedbackId} has no option ${k}`)
      await def.callback({ id: 'x', feedbackId: f.feedbackId, options: f.options, image: { width: 72, height: 72 } }, ctx)
    }
  }
  const cats = [...new Set(Object.values(presets).map((p) => p.category))]
  console.log(`presets: ${n} in ${cats.length} categories: ${cats.join(' | ')}`)

  // ---------- Millumin does not echo OSC changes: local updates, /? requery, aliases, pause inference ----------
  state.reset()
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
  msg('/millumin/layer:layer/selected')
  msg('/millumin/index:1/selected')
  assert.strictEqual(state.aliases.get('layer:layer'), 'index:1', 'layer <-> index alias learnt')
  msg('/millumin/index:1/mediaStarted', 2, 'clip.mov', 120)
  assert.strictEqual(state.getElement('layer:layer').media.name, 'clip.mov', 'alias mirrors media')
  for (let k = 1; k <= 3; k++) { msg('/millumin/selectedLayer/media/time', k, 120); await sleep(5) }
  assert.strictEqual(state.getElement('index:1').media.time, 3)
  await run(ActionId.LAYER_PAUSE_MEDIA, T({}))
  assert.strictEqual(state.getElement('selectedLayer').media.status, 'paused', 'optimistic pause')
  assert.strictEqual(state.getElement('index:1').media.status, 'paused', 'optimistic pause on alias')
  await sleep(750) // grace period after a command
  msg('/millumin/selectedLayer/media/time', 3.5, 120)
  assert.strictEqual(state.getElement('selectedLayer').media.status, 'playing', 'moving playhead = playing')
  assert.strictEqual(state.tick(Date.now() + 2000), true)
  assert.strictEqual(state.getElement('selectedLayer').media.status, 'paused', 'frozen playhead = paused')
  await run(ActionId.LAYER_START_OR_PAUSE_MEDIA, T({}))
  assert.strictEqual(state.getElement('selectedLayer').media.status, 'playing', 'toggle')
  await run(ActionId.LAYER_STOP_MEDIA, T({}))
  assert.strictEqual(state.getElement('selectedLayer').media.status, 'stopped')
  await run(ActionId.MEDIA_SPEED, T({ mode: 'set', value: '0.5' }))
  assert.strictEqual(state.getElement('index:1').media.speed, 0.5, 'optimistic speed')
  await run(ActionId.MEDIA_SPEED, T({ mode: '+', value: '0.25' }))
  assert.strictEqual(state.getElement('selectedLayer').media.speed, 0.75, 'relative speed')
  await run(ActionId.ELEMENT_OPACITY, T({ mode: 'set', value: '0.5' }))
  assert.strictEqual(state.getProperty(state.getElement('index:1'), 'opacity'), 0.5, 'optimistic opacity')
  await run(ActionId.ELEMENT_POSITION, T({ axis: 'xy', mode: 'set', x: '12', y: '21' }))
  assert.strictEqual(state.getProperty(state.getElement('selectedLayer'), 'y'), 21, 'optimistic position')
  config.requeryAfterCommand = true
  sent.length = 0
  await actions[ActionId.ELEMENT_OPACITY].callback({ actionId: ActionId.ELEMENT_OPACITY, options: T({ mode: '-', value: '0.1' }) }, ctx)
  await sleep(200)
  assert.deepStrictEqual(sent.map((x) => x[0]), ['/selectedLayer/opacity/-', '/selectedLayer/opacity/?'], 'requery after relative change')
  assert.strictEqual(state.getProperty(state.getElement('index:1'), 'opacity'), 0.5, 'relative change waits for the /? answer')
  msg('/millumin/selectedLayer/opacity', 0.4)
  assert.strictEqual(state.getProperty(state.getElement('index:1'), 'opacity'), 0.4, '/? answer applied to alias')
  config.requeryAfterCommand = false
  // Layer already selected in Millumin: no selection feedback, the select action sets it locally
  state.reset()
  msg('/millumin/index:1/mediaStarted', 2, 'a.mov', 60)
  await run(ActionId.SELECT_LAYER_BY_INDEX, { index: 1 })
  assert.strictEqual(state.getElement('selectedLayer').key, 'index:1', 'selectedLayer resolved through the index')
  msg('/millumin/selectedLayer/media/time', 5, 60)
  assert.strictEqual(state.getElement('index:1').media.time, 5, 'selectedLayer feedback stored on index:1')
  assert.strictEqual(await fb('mediaStatus', T({ status: 'playing', media: '' })), true)
  // The /? answer comes back with the real layer name: it teaches the selection and links it to the index
  msg('/millumin/layer:Layer/opacity', 0.4)
  assert.strictEqual(state.selectedLayer, 'Layer', 'selection learnt from the /? answer')
  assert.strictEqual(state.aliases.get('layer:layer'), 'index:1')
  assert.strictEqual(state.getProperty(state.getElement('selectedLayer'), 'opacity'), 0.4)
  // A pause is not undone by time messages still in flight
  msg('/millumin/layer:Layer/media/time', 6, 60)
  await run(ActionId.LAYER_PAUSE_MEDIA, T({}))
  msg('/millumin/layer:Layer/media/time', 6.1, 60)
  assert.strictEqual(state.getElement('selectedLayer').media.status, 'paused', 'grace period after pause')
  console.log('optimistic state / requery / aliases: ok')

  // ---------- Upgrade 4 -> 5 ----------
  const up = UpgradeV4ToV5({}, {
    config: { host: '1.2.3.4' },
    actions: [
      { id: 'a', controlId: 'c', actionId: 'Action_SelectedLayer_StartOrPauseMedia', options: {} },
      { id: 'b', controlId: 'c', actionId: 'Action_SelectedLayer_StartMedia_ByIndex', options: { index: 5 } },
      { id: 'c', controlId: 'c', actionId: 'Action_SelectedLayer_SetMediaSpeed', options: { value: 2 } },
      { id: 'd', controlId: 'c', actionId: 'Action_Play', options: {} },
    ],
    feedbacks: [],
  })
  assert.strictEqual(up.updatedActions.length, 3)
  assert.strictEqual(up.updatedActions[0].actionId, 'Layer_StopMedia')
  for (const a of up.updatedActions) assert.ok(actions[a.actionId], 'upgrade to unknown action')
  assert.strictEqual(await run(up.updatedActions[1].actionId, up.updatedActions[1].options), '/selectedLayer/startMedia i:5')
  assert.strictEqual(await run(up.updatedActions[2].actionId, up.updatedActions[2].options), '/selectedLayer/media/speed f:2')
  assert.strictEqual(up.updatedConfig.pingOnConnect, true)
  console.log('upgrade: ok')
  if (logs.length) console.log('logs:', logs.slice(0, 5))
  process.exit(fails ? 1 : 0)
})().catch((e) => { console.error(e); process.exit(1) })
