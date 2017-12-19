var patchTypes = require('../patchTypes');
var toJson = require('vdom-as-json/toJson');

// traverse the thing that the original patch structure called "a',
// i.e. the virtual tree representing the current node structure.
function getVDomPathToIndex(tree, index) {
  var path = [];

  for (var i = 0; i < tree.length && index >= 0; i++) {
    var node = tree[i];
    var children = node && node.children || [];
    var numNodes = node && node.count || 0;

    index--; // decrement to account for current node

    if (index < numNodes) {
      // when actual index is less than number of nested nodes, go deeper in the tree
      path = path.concat(i, getVDomPathToIndex(children, index));
      break;
    } else {
      index -= numNodes; // skip all nested nodes and search further
    }
  }

  return path;
}

function serializeVirtualPatchOrPatches(vPatch) {
  if (Array.isArray(vPatch)) {
    var len = vPatch.length;
    var res = new Array(len);
    var i = -1;
    while (++i < len) {
      res[i] = serializeVirtualPatch(vPatch[i]);
    }
    return res;
  }
  return [serializeVirtualPatch(vPatch)];
}

function serializeVirtualPatch(vPatch) {
  var type = vPatch.type;
  var res = [
    type,
    vPatch.patch && vPatch.patch.a ? toJson(serializeRootPatch(vPatch.patch)) : toJson(vPatch.patch)
  ];

  if (type === patchTypes.PROPS) {
    // this is the only time the vNode is needed
    res.push({p: vPatch.vNode.properties}); // 'p' === 'properties'
  }
  return res;
}

function serializeRootPatch(patch) {
  var res = {
    paths: {}
  };

  for (var index in patch) {
    index = Number(index);
    if (index >= 0) {
      res[index] = serializeVirtualPatchOrPatches(patch[index]);
      res.paths[index] = getVDomPathToIndex([patch.a], index);
    }
  }

  return res;
};

module.exports = serializeRootPatch;
