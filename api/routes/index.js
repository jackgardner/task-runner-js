module.exports = function (server) {
  server.get('/tasks', function (req, res, next) {
    const tasks = req.taskQueue.getTasks();

    res.json(tasks);
    return next();
  });


  server.del('/tasks/bytag/:tagName',  function (req, res, next) {
    const taskQueue = req.taskQueue;
    const tagName = req.params.tagName;
    
    if (tagName) {
      const result = taskQueue.cancelTask([ tagName ]);
      res.json(result);
    } else {
      res.json([]);
    }

    return next();
  });

  server.del('/tasks/:id', function (req, res, next) {
    const taskQueue = req.taskQueue;
    const taskId = req.params.id;

    if (taskId) {
      const result = taskQueue.cancelTask(taskId);
      res.json(result);
    } else {
      res.json([]);
    }

    return next();
  });
};