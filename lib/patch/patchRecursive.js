var patchOp = require("./patchOp")

function patchRecursive(rootNode, patches) {
  var index = domIndex(rootNode, patches.paths)

  for (var i in patches.paths) {
    rootNode = applyPatch(rootNode, index[i], patches[i])
  }

  return rootNode
}

function domIndex(rootNode, paths) {
  var index = {}

  for (var i in paths) {
    index[i] = getNodeByPath(rootNode, paths[i])
  }

  return index
}

function getNodeByPath(rootNode, path) {
    var nodes = [rootNode]

    for (var i = 0; i < path.length; i++) {
        var node = nodes[path[i]]
        nodes = node && node.childNodes
    }

    return node
}

function applyPatch(rootNode, domNode, patchList) {
  if (!domNode) {
    return rootNode
  }

  var newNode

  for (var i = 0; i < patchList.length; i++) {
    newNode = patchOp(patchList[i], domNode, patchRecursive)

    if (domNode === rootNode) {
      rootNode = newNode
    }
  }

  return rootNode
}

module.exports = patchRecursive;
