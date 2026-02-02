import { useState } from "react"
import { BindField } from "./MaxValueField"
import type { ImageElement, StaticTextElement, TextElement } from "../models/Element"
import { useEditorStore } from "../store/editorStore"
import styles from "./PropertiesPanel.module.css"

export default function PropertiesPanel() {
  const template = useEditorStore((s) => s.template)
  const selectedElementId = useEditorStore((s) => s.selectedElementId)
  const updateElement = useEditorStore((s) => s.updateElement)
  const deleteElement = useEditorStore((s) => s.deleteElement)
  const customFonts = useEditorStore((s) => s.template.customFonts)
  const [maxWidthTab, setMaxWidthTab] = useState<'number' | 'field'>('number');
  const [maxHeightTab, setMaxHeightTab] = useState<'number' | 'field'>('number');
  const baseFonts = ["Arial", "Roboto", "Cinzel"]

  const allFonts = [...baseFonts, ...customFonts]

  // Get available fields from sampleCards
  const sampleCards = useEditorStore((s) => s.sampleCards)
  const sampleFields = Array.from(new Set(sampleCards.flatMap(card => Object.keys(card))))

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

          <BindField
            label="Max Width:"
            numberValue={selectedElement.maxWidth}
            fieldValue={selectedElement.width_bind}
            tab={maxWidthTab}
            setTab={setMaxWidthTab}
            onNumberChange={value => updateElement(selectedElement.id, { maxWidth: value, width_bind: undefined })}
            onFieldChange={value => updateElement(selectedElement.id, { width_bind: value, maxWidth: undefined })}
            availableFields={sampleFields}
            fallbackNumber={selectedElement.width}
          />

          <BindField
            label="Max Height:"
            numberValue={selectedElement.maxHeight}
            fieldValue={selectedElement.height_bind}
            tab={maxHeightTab}
            setTab={setMaxHeightTab}
            onNumberChange={value => updateElement(selectedElement.id, { maxHeight: value, height_bind: undefined })}
            onFieldChange={value => updateElement(selectedElement.id, { height_bind: value, maxHeight: undefined })}
            availableFields={sampleFields}
            fallbackNumber={selectedElement.height}
          />
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

          <BindField
            label="Width:"
            numberValue={selectedElement.width}
            fieldValue={selectedElement.width_bind}
            tab={maxWidthTab}
            setTab={setMaxWidthTab}
            onNumberChange={value => updateElement(selectedElement.id, { width: value, width_bind: undefined })}
            onFieldChange={value => updateElement(selectedElement.id, { width_bind: value})}
            availableFields={sampleFields}
            fallbackNumber={selectedElement.width}
          />

          <BindField
            label="Height:"
            numberValue={selectedElement.height}
            fieldValue={selectedElement.height_bind}
            tab={maxHeightTab}
            setTab={setMaxHeightTab}
            onNumberChange={value => updateElement(selectedElement.id, { height: value, height_bind: undefined })}
            onFieldChange={value => updateElement(selectedElement.id, { height_bind: value })}
            availableFields={sampleFields}
            fallbackNumber={selectedElement.height}
          />
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
