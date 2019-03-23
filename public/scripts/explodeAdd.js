util.calcAPI["explode"] = function(args, targets) {
  var maxLoop = 1000;
  var loop = 0;
  var cachedTargets = duplicate(targets);

  var max = diceRegex.exec(args[0]);
  var expVal = sync.eval(args[0], cachedTargets);
  cachedTargets.val = expVal;
  var cond;
  if (args.length > 1) {
    cond = sync.eval(args[1], cachedTargets);
  }
  else {
    cond = (cachedTargets.val == max[2]);
  }
  while (cond) {
    cachedTargets.val = sync.eval(args[0], cachedTargets);
    expVal = expVal + cachedTargets.val;
    if (args.length > 1) {
      cond = sync.eval(args[1], cachedTargets);
    }
    else {
      cond = (cachedTargets.val == max[2]);
    }
    loop++;
    if (loop > maxLoop) {
      sendAlert({text : "Error Processing Equation"});
      return "0";
    }
  }
  return expVal;
}
