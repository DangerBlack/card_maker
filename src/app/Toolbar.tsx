import { useState, useMemo, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { useEditorStore } from "../store/editorStore"
import styles from "./Toolbar.module.css"
import { ProcessRulesModal } from "../modal/ProcessRuleModal"

export default function Toolbar() {
  const addElement = useEditorStore((s) => s.addElement)
  const sampleCards = useEditorStore((s) => s.sampleCards)
  const setSampleCards = useEditorStore((s) => s.setSampleCards)

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
          fontSize: 30,
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
        fontSize: 30,
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

      {showRules && <ProcessRulesModal onClose={() => setShowRules(false)} />}
    </div>
  )
}
