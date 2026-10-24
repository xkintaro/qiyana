type FaceBounds = { x: number; y: number; width: number; height: number };

export function frameArtwork(face: FaceBounds, image: { width: number; height: number }, viewport: { width: number; height: number }) {
  if (!viewport.width || !viewport.height) return { x: 0, y: 0, scale: 1 };
  const margin = Math.min(20, viewport.width * .04);
  const cover = Math.max(viewport.width / image.width, viewport.height / image.height);
  // Extremely tall viewports must not enlarge a face beyond the available width.
  const scale = Math.min(cover, (viewport.width - margin * 2) / (face.width * image.width), (viewport.height - margin * 2) / (face.height * image.height));
  const renderedWidth = image.width * scale;
  const renderedHeight = image.height * scale;
  const portrait = viewport.width / viewport.height < 1;
  const targetX = viewport.width * (portrait ? .67 : .69);
  const targetY = viewport.height * (portrait ? .24 : .28);
  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
  const x = clamp(targetX - (face.x + face.width / 2) * renderedWidth,
    Math.max(Math.min(viewport.width - renderedWidth, 0), margin - face.x * renderedWidth),
    Math.min(Math.max(viewport.width - renderedWidth, 0), viewport.width - margin - (face.x + face.width) * renderedWidth));
  const y = clamp(targetY - (face.y + face.height / 2) * renderedHeight,
    Math.max(Math.min(viewport.height - renderedHeight, 0), margin - face.y * renderedHeight),
    Math.min(Math.max(viewport.height - renderedHeight, 0), viewport.height - margin - (face.y + face.height) * renderedHeight));
  return { x, y, scale };
}
