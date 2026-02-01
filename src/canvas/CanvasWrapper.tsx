import { useEditorStore } from "../store/editorStore"
import { v4 as uuidv4 } from "uuid"
import { useState, useCallback } from "react"
import style from "./CanvasWrapper.module.css"

export default function CanvasWrapper({ children, width, height }: { children: React.ReactNode, width: number, height: number }) {
  const addElement = useEditorStore((s) => s.addElement)
  const setSampleCards = useEditorStore((s) => s.setSampleCards)
  const importTemplate = useEditorStore((s) => s.importTemplate)
  const [dragOver, setDragOver] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)

    const file = e.dataTransfer.files[0]
    if (!file) return

    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = () => {
        addElement({
          id: uuidv4(),
          type: "staticImage",
          x: 50,
          y: 50,
          width: 400,
          height: 600,
          src: reader.result as string,
          zIndex: 0,
        })
      }
      reader.readAsDataURL(file)
    } else if (file.type === "application/json") {
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string)
          if(Array.isArray(data)) 
                setSampleCards(data)
          else if(data.template) 
                importTemplate(reader.result as string)
          else
            throw new Error("JSON must be an array")
        } catch (err) {
          console.error("Invalid JSON file", err)
        }
      }
      reader.readAsText(file)
    }
  }, [addElement, setSampleCards, importTemplate])

  return (
    <div
      className={style.canvasWrapper}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {children}
      {dragOver && (
        <div style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,170,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          fontWeight: "bold",
          color: "#00aaff",
          pointerEvents: "none",
        }}>
          Drop file here
        </div>
      )}
    </div>
  )
}
