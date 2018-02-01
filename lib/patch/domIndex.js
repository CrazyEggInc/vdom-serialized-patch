// Maps a virtual DOM tree onto a real DOM tree in an efficient manner.
// We don't want to read all of the DOM nodes in the tree so we use
// the in-order tree indexing to eliminate recursion down certain branches.
// We only recurse into a DOM node if we know that it contains a child of
// interest.

var noChild = {}

module.exports = domIndex

function domIndex(rootNode, indices, tree) {
  if (!indices || indices.length === 0) {
    return {}
  } else {
    indices.sort(ascending)
    if (tree) // if serialized tree is present, use faster algorithm to index DOM elements
      return recurseSerializedTree(rootNode, tree, indices)
    else
      return recurseDom(rootNode, indices)
  }
}

function recurseSerializedTree(rootNode, tree, indices, nodes, rootIndex) {
  nodes = nodes || {}
  rootIndex = rootIndex || 0

  if (rootNode) {
    if (indexInRange(indices, rootIndex, rootIndex)) {
      nodes[rootIndex] = rootNode
    }

    var treeChildren = tree[0];

    if (treeChildren) {

      var childNodes = rootNode.childNodes

      for (var i = 0; i < treeChildren.length; i++) {
        rootIndex += 1

        var vChild = treeChildren[i] || noChild
        var nextIndex = rootIndex + (vChild[1] || 0)

        // skip recursion down the tree if there are no nodes down here
        if (indexInRange(indices, rootIndex, nextIndex)) {
          recurseSerializedTree(childNodes[i], vChild, indices, nodes, rootIndex)
        }

        rootIndex = nextIndex
      }
    }
  }

  return nodes
}

// Binary search for an index in the interval [left, right]
function indexInRange(indices, left, right) {
  if (indices.length === 0) {
    return false
  }

  var minIndex = 0
  var maxIndex = indices.length - 1
  var currentIndex
  var currentItem

  while (minIndex <= maxIndex) {
    currentIndex = ((maxIndex + minIndex) / 2) >> 0
    currentItem = indices[currentIndex]

    if (minIndex === maxIndex) {
      return currentItem >= left && currentItem <= right
    } else if (currentItem < left) {
      minIndex = currentIndex + 1
    } else if (currentItem > right) {
      maxIndex = currentIndex - 1
    } else {
      return true
    }
  }

  return false;
}

// straightforward way of searching elements by indices:
// traverse DOM tree in-depth until elements for all indices are found
function recurseDom(originalDOM, indices) {
  var paths = {}
  indices = indices.slice()

  depthFirstSearch([originalDOM], function(node, index) {
    // indices are ordered ascending, so we always check for the first index in the list;
    // when it's reached, remember indexed node and shift indices array
    if (index === indices[0]) {
      paths[index] = node
      indices.shift()
    }

    // stop searching when all indices are found
    return indices.length > 0
  })

  return paths
}

function depthFirstSearch(nodes, delegate, index) {
  index = index || {value: 0} // we use object instead of simple number to mutate it throughout the recursion

  for (var i = 0; i < nodes.length; i++) {
    if (delegate(nodes[i], index.value) === false)
      return false // interrupt recursion

    index.value++

    var children = nodes[i].childNodes
    if (children && depthFirstSearch(children, delegate, index) === false)
      return false // propagate interruption
  }
}

function ascending(a, b) {
  return a > b ? 1 : -1
}
