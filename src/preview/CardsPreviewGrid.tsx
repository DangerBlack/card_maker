import { useState, useEffect, useRef,useCallback } from "react"
import { useEditorStore } from "../store/editorStore"
import { renderCardToDataURL } from "../utils/renderCardsToCanvas"
import styles from "./CardsPreviewGrid.module.css"

export function CardsPreviewGrid() {
  const template = useEditorStore((s) => s.template)
  const sampleCards = useEditorStore((s) => s.sampleCards)
  const [images, setImages] = useState<(string | null)[]>(Array(sampleCards.length).fill(null))
  const containerRef = useRef<HTMLDivElement>(null)
  const CARD_WIDTH = 150
  const CARD_HEIGHT = (template.height / template.width) * CARD_WIDTH
  const BATCH_SIZE = 5 // only 5 cards at a time

  // queue for lazy rendering
  const renderQueueRef = useRef<number[]>([])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const processQueue = async () => {
    if (renderQueueRef.current.length === 0) return
    const batch = renderQueueRef.current.splice(0, BATCH_SIZE)
    await Promise.all(batch.map(async (i) => {
      if (!images[i]) {
        try {
          const url = await renderCardToDataURL(template, sampleCards[i])
          setImages(prev => {
            const copy = [...prev]
            copy[i] = url
            return copy
          })
        } catch (err) {
          console.error("Failed to render card", i, err)
        }
      }
    }))
    if (renderQueueRef.current.length > 0) {
      requestAnimationFrame(processQueue) // schedule next batch
    }
  }

  const enqueueVisibleCards = useCallback(() => {
    if (!containerRef.current) return
    const scrollTop = containerRef.current.scrollTop
    const containerHeight = containerRef.current.clientHeight
    const itemsPerRow = Math.floor(containerRef.current.clientWidth / CARD_WIDTH)
    const startRow = Math.floor(scrollTop / CARD_HEIGHT)
    const endRow = Math.ceil((scrollTop + containerHeight) / CARD_HEIGHT) + 2 // buffer rows

    const newQueue: number[] = []
    for (let row = startRow; row <= endRow; row++) {
      for (let col = 0; col < itemsPerRow; col++) {
        const idx = row * itemsPerRow + col
        if (idx < sampleCards.length && !images[idx]) newQueue.push(idx)
      }
    }
    renderQueueRef.current.push(...newQueue)
    requestAnimationFrame(processQueue)
  }, [CARD_HEIGHT, images, processQueue, sampleCards.length])

  useEffect(() => {
    enqueueVisibleCards()
  }, [enqueueVisibleCards, sampleCards, template])

  return (
    <div
      className={styles.gridContainer}
      ref={containerRef}
      onScroll={enqueueVisibleCards}
    >
      {images.map((url, i) => (
        <div
          key={i}
          className={styles.cardWrapper}
          style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
        >
          {url ? (
            <img src={url} style={{ width: "100%", height: "100%", border: "1px solid #ccc" }} />
          ) : (
            <div className={styles.placeholder} />
          )}
        </div>
      ))}
    </div>
  )
}
