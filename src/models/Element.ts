export type CardElement =
  | TextElement
  | ImageElement
  | StaticTextElement
  | StaticImageElement

export interface BaseElement {
  id: string
  x: number
  y: number
  width: number
  height: number
  zIndex?: number // optional
}

export interface TextElement extends BaseElement {
  type: "text"
  fontSize: number
  fontFamily: string
  color: string
  align: "left" | "center" | "right"
  bind?: string
  staticText?: string
  maxWidth?: number   // maximum bounding box width
  maxHeight?: number  // maximum bounding box height
}

export interface ImageElement extends BaseElement {
  type: "image"
  src?: string
  bind?: string
}

export interface StaticTextElement extends BaseElement {
  type: "staticText"
  text: string
  fontSize: number
  fontFamily: string
  color: string
  align: "left" | "center" | "right"
  maxWidth?: number
  maxHeight?: number
}

export interface StaticImageElement extends BaseElement {
  type: "staticImage"
  src: string
}