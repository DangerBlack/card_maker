import { useState, useMemo, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { useEditorStore } from "../store/editorStore"
import { renderCardToDataURL } from "../utils/renderCardsToCanvas"
import JSZip from "jszip"
import { saveAs } from "file-saver"
import styles from "./Toolbar.module.css"
import { ProcessRulesModal } from "../modal/ProcessRuleModal"

export default function Toolbar() {
  const addElement = useEditorStore((s) => s.addElement)
  const exportTemplate = useEditorStore((s) => s.exportTemplate)
  const importTemplate = useEditorStore((s) => s.importTemplate)
  const template = useEditorStore((s) => s.template)
  const showGuides = useEditorStore((s) => s.showGuides)
  const toggleGuides = useEditorStore((s) => s.toggleGuides)
  const setCardSize = useEditorStore((s) => s.setCardSize)
  const sampleCards = useEditorStore((s) => s.sampleCards)
  const setSampleCards = useEditorStore((s) => s.setSampleCards)

  const [width, setWidth] = useState(template.width)
  const [height, setHeight] = useState(template.height)
  const jsonFields = useMemo(() => (sampleCards.length > 0 ? Object.keys(sampleCards[0]) : []), [sampleCards])
  const [selectedField, setSelectedField] = useState<string>("")
  const [showRules, setShowRules] = useState(false)

  useEffect(() => {
    if (jsonFields.length === 0) return
    if (!selectedField || !jsonFields.includes(selectedField)) setSelectedField(jsonFields[0])
  }, [jsonFields, selectedField])

  const handleStaticImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      addElement({
        id: uuidv4(),
        type: "staticImage",
        x: 0,
        y: 0,
        width: 400,
        height: 600,
        src: reader.result as string,
        zIndex: 0
      })
    }
    reader.readAsDataURL(file)
  }

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        if (!Array.isArray(data)) throw new Error("JSON must be an array")
        setSampleCards(data)
      } catch (err) {
        console.error(err)
      }
    }
    reader.readAsText(file)
  }

  const exportCards = async () => {
    const zip = new JSZip()
    for (let i = 0; i < sampleCards.length; i++) {
      const dataURL = await renderCardToDataURL(template, sampleCards[i])
      const base64 = dataURL.split(",")[1]
      zip.file(`card_${i + 1}.png`, base64, { base64: true })
    }
    const blob = await zip.generateAsync({ type: "blob" })
    saveAs(blob, "cards.zip")
  }

  return (
    <div className={styles.toolbar}>
      <h2>Toolbar</h2>

      <h3>Static Elements</h3>
      <button onClick={() => {
        const text = prompt("Insert static text")
        if (!text) return
        addElement({
          id: uuidv4(),
          type: "staticText",
          x: 20,
          y: 20,
          width: 200,
          height: 30,
          fontSize: 18,
          fontFamily: "Arial",
          color: "black",
          align: "left",
          text,
          zIndex: 2
        })
      }}>Add Static Text</button>

      <label>
        Upload Static Image
        <input type="file" accept="image/*" onChange={handleStaticImageUpload} />
      </label>

      <hr />

      <h3>Dynamic Elements</h3>
      <label>
        Upload JSON
        <input type="file" accept=".json" onChange={handleJsonUpload} />
      </label>

      <div>
        <label>Bind JSON Field</label>
        <select value={selectedField} onChange={(e) => setSelectedField(e.target.value)}>
          {jsonFields.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      <button onClick={() => setShowRules(true)}>
        Add / Edit Process Rules
      </button>

      <button onClick={() => addElement({
        id: uuidv4(),
        type: "text",
        x: 50,
        y: 50,
        width: 200,
        height: 40,
        fontSize: 20,
        fontFamily: "Arial",
        color: "black",
        align: "left",
        bind: selectedField,
        zIndex: 1
      })}>Add Dynamic Text</button>

      <button onClick={() => addElement({
        id: uuidv4(),
        type: "image",
        x: 50,
        y: 120,
        width: 200,
        height: 200,
        bind: selectedField,
        zIndex: 1
      })}>Add Dynamic Image</button>

      <hr />

      <h3>Template</h3>
      <button onClick={() => {
        const json = exportTemplate()
        const blob = new Blob([json], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "template.json"
        a.click()
        URL.revokeObjectURL(url)
      }}>Export Template</button>

      <label>Import Template
        <input type="file" accept=".json" onChange={(e) => {
          const file = e.target.files?.[0]
          if (!file) return
          const reader = new FileReader()
          reader.onload = () => importTemplate(reader.result as string)
          reader.readAsText(file)
        }} />
      </label>

      <hr />

      <h3>Guides</h3>
      <label className={styles.checkboxLabel}>
        <input type="checkbox" checked={showGuides} onChange={toggleGuides} />
        Show card guides
      </label>

      <hr />

      <h3>Card Size</h3>
      <label>Width
        <input type="number" min={50} value={width} onChange={(e) => setWidth(parseInt(e.target.value))}
          onBlur={() => setCardSize(width, height)} />
      </label>
      <label>Height
        <input type="number" min={50} value={height} onChange={(e) => setHeight(parseInt(e.target.value))}
          onBlur={() => setCardSize(width, height)} />
      </label>
      
      <hr />

      <h3>Export</h3>
      <button onClick={exportCards}>Export Cards (PNG)</button>
      {showRules && <ProcessRulesModal onClose={() => setShowRules(false)} />}
    </div>
  )
}
