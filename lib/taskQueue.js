'use strict';

const moment = require('moment');
const JobLoader = require('./jobs/job');
const jobLoader = new JobLoader();
const Promise = require('bluebird');
const Random = require('meteor-random');

const TaskQueue = function (logger) {
  this.queue = [];
  this.logger = logger;
  this.checkIntervalHandle = setInterval(this.runTasks.bind(this), 10000);
  this.runTasks();
};
TaskQueue.prototype.executeJob = function (job) {
    this.logger.info(`Executing job ${job.name}`);
    return jobLoader
      .loadJob(job.manifest)
      .finally(() => {
        let needsRequeue = job.onFinish === 'requeue';
        if (needsRequeue) {
          this.enqueue(job);
        }
      });
};

TaskQueue.prototype.getTasks = function () {
  return this.queue;
};
TaskQueue.prototype.cancelTask = function (taskId) {
  let taskCandidates = [];

  if (taskId.constructor === Array) {
    this.logger.info(`Removing tasks tagged with: '${taskId}'`);

    taskCandidates = this.queue.filter((queueItem) => {
        return queueItem.tags.some((tag) => taskId.indexOf(tag) >= 0);
      })
      .map((task) => task.id);
  } else {
    this.logger.info(`Removing task #${taskId}`);
    taskCandidates = this.queue.filter(queueItem => queueItem.id === taskId);
  }

  if(taskCandidates.length) {
    this.queue = this.queue.filter((queueItem) => taskCandidates.indexOf(queueItem.id) < 0);
    this.logger.info(`Removed ${taskCandidates.length} tasks`);


    return taskCandidates;
  }

  return;
};

TaskQueue.prototype.runTasks = function () {
  const currentTime = new Date();
  let interestingTasks = [];
  this.queue.forEach( (queueItem, index) => {
    if (queueItem.nextRunTime < currentTime && queueItem.startFrom < currentTime) {
      interestingTasks.push(queueItem);
      this.queue.splice(index, 1);
    }
  });

  const jobs = [];

  if (interestingTasks.length) {
    interestingTasks.forEach(task =>
      jobs.push(this.executeJob(task))
    );

    Promise.all(jobs)
      .then(() => {
        this.logger.info('All jobs ran successfully!');
      })
      .catch((err) => {
        this.logger.error(err);
      });
  }
};

TaskQueue.prototype.enqueue = function (packet) {

  let from = null;
  // 1. Calculate when the task is to be run from, which will be an absolute future date or the string "now"
  if (packet.from === 'now') {
    from = new Date();
  } else {
    from = Date.parse(packet.from);
  }

  // 2. Parse out the interval
  let nextRunTime = null;
  if (packet.interval) {
    nextRunTime = moment(from).endOf(packet.interval);
  }

  const job = packet;
  job.id = Random.id();
  job.nextRunTime = nextRunTime.toDate();
  job.startFrom = from;

  this.queue.push(job);
  this.logger.info(`Queued job: ${job.name} with next run time: ${job.nextRunTime}`);
};




module.exports = TaskQueue;