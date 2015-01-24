var MyApp = angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'starter.filters', 'starter.directive']);

//app启动后需要立即执行的操作
MyApp.run(function ($ionicPlatform, $rootScope, $state, $ionicLoading, CommonFn, dataInitRequest, setVariables) {

  //资源加载完毕后需要做的一些事情，例如把服务器上一些常用的静态数据缓存到内存中，例如少数名族种类，客户收入来源，关系种类等；
  $ionicPlatform.ready(function() {
    /*if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }*/
    if(window.StatusBar) {
      StatusBar.styleDefault();
    };

    //根据url存储一些常量
    setVariables.setVariablesData();

    //获取code表
    dataInitRequest.getAllCodeMsg();   
     
  });

  //点击最左侧的导航时，判断跳转模块
  function toUsrManage () {
    var stateName = $state.current.name;
    if(stateName.indexOf('CustomerMain') == -1){
      $state.go('app.CustomerMain');
    };
  };

  function showLoading () {
    $ionicLoading.show({
        template: 'Loading...'
    });
  };

  function hideLoading () {
    $ionicLoading.hide();
  };

  //隐藏右侧顶部栏
  function hideBar () {
    CommonFn.hideBarFn();
  };

  //返回上一历史记录
  function goBack() {
    window.history.back();
  };

  //退出应用
  function gohomeFun (){
    CommonFn.closeWebViewFn('');
  };

  function goAddCustomForm () {
    CommonFn.showLoading('表单加载中...');
    setTimeout(function(){
      $state.go('app.CustomerMain.addUsr');
    },200);
  };

  //建立$rootScope命名空间
  $rootScope.commonModule = {
    /**
     *   $rootScope上的公共属性说明
     *
     * * hideRightViewTopBar 右侧view导航栏是否隐藏
     *    @true {bolean} 隐藏状态
     *    @false {bolean} 显示状态
     *
     * * toUsrManage 点击最左侧的导航时，判断跳转模块
     */

    hideRightViewTopBar : true,
    isPad               : true, 
    toUsrManage         : toUsrManage,
    hideBar             : hideBar,
    goBack              : goBack,
    showLoading         : showLoading,
    hideLoading         : hideLoading,
    gohomeFun           : gohomeFun,
    isIpad              : ionic.Platform.isIPad(),
    goAddCustomForm     : goAddCustomForm
  };
});

//路由配置
MyApp.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/app/CustomerMain');

    if(ionic.Platform.isIPad()){
      $stateProvider
        .state('app', {
          url: "/app",
          abstract: true,
          templateUrl: "templates/pad/menu.html"
        })

        .state('app.CustomerMain', {
          url: "/CustomerMain",
          views: {
            'menuContent' :{
              templateUrl: "templates/pad/CustomerMain.html"
            },
            'pageRightView@app.CustomerMain': {
              templateUrl: "templates/pad/pageRightView.html"
            },
            'RightViewContent@app.CustomerMain': {
              templateUrl: "templates/pad/blankPage.html",
              controller: 'blankPageCtrl'
            }
          }
        })

        .state('app.CustomerMain.usrDetailJump', {
          url: '/usrDetailJump/:usrListId',
          views: {
            'RightViewContent@app.CustomerMain': {
              templateUrl: 'templates/pad/usrDetail.html',
              controller: 'CustomerDetailCtrl'
            }
          }
        })

        .state('app.CustomerMain.addUsr', {
          url: '/addUsr',
          views: {
            'RightViewContent@app.CustomerMain': {
              templateUrl: 'templates/pad/addUsr.html',
              controller: 'addUsrCtrl'
            }
          }
        })

        .state('app.CustomerMain.editUsr', {
          url: '/editUsr/:usrListId',
          views: {
            'RightViewContent@app.CustomerMain': {
              templateUrl: 'templates/pad/editUsr.html',
              controller: 'editUsrCtrl'
            }
          }
        });

    }else{
      $stateProvider
        //侧滑
        .state('app', {
          url: "/app",
          abstract: true,
          templateUrl: "templates/phone/menu.html"
        })

        //客户列表
        .state('app.CustomerMain', {
          url: "/CustomerMain",
          views: {
            'menuContent@app' :{
              templateUrl: "templates/phone/CustomerMain.html"
            }
          }
        })

        //客户详情
        .state('app.CustomerMain.usrDetailJump', {
          url: '/usrDetailJump/:usrListId',
          views: {
            'menuContent@app': {
              templateUrl: 'templates/phone/usrDetail.html',
              controller: 'CustomerDetailCtrl'
            }
          }
        })

        //编辑客户
        .state('app.CustomerMain.editUsr', {
          url: '/editUsr/:usrListId',
          views: {
            'menuContent@app': {
              templateUrl: 'templates/phone/editUsr.html',
              controller: 'editUsrCtrl'
            }
          }
        })

        //新增客户
        .state('app.CustomerMain.addUsr', {
          url: '/addUsr',
          views: {
            'menuContent@app': {
              templateUrl: 'templates/phone/addUsr.html',
              controller: 'addUsrCtrl'
            }
          }
        })
    };
  
}]);

