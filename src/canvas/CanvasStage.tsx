import { Stage, Layer, Text, Image as KonvaImage, Rect, Group } from "react-konva"
import type { ImageElement, StaticImageElement, StaticTextElement, TextElement } from "../models/Element"
import { useEditorStore } from "../store/editorStore"
import { resolveImage, resolveText } from "../utils/jsonBinding"
import useImage from "use-image"
import { useEffect, useMemo } from "react"
import SelectionBox from "./SelectionBox"
import { Grid } from "./Grid"

export const SAFE_MARGIN = 24
interface CanvasStageProps {
    cardIndex?: number
}

function RenderTextElement({
    el,
    cardData,
    updateElement,
    isSelected,
    setSelectedElement
}: {
    el: TextElement
    cardData: Record<string, unknown>
    updateElement: (id: string, updates: Partial<TextElement>) => void
    isSelected: boolean
    setSelectedElement: (id?: string) => void
}) {
    const width = el.maxWidth ?? el.width
    const height = el.maxHeight ?? el.height

    return (
        <Group
            x={el.x}
            y={el.y}
            draggable
            onDragEnd={(e) =>
                updateElement(el.id, { x: e.target.x(), y: e.target.y() })
            }
            onClick={() => setSelectedElement(el.id)}
            onTap={() => setSelectedElement(el.id)}
        >
            {/* Selection box */}
            {isSelected && (
               <SelectionBox width={width} height={height} />
            )}

            <Text
                width={width}
                height={height}
                fontSize={el.fontSize}
                fontFamily={el.fontFamily}
                fill={el.color}
                text={resolveText(el, cardData)}
                align={el.align}
                verticalAlign="top"
            />
        </Group>
    )
}

function RenderImageElement({
    el,
    cardData,
    updateElement,
    isSelected,
    setSelectedElement
}: {
    el: ImageElement
    cardData: Record<string, unknown>
    updateElement: (id: string, updates: Partial<ImageElement>) => void
    isSelected: boolean
    setSelectedElement: (id?: string) => void
}) {
    const [img] = useImage(resolveImage(el, cardData))
    if (!img) return null

    const imgRatio = img.width / img.height
    const boxRatio = el.width / el.height

    let drawWidth = el.width
    let drawHeight = el.height
    let offsetX = 0
    let offsetY = 0

    if (imgRatio > boxRatio) {
        drawWidth = el.width
        drawHeight = el.width / imgRatio
        offsetY = (el.height - drawHeight) / 2
    } else {
        drawHeight = el.height
        drawWidth = el.height * imgRatio
        offsetX = (el.width - drawWidth) / 2
    }

    return (
        <Group
            x={el.x}
            y={el.y}
            draggable
            onDragEnd={(e) =>
                updateElement(el.id, { x: e.target.x(), y: e.target.y() })
            }
            onClick={() => setSelectedElement(el.id)}
            onTap={() => setSelectedElement(el.id)}
        >
            {/* Selection box */}
            {isSelected && (
                <SelectionBox width={el.width} height={el.height} />
            )}

            {/* Image bounding box (optional visual aid) */}
            {/* <Rect width={el.width} height={el.height} stroke="#ccc" /> */}

            <KonvaImage
                x={offsetX}
                y={offsetY}
                width={drawWidth}
                height={drawHeight}
                image={img}
            />
        </Group>
    )
}

function RenderStaticTextElement({
    el,
    updateElement,
    isSelected,
    setSelectedElement,
}: {
    el: StaticTextElement
    updateElement: (id: string, updates: Partial<StaticTextElement>) => void
    isSelected: boolean
    setSelectedElement: (id?: string) => void
}) {
    const width = el.maxWidth ?? el.width
    const height = el.maxHeight ?? el.height

    return (
        <Group
            x={el.x}
            y={el.y}
            draggable
            onDragEnd={(e) =>
                updateElement(el.id, { x: e.target.x(), y: e.target.y() })
            }
            onClick={() => setSelectedElement(el.id)}
            onTap={() => setSelectedElement(el.id)}
        >
            {/* Selection border */}
            {isSelected && (
                <SelectionBox width={width} height={height} />
            )}

            <Text
                width={width}
                height={height}
                fontSize={el.fontSize}
                fontFamily={el.fontFamily}
                fill={el.color}
                text={el.text}
                align={el.align}
                verticalAlign="top"
            />
        </Group>
    )
}

function RenderStaticImageElement({
    el,
    updateElement,
    isSelected,
    setSelectedElement
}: {
    el: StaticImageElement
    updateElement: (id: string, updates: Partial<StaticImageElement>) => void
    isSelected: boolean
    setSelectedElement: (id?: string) => void
}) {
    const [img] = useImage(el.src)
    if (!img) return null

    const imgRatio = img.width / img.height
    const boxRatio = el.width / el.height

    let drawWidth = el.width
    let drawHeight = el.height
    let offsetX = 0
    let offsetY = 0

    if (imgRatio > boxRatio) {
        drawWidth = el.width
        drawHeight = el.width / imgRatio
        offsetY = (el.height - drawHeight) / 2
    } else {
        drawHeight = el.height
        drawWidth = el.height * imgRatio
        offsetX = (el.width - drawWidth) / 2
    }

    return (
        <Group
            x={el.x}
            y={el.y}
            draggable
            onDragEnd={(e) =>
                updateElement(el.id, { x: e.target.x(), y: e.target.y() })
            }
            onClick={() => setSelectedElement(el.id)}
            onTap={() => setSelectedElement(el.id)}
        >
            {isSelected && (
                <SelectionBox width={el.width} height={el.height} />
            )}

            <KonvaImage
                x={offsetX}
                y={offsetY}
                width={drawWidth}
                height={drawHeight}
                image={img}
            />
        </Group>
    )
}

export default function CanvasStage({ cardIndex = 0 }: CanvasStageProps) {
    const setSelectedElement = useEditorStore((s) => s.setSelectedElement)
    const template = useEditorStore((s) => s.template)
    const updateElement = useEditorStore((s) => s.updateElement)
    const showGuides = useEditorStore((s) => s.showGuides)
    const sampleCards = useEditorStore((s) => s.sampleCards)

    const selectedElementId = useEditorStore((s) => s.selectedElementId)

    useEffect(() => {
        if (!selectedElementId && template.elements.length > 0) {
            setSelectedElement(template.elements[0].id)
        }
    }, [selectedElementId, template.elements, setSelectedElement])
    const sortedElements = useMemo(
        () => [...template.elements].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0)),
        [template.elements]
    )

    const cardData = useMemo(
        () => sampleCards[cardIndex] || {},
        [sampleCards, cardIndex]
    )
    return (
        <Stage width={template.width} height={template.height}>
            <Layer>
                <Grid width={template.width} height={template.height} step={5} color="#000" />
                <Rect
                    x={0}
                    y={0}
                    width={template.width}
                    height={template.height}
                    stroke="#555"
                    strokeWidth={2}
                    listening={false}
                />
                {sortedElements.map((el) => {
                    switch (el.type) {
                        case "text":
                            return <RenderTextElement key={el.id} el={el} cardData={cardData} updateElement={updateElement} isSelected={selectedElementId === el.id} setSelectedElement={setSelectedElement} />
                        case "image":
                            return <RenderImageElement key={el.id} el={el} cardData={cardData} updateElement={updateElement} isSelected={selectedElementId === el.id} setSelectedElement={setSelectedElement} />
                        case "staticText":
                            return <RenderStaticTextElement key={el.id} el={el} updateElement={updateElement} isSelected={selectedElementId === el.id} setSelectedElement={setSelectedElement} />
                        case "staticImage":
                            return <RenderStaticImageElement key={el.id} el={el} updateElement={updateElement}  isSelected={selectedElementId === el.id}setSelectedElement={setSelectedElement} />
                        default:
                            return null
                        }
                    })}
                <Rect
                    x={SAFE_MARGIN}
                    y={SAFE_MARGIN}
                    width={template.width - SAFE_MARGIN * 2}
                    height={template.height - SAFE_MARGIN * 2}
                    stroke="#00aaff"
                    strokeWidth={1}
                    dash={[6, 4]}
                    listening={false}
                    visible={showGuides}
                    zIndex={-1}
                />
            </Layer>
        </Stage>
    )
}