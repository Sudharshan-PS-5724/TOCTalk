/**
 * Regex AST node shapes. All nodes carry the source `pos` (0-based) of the
 * start of the construct for accurate error reporting downstream.
 *
 *   char    { type:'char',    value: string, pos: number }
 *   epsilon { type:'epsilon', pos: number }
 *   star    { type:'star',    child: Node,           pos: number }
 *   concat  { type:'concat',  left:  Node, right: Node, pos: number }
 *   union   { type:'union',   left:  Node, right: Node, pos: number }
 */

export function printAST(node) {
  if (!node) return ''
  switch (node.type) {
    case 'char':
      return node.value
    case 'epsilon':
      return 'ε'
    case 'star':
      return `(${printAST(node.child)})*`
    case 'concat':
      return `${printAST(node.left)}${printAST(node.right)}`
    case 'union':
      return `(${printAST(node.left)}|${printAST(node.right)})`
    default:
      return '?'
  }
}

export function astToTree(node, depth = 0) {
  if (!node) return ''
  const pad = '  '.repeat(depth)
  switch (node.type) {
    case 'char':
      return `${pad}char '${node.value}' @${node.pos}`
    case 'epsilon':
      return `${pad}epsilon @${node.pos}`
    case 'star':
      return `${pad}star @${node.pos}\n${astToTree(node.child, depth + 1)}`
    case 'concat':
      return `${pad}concat @${node.pos}\n${astToTree(node.left, depth + 1)}\n${astToTree(node.right, depth + 1)}`
    case 'union':
      return `${pad}union @${node.pos}\n${astToTree(node.left, depth + 1)}\n${astToTree(node.right, depth + 1)}`
    default:
      return `${pad}?`
  }
}
