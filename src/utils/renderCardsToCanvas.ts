import type { CardTemplate } from "../models/Template"

// Renders one card to a canvas and returns a data URL
import Konva from "konva"
import { resolveText, resolveImage } from "./jsonBinding"
import type { CardElement } from "../models/Element"

const STATIC_IMAGE_PROXY = import.meta.env.VITE_STATIC_IMAGE_PROXY

export async function renderCardToDataURL(
    template: CardTemplate,
    cardData: Record<string, string>
): Promise<string> {
    const stage = new Konva.Stage({
        width: template.width,
        height: template.height,
        container: document.createElement("div")
    })

    const layer = new Konva.Layer()
    stage.add(layer)

    for (const el of template.elements.sort((a: CardElement, b: CardElement) => (a.zIndex ?? 0) - (b.zIndex ?? 0))) {
        if (el.type === "text" || el.type === "staticText") {
            layer.add(
                new Konva.Text({
                    x: el.x,
                    y: el.y,
                    width: el.maxWidth ?? el.width,
                    height: el.maxHeight,
                    text: el.type === "staticText" ? el.text : resolveText(el, cardData),
                    fontSize: el.fontSize,
                    fontFamily: el.fontFamily,
                    fill: el.color,
                    align: el.align ?? "left",
                    verticalAlign: "top",
                    wrap: "word",
                    opacity: el.opacity,
                })
            )
        }

        if (el.type === "image" || el.type === "staticImage") {
            const img = new Image()
            img.crossOrigin = "anonymous"
            img.src = el.type === "staticImage"
                ? el.src
                : resolveImage({ ...el }, cardData)
            if(el.type === "image" && STATIC_IMAGE_PROXY)
                img.src = STATIC_IMAGE_PROXY + encodeURIComponent(img.src)

            await new Promise<void>((res, rej) => {
                img.onload = () => res()
                img.onerror = () => rej()
            })

            const imgRatio = img.width / img.height
            const boxRatio = el.width / el.height

            let drawWidth = el.width
            let drawHeight = el.height
            let offsetX = 0
            let offsetY = 0

            if (imgRatio > boxRatio) {
                // image is wider than bounding box
                drawWidth = el.width
                drawHeight = el.width / imgRatio
                offsetY = (el.height - drawHeight) / 2
            } else {
                // image is taller than bounding box
                drawHeight = el.height
                drawWidth = el.height * imgRatio
                offsetX = (el.width - drawWidth) / 2
            }

            layer.add(
                new Konva.Image({
                    x: el.x + offsetX,
                    y: el.y + offsetY,
                    width: drawWidth,
                    height: drawHeight,
                    opacity: el.opacity,
                    image: img,
                })
            )
        }
    }

    layer.draw()

    const dataURL = stage.toDataURL({ pixelRatio: 2 })
    stage.destroy()

    return dataURL
}
