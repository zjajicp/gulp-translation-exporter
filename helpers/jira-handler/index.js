const Jira = require('./jira.js');

const formatTicketTitle = (teamName, sprintNumber) => `${teamName} - keys required - R${sprintNumber}`;

module.exports.sendTranslationRequest = (jiraAPI, config) => {
  const jira = Jira(jiraAPI, {
    username: config.username,
    password: config.password,
  }, config.agentOptions);

  if (config.existingTicket) {
    return jira.getTask(config.existingTicketId)
      .then(existingTicketData => existingTicketData.fields.description)
      .then(existingTicketDescription => jira.updateTask(config.existingTicketId, {
        description: `${existingTicketDescription || ''}\n${config.description}`
      }))
      .then(() => ({
        type: 'update',
        data: {
          key: config.existingTicketId
        }
      }));
  }

  return jira.createTask({
    projectKey: config.projectKey,
    description: config.description,
    title: formatTicketTitle(config.teamName, config.sprintNumber),
    priority: config.priority,
    assigneeName: config.assigneeName
  }).then(response => ({
    type: 'create',
    data: response
  }));
};
