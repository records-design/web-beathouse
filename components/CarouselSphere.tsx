import { useEffect, useRef, useState } from "react"

interface CarouselItem {
  image: string
  alt: string
}

interface Props {
  items: CarouselItem[]
  cardWidth?: number
  cardHeight?: number
  sphereRadius?: number
  rotationSpeed?: number
  tiltX?: number
  tiltZ?: number
}

export default function CarouselSphere({
  items,
  cardWidth = 180,
  cardHeight = 205,
  sphereRadius = 330,
  rotationSpeed = 0.003,
  tiltX = -23,
  tiltZ = -23,
}: Props) {
  const rotationRef = useRef(0)
  const [rotation, setRotation] = useState(0)
  const rafRef = useRef<number>()

  useEffect(() => {
    const animate = () => {
      rotationRef.current += rotationSpeed
      setRotation(rotationRef.current)
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current!)
  }, [rotationSpeed])

  const n = items.length

  const cards = items
    .map((item, i) => {
      const theta = Math.acos(1 - (2 * (i + 0.5)) / n)
      const phi = Math.PI * (1 + Math.sqrt(5)) * i
      const x = sphereRadius * Math.sin(theta) * Math.cos(phi + rotation)
      const y = sphereRadius * Math.cos(theta)
      const z = sphereRadius * Math.sin(theta) * Math.sin(phi + rotation)
      const scale = 0.6 + 0.4 * ((z + sphereRadius) / (2 * sphereRadius))
      const opacity = 0.5 + 0.5 * ((z + sphereRadius) / (2 * sphereRadius))
      return { ...item, x, y, z, scale, opacity }
    })
    .sort((a, b) => a.z - b.z)

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        perspective: "1000px",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          transform: `rotateX(${tiltX}deg) rotateZ(${tiltZ}deg)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {cards.map((card, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: cardWidth,
              height: cardHeight,
              transform: `translate3d(${card.x}px, ${card.y}px, ${card.z}px) scale(${card.scale})`,
              opacity: card.opacity,
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            <img
              src={card.image}
              alt={card.alt}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
