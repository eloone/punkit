// Return tag list
getTags = function (filter) {

  var tags = [],
  taskCount = 0,
  doneCount = 0,
  difficultyCount = 0;

  if (! Meteor.user())
    return tags;

  // Retrieve tags
  Tasks.find({user: Meteor.user()._id}).forEach(function (task) {
    _.each(task.tags, function (text) {
      var tag = _.where(tags, {text: text})[0] || null;

      if (! tag)
        tags.push({
          text: text,
          count: 1,
          done: task.done ? 1 : 0,
          difficulty: task.difficulty
        });
      else {
        tag.count++;
        tag.done = task.done ? tag.done + 1 : tag.done;
        tag.difficulty += task.difficulty;
      }
    });

    taskCount++;
    doneCount = task.done ? doneCount + 1 : doneCount;
    difficultyCount += task.difficulty;
  });

  if (_.isArray(filter))
    tags = _.filter(tags, function (tag) {
      return filter.indexOf(tag.text) >= 0;
    });

  tags.unshift({
    text: 'all',
    count: taskCount,
    done: doneCount,
    difficulty: difficultyCount
  });

  // Compute progress, difficulty
  _.map(tags, function (tag) {
    return _.extend(tag, {
      progress: Math.round(tag.done / tag.count * 100),
      complete: tag.done === tag.count,
      difficultyAverage: Math.round(tag.difficulty / tag.count / 3 * 100) / 100,
      current: tag.text == 'all' ? 'current' : ''
    });
  });

  // Normalize values
  _.map(tags, function (tag) {
    return _.extend(tag, {
      progress: tag.progress || 0,
      complete: tag.done === tag.count,
      difficultyAverage: tag.difficultyAverage || 0
    });
  });

  // Sort tags
  tags = _.sortBy(tags, function (tag) {
    return tag.text;
  });

  return tags;
};

// Pick out the unique tags from all todos in current list.
Template['tag-list'].tags = function () {
  return getTags();
};

Template['tag-list'].label = function () {
  return this.text =='all'  ? "All items" : this.text;
};

Template['tag-list'].events({

  'click li' : function(event){
    var $target = $(event.target);
    if($target.is('a')){
      $target.parent('li').addClass('current').siblings().removeClass('current');
    }else{
      $target.addClass('current').siblings().removeClass('current');
    }

  }

});