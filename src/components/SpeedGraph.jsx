import PropTypes from 'prop-types'
import React, { useEffect, useRef } from 'react'

const SpeedGraph = ({ dataRef }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationFrameId

    const handleResize = () => {
      canvas.width = window.innerWidth
    }
    window.addEventListener('resize', handleResize)
    handleResize()

    const render = () => {
      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)

      const history = dataRef.current
      if (history.length === 0) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      ctx.beginPath()
      ctx.strokeStyle = '#0f0'
      ctx.lineWidth = 1

      const maxSpeed = 5.0
      const step = width / history.length

      history.forEach((item, index) => {
        const x = index * step
        const y = height - (Math.min(item.speed, maxSpeed) / maxSpeed) * height
        if (index === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()

      history.forEach((item, index) => {
        if (item.marker) {
          const x = index * step
          let color = 'yellow' // Default for unknown markers
          if (item.marker === 'static') {
            color = 'red'
          } else if (item.marker === 'stop') {
            color = 'cyan'
          }

          ctx.beginPath()
          ctx.strokeStyle = color
          ctx.moveTo(x, 0)
          ctx.lineTo(x, height)
          ctx.stroke()
        }
      })

      animationFrameId = requestAnimationFrame(render)
    }
    render()
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [dataRef])

  return <canvas ref={canvasRef} height={100} style={{ position: 'absolute', bottom: 0, left: 0, zIndex: 9999, background: 'rgba(0,0,0,0.2)', pointerEvents: 'none' }} />
}

SpeedGraph.propTypes = {
  dataRef: PropTypes.shape({
    current: PropTypes.arrayOf(PropTypes.shape({
      speed: PropTypes.number,
      marker: PropTypes.string
    }))
  })
}

export default SpeedGraph
