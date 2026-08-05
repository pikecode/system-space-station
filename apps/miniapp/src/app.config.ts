export default {
  pages: [
    'pages/login/index',
    'pages/register/index',
    'pages/register/success',
    'pages/customers/index',
    'pages/customers/detail',
    'pages/profile/index',
    'pages/approvals/index',
    'pages/memberships/create',
    'pages/memberships/detail',
    'pages/commissions/list',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#173f3a',
    navigationBarTitleText: '客户资源管理',
    navigationBarTextStyle: 'white',
  },
  tabBar: {
    color: '#9ea5b0',
    selectedColor: '#176b61',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/customers/index',
        text: '客户',
        iconPath: 'assets/icons/customers.png',
        selectedIconPath: 'assets/icons/customers-active.png',
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
