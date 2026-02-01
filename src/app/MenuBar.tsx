import { useState } from "react"
import { useEditorStore } from "../store/editorStore"
import { renderCardToDataURL } from "../utils/renderCardsToCanvas"
import JSZip from "jszip"
import { saveAs } from "file-saver"
import styles from "./MenuBar.module.css"
import { CardSizeModal } from "../modal/CardSizeModal"
import { AddFontModal } from "../modal/AddFontModal"

export default function MenuBar() {
    const exportTemplate = useEditorStore((s) => s.exportTemplate)
    const importTemplate = useEditorStore((s) => s.importTemplate)
    const template = useEditorStore((s) => s.template)
    const sampleCards = useEditorStore((s) => s.sampleCards)
    const setSampleCards = useEditorStore((s) => s.setSampleCards)
    const setCardSize = useEditorStore((s) => s.setCardSize)
    const [showCardSizeModal, setShowCardSizeModal] = useState(false)
    const [showAddFontModal, setShowAddFontModal] = useState(false)

    const [importError, setImportError] = useState("")

    const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => {
            try {
                const data = JSON.parse(reader.result as string)
                if (!Array.isArray(data)) throw new Error("JSON must be an array")
                setSampleCards(data)
                setImportError("")
            } catch (err) {
                console.log("Invalid JSON file", err)
                setImportError("Invalid JSON file")
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
        <>
        <div className={styles.menuBar}>
            <div className={styles.menu}>
                <span className={styles.menuTitle}>File</span>
                <div className={styles.dropdown}>
                    <label>
                        Import Card
                        <input type="file" accept=".json" onChange={handleJsonUpload} className={styles.hiddenInput} />
                    </label>
                    <hr />
                    <label>Import Template
                        <input type="file" accept=".json" onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const reader = new FileReader()
                        reader.onload = () => importTemplate(reader.result as string)
                        reader.readAsText(file)
                        }} className={styles.hiddenInput} />
                    </label>
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
                    <hr />
                    <button onClick={exportCards}>Export Cards (PNG)</button>
                    {importError && <span className={styles.error}>{importError}</span>}
                </div>
            </div>
            <div className={styles.menu}>
                <span className={styles.menuTitle}>Edit</span>
                <div className={styles.dropdown}>
                    <button onClick={() => setShowAddFontModal(true)}>Add Font</button>
                    <hr />
                    <div style={{ display: "block", marginTop: 8 }}>
                        <div style={{ fontWeight: 500, marginBottom: 4 }}>Card Size:</div>
                        <button
                            style={{
                                display: "block",
                                width: "100%",
                                textAlign: "left",
                                background: template.width === 600 && template.height === 825 ? "#e0e0e0" : undefined,
                                fontWeight: template.width === 600 && template.height === 825 ? "bold" : undefined
                            }}
                            onClick={() => setCardSize(600, 825)}
                        >600x825 Mini Deck</button>
                        <button
                            style={{
                                display: "block",
                                width: "100%",
                                textAlign: "left",
                                background: template.width === 750 && template.height === 1125 ? "#e0e0e0" : undefined,
                                fontWeight: template.width === 750 && template.height === 1125 ? "bold" : undefined
                            }}
                            onClick={() => setCardSize(750, 1125)}
                        >750x1125 Bridge Deck</button>
                        <button
                            style={{
                                display: "block",
                                width: "100%",
                                textAlign: "left",
                                background: template.width === 825 && template.height === 1125 ? "#e0e0e0" : undefined,
                                fontWeight: template.width === 825 && template.height === 1125 ? "bold" : undefined
                            }}
                            onClick={() => setCardSize(825, 1125)}
                        >825x1125 Euro Poker Deck</button>
                        <button
                            style={{
                                display: "block",
                                width: "100%",
                                textAlign: "left",
                                background: template.width === 750 && template.height === 1125 ? "#e0e0e0" : undefined,
                                fontWeight: template.width === 750 && template.height === 1125 ? "bold" : undefined
                            }}
                            onClick={() => setCardSize(750, 1125)}
                        >750x1125 US Game Deck</button>
                        <button
                            style={{
                                display: "block",
                                width: "100%",
                                textAlign: "left",
                                background: template.width === 900 && template.height === 1500 ? "#e0e0e0" : undefined,
                                fontWeight: template.width === 900 && template.height === 1500 ? "bold" : undefined
                            }}
                            onClick={() => setCardSize(900, 1500)}
                        >900x1500 Tarot Deck</button>
                    </div>
                    <button onClick={() => setShowCardSizeModal(true)}>Custom Card Size</button>
                </div>
            </div>
            <div className={styles.menu}>
                <span className={styles.menuTitle}>View</span>
                <div className={styles.dropdown}>
                    
                </div>
            </div>
        </div>
        {showCardSizeModal && <CardSizeModal onClose={() => setShowCardSizeModal(false)} />}
        {showAddFontModal && <AddFontModal onClose={() => setShowAddFontModal(false)} />}
        </>
    )
}
