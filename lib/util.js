var util = {};
util.insert = function(array, index, value) {
  var spliced = [];
  for (var i=array.length-1; i>=index; i--) {
    spliced.push(array[i]);
    array.splice(i, 1);
  }
  array.push(value);
  for (var i=spliced.length-1; i>=0; i--) {
    array.push(spliced[i]);
  }
  return index;
}

util.contains = function(array, value) {
  for (var index in array) {
    if (array[index] == value) {
      return true;
    }
  }
  return false;
}

exports.contains = util.contains;
exports.insert = util.insert;
