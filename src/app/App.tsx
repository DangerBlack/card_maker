import CanvasStage from "../canvas/CanvasStage"
import Toolbar from "./Toolbar"
import PropertiesPanel from "./PropertiesPanel"
import { useEditorStore } from "../store/editorStore"
import { useState } from "react"
import styles from "./App.module.css"
import MenuBar from "./MenuBar"
import CanvasWrapper from "../canvas/CanvasWrapper"
import {CardsPreviewGrid} from "../preview/CardsPreviewGrid"

export default function App() {
  const sampleCards = useEditorStore((s) => s.sampleCards)
  const [cardIndex, setCardIndex] = useState(0)
  const prevCard = () => setCardIndex((i) => Math.max(i - 1, 0))
  const nextCard = () => setCardIndex((i) => Math.min(i + 1, sampleCards.length - 1))
  const showPreview = useEditorStore((s) => s.showPreview)

  return (
    <div className={styles.root}>
      {/* Top menubar */}
      <MenuBar />
      <div className={styles.app}>
        {/* Toolbar */}
        <Toolbar />

        {/* Canvas */}
        {showPreview ? <CardsPreviewGrid /> :
        <CanvasWrapper width={useEditorStore.getState().template.width} height={useEditorStore.getState().template.height}>
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
        </CanvasWrapper>
        }

        {/* Properties Panel */}
        <PropertiesPanel />
      </div>
    </div>
  )
}
