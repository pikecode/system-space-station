export default {
  pages: [
    'pages/login/index',
    'pages/customers/index',
    'pages/customers/detail',
    'pages/approvals/index',
    'pages/profile/index',
    'pages/memberships/create',
    'pages/memberships/detail',
    'pages/commissions/list',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '客户资源管理',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    color: '#666666',
    selectedColor: '#00a3a3',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/customers/index',
        text: '客户',
        iconPath: 'assets/icons/customers.png',
        selectedIconPath: 'assets/icons/customers-active.png',
      },
      {
        pagePath: 'pages/approvals/index',
        text: '待办',
        iconPath: 'assets/icons/approvals.png',
        selectedIconPath: 'assets/icons/approvals-active.png',
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/icons/profile.png',
        selectedIconPath: 'assets/icons/profile-active.png',
      },
    ],
  },
};
