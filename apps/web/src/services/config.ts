import request from './request';

export const configApi = {
  getCurrent: () => request.get('/config/current'),
  getVersions: () => request.get('/config/versions'),
  create: (data: unknown) => request.post('/config/versions', data),
};
