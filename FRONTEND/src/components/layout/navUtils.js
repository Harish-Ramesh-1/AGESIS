export function isGroupActive(section, pathname) {
  return section.children.some((child) => pathname.startsWith(child.path))
}
