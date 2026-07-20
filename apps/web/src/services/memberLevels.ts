import request from './request';

export const memberLevelsApi = {
  getAll: () => request.get('/member-levels'),
};
