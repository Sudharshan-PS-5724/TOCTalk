import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export const useGSAP = () => {
  const elementRef = useRef(null)

  const animateIn = (animationType = 'fadeIn', delay = 0) => {
    if (!elementRef.current) return

    const element = elementRef.current
    
    // Reset initial state
    gsap.set(element, { clearProps: 'all' })
    
    // Set initial state based on animation type
    switch (animationType) {
      case 'fadeIn':
        gsap.set(element, { opacity: 0, y: 20 })
        break
      case 'slideInLeft':
        gsap.set(element, { opacity: 0, x: -50 })
        break
      case 'slideInRight':
        gsap.set(element, { opacity: 0, x: 50 })
        break
      case 'scaleIn':
        gsap.set(element, { opacity: 0, scale: 0.8 })
        break
      case 'bounceIn':
        gsap.set(element, { opacity: 0, scale: 0.3 })
        break
      case 'rotateIn':
        gsap.set(element, { opacity: 0, rotation: -10, scale: 0.8 })
        break
      default:
        gsap.set(element, { opacity: 0, y: 20 })
    }

    // Animate to final state
    const animation = gsap.to(element, {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      duration: 0.6,
      delay: delay,
      ease: 'power2.out'
    })

    return animation
  }

  const staggerIn = (selector, stagger = 0.1, delay = 0) => {
    if (!elementRef.current) return

    const elements = elementRef.current.querySelectorAll(selector)
    
    gsap.set(elements, { opacity: 0, y: 30 })
    
    const animation = gsap.to(elements, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: stagger,
      delay: delay,
      ease: 'power2.out'
    })

    return animation
  }

  const animateOut = (animationType = 'fadeOut', delay = 0) => {
    if (!elementRef.current) return

    const element = elementRef.current
    
    const animation = gsap.to(element, {
      opacity: 0,
      y: -20,
      duration: 0.4,
      delay: delay,
      ease: 'power2.in'
    })

    return animation
  }

  const hoverAnimation = (scale = 1.05, duration = 0.2) => {
    if (!elementRef.current) return

    const element = elementRef.current
    
    element.addEventListener('mouseenter', () => {
      gsap.to(element, {
        scale: scale,
        duration: duration,
        ease: 'power2.out'
      })
    })

    element.addEventListener('mouseleave', () => {
      gsap.to(element, {
        scale: 1,
        duration: duration,
        ease: 'power2.out'
      })
    })
  }

  const pulseAnimation = (duration = 2) => {
    if (!elementRef.current) return

    const element = elementRef.current
    
    gsap.to(element, {
      scale: 1.05,
      duration: duration / 2,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: -1
    })
  }

  return {
    elementRef,
    animateIn,
    animateOut,
    staggerIn,
    hoverAnimation,
    pulseAnimation
  }
}

export default useGSAP 