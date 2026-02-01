import { useState, useMemo, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { useEditorStore } from "../store/editorStore"
import styles from "./Toolbar.module.css"
import { ProcessRulesModal } from "../modal/ProcessRuleModal"
import { SAFE_MARGIN } from "../canvas/CanvasStage"

export default function Toolbar() {
  const addElement = useEditorStore((s) => s.addElement)
  const sampleCards = useEditorStore((s) => s.sampleCards)
  const setSampleCards = useEditorStore((s) => s.setSampleCards)
  const width = useEditorStore((s) => s.template.width)
  const height = useEditorStore((s) => s.template.height)

  const jsonFields = useMemo(() => {
    const allKeys = new Set<string>()
    sampleCards.forEach(card => Object.keys(card).forEach(key => allKeys.add(key)))
    return Array.from(allKeys)
  }, [sampleCards])
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
        x: SAFE_MARGIN+2,
        y: SAFE_MARGIN+2,
        width: width / 2,
        height: height / 2,
        src: reader.result as string,
        zIndex: 0
      })
    }
    reader.readAsDataURL(file)
  }

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file)
      return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        let data: Record<string, string>[] = [];
        if (file.name.endsWith(".json")) {
          data = JSON.parse(reader.result as string)
          if (!Array.isArray(data))
            throw new Error("JSON must be an array")
        } else if (file.name.endsWith(".csv")) {
          const text = reader.result as string
          const lines = text.split("\n").filter(line => line.trim() !== "")
          const headers = lines[0].split(",").map(h => h.trim())
          data = lines.slice(1).map(line => {
            const values = line.split(",").map(v => v.trim())
            const record: Record<string, string> = {}
            headers.forEach((header, index) => {
              record[header] = values[index] || ""
            })
            return record
          })
        }
        setSampleCards(data)
      }
      catch (err) {
        console.error(err)
      }
    }
    reader.readAsText(file)
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
          x: SAFE_MARGIN+2,
          y: SAFE_MARGIN+2,
          width: width - ((SAFE_MARGIN+4) * 2),
          height: 30,
          fontSize: 30,
          fontFamily: "Arial",
          color: "black",
          align: "center",
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

      <button onClick={() => setShowRules(true)}>
        Add / Edit Process Rules
      </button>

      <div>
        <label>Bind JSON Field</label>
        <select value={selectedField} onChange={(e) => setSelectedField(e.target.value)}>
          {jsonFields.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      <button onClick={() => addElement({
        id: uuidv4(),
        type: "text",
        x: SAFE_MARGIN+2,
        y: SAFE_MARGIN,
        width: width - ((SAFE_MARGIN+4) * 2),
        height: 40,
        fontSize: 30,
        fontFamily: "Arial",
        color: "black",
        align: "center",
        bind: selectedField,
        zIndex: 1
      })}>Add Dynamic Text</button>

      <button onClick={() => addElement({
        id: uuidv4(),
        type: "image",
        x: SAFE_MARGIN+2,
        y: SAFE_MARGIN+2,
        width: width / 2,
        height: height / 2,
        bind: selectedField,
        zIndex: 1
      })}>Add Dynamic Image</button>

      {showRules && <ProcessRulesModal onClose={() => setShowRules(false)} />}
    </div>
  )
}
