module.exports = function (connector) {
  connector.send('invoice-actions', { instruction: 'pastDue' });
};