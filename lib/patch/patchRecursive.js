var domIndex = require("./domIndex")
var patchOp = require("./patchOp")

function patchRecursive(rootNode, patches, options) {
  options = options || {}
  var indices = patchIndices(patches)

  if (indices.length === 0) {
    return rootNode
  }

  var index = domIndex(rootNode, indices, patches.a)

  for (var i = 0; i < indices.length; i++) {
    var nodeIndex = indices[i]
    rootNode = applyPatch(rootNode, index[nodeIndex], patches[nodeIndex], options)
  }

  return rootNode
}

function applyPatch(rootNode, domNode, patchList, options) {
  if (!domNode) {
    return rootNode
  }

  var newNode
  var beforePatch = options && options.beforePatch

  for (var i = 0; i < patchList.length; i++) {
    if (beforePatch && beforePatch(domNode, patchList[i]) === false)
      continue;

    newNode = patchOp(patchList[i], domNode, patchRecursive)

    if (domNode === rootNode) {
      rootNode = newNode
    }
  }

  return rootNode
}

function patchIndices(patches) {
  var indices = [],
      index;

  for (var key in patches) {
    index = + key;
    if (index || index === 0) {
      indices.push(index);
    }
  }

  return indices;
}


module.exports = patchRecursive;
