const request = require('request-promise');

const getAuthorizationHeader = (username, password) => {
  const headerString = `${username}:${password}`;
  return {
    Authorization: `Basic ${new Buffer(headerString).toString('base64')}`
  };
};

const JIRA_TASK_TYPE = {
  self: 'https://jira.ryanair.com:8443/rest/api/2/issuetype/3',
  id: '3',
  description: 'A task that needs to be done.',
  iconUrl: 'https://jira.ryanair.com:8443/secure/viewavatar?size=xsmall&avatarId=10918&avatarType=issuetype',
  name: 'Task',
  subtask: false,
  avatarId: 10918
};

//{ title, description, assigneeName, projectKey, priority }

const getTaskPayload = (taskData) => {
  const fields = {
    issuetype: {
      id: JIRA_TASK_TYPE.id
    }
  };

  if (taskData.projectKey) {
    fields.project = {
      key: taskData.projectKey
    };
  }

  if (taskData.title) {
    fields.summary = taskData.title;
  }

  if (taskData.assigneeName) {
    fields.assignee = {
      name: taskData.assigneeName
    };
  }

  if (taskData.priority) {
    fields.priority = {
      id: taskData.priority
    };
  }

  if (taskData.description) {
    fields.description = taskData.description;
  }

  return {
    fields
  };
};

const getMethodOptions = (method, api, taskKey, options) => {
  return {
    uri: `${api}/issue${(taskKey ? `/${taskKey}` : '')}`,
    method,
    json: true,
    headers: Object.assign({}, getAuthorizationHeader(options.username, options.password)),
    agentOptions: options.agentOptions
  };
};

const createTask = (jiraAPI, options) => {
  const requestOptions = getMethodOptions('POST', jiraAPI, null, options);
  return request(Object.assign({
    body: getTaskPayload(options)
  }, requestOptions));
};

const getTask = (jiraAPI, taskKey, options) => {
  return request(getMethodOptions('GET', jiraAPI, taskKey, options));
};

const updateTask = (jiraAPI, taskKey, options) => {
  const requestOptions = Object.assign({
    body: getTaskPayload(options)
  }, getMethodOptions('PUT', jiraAPI, taskKey, options));

  return request(requestOptions);
};

const TASK_PRIORITIES = {
  LOW: '4',
  MEDIUM: '3',
  HIGH: '2',
  CRITICAL: '1'
};

const handlerFactory = (jiraAPI, credentials, agentOptions) => {
  return {
    getTask(taskKey) {
      return getTask(jiraAPI, taskKey, {
        username: credentials.username,
        password: credentials.password,
        agentOptions
      });
    },
    createTask(taskData) {
      return createTask(jiraAPI, Object.assign({
        username: credentials.username,
        password: credentials.password,
        agentOptions
      }, taskData));
    },
    updateTask(taskKey, taskData) {
      return updateTask(jiraAPI, taskKey, Object.assign({
        username: credentials.username,
        password: credentials.password,
        agentOptions
      }, taskData));
    }
  };
};

handlerFactory.TASK_PRIORITIES = TASK_PRIORITIES;

module.exports = handlerFactory;
