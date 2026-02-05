import type {ImageElement, TextElement } from "../models/Element"

export function resolveText(el: TextElement, data: Record<string, unknown>) {
  if(el.bind) {
    if(Array.isArray(data[el.bind]))
    {
      return (data[el.bind] as unknown[]).join(", ")
    }

    return String(data[el.bind] ?? "")
  }
  return el.staticText ?? ""
}

export function resolveImage(el: ImageElement, data: Record<string, unknown>) {
  if (el.bind) return String(data[el.bind] ?? "")
  return el.src ?? ""
}