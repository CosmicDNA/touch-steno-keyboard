// import JSONPretty from 'react-json-pretty'
import 'react-json-pretty/themes/monikai.css'

import { OrbitControls } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Scanner } from '@yudiel/react-qr-scanner'
import { useAtom } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import PropTypes from 'prop-types'
import { Perf } from 'r3f-perf'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import { Vector3 } from 'three'

import styles from './App.module.css' // This import is now used
import Octocat from './assets/github-octocat.svg'
import Grid from './components/Grid'
import usePersistedControls from './components/hooks/use-persisted-controls.mjs'
import useUrlParam from './components/hooks/use-url-param.mjs'
import useFullScreen from './components/hooks/useFullScreen.mjs'
import useTheme from './components/hooks/useTheme.mjs'
import { TunnelProvider, useTunnelContext } from './components/hooks/useTunnel'
import { useWebSocketContext, WebSocketProvider } from './components/hooks/useWebSocket'
import SpeedGraph from './components/SpeedGraph'
import StenoKeyboard from './components/StenoKeyboard'
import { getClientPublicKeyHex } from './components/utils/encryptionWrapper.mjs'

const publicKey = getClientPublicKeyHex()

/**
 * @param {String} _url
 */
const getBaseAndParams = (_url) => {
  // console.log(`URL is ${_url}`)
  const url = new URL(_url)
  const { searchParams, origin, pathname } = url
  const searchParamsEntries = Object.fromEntries(searchParams.entries())

  const base = origin + pathname
  // console.log(`Base is ${base} and search params are`, searchParamsEntries)
  return { base, searchParamsEntries }
}

/**
 *
 * @param {{scheduledCameraPositionSave: {scheduled: Boolean, setPersistentCameraPosition: func} setScheduledCameraPositionSave: func}} param0
 * @returns
 */
const ReactToCameraChange = ({ onCameraUpdate, children }) => {
  const { camera } = useThree()
  const previousCameraPosition = useRef(camera.position.clone())
  const previousSpeed = useRef(new Vector3())
  const onCameraUpdateRef = useRef(onCameraUpdate)

  useEffect(() => {
    onCameraUpdateRef.current = onCameraUpdate
  }, [onCameraUpdate])

  useFrame(({ camera }, clockDelta) => {
    const position = camera.position
    const cameraPositionDelta = position.clone().sub(previousCameraPosition.current)
    const instantaneousSpeed = cameraPositionDelta.clone().divideScalar(clockDelta)
    // drop the exponential smoothing; we want an exact zero when the camera
    // stops moving so our marker logic can fire. also clamp tiny residuals.
    previousSpeed.current.copy(instantaneousSpeed)
    if (previousSpeed.current.length() < 1e-6) {
      previousSpeed.current.set(0, 0, 0)
    }
    onCameraUpdateRef.current({ speed: previousSpeed.current.clone(), position })
    previousCameraPosition.current.copy(position)
  })

  return (
    <>
      {children}
    </>
  )
}
ReactToCameraChange.propTypes = {
  onCameraUpdate: PropTypes.func.isRequired,
  children: PropTypes.any
}

const sendStroke = {
  onKeyPress: 'onKeyPress',
  onKeyRelease: 'onKeyRelease'
}

const kSchema = {
  sendStroke: { value: sendStroke.onKeyRelease, options: Object.keys(sendStroke) },
  lockPosition: false,
  performanceMonitor: false,
  show3DText: true,
  showShadows: true
}

const initialCameraPosition = new Vector3(0, 6, 10)
const cameraAtom = atomWithStorage(
  'cameraPosition',
  initialCameraPosition,
  undefined,
  { getOnInit: true }
)

const websocketUrlAtom = atomWithStorage(
  'websocketUrl',
  null,
  createJSONStorage(() => sessionStorage)
)

const SessionHandler = () => {
  const { lastJsonMessage } = useWebSocketContext()
  const [websocketUrl, setWebsocketUrl] = useAtom(websocketUrlAtom)

  useEffect(() => {
    const newToken = lastJsonMessage?.newTabletToken
    const currentToken = websocketUrl?.searchParamsEntries?.token

    if (newToken && newToken !== currentToken) {
      console.info('Received new session token, updating storage.')
      toast.success('Session secured with new token')
      setWebsocketUrl(prev => {
        if (!prev) return prev
        return {
          ...prev,
          searchParamsEntries: {
            ...prev.searchParamsEntries,
            token: newToken
          }
        }
      })
    }
  }, [lastJsonMessage, setWebsocketUrl, websocketUrl])

  return null
}

const Tunneled = () => {
  const { status } = useTunnelContext()
  const [showScanner, setShowScanner] = useState(false)
  const kControls = usePersistedControls('Keyboard', kSchema)
  const [storedWebsocketUrl, setStoredWebsocketUrl] = useAtom(websocketUrlAtom)
  const [activeWebsocketUrl, setActiveWebsocketUrl] = useState(storedWebsocketUrl)
  const speedHistory = useRef([])

  useEffect(() => {
    if (storedWebsocketUrl && !activeWebsocketUrl) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveWebsocketUrl(storedWebsocketUrl)
    }
  }, [storedWebsocketUrl, activeWebsocketUrl])

  const theme = useTheme()

  const isTouchDevice = useMemo(() => ('ontouchstart' in window) || (navigator.maxTouchPoints > 0), [])

  useFullScreen(!isTouchDevice)

  const floorColor = theme === 'dark' ? 'black' : '#f0f0f0'

  useEffect(() => {
    document.body.style.backgroundColor = floorColor
  }, [floorColor])

  const [persistentCameraPosition, setPersistentCameraPosition] = useAtom(cameraAtom)
  // track the previous frame's speed so we can spot the instant the camera
  // arrives at a full stop. since the controls now guarantee exact zero we
  // simply look for a transition from >0 to 0.
  const lastSpeedRef = useRef(0)

  // `onOrbitMotionEnd` is still passed to the controls for logging/metrics,
  // but it no longer affects marker logic.
  const onOrbitMotionEnd = () => {
    // nothing to do here; kept for backwards compatibility
  }

  const relay = useUrlParam('relay')
  const isDebug = useUrlParam('debug')

  // const lookupState = useRef(LookupStateEnum.IDLE)
  useEffect(() => {
    if (relay) {
      console.log('Relay URL parameter detected:', relay)

      const newUrlData = getBaseAndParams(relay)
      setStoredWebsocketUrl(newUrlData)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveWebsocketUrl(newUrlData)
      console.info(`WebSocket URL set to ${relay}`)

      // Optional: remove the relay parameter from the URL to avoid re-sending on refresh
      const url = new URL(window.location.href)
      url.searchParams.delete('relay')
      // Reconstruct the URL without the 'relay' parameter and update the browser history
      window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`)
    }
  }, [relay, setStoredWebsocketUrl])

  const onCameraUpdate = ({ speed, position }) => {
    const speedModule = speed.length()
    const historyItem = { speed: speedModule, marker: null }
    speedHistory.current.push(historyItem)
    if (speedHistory.current.length > 500) speedHistory.current.shift()

    // OrbitControls now clamps its velocity deltas to zero when static
    // friction has brought the camera to rest. simply look for the transition
    // from nonzero to zero speed and tag that frame.
    if (lastSpeedRef.current > 0 && speedModule === 0) {
      historyItem.marker = 'static'
      setPersistentCameraPosition(position)
    }

    lastSpeedRef.current = speedModule
  }

  const { parent, child } = styles

  const gridY = -0.5

  /**
   * @param {import ('@yudiel/react-qr-scanner').IDetectedBarcode[]} results
   */
  const handleScan = (results) => {
    const aScan = results.find(result => result?.rawValue)
    if (aScan) {
      try {
        const url = new URL(aScan.rawValue) // This will throw if it's not a valid URL
        const urlParams = new URLSearchParams(url.search)
        const relay = urlParams.get('relay')
        const newUrlData = getBaseAndParams(relay)
        setStoredWebsocketUrl(newUrlData)
        setActiveWebsocketUrl(newUrlData)
        console.debug('Scanned QR code result', aScan)
        console.info(`WebSocket URL set to ${aScan.rawValue}`)
        setShowScanner(false)
      } catch (e) {
        console.error('Scanned QR code is not a valid URL', e)
      }
    }
  }

  const queryParams = useMemo(() => ({ publicKey, ...activeWebsocketUrl?.searchParamsEntries }), [activeWebsocketUrl])
  // const queryParams = { ...websocketUrl?.searchParamsEntries }
  // console.log({ queryParams })

  return (
    <div className={parent}>
      {isDebug && <SpeedGraph dataRef={speedHistory} />}
      {showScanner && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 100, background: 'black' }}>
          <Scanner
            onScan={handleScan}
            constraints={{ facingMode: 'environment' }}
          />
          <button style={{ position: 'absolute', top: '20px', right: '20px' }} onClick={() => setShowScanner(false)}>Cancel</button>
        </div>
      )}
      <div className={child}>
        <status.Out />
        <button className={styles.button} onClick={() => setShowScanner(true)}>Scan QR</button>
      </div>
      <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 10 }}>
        <a href='https://github.com/CosmicDNA/touch-steno-keyboard' target='_blank' rel='noreferrer'>
          <img
            src={Octocat}
            alt='Octocat'
            width={60}
            height={60}
            style={{ filter: theme === 'dark' ? 'drop-shadow(0 0 3px white)' : 'none' }}
          />
        </a>
      </div>
      <div>
        <ToastContainer theme={theme} />
      </div>
      <Canvas shadows camera={{ position: Object.values(persistentCameraPosition), fov: 25 }}>
        {kControls.performanceMonitor && <Perf position='bottom-right' />}
        <ReactToCameraChange {...{ onCameraUpdate }}>
          <ambientLight intensity={0.5} />
          <directionalLight
            castShadow={kControls.showShadows}
            intensity={0.5}
            position={[0, 5, -10]}
            shadow-mapSize-width={512}
            shadow-mapSize-height={512}
            shadow-camera-far={50}
          />
          <WebSocketProvider
            url={activeWebsocketUrl?.base}
            queryParams={queryParams}
          >
            <SessionHandler />
            <StenoKeyboard controls={kControls} isTouchDevice={isTouchDevice} />
          </WebSocketProvider>
          <OrbitControls
            onEnd={onOrbitMotionEnd}
            zoomSpeed={0.25}
            // The camera position is now persisted via the Jotai atom
            minPolarAngle={0}
            dampingFactor={0.05}
            staticMovingFriction={1E-4}
            enableDamping
            maxPolarAngle={Math.PI / 2.1} // Prevents camera from going under the grid
            enableRotate={!kControls.lockPosition}
            enablePan={!kControls.lockPosition}
            enableZoom={!kControls.lockPosition}
          />
          <mesh
            receiveShadow rotation-x={-Math.PI / 2} position-y={gridY - 0.02}
          >
            <planeGeometry
              args={[100, 100]}
            />
            <meshStandardMaterial color={floorColor} />
          </mesh>
          <Grid position={[0, gridY, 0]} />
        </ReactToCameraChange>
      </Canvas>
      {/* <status.In className='child'>
            {
                isError &&
                  <JSONPretty id="json-pretty" data={error}></JSONPretty>
            }
          </status.In> */}
    </div>
  )
}

const App = () => {
  return (
    <TunnelProvider>
      <Tunneled />
    </TunnelProvider>
  )
}

export default App
