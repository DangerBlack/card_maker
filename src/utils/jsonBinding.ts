import type {ImageElement, TextElement } from "../models/Element"

export function resolveText(el: TextElement, data: Record<string, unknown>) {
  if(el.bind) {
    if(Array.isArray(data[el.bind]))
    {
      return (data[el.bind] as unknown[]).join(", ")
    }

    if(typeof data[el.bind] === "object" && data[el.bind] !== null) {
      return JSON.stringify(data[el.bind])
    }

    return String(data[el.bind] ?? "")
  }
  return el.staticText ?? ""
}

export function resolveImage(el: ImageElement, data: Record<string, unknown>) {
  if (el.bind) return String(data[el.bind] ?? "")
  return el.src ?? ""
}