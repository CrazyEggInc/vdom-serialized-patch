var applyProperties = require("virtual-dom/vdom/apply-properties");
var isVText = require('./isVText');
var isVNode = require('./isVNode');
var hookProperties = require('vdom-as-json/hookProperties');

module.exports = createElement;

function createElement(vnode) {
  var doc = document;

  if (isVText(vnode)) {
    return doc.createTextNode(vnode.x) // 'x' means 'text'
  } else if (!isVNode(vnode)) {
    return null
  }

  var node = (!vnode.n) ? // 'n' === 'namespace'
    doc.createElement(vnode.tn) : // 'tn' === 'tagName'
    doc.createElementNS(vnode.n, vnode.tn)

  var props = vnode.p // 'p' === 'properties'

  if (props) {
    hookProperties(vnode.n, props);
  }

  applyProperties(node, props)

  var children = vnode.c // 'c' === 'children'

  if (children) {
    for (var i = 0; i < children.length; i++) {
      var childNode = createElement(children[i])
      if (childNode) {
        node.appendChild(childNode)
      }
    }
  }

  return node
}
