import { Rect } from "react-konva"

interface SelectionBoxProps {
  width: number
  height: number
  padding?: number
}

export default function SelectionBox({
  width,
  height,
  padding = 4,
}: SelectionBoxProps) {
  return (
    <Rect
      x={-padding}
      y={-padding}
      width={width + padding * 2}
      height={height + padding * 2}
      stroke="#00aaff"
      strokeWidth={1}
      dash={[4, 4]}
      listening={false}
    />
  )
}
