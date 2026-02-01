import { Rect } from "react-konva"
import { useState, useEffect } from "react"
import { useEditorStore } from "../store/editorStore"

interface GridProps {
  width: number
  height: number
  step?: number
  color?: string
}

export function Grid({ width, height, step = 5, color = "#ccc" }: GridProps) {
  const [patternImg, setPatternImg] = useState<HTMLImageElement | null>(null)
  const showGrid = useEditorStore((s) => s.showGrid)
  
  useEffect(() => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${step}" height="${step}">
      <line x1="0" y1="0" x2="0" y2="${step}" stroke="${color}" stroke-width="0.5"/>
      <line x1="0" y1="0" x2="${step}" y2="0" stroke="${color}" stroke-width="0.5"/>
    </svg>`

    const img = new window.Image()
    img.src = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
    img.onload = () => setPatternImg(img)
  }, [step, color])

  if (!patternImg) return null

  return (
    <Rect
      x={0}
      y={0}
      width={width}
      height={height}
      fillPatternImage={patternImg}
      fillPatternRepeat="repeat"
      fillPatternScale={{ x: 1, y: 1 }}
      fillPatternOffset={{ x: 0, y: 0 }}
      listening={false}
      visible={showGrid}
    />
  )
}
