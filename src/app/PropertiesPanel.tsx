import type { ImageElement, StaticTextElement, TextElement } from "../models/Element"
import { useEditorStore } from "../store/editorStore"
import styles from "./PropertiesPanel.module.css"

export default function PropertiesPanel() {
  const template = useEditorStore((s) => s.template)
  const selectedElementId = useEditorStore((s) => s.selectedElementId)
  const updateElement = useEditorStore((s) => s.updateElement)
  const deleteElement = useEditorStore((s) => s.deleteElement)
  const customFonts = useEditorStore((s) => s.template.customFonts)
  const baseFonts = ["Arial", "Roboto", "Cinzel"]

  const allFonts = [...baseFonts, ...customFonts]

  const selectedElement = template.elements.find((el) => el.id === selectedElementId)
  if (!selectedElement) return null

  const isText = selectedElement.type === "text" || selectedElement.type === "staticText"
  const isImage = selectedElement.type === "image" || selectedElement.type === "staticImage"

  let identifier = ""
  switch (selectedElement.type) {
    case "text":
      identifier = (selectedElement as TextElement).bind || "Unbound Text"
      break
    case "staticText":
      {
        const staticText = (selectedElement as StaticTextElement).text
        identifier = staticText.length > 20 ? staticText.slice(0, 20) + "..." : staticText
      }
      break
    case "image":
      identifier = (selectedElement as ImageElement).bind || "Unbound Image"
      break
    case "staticImage":
      {
        const displayedText = selectedElement.src ? selectedElement.src.split("/").pop() || "Image" : "Image"
        identifier = displayedText.length > 20 ? displayedText.slice(0, 20) + "..." : displayedText
      }
      break
    default:
      identifier = ""
  }

  return (
    <div className={styles.panel}>
      <h3>Properties</h3>

      {/* Text Properties */}
      {isText && (
        <>
          <h4>{identifier}</h4>
          <label>Font:
            <select
              value={selectedElement.fontFamily}
              onChange={(e) =>
                updateElement(selectedElement.id, { fontFamily: e.target.value })
              }
            >
              {allFonts.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </label>

          <label>Color:
            <input
              type="color"
              value={selectedElement.color}
              onChange={(e) =>
                updateElement(selectedElement.id, { color: e.target.value })
              }
            />
          </label>

          <label>Size:
            <input
              type="number"
              value={selectedElement.fontSize}
              onChange={(e) =>
                updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })
              }
            />
          </label>

          <label>Opacity:
            <input
              type="number"
              value={selectedElement.opacity ?? 1}
              max={1}
              min={0}
              step={0.01}
              onChange={(e) =>
                updateElement(selectedElement.id, { opacity: parseFloat(e.target.value) })
              }
            />
          </label>

          <label>Align:
            <select
              value={selectedElement.align}
              onChange={(e) =>
                updateElement(selectedElement.id, { align: e.target.value as "left" | "center" | "right" })
              }
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </label>

          <label>Max Width:
            <input
              type="number"
              value={selectedElement.maxWidth ?? selectedElement.width}
              onChange={(e) =>
                updateElement(selectedElement.id, { maxWidth: parseInt(e.target.value) })
              }
            />
          </label>

          <label>Max Height:
            <input
              type="number"
              value={selectedElement.maxHeight ?? selectedElement.height}
              onChange={(e) =>
                updateElement(selectedElement.id, { maxHeight: parseInt(e.target.value) })
              }
            />
          </label>
        </>
      )}

      {/* Image Properties */}
      {isImage && (
        <>
          <h4>{identifier}</h4>

          <label>Opacity:
            <input
              type="number"
              value={selectedElement.opacity ?? 1}
              max={1}
              min={0}
              step={0.01}
              onChange={(e) =>
                updateElement(selectedElement.id, { opacity: parseFloat(e.target.value) })
              }
            />
          </label>

          <label>Width:
            <input
              type="number"
              value={selectedElement.width}
              onChange={(e) =>
                updateElement(selectedElement.id, { width: parseInt(e.target.value) })
              }
            />
          </label>

          <label>Height:
            <input
              type="number"
              value={selectedElement.height}
              onChange={(e) =>
                updateElement(selectedElement.id, { height: parseInt(e.target.value) })
              }
            />
          </label>
        </>
      )}
      <hr />
      <label>Layers</label>
      {/* Z-Index Controls */}
      <button onClick={() => updateElement(selectedElement.id, { zIndex: (selectedElement.zIndex ?? 0) + 1 })}>
        Bring Forward
      </button>

      <button onClick={() => updateElement(selectedElement.id, { zIndex: (selectedElement.zIndex ?? 0) - 1 })}>
        Send Backward
      </button>

      <hr />
      <button onClick={() => deleteElement(selectedElement.id)}>
        Delete Element
      </button>
    </div>
  )
}
