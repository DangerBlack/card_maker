import CanvasStage from "../canvas/CanvasStage"
import Toolbar from "./Toolbar"
import PropertiesPanel from "./PropertiesPanel"
import { useEditorStore } from "../store/editorStore"
import { useState } from "react"
import styles from "./App.module.css"

export default function App() {
  const sampleCards = useEditorStore((s) => s.sampleCards)
  const [cardIndex, setCardIndex] = useState(0)
  const prevCard = () => setCardIndex((i) => Math.max(i - 1, 0))
  const nextCard = () => setCardIndex((i) => Math.min(i + 1, sampleCards.length - 1))

  return (
    <div className={styles.root}>
      <div className={styles.app}>
        {/* Toolbar */}
        <Toolbar />

        {/* Canvas */}
        <div className={styles.canvasWrapper}>
          <div className={styles.cardNav}>
            <button onClick={prevCard} disabled={cardIndex === 0}>
              ◀ Prev
            </button>
            <span>
              Card {cardIndex + 1} / {sampleCards.length}
            </span>
            <button onClick={nextCard} disabled={cardIndex === sampleCards.length - 1}>
              Next ▶
            </button>
          </div>

          <CanvasStage cardIndex={cardIndex} />
        </div>

        {/* Properties Panel */}
        <PropertiesPanel />
      </div>
    </div>
  )
}
