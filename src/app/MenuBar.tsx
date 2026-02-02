import { useState } from "react"
import { useEditorStore } from "../store/editorStore"
import { renderCardToDataURL } from "../utils/renderCardsToCanvas"
import JSZip from "jszip"
import { saveAs } from "file-saver"
import styles from "./MenuBar.module.css"
import { CardSizeModal } from "../modal/CardSizeModal"
import { AddFontModal } from "../modal/AddFontModal"

const KOFI_URL = import.meta.env.VITE_STATIC_KOFI_URL;
console.log("KOFI_URL:", KOFI_URL);
export default function MenuBar() {
    const exportTemplate = useEditorStore((s) => s.exportTemplate)
    const importTemplate = useEditorStore((s) => s.importTemplate)
    const template = useEditorStore((s) => s.template)
    const sampleCards = useEditorStore((s) => s.sampleCards)
    const setSampleCards = useEditorStore((s) => s.setSampleCards)
    const setCardSize = useEditorStore((s) => s.setCardSize)
    const [showCardSizeModal, setShowCardSizeModal] = useState(false)
    const [showAddFontModal, setShowAddFontModal] = useState(false)
    const toggleGuides = useEditorStore((s) => s.toggleGuides)
    const toggleGrid = useEditorStore((s) => s.toggleGrid)
    const togglePreview = useEditorStore((s) => s.togglePreview)
    const clearHistory = useEditorStore((s) => s.clearHistory)
    const undo = useEditorStore((s) => s.undo)
    const redo = useEditorStore((s) => s.redo)
    const historySize = useEditorStore((s) => s.history.length)
    const historyIndex = useEditorStore((s) => s.historyIndex)

    const showGuides = useEditorStore((s) => s.showGuides)
    const showGrid = useEditorStore((s) => s.showGrid)
    const showPreview = useEditorStore((s) => s.showPreview)

    const templateWidth = useEditorStore((s) => s.template.width)
    const templateHeight = useEditorStore((s) => s.template.height)

    const [importError, setImportError] = useState("")

    const cardSizes = [
        { label: "600x825 Mini Deck", width: 600, height: 825 },
        { label: "750x1125 Bridge Deck/Us Game Deck", width: 750, height: 1125 },
        { label: "825x1125 Euro Poker Deck", width: 825, height: 1125 },
        { label: "900x1500 Tarot Deck", width: 900, height: 1500 },
    ]

    const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
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
                setImportError("")
            }
            catch (err) {
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

    const newProject = () => {
        const emptyTemplate = {
            width: 750,
            height: 1125,
            elements: [],
            customFonts: [],
        }

        clearHistory()
        importTemplate(JSON.stringify({ template: emptyTemplate, processRules: [] }))
        setSampleCards([])
    }

    return (
        <>
            <div className={styles.menuBar}>
                <div className={styles.menu}>
                    <span className={styles.menuTitle}>File</span>
                    <div className={styles.dropdown}>
                        <button onClick={newProject}>New project</button>
                        <hr />
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
                        <button onClick={() => undo()} disabled={historyIndex <= 0}>Undo</button>
                        <button onClick={() => redo()} disabled={historyIndex >= historySize - 1}>Redo</button>
                        <hr />
                        <button onClick={() => setShowAddFontModal(true)}>Add Font</button>
                        <hr />
                        <div style={{ display: "block", marginTop: 8 }}>
                            <div style={{ fontWeight: 500, marginBottom: 4 }}>Card Size:</div>
                            {cardSizes.map((cs) => {
                                const selected = templateWidth === cs.width && templateHeight === cs.height
                                return (
                                    <button
                                        key={cs.label}
                                        style={{
                                            display: "block",
                                            width: "100%",
                                            textAlign: "left",
                                            background: selected ? "#e0e0e0" : undefined,
                                            fontWeight: selected ? "bold" : undefined,
                                        }}
                                        onClick={() => setCardSize(cs.width, cs.height)}
                                    >
                                        {cs.label}
                                    </button>
                                )
                            })}
                        </div>
                        <button onClick={() => setShowCardSizeModal(true)}>Custom Card Size</button>
                    </div>
                </div>
                <div className={styles.menu}>
                    <span className={styles.menuTitle}>View</span>
                    <div className={styles.dropdown}>
                        <button onClick={toggleGuides}><input type="checkbox" checked={showGuides} readOnly /> Toggle Guides </button>
                        <button onClick={toggleGrid}><input type="checkbox" checked={showGrid} readOnly /> Toggle Grid </button>
                        <button onClick={togglePreview}><input type="checkbox" checked={showPreview} readOnly /> Toggle Preview </button>
                    </div>
                </div>
                { KOFI_URL &&
                <a href={KOFI_URL} target='_blank'>
                    <img style={{ border: "0px", height: "24px", verticalAlign: "middle" }} src='https://storage.ko-fi.com/cdn/kofi6.png?v=6' alt='Buy Me a Coffee at ko-fi.com' />
                </a>
                }
            </div>
            {showCardSizeModal && <CardSizeModal onClose={() => setShowCardSizeModal(false)} />}
            {showAddFontModal && <AddFontModal onClose={() => setShowAddFontModal(false)} />}
        </>
    )
}
