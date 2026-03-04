import { useEffect, useState } from 'react'

const usePrevious = (value, defaultValue) => {
  const [previous, setPrevious] = useState(defaultValue)
  useEffect(() => {
    setPrevious(value)
  }, [value])
  return [previous, setPrevious]
}

export default usePrevious
