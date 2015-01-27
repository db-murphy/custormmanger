var AppController = angular.module('starter.controllers', [])

//获取客户列表 
AppController.controller('MyCustomerListCtrl', ['$scope', '$rootScope', 'CommonFn', 'UsrData', function ($scope, $rootScope, CommonFn, UsrData) {
  //显示右侧顶部头部
  CommonFn.showBarFn();
  CommonFn.showLoading('客户列表加载中...');

  //获取全部客户信息
  document.addEventListener('deviceready', function(){
    UsrData.getList({
      getStaticData: false,
      scope: $scope
    },function () {
      CommonFn.hideLoading();
    });
  }, false);

  var searchUsrList = function () {
    UsrData.searchUsr($scope);
  };

  //接口导出
  $scope.MyCustomerListCtrlModule = {
    data:{
      keyWord: ''
    },
    fn: {
      searchUsrFn: searchUsrList
    }
  };

}]);

//获取客户详情 
AppController.controller('CustomerDetailCtrl', ['$scope', '$stateParams', '$rootScope', '$ionicPopover', '$state', '$ionicActionSheet', 'CommonFn', 'UsrData', 'relationshipData', 'Variables', 'manuScriptServer', function ($scope, $stateParams, $rootScope, $ionicPopover, $state, $ionicActionSheet, CommonFn, UsrData, relationshipData, Variables, manuScriptServer) {

  if($rootScope.commonModule.isPad){
    //如果是pad显示右侧顶部头部
    CommonFn.showBarFn();
  };

  //获取客户id
  var id = $stateParams.usrListId;

  //scope接口导出
  $scope.CustomerDetailModule = {
    attr: {
      tabIndex     : "basicMsg",
      buttonText   : '',
      create       : '',
      recommend    : '',
      relationIndex: null
    },
    data: UsrData.getUsrDetail({ID: id, tanslateCode:false}),
    relationList: [],
    fn  : {
      openPopoverFn   : openPopover,
      closePopoverFn  : closePopover,
      deleteUsrFn     : deleteUsr,
      setPlatformFn   : setPlatform,
      appJumpFn       : appJump,
      chooseRelationFn: chooseRelation,
      showActionsheet : showActionsheet,
      goEditPage      : goEditPage
    }
  };

  //跳转到编辑界面
  function goEditPage () {
    CommonFn.showLoading('表单加载中...');
    setTimeout(function(){
      $state.go('app.CustomerMain.editUsr',{usrListId: id});
    },200);
  };

  //上传头像
  function showActionsheet () {
    $ionicActionSheet.show({
      titleText: '上传头像',
      buttons: [
        {
          text: '拍照'
        },
        {
          text: '从相册中选取'
        },
      ],
      cancelText: '取消',
      cancel: function () {
        console.log('CANCELLED');
      },
      buttonClicked: function (index) {
        CommonFn.myAlert('暂不支持修改头像功能!');
        return;
        if(index == 0){
          if(CommonFn.checkConnection()){
            getPhotoFromCamera(function (imageURL){
              //alert(imageURL);
              uploadImage('http://10.0.22.112:7003/app/agent/uploadphoto', imageURL, Variables.agentCode, Variables.agentPassword, function (webImgUrl) {
                alert(JSON.stringify(webImgUrl));
              }, function () {
                CommonFn.myAlert('头像上传失败!');
              });
            }, function () {
              alert('拍照失败');
            });
          }else{
            CommonFn.myAlert('离线不能修改头像!');
          };
        }else if(index == 1){
          getPhotoFromAlbum(1, function (imageURL) {
            uploadImage('http://10.0.22.112:7003/app/customer/uploadphoto', imageURL, id, '', function (webImgUrl) {
              //alert(JSON.stringify(webImgUrl));
              $('.customIcon').attr('src', webImgUrl.local);
            }, function () {
              CommonFn.myAlert('头像上传失败!');
            });
          }, function () {
            alert('选择照片失败');
          });
        };
      },
      destructiveButtonClicked: function () {
        console.log('DESTRUCT');
        return true;
      }
    });
  };

  //tab切换
  function setPlatform (indexValue) {
    $scope.CustomerDetailModule.attr.tabIndex = indexValue;
  };
  
  //初始化模态框
  var popoverObj = null;
  $ionicPopover.fromTemplateUrl('my-popover.html', {
    scope: $scope,
  }).then(function(popover) {
    popoverObj = popover;
  });

  function openPopover ($event) {
    popoverObj.show($event);
  };

  function closePopover () {
    popoverObj.hide();
  };

  $scope.$on('$destroy', function() {
    popoverObj.remove();
  });

  //删除客户
  function deleteUsr () {
    UsrData.deleteUsrList({
      ID: id,
      useStaticData: false
    }, function(){
      if($rootScope.commonModule.isPad){
        $scope.commonModule.hideBar();
        $state.go('app.CustomerMain');
      }else{
        $rootScope.commonModule.goBack();
      };
    });
  };

  //判断当前建议书按钮状态
  var recommend = Variables.recommend;

  $scope.CustomerDetailModule.attr.recommend = recommend;
  
  switch(recommend){
    case "1":
      $scope.CustomerDetailModule.attr.buttonText = "选为投保人";
      break;

    case "2":
      $scope.CustomerDetailModule.attr.buttonText = "选为被保人";
      break;

    default:
      $scope.CustomerDetailModule.attr.buttonText = "创建建议书";
      $scope.CustomerDetailModule.attr.create = true;
      $scope.CustomerDetailModule.attr.recommend = '1';
  };

  //跳转应用
  function appJump(){
    var selectedRelationIndex = $scope.CustomerDetailModule.attr.relationIndex;

    var sendMsg = null;

    if($scope.CustomerDetailModule.attr.create){
      //创建建议书
      manuScriptServer.createMsgFn($scope, $scope.CustomerDetailModule.data, function (sendMsg) {
        manuScriptServer.createManuscriptFn(sendMsg);
      });
      
    }else{
      //选择投保人或者被保人
      if(recommend == '1'){
        //选择投保人(投保人只能选择客户)
        manuScriptServer.createMsgFn($scope, $scope.CustomerDetailModule.data, function (sendMsg) {
          manuScriptServer.selectCustomFn(sendMsg);
        });
      }else if(recommend == '2'){
        //选择被保人
        if(selectedRelationIndex != null){
          manuScriptServer.createMsgFn($scope, $scope.CustomerDetailModule.relationList[selectedRelationIndex], function (sendMsg) {
            manuScriptServer.selectCustomFn(sendMsg);
          });
        }else{
          manuScriptServer.createMsgFn($scope, $scope.CustomerDetailModule.data, function (sendMsg) {
            manuScriptServer.selectCustomFn(sendMsg);
          });
        };
      };
      //建议书跳转到客户管理时使用的地址
      //var url = "promodel/"+customer_appId+"/www/index.html?pctype="+platform+"&proid="+customer_appId+"&recommend="+type;
      //选择投保人或者被保人(投保人只能是客户，被保人既可以是客户也可以是家属)
    };
  };

  //选择家属
  function chooseRelation (index) {
    if(recommend != '2'){
      return;
    };
    if($scope.CustomerDetailModule.attr.relationIndex == index){
      $scope.CustomerDetailModule.attr.relationIndex = null;
    }else{
      $scope.CustomerDetailModule.attr.relationIndex = index;
    };
  };

  //获取客户的关系信息
  relationshipData.getRelation({
    id: id
  },function(arr){
    $scope.CustomerDetailModule.relationList = arr;
  });

}]);

//加载空白页面 
AppController.controller('blankPageCtrl', ['$scope', '$rootScope', 'CommonFn', function ($scope, $rootScope, CommonFn) {
  //隐藏右侧顶部头部
  CommonFn.hideBarFn();
}]);

//添加新客户 
AppController.controller('addUsrCtrl', ['$scope', '$rootScope', '$stateParams', '$state', '$timeout', '$ionicScrollDelegate', '$ionicModal', 'CommonFn', 'UsrData', 'searchOccupationServer', 'relationshipData', 'dataInit', 'checkFormHandle', function ($scope, $rootScope, $stateParams, $state, $timeout, $ionicScrollDelegate, $ionicModal, CommonFn, UsrData, searchOccupationServer, relationshipData, dataInit, checkFormHandle) {
  if($rootScope.commonModule.isPad){
    //如果是pad显示右侧顶部头部
    CommonFn.showBarFn();
  };

  //检测表单是否加载完毕
  var addFormBox = $('#addCustom');
  var timer = setInterval(function(){
    if(!addFormBox.hasClass('ng-enter')){
      CommonFn.hideLoading();
      clearInterval(timer);
    };
  },20);

  //tab切换方法
  function setPlatform(indexValue) {
    $scope.addUsrModule.attr.tabIndex = indexValue;
  };
  
  //点击保存按钮,添加客户
  function addUsr() { 
    
    var textInput = $('input[type="text"]');
    for(var i = 0; i < textInput.length; i++){
      textInput.get(i).blur();
    };

    //延迟校验
    setTimeout(function(){
      //判断是否选择了性别
      if(!$scope.addUsrModule.data.SEX){
        $('.sexErrorMsg').addClass('my-show');
      };

      //判断用户名是否为空
      if($scope.addUsrModule.data.REAL_NAME == "" || !$scope.addUsrModule.data.REAL_NAME){
        $('.usrNameErrorMsg').addClass('my-show');
        $('.usrNameErrorMsg').text('用户姓名不能为空');
      };

      if($('.normalForm .error-font.my-show').length){
        CommonFn.ionicAlert('表单验证不通过,查看是否填写正确');
        return;
      }else{
        restoreTheData();
      };
    },100);
  };

  function restoreTheData() {
    if(UsrData.checkCustomHasFn($scope.addUsrModule.data.REAL_NAME)){
      CommonFn.showConfirm({
        title: '提示',
        content: '已存在此姓名用户，确定提交吗?',
        sure: function(){
          //新增客户
          UsrData.setUsr({
            data        : $scope.addUsrModule.data,
            test        : false,
            add         : true,
            formName    : 'T_CUSTOMER'
          },function (SCOPE, data){
            //新增客户成功后，添加与他有关系的客户;
            addCustomRelationCustom(data.ID, function(){
              //关系客户添加完了，再跳转到主客户的详情界面
              UsrData.addCustomSuccessFn(data, true);
            });
          });
        }
      });
    }else{
      //新增客户
      UsrData.setUsr({
        data        : $scope.addUsrModule.data,
        test        : false,
        add         : true,
        formName    : 'T_CUSTOMER'
      },function (SCOPE, data){
        //新增客户成功后，添加与他有关系的客户;
        addCustomRelationCustom(data.ID, function(){
          //关系客户添加完了，再跳转到主客户的详情界面
          UsrData.addCustomSuccessFn(data, true);
        });
      });
    };
  };

  //添加新增客户的关系客户
  function addCustomRelationCustom (firstCustomId, fn) {
    var arrRelation = $scope.addUsrModule.attr.newRelationShip;

    //如果添加了关系信息
    if(arrRelation.length){
      relationshipData.addCustomRelationShip(arrRelation, firstCustomId, fn, arrRelation.length);
    }else{
      //如果没有新增关系信息，则直接跳转到此新增客户的详情界面
      fn && fn();
    };
  };

  //选择身份证截止日期
  function useDatePlugin() {
    CommonFn.getDateFn(function (data) {
      $scope.addUsrModule.data.ID_END_DATE = data;
      $scope.addUsrModule.attr.idCardLongTime = false;
      $scope.$apply($scope.addUsrModule.data.ID_END_DATE);
    });
  };

  //选择特殊纪念日
  function chooseMyDate() {
    CommonFn.getDateFn(function (data) {
      $scope.addUsrModule.data.ANNIVERSARY = data;
      $scope.$apply($scope.addUsrModule.data.ANNIVERSARY);
    });
  };

  function idCardFnResert() {
    $scope.addUsrModule.attr.idCardPassDontPass = false;
  };

  //城市联动处理
  var allProvince = dsy.Items['0'];

  //基本信息中的地址联动处理
  CommonFn.adressSelect('addUsrModule', allProvince, $scope, dsy, 'RGT_PROVINCE', 'RGT_CITY', 'basicAfress');

  //联系方式中的地址联动处理
  CommonFn.adressSelect('addUsrModule', allProvince, $scope, dsy, 'HOME_PROVINCE', 'HOME_CITY', 'homeAddress');

  //单位地址联动
  CommonFn.adressSelect('addUsrModule', allProvince, $scope, dsy, 'COMPANY_PROVINCE', 'COMPANY_CITY', 'companyAddress');

  //身份证是否长期使用
  $scope.$watch('addUsrModule.attr.idCardLongTime', function (){
    if($scope.addUsrModule.attr.idCardLongTime){
      $scope.addUsrModule.data.ID_END_DATE = '长期有效';
    }else{
      if($scope.addUsrModule.data.ID_END_DATE == '长期有效'){
        $scope.addUsrModule.data.ID_END_DATE = '';
      };
    };
  });

  //添加联系方式
  function addContactType() {
    if(!('otherContactMethod' in $scope.addUsrModule.data)){
      $scope.addUsrModule.data.otherContactMethod = [];
    };
    var newJson = angular.copy($scope.addUsrModule.attr.contactMsg);

    $scope.addUsrModule.data.otherContactMethod.push(newJson);
    $ionicScrollDelegate.resize();
  };

  //删除联系方式
  function deleteContact (index) {
    $scope.addUsrModule.data.otherContactMethod.splice(index, 1);
    $ionicScrollDelegate.resize();
  };

  $ionicModal.fromTemplateUrl('professionalModal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  
  function openModal() {
    $scope.modal.show();
    $('.serach-box .items_content').click(function(ev){
      var oTarget = $(ev.target);  
      var itemNow = oTarget.closest('.table_items');

      $('.serach-box .table_items').removeClass('itemActive');
      if(itemNow.length){
        var indexNow = parseInt($('.serach-box .table_items').index(itemNow), 10);
        oTarget.closest('.table_items').addClass('itemActive');
        chooseOccupation(indexNow);
      };
    });
  };

  function closeModal() {
    $('.serach-box .items_content').unbind('click');
    $scope.modal.hide();
  };

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

  //添加关系信息到新增客户信息中
  function addRelationShip () {

    if(typeof $scope.addUsrModule.attr.relationShipDataCache.SEX == 'undefined' || $scope.addUsrModule.attr.relationShipDataCache.SEX == ''){
      CommonFn.showFormError('relationSexErrorMsg', '性别为必选项');
    };

    if(typeof $scope.addUsrModule.attr.relationShipDataCache.relationShipType == 'undefined' || $scope.addUsrModule.attr.relationShipDataCache.relationShipType == ''){
      CommonFn.showFormError('relationTypeErrorMsg', '请选择关系');
    };

    if(typeof $scope.addUsrModule.attr.relationShipDataCache.REAL_NAME == 'undefined' || $scope.addUsrModule.attr.relationShipDataCache.REAL_NAME == ''){
      CommonFn.showFormError('relationUsrNameErrorMsg', '客户姓名未告知，请告知');
    };

    if($('.addRelationForm .error-font.my-show').length){
      return;
    };

    $scope.addUsrModule.attr.newRelationShip.push(angular.copy($scope.addUsrModule.attr.relationShipDataCache));
    $ionicScrollDelegate.resize();
    relationResert();
  };

  //展开关系下拉菜单选择关系时触发
  function selectRelation () {
    if($scope.addUsrModule.attr.relationShipDataCache.relationShipType){
      CommonFn.hideFormError('relationTypeErrorMsg');
    }else{
      CommonFn.showFormError('relationTypeErrorMsg', '请选择关系');
    };
  };

  //性别选择是触发
  $scope.$watch('addUsrModule.attr.relationShipDataCache.SEX', function(){
    CommonFn.hideFormError('relationSexErrorMsg');
  });

  //重置关系表单
  function relationResert () {
    $scope.addUsrModule.attr.relationShipDataCache = {
        relationShipType: '',
        SEX             : '',
        BIRTHDAY        : '',
        AGE             : '',
        REAL_NAME       : ''
    }
  };

  //搜索职业
  function searchOccupation () {
    var searchOccupationKeyWord = $scope.addUsrModule.attr.WORD;
    var searchMatchAll = $scope.addUsrModule.attr.searchOccupationMacth;

    CommonFn.showLoading('查询中...');

    $timeout(function(){
      searchOccupationServer.searchOccupation({
        keyWord : searchOccupationKeyWord,
        ruler   : searchMatchAll,
        callBack: function(data){
          CommonFn.hideLoading();
          $scope.addUsrModule.searchOccupationModel = data;
          $scope.$apply($scope.addUsrModule.searchOccupationModel);
        }
      });
    }, 500);
  };

  function checkTheSearch () {
    $scope.addUsrModule.attr.searchOccupationMacth = !$scope.addUsrModule.attr.searchOccupationMacth;
  };

  function chooseOccupation (index) {
    $scope.addUsrModule.attr.chooseOccupationNow = $scope.addUsrModule.searchOccupationModel[index];
  }

  function occupationSelect () {
    $scope.addUsrModule.attr.occupationSelected    = true;
    $scope.addUsrModule.data.OCCUPATION_CODE       = $scope.addUsrModule.attr.chooseOccupationNow.OCCUPATION_CODE;
    $scope.addUsrModule.data.OCCUPATION_CODE_NAME  = $scope.addUsrModule.attr.chooseOccupationNow.OCCUPATION_NAME;
    $scope.addUsrModule.data.OCCUPATION_CODE_TYPE  = $scope.addUsrModule.attr.chooseOccupationNow.OCCUPATION_TYPE;
    closeModal();
  };

  //从收入来源中把其他删除
  CommonFn.deleteElementInArr(dataInit.allCode.incomeway.codeName, '其他');

  $scope.$watch('addUsrModule.attr.incomeOtherWay', function () {
    if(!$scope.addUsrModule.attr.incomeOtherWay){
      $scope.addUsrModule.data.OTHER_INCOME_WAY = '';
    };
  });

  //选择邮寄地址
  $scope.$watch('addUsrModule.attr.mailingAddress', function () {
    switch($scope.addUsrModule.attr.mailingAddress){
      case '家庭地址':
        $scope.addUsrModule.data.MAILING_ADDRESS = $scope.addUsrModule.data.HOME_ADDRESS;
        break;

      case '单位地址':
        $scope.addUsrModule.data.MAILING_ADDRESS = $scope.addUsrModule.data.COMPANY_ADDRESS;
        break;
    };
  });

  function showAddRelationForm () {
    $scope.addUsrModule.attr.relationForm = true;
    $ionicScrollDelegate.resize();
  };

  function returnRelationForm () {
    $scope.addUsrModule.attr.relationForm = false;
    $ionicScrollDelegate.resize();
  };

  //通过xml校验表单部分
  
  //校验用户名
  function checkUsrName(str, className) {
    checkFormHandle.checkUsrName(str, function(json) {
      if(!json.Falg){
        CommonFn.showFormError(className, json.msg);
      }else{
        CommonFn.hideFormError(className);
      };
    });
  };

  //校验性别
  $scope.$watch('addUsrModule.data.SEX', function(){
    $('.sexErrorMsg').removeClass('my-show');
  });

  //居住详细地址验证
  function checkAddress(str, className) {
    if((typeof str != 'undefined') && str != ''){
      checkFormHandle.checkAddress(str, function(json) {
        if(!json.Falg){
          CommonFn.showFormError(className, json.msg);
        }else{
          CommonFn.hideFormError(className);
        };
      });
    }else{
      CommonFn.hideFormError(className);
    };
    
  };

  //验证证件号码
  function checkPersonId(idCard, className) {
    
    //判断证件类型
    switch($scope.addUsrModule.data.IDTYPE){
      case "居民身份证":
        idType = "idNo";
        break;

      case "中国护照":
        idType = "chinesepassport";
        break;

      case "军官证":
        idType = "officerpassport";
        break;

      case "士兵证":
        idType = "officerpassport";
        break;

      case "出生证":
        idType = "born";
        break;

      case "台湾通行证":
        idType = "taiwanpass";
        break;

      case "外国护照":
        idType = "foreignpassport";
        break;

      default:
        idType = "otheridtype";
    };

    //判断是否为回乡证
    if(typeof $scope.addUsrModule.data.IDTYPE != 'undefined' && $scope.addUsrModule.data.IDTYPE.indexOf('回乡证') != -1){
      idType = "gobackpass";
    };

    //如果没有没有选择证件类型
    if(typeof $scope.addUsrModule.data.IDTYPE == 'undefined' || $scope.addUsrModule.data.IDTYPE == null){
      idType = "";
    };

    if(typeof idCard != 'undefined' && idCard != ''){
      if(idType == ""){
        CommonFn.showFormError('idtypeErrorMsg', "请选择证件类型");
        return;
      };

      if(idType == "otheridtype"){
        CommonFn.hideFormError(className);
        return;
      };

      //根据证件类型验证
      checkFormHandle.checkPersonIdCard(idCard, idType, function(json) {
        if(!json.Falg){
          CommonFn.showFormError(className, json.msg);
        }else{
          //身份证号码验证通过
          CommonFn.hideFormError(className);
          if($scope.addUsrModule.data.IDTYPE == '居民身份证'){
            calculateAge(idCard);
          };
        };
      });
    }else{
      CommonFn.hideFormError(className);
    };

  };

  //监听证件类型
  $scope.$watch('addUsrModule.data.IDTYPE', function () {
    if($scope.addUsrModule.data.IDTYPE != "证件类型"){
      CommonFn.hideFormError('idtypeErrorMsg');
      checkPersonId($scope.addUsrModule.data.IDNO, 'idnoErrorMsg');
    };
  });

  //根据身份证号码计算年龄
  function calculateAge(_idCard) {
    var usrAgeMsg = CommonFn.getUserAge(_idCard);

    $scope.addUsrModule.data.AGE = usrAgeMsg.age;
    $scope.addUsrModule.data.BIRTHDAY = usrAgeMsg.birthday;
    $scope.addUsrModule.attr.idCardLongTime = usrAgeMsg.isEffective;

    if(usrAgeMsg.age < 1){
      $scope.addUsrModule.attr.agePass = false;
    }else{
      $scope.addUsrModule.attr.agePass = true;
    };

    if($scope.addUsrModule.data.AGE > 46){
      $scope.addUsrModule.attr.idCardLongTime = true;
    }else{
      $scope.addUsrModule.attr.idCardLongTime = false;
    };

  };

  //简单规则校验校验(除证件号码之外,普通输入框里的字符)
  function checkCommon(num, type, className) {
    if((typeof num) != 'undefined' && num != ""){
      checkFormHandle.commonCheck(num, type, function(json) {
        if(!json.Falg){
          CommonFn.showFormError(className, json.msg);
        }else{
          CommonFn.hideFormError(className);
        };
      });
    }else{
      CommonFn.hideFormError(className);
    };
  };

  //$scope接口导出
  $scope.addUsrModule = {
    attr: {
      tabIndex             : "basicMsg",
      basicMsgFormPass     : '',
      addressMsgFormPass   : '',
      idCardPassDontPass   : false,
      idCardLongTime       : false,
      relationTypePass     : true,
      relationForm         : false,
      sexPass              : true,
      agePass              : true,
      relationAgePass      : true,
      contactMsg           : {
        type : '',
        value: ''
      },
      relationShipDataCache: {
        relationShipType: '',
        SEX             : '',
        BIRTHDAY        : '',
        AGE             : '',
        REAL_NAME       : ''
      },
      newRelationShip      : [],
      chooseOccupationNow  : null,
      activeNow            : '',
      occupationSelected   : false,
      searchOccupationMacth: false,
      incomeOtherWay       : false,
      mailingAddress       : ''
    },
    searchOccupationModel: [],
    data: {},
    staticData: {
      "ClientType"         : dataInit.allCode.customertype.codeName,
      "ClientSource"       : dataInit.allCode.customersource.codeName,
      "ClientNation"       : dataInit.allCode.nationality.codeName,
      "Nationality"        : dataInit.allCode.nativeplace.codeName,
      "CertificateType"    : dataInit.allCode.idtype.codeName,
      "EducationBackground": dataInit.allCode.degree.codeName,
      "MARRI_STATUS"       : dataInit.allCode.marriage.codeName,
      "companyType"        : dataInit.allCode.incomeway.codeName,
      "ACCOUNT_TENDENCY"   : dataInit.allCode.accounttendency.codeName,
      "sites"              : ["家庭地址","单位地址"],
      "Relationship"       : dataInit.allCode.relation.codeMap,
      "Number"             : ['邮箱', '微博', '微信', 'QQ']
    },
    adress: {
      basicAfress: {
        province: allProvince,
        city    : null,
        county  : null
      },
      homeAddress: {
        province: allProvince,
        city    : null,
        county  : null
      },
      companyAddress: {
        province: allProvince,
        city    : null,
        county  : null
      }
    },
    fn: {
      addUsrFn         : addUsr,
      setPlatformFn    : setPlatform,
      useDatePluginFn  : useDatePlugin,
      idCardFnResertFn : idCardFnResert,
      addContactType   : addContactType,
      deleteContact    : deleteContact,
      openModal        : openModal,
      closeModal       : closeModal,
      addRelationShipFn: addRelationShip,
      relationResertFn : relationResert,
      searchOccupation : searchOccupation,
      chooseOccupation : chooseOccupation,
      occupationSelect : occupationSelect,
      chooseMyDate     : chooseMyDate,
      selectRelationFn : selectRelation,
      showAddRelationForm:showAddRelationForm,
      returnRelationForm: returnRelationForm,
      checkTheSearch   : checkTheSearch
    },
    formCheckFn: {
      checkUsrName: checkUsrName,
      checkPersonId: checkPersonId,
      checkCommon: checkCommon,
      checkAddress: checkAddress
    }
  };
}]);

//编辑客户
AppController.controller('editUsrCtrl', ['$scope', '$rootScope', '$state', '$stateParams', '$ionicScrollDelegate', '$ionicModal', '$timeout', 'UsrData', 'CommonFn', 'searchOccupationServer', 'dataInit', 'relationshipData', 'Variables', 'checkFormHandle', function ($scope, $rootScope, $state, $stateParams, $ionicScrollDelegate, $ionicModal, $timeout, UsrData, CommonFn, searchOccupationServer, dataInit, relationshipData, Variables, checkFormHandle) {

  //tab切换
  var setPlatform = function (indexValue) {
    $scope.editUsrModule.attr.tabIndex = indexValue;
  };

  //检测表单是否加赞完毕
  var editPage = $('#editPage');
  var timer = setInterval(function(){
    if(!editPage.hasClass('ng-enter')){
      CommonFn.hideLoading();
      clearInterval(timer);
    };
  },20);

  //获取客户id
  var id = $stateParams.usrListId;

  //提交内容
  var submitData = function(){
    var textInput = $('input[type="text"]');
    for(var i = 0; i < textInput.length; i++){
      textInput.get(i).blur();
    };

    //延迟校验
    setTimeout(function(){
      if($('.normalForm .error-font.my-show').length){
        CommonFn.ionicAlert('表单验证不通过,查看是否填写正确');
        return;
      }else{
        restoreTheData();
      };
    },100);
  };

  //保存数据
  function restoreTheData() {
    UsrData.editUsrData({
      ID      : id,
      data    : $scope.editUsrModule.data,
      test    : false,
      add     : false,
      formName: 'T_CUSTOMER'
    }, function (SCOPE, data) {
      //新增客户成功后，添加与他有关系的客户;
      addCustomRelationCustom(data.ID, function(){
        //关系客户添加完了，再跳转到主客户的详情界面
        UsrData.editSeccessFn(data);
      });
    });
  };

  //添加新增客户的关系客户
  function addCustomRelationCustom (firstCustomId, fn) {
    var arrRelation = $scope.editUsrModule.attr.newRelationShip;

    //如果添加了关系信息
    if(arrRelation.length){
      relationshipData.addCustomRelationShip(arrRelation, firstCustomId, fn, arrRelation.length);
    }else{
      //如果没有新增关系信息，则直接跳转到此新增客户的详情界面
      fn && fn();
    };
  };

  //城市联动处理
  var allProvince = dsy.Items['0'];

  //基本信息中的地址联动处理
  CommonFn.adressSelect('editUsrModule', allProvince, $scope, dsy, 'RGT_PROVINCE', 'RGT_CITY', 'basicAfress');

  //联系方式中的地址联动处理
  CommonFn.adressSelect('editUsrModule', allProvince, $scope, dsy, 'HOME_PROVINCE', 'HOME_CITY', 'homeAddress');

  //单位地址联动
  CommonFn.adressSelect('editUsrModule', allProvince, $scope, dsy, 'COMPANY_PROVINCE', 'COMPANY_CITY', 'companyAddress');

  function idCardFnResert() {
    $scope.editUsrModule.attr.idCardPassDontPass = false;
  };

  //选择身份证截止日期
  function useDatePlugin() {
    CommonFn.getDateFn(function (data) {
      $scope.editUsrModule.data.ID_END_DATE = data;
      $scope.editUsrModule.attr.idCardLongTime = false;
      $scope.$apply($scope.editUsrModule.data.ID_END_DATE);
    });
  };

  //选择特殊纪念日
  function chooseMyDate() {
    CommonFn.getDateFn(function (data) {
      $scope.editUsrModule.data.ANNIVERSARY = data;
      $scope.$apply($scope.editUsrModule.data.ANNIVERSARY);
    });
  };

  //身份证是否长期使用
  $scope.$watch('editUsrModule.attr.idCardLongTime', function (){
    if($scope.editUsrModule.attr.idCardLongTime){
      $scope.editUsrModule.data.ID_END_DATE = '长期有效';
    }else{
      if($scope.editUsrModule.data.ID_END_DATE == '长期有效'){
        $scope.editUsrModule.data.ID_END_DATE = '';
      };
    };
  });

  //重置添加关系表单
  function relationResert () {
    $scope.editUsrModule.attr.relationShipDataCache = {
        relationShipType: '',
        SEX             : '',
        BIRTHDAY        : '',
        AGE             : '',
        REAL_NAME       : ''
    }
  };

  //添加一个关系到临时缓存
  function addRelationShip () {
    if(typeof $scope.editUsrModule.attr.relationShipDataCache.SEX == 'undefined' || $scope.editUsrModule.attr.relationShipDataCache.SEX == ''){
      CommonFn.showFormError('relationSexErrorMsg', '性别为必选项');
    };

    if(typeof $scope.editUsrModule.attr.relationShipDataCache.relationShipType == 'undefined' || $scope.editUsrModule.attr.relationShipDataCache.relationShipType == ''){
      CommonFn.showFormError('relationTypeErrorMsg', '请选择关系');
    };

    if(typeof $scope.editUsrModule.attr.relationShipDataCache.REAL_NAME == 'undefined' || $scope.editUsrModule.attr.relationShipDataCache.REAL_NAME == ''){
      CommonFn.showFormError('relationUsrNameErrorMsg', '客户姓名未告知，请告知');
    };

    if($('.addRelationForm .error-font.my-show').length){
      CommonFn.ionicAlert('表单验证不通过,查看是否填写正确');
      return;
    };

    $scope.editUsrModule.attr.newRelationShip.push(angular.copy($scope.editUsrModule.attr.relationShipDataCache));
    $scope.editUsrModule.relationList.push(angular.copy($scope.editUsrModule.attr.relationShipDataCache));
    $ionicScrollDelegate.resize();
    relationResert();
  };

  //选择关系触发的事件
  function selectRelation () {
    if($scope.editUsrModule.attr.relationShipDataCache.relationShipType){
      CommonFn.hideFormError('relationTypeErrorMsg');
    }else{
      CommonFn.showFormError('relationTypeErrorMsg', '请选择关系');
    };
  };

  //性别选择是触发
  $scope.$watch('editUsrModule.attr.relationShipDataCache.SEX', function(){
    CommonFn.hideFormError('relationSexErrorMsg');
  });

  //搜索职业
  $ionicModal.fromTemplateUrl('professionalModal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  
  function openModal() {
    $scope.modal.show();
    $('.serach-box .items_content').click(function(ev){
      var oTarget = $(ev.target);  
      var itemNow = oTarget.closest('.table_items');

      $('.serach-box .table_items').removeClass('itemActive');
      if(itemNow.length){
        var indexNow = parseInt($('.serach-box .table_items').index(itemNow), 10);
        oTarget.closest('.table_items').addClass('itemActive');
        chooseOccupation(indexNow);
      };
    });
  };
  function closeModal() {
    $('.serach-box .items_content').unbind('click');
    $scope.modal.hide();
  };

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

  //搜索职业
  function searchOccupation () {
    var searchOccupationKeyWord = $scope.editUsrModule.attr.WORD;
    var searchMatchAll = $scope.editUsrModule.attr.searchOccupationMacth;

    CommonFn.showLoading('查询中...');

    $timeout(function(){
      searchOccupationServer.searchOccupation({
        keyWord : searchOccupationKeyWord,
        ruler   : searchMatchAll,
        callBack: function(data){
          CommonFn.hideLoading();
          $scope.editUsrModule.searchOccupationModel = data;
          $scope.$apply($scope.editUsrModule.searchOccupationModel);
        }
      });
    }, 500);
  };

  function chooseOccupation (index) {
    $scope.editUsrModule.attr.chooseOccupationNow = $scope.editUsrModule.searchOccupationModel[index];
  }

  function occupationSelect () {
    $scope.editUsrModule.attr.occupationSelected    = true;
    $scope.editUsrModule.data.OCCUPATION_CODE       = $scope.editUsrModule.attr.chooseOccupationNow.OCCUPATION_CODE;
    $scope.editUsrModule.data.OCCUPATION_CODE_NAME  = $scope.editUsrModule.attr.chooseOccupationNow.OCCUPATION_NAME;
    $scope.editUsrModule.data.OCCUPATION_CODE_TYPE  = $scope.editUsrModule.attr.chooseOccupationNow.OCCUPATION_TYPE;
    closeModal();
  };

  //从收入来源中把其他删除
  CommonFn.deleteElementInArr(dataInit.allCode.incomeway.codeName, '其他');

  $scope.$watch('editUsrModule.attr.incomeOtherWay', function () {
    if(!$scope.editUsrModule.attr.incomeOtherWay){
      $scope.editUsrModule.data.OTHER_INCOME_WAY = '';
    };
  });

  //显示新增关系表单
  function showAddRelationForm () {
    $scope.editUsrModule.attr.relationForm = true;
    $ionicScrollDelegate.resize();
  };

  function returnRelationForm () {
    $scope.editUsrModule.attr.relationForm = false;
    $ionicScrollDelegate.resize();
  };

  function checkTheSearch () {
    $scope.editUsrModule.attr.searchOccupationMacth = !$scope.editUsrModule.attr.searchOccupationMacth;
  };

  //校验用户名
  function checkUsrName(str, className) {
    checkFormHandle.checkUsrName(str, function(json) {
      if(!json.Falg){
        CommonFn.showFormError(className, json.msg);
      }else{
        CommonFn.hideFormError(className);
      };
    });
  };

  //验证证件号码
  function checkPersonId(idCard, className) {
    //判断证件类型
    switch($scope.editUsrModule.data.IDTYPE){
      case "居民身份证":
        idType = "idNo";
        break;

      case "中国护照":
        idType = "chinesepassport";
        break;

      case "军官证":
        idType = "officerpassport";
        break;

      case "士兵证":
        idType = "officerpassport";
        break;

      case "出生证":
        idType = "born";
        break;

      case "台湾通行证":
        idType = "taiwanpass";
        break;

      case "外国护照":
        idType = "foreignpassport";
        break;

      default:
        idType = "otheridtype";
    };

    //判断是否为回乡证
    if(typeof $scope.editUsrModule.data.IDTYPE != 'undefined' && $scope.editUsrModule.data.IDTYPE.indexOf('回乡证') != -1){
      idType = "gobackpass";
    };

    //如果没有没有选择证件类型
    if(typeof $scope.editUsrModule.data.IDTYPE == 'undefined' || $scope.editUsrModule.data.IDTYPE == ''){
      idType = "";
    };
    
    if(typeof idCard != 'undefined' && idCard != '' && idCard != null){
      if(idType == ""){
        CommonFn.showFormError('idtypeErrorMsg', "请选择证件类型");
        return;
      };

      if(idType == "otheridtype"){
        CommonFn.hideFormError(className);
        return;
      };

      //根据证件类型验证
      checkFormHandle.checkPersonIdCard(idCard, idType, function(json) {
        if(!json.Falg){
          CommonFn.showFormError(className, json.msg);
        }else{
          //身份证号码验证通过
          CommonFn.hideFormError(className);
          if($scope.editUsrModule.data.IDTYPE == '居民身份证'){
            calculateAge(idCard);
          };
        };
      });
    }else{
      CommonFn.hideFormError(className);
    };

  };

  //监听证件类型
  $scope.$watch('editUsrModule.data.IDTYPE', function () {
    if(typeof $scope.editUsrModule.data.IDTYPE != 'undefined' && $scope.editUsrModule.data.IDTYPE != "证件类型"){
      CommonFn.hideFormError('idtypeErrorMsg');
      checkPersonId($scope.editUsrModule.data.IDNO, 'idnoErrorMsg');
    };
  });

  //根据身份证号码计算年龄
  function calculateAge(_idCard) {
    var usrAgeMsg = CommonFn.getUserAge(_idCard);

    $scope.editUsrModule.data.AGE = usrAgeMsg.age;
    $scope.editUsrModule.data.BIRTHDAY = usrAgeMsg.birthday;
    $scope.editUsrModule.attr.idCardLongTime = usrAgeMsg.isEffective;

    if(usrAgeMsg.age < 1){
      $scope.editUsrModule.attr.agePass = false;
    }else{
      $scope.editUsrModule.attr.agePass = true;
    };

    if($scope.editUsrModule.data.AGE > 46){
      $scope.editUsrModule.attr.idCardLongTime = true;
    }else{
      $scope.editUsrModule.attr.idCardLongTime = false;
    };

  };

  //居住详细地址验证
  function checkAddress(str, className) {
    if((typeof str != 'undefined') && str != ''){
      checkFormHandle.checkAddress(str, function(json) {
        if(!json.Falg){
          CommonFn.showFormError(className, json.msg);
        }else{
          CommonFn.hideFormError(className);
        };
      });
    }else{
      CommonFn.hideFormError(className);
    };
  };

  //简单规则校验校验(除证件号码之外,普通输入框里的字符)
  function checkCommon(num, type, className) {
    if((typeof num) != 'undefined' && num != "" && num != null){
      checkFormHandle.commonCheck(num, type, function(json) {
        if(!json.Falg){
          CommonFn.showFormError(className, json.msg);
        }else{
          CommonFn.hideFormError(className);
        };
      });
    }else{
      CommonFn.hideFormError(className);
    };
  };

  //接口导出
  $scope.editUsrModule = {
    attr: {
      tabIndex             : 'basicMsg',
      basicMsgFormPass     : '',
      addressMsgFormPass   : '',
      idCardPassDontPass   : false,
      idCardLongTime       : false,
      agePass              : true,
      relationForm         : false,
      relationTypePass     : true,
      relationAgePass      : true,
      searchOccupationMacth: false,
      relationShipDataCache: {
        relationShipType: '',
        SEX             : '',
        BIRTHDAY        : '',
        AGE             : '',
        REAL_NAME       : ''
      },
      newRelationShip      : [],
      chooseOccupationNow  : null,
      activeNow            : '',
      occupationSelected   : false,
      searchOccupationMacth: false,
      incomeOtherWay       : false,
      mailingAddress       : ''
    },
    relationList: [],
    mustNeedData: Variables.mustNeedData,
    staticData: {
      "ClientType"         : dataInit.allCode.customertype.codeName,
      "ClientSource"       : dataInit.allCode.customersource.codeName,
      "ClientNation"       : dataInit.allCode.nationality.codeName,
      "Nationality"        : dataInit.allCode.nativeplace.codeName,
      "CertificateType"    : dataInit.allCode.idtype.codeName,
      "EducationBackground": dataInit.allCode.degree.codeName,
      "MARRI_STATUS"       : dataInit.allCode.marriage.codeName,
      "companyType"        : dataInit.allCode.incomeway.codeName,
      "ACCOUNT_TENDENCY"   : dataInit.allCode.accounttendency.codeName,
      "sites"              : ["家庭地址","单位地址"],
      "Relationship"       : dataInit.allCode.relation.codeMap,
      "Number"             : ['邮箱', '微博', '微信', 'QQ']
    },
    adress: {
      basicAfress: {
        province: allProvince,
        city    : null,
        county  : null
      },
      homeAddress: {
        province: allProvince,
        city    : null,
        county  : null
      },
      companyAddress: {
        province: allProvince,
        city    : null,
        county  : null
      }
    },
    data: UsrData.getUsrDetail({ID: id, tanslateCode:true}),
    fn  : {
      submitDataFn     : submitData,
      setPlatformFn    : setPlatform,
      idCardFnResertFn : idCardFnResert,
      useDatePluginFn  : useDatePlugin,
      relationResertFn : relationResert,
      addRelationShipFn: addRelationShip,
      closeModal       : closeModal,
      openModal        : openModal,
      occupationSelect : occupationSelect,
      searchOccupation : searchOccupation,
      chooseMyDate     : chooseMyDate,
      showAddRelationForm: showAddRelationForm,
      selectRelationFn : selectRelation,
      returnRelationForm: returnRelationForm,
      checkTheSearch   : checkTheSearch
    },
    formCheckFn: {
      checkUsrName: checkUsrName,
      checkPersonId: checkPersonId,
      checkCommon: checkCommon,
      checkAddress: checkAddress
    }
  };

  if($scope.editUsrModule.data.OCCUPATION_CODE_NAME){
    $scope.editUsrModule.attr.occupationSelected = true;
  };

  if($scope.editUsrModule.data.OTHER_INCOME_WAY){
    $scope.editUsrModule.attr.incomeOtherWay = true;
  };

  //判断邮寄地址
  if($scope.editUsrModule.data.MAILING_ADDRESS == ''){
    $scope.editUsrModule.attr.mailingAddress = '';
  }else{
    if($scope.editUsrModule.data.MAILING_ADDRESS == $scope.editUsrModule.data.HOME_ADDRESS){
      $scope.editUsrModule.attr.mailingAddress = '家庭地址';
    }else if($scope.editUsrModule.data.MAILING_ADDRESS == $scope.editUsrModule.data.COMPANY_ADDRESS){
      $scope.editUsrModule.attr.mailingAddress = '单位地址';
    }else{
      $scope.editUsrModule.attr.mailingAddress = '';
    };
  };

  //选择邮寄地址
  $scope.$watch('editUsrModule.attr.mailingAddress', function () {
    switch($scope.editUsrModule.attr.mailingAddress){
      case '家庭地址':
        $scope.editUsrModule.data.MAILING_ADDRESS = $scope.editUsrModule.data.HOME_ADDRESS;
        break;

      case '单位地址':
        $scope.editUsrModule.data.MAILING_ADDRESS = $scope.editUsrModule.data.COMPANY_ADDRESS;
        break;
    };
  });

  //获取客户的关系信息
  relationshipData.getRelation({
    id: id
  },function(arr){
    $scope.editUsrModule.relationList = arr;
  });

}]);
