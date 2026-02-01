import { useState } from "react"
import { useEditorStore } from "../store/editorStore"
import { Modal } from "./Modal"

interface CardSizeModalProps {
  onClose: () => void
}

export function CardSizeModal({ onClose }: CardSizeModalProps) {
  const template = useEditorStore((s) => s.template)
  const setCardSize = useEditorStore((s) => s.setCardSize)

  const [width, setWidth] = useState(template.width)
  const [height, setHeight] = useState(template.height)

  const apply = () => {
    if (width >= 50 && height >= 50) {
      setCardSize(width, height)
      onClose()
    } else {
      alert("Width and height must be at least 50")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") apply()
    if (e.key === "Escape") onClose()
  }

  return (
    <Modal onClose={onClose}>
      <div onKeyDown={handleKeyDown} tabIndex={0} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h2>Set Card Size</h2>

        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          Width
          <input
            type="number"
            min={50}
            value={width}
            onChange={(e) => setWidth(parseInt(e.target.value))}
            style={{ padding: 6, fontSize: 14 }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          Height
          <input
            type="number"
            min={50}
            value={height}
            onChange={(e) => setHeight(parseInt(e.target.value))}
            style={{ padding: 6, fontSize: 14 }}
          />
        </label>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
          <button
            onClick={apply}
            style={{
              padding: "6px 12px",
              borderRadius: 4,
              border: "1px solid #888",
              cursor: "pointer",
              background: "#fff",
            }}
          >
            Apply
          </button>

          <button
            onClick={onClose}
            style={{
              padding: "6px 12px",
              borderRadius: 4,
              border: "1px solid #888",
              cursor: "pointer",
              background: "#fff",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  )
}
