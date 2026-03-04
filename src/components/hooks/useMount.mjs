import { useState } from 'react'

import useOnMount from './use-on-mount.mjs'

/**
 *
 * @param {Function} callback
 * @param {React.DependencyList} deps
 * @returns
 */
const useMount = (callback = () => {}, deps = []) => {
// Ref to track component mount state
  const [isMounted, setIsMounted] = useState(false)

  useOnMount(() => {
    // Component has mounted, set the flag
    if (!isMounted.current) {
      setIsMounted(true)
      callback()
    }

    // Cleanup function to reset the flag when component unmounts
    return () => {
      setIsMounted(false)
    }
  }, deps)

  return { isMounted }
}

export default useMount
