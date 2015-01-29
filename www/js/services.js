var AppServices = angular.module('starter.services', []);

//所有controller公用的常量
AppServices.factory('Variables', ['CommonFn', function (CommonFn) {
	return {
        platform          : 'pad',
        appId   		  : '10002',//客户管理的id
        recommend_appId   : '10003',//建议书id
        recommend         : '',
        insurancerId      : '',//投保人id
        dataBaseName      : "esales.sqlite",
        occupationBaseName: "t_code.sqlite",
        professionalBase  : "t_occupation.sqlite",
        agentCode         : '8611018517',
        agentPassword     : '96E7921895EB72C92A549DD5A330112',
        mustNeedData      : [],
        translateDataArr  : [
        	{
	        	codeType: 'nationality',
	        	beTranslatedKey: 'NATIONALITY'
	        },
	        {
	        	codeType: 'customertype',
	        	beTranslatedKey: 'TYPE'
	        },
	        {
        		beTranslatedKey: 'SOURCE',
        		codeType: 'customersource'
        	},
        	{
        		beTranslatedKey: 'MARRI_STATUS',
        		codeType: 'marriage'
        	},
        	{
        		beTranslatedKey: 'EDUCATION',
        		codeType: 'degree'
        	},
        	{
        		beTranslatedKey: 'IDTYPE',
        		codeType: 'idtype'
        	},
        	{
        		beTranslatedKey: 'NATIVE_PLACE',
        		codeType: 'nativeplace'
        	},
        	{
        		beTranslatedKey: 'INCOME_WAY',
        		codeType: 'incomeway'
        	},
        	{
        		beTranslatedKey: 'ACCOUNT_TENDENCY',
        		codeType: 'accounttendency'
        	},
        	{
        		beTranslatedKey: 'SEX',
        		codeType: 'sex'
        	}
        ]
    }
}]);

AppServices.factory('dataInit', [function () {
	var dataJson = {
		allCode: {}
	};
	return dataJson;
}]);

AppServices.factory('setVariables', ['Variables', 'CommonFn', function (Variables, CommonFn) {

	function setVariablesDataFn () {
		Variables.appId              = CommonFn.getQueryStringByName("proid");
		Variables.platform           = CommonFn.getQueryStringByName("pctype");
		Variables.recommend          = CommonFn.getQueryStringByName("recommend");
		Variables.dataBaseName       = "promodel/"+Variables.appId+"/www/db/esales.sqlite";
		Variables.occupationBaseName = "promodel/"+Variables.appId+"/www/db/t_code.sqlite";
		Variables.professionalBase   = "promodel/"+Variables.appId+"/www/db/t_occupation.sqlite";
		Variables.insurancerId       = CommonFn.getQueryStringByName("applicant_id");
		Variables.agentCode          = CommonFn.getQueryStringByName("agentCode");
		Variables.agentPassword      = localStorage.agentPassword;
	};

	return {
		setVariablesData: function () {
			setVariablesDataFn();
		}
	}
}]);

AppServices.factory('dataInitRequest', ['Variables', 'dataInit', function (Variables, dataInit) {

	function getAllCodeMsgFn () {
		getAllCodeMsg(function (arrData) {
			for(var i=0; i<arrData.length; i++){
				var codeType = arrData[i].CODE_TYPE;

				if(!(codeType in dataInit.allCode)){
					dataInit.allCode[codeType] = {
						codeMap: [],
						codeName: []
					};
				};

				dataInit.allCode[codeType].codeMap.push(arrData[i]);
				dataInit.allCode[codeType].codeName.push(arrData[i].CODE_NAME);
			};
		});
	};

	//获取所有的code表
	function getAllCodeMsg (fn) {
		queryAllTableData({
			"databaseName": Variables.occupationBaseName,
	        "tableName": "T_CODE"
		},function (CallBackData) {
			fn && fn(CallBackData);
		},function(){
			alert('获取code失败');
		});
	};

	return {
		getAllCodeMsg: getAllCodeMsgFn
	}
}]);

//表单各种校验规则
AppServices.factory('checkFormHandle', [function() {

	//校验用户名
	function checkUsrNameFn(usrname, fn) {
		var xmlUrl = "validators/CustomerDetail-validation.xml";
		var formElementID = "realName";
		var formElementValue = usrname;
		var checkResult = formCheckHandle(xmlUrl, formElementID, formElementValue);

		fn && fn(checkResult);
	};

	//校验详细地址
	function checkAddressFn(address, fn) {
		var REGEXP = /^[a-zA-Z0-9\u4e00-\u9fa5]+$/g;

		if(REGEXP.test(address)){
			fn && fn({
				Falg: true,
				msg: ''
			})
		}else{
			fn && fn({
				Falg: false,
				msg: '地址不能含有标点符号'
			})
		};
	};

	//校验身份证
	function checkPersonIdCardFn(idNum, idType, fn) {
		var xmlUrl = "validators/CustomerDetail-validation.xml";
		var formElementID = idType;
		var formElementValue = idNum;
		var checkResult = formCheckHandle(xmlUrl, formElementID, formElementValue);

		fn && fn(checkResult);
	};

	function commonCheckFn(num, type, fn) {
		var xmlUrl = "validators/CustomerDetail-validation.xml";
		var formElementID = type;
		var formElementValue = num;
		var checkResult = formCheckHandle(xmlUrl, formElementID, formElementValue);

		fn && fn(checkResult);
	};

	return {
		checkUsrName: function(usrname, fn) {
			checkUsrNameFn(usrname, fn);
		},

		checkAddress: function(address, fn) {
			checkAddressFn(address, fn);
		},

		checkPersonIdCard: function(idNum, idType, fn) {
			checkPersonIdCardFn(idNum, idType, fn);
		},

		commonCheck: function(num, type, fn) {
			commonCheckFn(num, type, fn);
		}
	}
}]);

AppServices.factory('CommonFn', ['$rootScope', '$ionicLoading', '$timeout', '$ionicPopup', function ($rootScope, $ionicLoading, $timeout, $ionicPopup) {
	var hideBarFn = function () {
		$rootScope.commonModule.hideRightViewTopBar = true;
	};

	var showBarFn = function () {
		$rootScope.commonModule.hideRightViewTopBar = false;
	};

	//从一个数组中查找出一个元素
	function findIndex (arr, n) {
		if(!angular.isArray(arr)){
			return null;
		};
		for(var i=0; i<arr.length; i++){
			if(arr[i] === n){
				return i;
			};
		};

		return null;
	};

	function pushToViewCtrl (jsonKey) {
		pushToViewController(jsonKey, function (){
		  console.log("创建建议书跳转成功！");
		},function (){
			alert('shshs');
		  console.log("跳转失败！")
		});
	};

	function closeWebViewFn (arg) {
		//alert(JSON.stringify(arg, null, 4));
		closeWebView(arg,function (){
		  console.log('客户选择成功！');
		},function (){
		  console.log('客户选择失败！');
		}); 
	};

	function getQueryStringByName(name){
		var result = location.search.match(new RegExp("[\?\&]" + name+ "=([^\&]+)","i"));
		if(result == null || result.length < 1){
			return "";
		}
		return result[1];
	}

	//根据身份证算年龄
	var getUserAge = function (idCard) {
		var birthday = "";
		
		if(idCard != null && idCard != ""){
			if(idCard.length == 15){
				birthday = "19"+idCard.substr(6,6);
			} else if(idCard.length == 18){
				birthday = idCard.substr(6,8);
			}
		
			birthday = birthday.replace(/(.{4})(.{2})/,"$1-$2-");
		}
		
		var myDate = new Date(); 
		var month = myDate.getMonth() + 1; 
		var day = myDate.getDate(); 
		var age = myDate.getFullYear() - birthday.substring(0, 4) - 1; 
		if ((birthday.substring(4, 6) < month || birthday.substring(4, 6) == month) && birthday.substring(6, 8) <= day) { 
			age++; 
		};
		var isEffective = false;
		if(age > 46){ //国家规定四十六周岁以上发长期有效身份证
			isEffective = true;
		};

		return {
			"age" 		 : age,
			"birthday"   : birthday,
			"isEffective": isEffective
		};
	};

	//城市联动
	var adressSelect = function (module, allProvince, scope, dsy, provinceKey, cityKey, adressType) {
		var groupCity = null,
	        groupCounty = null,
	        groupCityKey;

	    scope.$watch(module + '.data.' + provinceKey, function () {
	      var provinceNow = scope[module].data[provinceKey];
	      
	      if(provinceNow){
	        var provinceIndex = findIndex(allProvince, provinceNow);

	        if(provinceIndex != null){
	        	groupCityKey = '0_' + provinceIndex;
		        groupCity = dsy.Items[groupCityKey];
		        scope[module].adress[adressType].city = groupCity;
		        scope[module].adress[adressType].county = [];
	        };
	      };
	    });

	    scope.$watch(module + '.data.' + cityKey, function () {
	      var cityNow = scope[module].data[cityKey];

	      if(cityNow){
	        var cityIndex = findIndex(groupCity, cityNow);

	        if(cityIndex != null){
	        	var CountyKey = groupCityKey + '_' + cityIndex;
		        groupCounty = dsy.Items[CountyKey];
		        scope[module].adress[adressType].county = groupCounty;
	        };
	      };
	    });
	};

	//根据时间选择器获得时间
	var getDateObject = function (fn) {
		if(!$.fn.calenderFun){
			return;
		};
		
		$.fn.calenderFun({
          'minYear' : '1900',
          'maxYear' : '2100',
          'dateFormat'  : 'yyyy-mm-dd',
          'callBackFun':function (data){
          	fn && fn(data);
          }
	    });
	};

	//根据生日算年龄
	var birthdayToAge = function (birthday) {
		var myDate = new Date();
		var month = myDate.getMonth() + 1; 
		var day = myDate.getDate(); 
		var age = myDate.getFullYear() - birthday.substring(0, 4) - 1; 
		if ((birthday.substring(4, 6) < month || birthday.substring(4, 6) == month) && birthday.substring(6, 8) <= day) { 
			age++; 
		};
		return age;
	};

	//单位数转两位数
	var toDouble = function (num) {
		if(num < 10){
			  return "0"+num;
		}
		else{
			  return ""+num;
		};
	};

	//获取当前时间
	var getTimeNow = function () {
		var json = {};
		var oDate = new Date();

		json.year = oDate.getFullYear();
		json.month = toDouble(oDate.getMonth()+1);
		json.date  = toDouble(oDate.getDate());
		json.hours = oDate.getHours();
		json.minutes = oDate.getMinutes();
		json.timeMs = oDate.getTime();

		return json;
	};

	var jsonClone = function (json){
		var newJson = {};

		for(var attr in json){
			newJson[attr] = json[attr];
		};

		return newJson;
	};

	function createUUid(){
		var uuid = new UUID().createUUID();
		uuid = uuid.replace(/[-]/g, "");  
		return uuid; 
	};

	//把codeName转化为code
	function codeNameToCode (form, codeName) {
		for(var i=0; i<form.length; i++){
			if(form[i].CODE_NAME == codeName){
				return form[i].CODE;
			};
		};

		return undefined;
	};

	//把code转化为codeName
	function codeToCodeName (form, code) {
		for(var i=0; i<form.length; i++){
			if(form[i].CODE == code){
				return form[i].CODE_NAME;
			};
		};

		return undefined;
	};

	function deleteElementInArr (arr, ele) {
		for(var i=0; i<arr.length; i++){
			if(arr[i] == ele){
				arr.splice(i,1);
			};
		};
	};

	function checkConnection() {
		return window.navigator.onLine;
	};

	function myAlert (str) {
		$ionicLoading.show({
          template: str
        });

        $timeout(function () {
          $ionicLoading.hide();
        }, 1000);
	};

	function showConfirm (opts) {
		$ionicPopup.confirm({
			title: opts.title,
			content: opts.content,
			okText:'确定',
   			cancelText: '取消'
		}).then(function (res) {
			if (res) {
				opts.sure();
			};
		});
	};

	function cloneArr (arr) {
		var newArr = [];

		for(var i=0; i<arr.length; i++){
			newArr.push(arr[i]);
		};

		return newArr;
	};

	function ionicAlert (str) {
		$ionicPopup.alert({
			title: '提示',
			content: str,
			okText:'确定',
			okType: 'myokbutton'
		}).then(function (res) {
			//console.log('Thank you for not eating my delicious ice cream cone');
		});
	};

	function showLoading (str) {
		$ionicLoading.show({
	      template: '<div class="pop_up_box"><span class="myloading"></span>'+str+'</div>'
	    });
	};

	function hideLoading () {
		$ionicLoading.hide();
	};

	function showFormError(className, msg) {
		$('.'+className).addClass('my-show');
      	$('.'+className).text(msg);
	};

	function hideFormError(className) {
		$('.'+className).removeClass('my-show');
      	$('.'+className).text('');
	};

	function isExist(value) {
		if(typeof value == 'undefined' || value == null || value == ''){
			return false;
		}else{
			return true;
		};
	};

	return {
		hideBarFn           : hideBarFn,
		showBarFn           : showBarFn,
		findIndex           : findIndex,
		adressSelect        : adressSelect,
		getUserAge          : getUserAge,
		getDateFn	        : getDateObject,
		birthdayToAgeFn     : birthdayToAge,
		getTimeNowFn        : getTimeNow,
		jsonClone           : jsonClone,
		createUUid          : createUUid,
		getQueryStringByName: getQueryStringByName,
		pushToViewCtrl      : pushToViewCtrl,
		closeWebViewFn      : closeWebViewFn,
		codeNameToCode      : codeNameToCode,
		codeToCodeName      : codeToCodeName,
		deleteElementInArr  : deleteElementInArr,
		checkConnection     : checkConnection,
		myAlert             : myAlert,
		cloneArr            : cloneArr,
		showConfirm         : showConfirm,
		ionicAlert          : ionicAlert,
		showLoading         : showLoading,
		hideLoading         : hideLoading,
		showFormError       : showFormError,
		hideFormError       : hideFormError,
		isExist             : isExist
	};
}]);

//创建建议书
AppServices.factory('manuScriptServer', ['Variables', 'CommonFn', 'relationshipData', 'dataInit', function (Variables, CommonFn, relationshipData, dataInit) {

	var appId = Variables.recommend_appId;
	var platform = Variables.platform;

	//创建建议书
	function createManuscript (sendMsg){
		var url = "promodel/"+appId+"/www/index.html#/customer/none/Y?pctype="+platform+"&proid="+appId;
		var jsonKey ={
		  "serviceType":"LOCAL",
		  "URL": url,
		  "key":sendMsg
		};

		CommonFn.pushToViewCtrl(jsonKey);
	};

	//组装数据
	function createMsg (scope, detailData, fn) {
	    var key             = {};
	    var array           = {};

	    key["recommend"]    = scope.CustomerDetailModule.attr.recommend;
	    array["id"] 	    = detailData.ID;//客户编号
	    array["name"]       = detailData.REAL_NAME;//客户姓名
	    array["birth"]      = detailData.BIRTHDAY;//客户生日
	    array["sex"]        = detailData.SEX;//客户性别
	    array["ocup_code"]  = detailData.OCCUPATION_CODE;//职业代码
	    array["ocup_name"]  = detailData.OCCUPATION_CODE_NAME;//职业名称
	    array["ocup_type"]  = detailData.OCCUPATION_CODE_TYPE;//职业类型
	    
	    if("2" == scope.CustomerDetailModule.attr.recommend){//选择的时被保人时，把与投保人得关系传过去
	    	if(Variables.insurancerId){
	    		if(detailData.ID == Variables.insurancerId){
	    			array["relation"] = '00';
	    			key["info"] = array;
					fn && fn(key);
	    		}else{
	    			relationshipData.getRelation({
						id: Variables.insurancerId
					},function(arr){
						var relationCode = '';
						arr.forEach(function(obj){
							if(obj.ID == detailData.ID){
								relationCode = CommonFn.codeNameToCode(dataInit.allCode.relation.codeMap, obj.relationName);
								//relationCode = obj.relationName;
							};
						});
						array["relation"] = relationCode;
						key["info"] = array;
						fn && fn(key);
					});
	    		};
	    	}else{
	    		array["relation"] = '';
    			key["info"] = array;
				fn && fn(key);
	    	};
	    }else{
	    	key["info"] = array;
	    	fn && fn(key);
	    };
	};

	return {
		createManuscriptFn: function (sendMsg){
			createManuscript(sendMsg);
		},

		createMsgFn: function (scope, detailData, fn) {
			createMsg(scope, detailData, fn);
		},

		selectCustomFn: function (sendMsg) {
			CommonFn.closeWebViewFn(sendMsg);
		}
	};
}]);

//职业搜索
AppServices.factory('searchOccupationServer', ['Variables', function (Variables) {

	function searchOccupationFn (opts) {

		if(typeof opts.keyWord == 'undefined' || opts.keyWord == ''){
			queryAllTableData({
				"databaseName": Variables.professionalBase,
		        "tableName": "T_OCCUPATION"
			},function (CallBackData) {
				opts.callBack && opts.callBack(CallBackData);
			},function(){
				alert('搜索失败');
			});
			return;
		};

		var keyWord = opts.keyWord;
		var sql = "select * from T_OCCUPATION";
	    if("" != keyWord){
	    	if(opts.ruler){
	    		sql+=" where OCCUPATION_CODE = "+keyWord+" or OCCUPATION_NAME = "+keyWord;
	    	}else{
	    		sql+=" where OCCUPATION_CODE like '%"+keyWord+"%' or OCCUPATION_NAME like '%"+keyWord+"%'";
	    	};
	    };

	    var json = {
	        "databaseName":Variables.professionalBase,
	        "sql": sql+" order by OCCUPATION_CODE asc"
	    };

		queryTableDataUseSql(json,function(data){ 
			//调用成功
			opts.callBack && opts.callBack(data);
		},function(){
			console.log('查询出错！');
		});
	};

	return {
		searchOccupation: function (opts) {
			searchOccupationFn(opts);
		}
	}
}]);

//客户增、删、改、查
AppServices.factory('UsrData', ['$rootScope', '$state', 'Variables', 'CommonFn', 'dataInit', function ($rootScope, $state, Variables, CommonFn, dataInit) {
	//静态数据用于测试
	var staticData = [];
	var SCOPE = null;
	var customListCache = null; //此登陆用户的所有客户

	//获取客户列表
	var getListFn = function (opts, fn) {
		SCOPE = opts.scope;

		if(opts.getStaticData){
			//取静态数据
			SCOPE.CustomerLists = staticData;
		}else{
			//从服务器上取得新数据
			var reg = /undefined/g;
			if(reg.test(Variables.dataBaseName)){
				alert('数据库路径错误，缺少appId');
				return;
			};
			
			queryTableDataByConditions({
				"databaseName": Variables.dataBaseName,
	            "tableName": "T_CUSTOMER",
	            "conditions": {
	            	"AGENT_CODE": Variables.agentCode
	            }
			},function (CallBackData) {
				customListCache = CommonFn.cloneArr(CallBackData).reverse();
				SCOPE.CustomerLists = CallBackData.reverse();
				SCOPE.$apply(SCOPE.CustomerLists);
				fn && fn();
			},function(){
				alert('获取客户列表失败');
			});
		};
	};

	//获取客户详情
	var getUsrDetailFn = function (opts) {

		var dataSearch = {};
		var dataResult = {};
		var translateDataArr = Variables.translateDataArr;

		for(var i=0; i<customListCache.length; i++){
			if(customListCache[i].ID == opts.ID){
				dataSearch = customListCache[i];
				break;
			};
		};

		angular.forEach(dataSearch, function (value, key) {
			dataResult[key] = value;
		});

		//是否把code转化为名称
		if(opts.tanslateCode){
			//把code值转化为名称
			var codeType,
				codeKey;

			if(translateDataArr.length){
				for(var i=0; i<translateDataArr.length; i++){
					codeKey = translateDataArr[i].beTranslatedKey;
					codeType = translateDataArr[i].codeType;
					dataResult[codeKey] = CommonFn.codeToCodeName(dataInit.allCode[codeType].codeMap, dataResult[codeKey]);
				};
			};
		};

		return dataResult;
	};

	//编辑客户资料
	var editUsrDataFn = function (newData, fn) {
		if(newData.test){
			editSeccess (newData);
		}else{
			setUsrFn(newData, fn);
		};
	};

	//编辑成功
	function editSeccess (newData) {
		//从缓存列表中编辑
		for(var j=0; j<customListCache.length; j++){
			if(customListCache[j].ID == newData.ID){
				customListCache.splice(j,1);
				customListCache.unshift(newData);
				break;
			};
		};

		//从model列表中编辑
		for(var i=0; i<SCOPE.CustomerLists.length; i++){
			if(SCOPE.CustomerLists[i].ID == newData.ID){
				SCOPE.CustomerLists.splice(i,1);
				SCOPE.CustomerLists.unshift(newData);
				break;
			};
		};
		$rootScope.commonModule.goBack();
	};

	//提交表单时，把名称转化为code
	function translateTheNameToCode (dataSorce, arrRule) {
		var modelKey = '';
		var codeMapName = '';

		for(var i=0; i<arrRule.length; i++){
			modelKey = arrRule[i].beTranslatedKey;
			codeMapName = arrRule[i].codeType;

			if(dataSorce[modelKey]){
				dataSorce[modelKey] = CommonFn.codeNameToCode(dataInit.allCode[codeMapName].codeMap, dataSorce[modelKey]);
			};
		};
	};

	//添加或编辑客户
	var setUsrFn = function (opts, fn) {

		opts.data = angular.copy(opts.data);

		var dateNow           = CommonFn.getTimeNowFn();
		var dateCreate        = dateNow.year + '-' + dateNow.month + '-' + dateNow.date;

		if(opts.add){
			opts.data.ID      = CommonFn.createUUid();
		};
		
		opts.data.CREATE_TIME = dateCreate;
		opts.data.UPDATE_TIME = dateCreate;
        opts.data.AGENT_CODE  = Variables.agentCode;

        //提交数据到数据库时，把名称转化为code
        translateTheNameToCode(opts.data, Variables.translateDataArr);

        //去除一些ionic框架添加的额外字段
        if('$$hashKey' in opts.data){
        	delete opts.data['$$hashKey'];
		};

		//不允许提交value为null的值
		angular.forEach(opts.data, function (value, key) {
			if(value == null || value == ''){
				opts.data[key] = '';
			};
		});

		if(opts.test){
			//addCustomSuccess(opts.data, opts.jumpToDetail);
			fn && fn(SCOPE, opts.data);
		}else{
			var ManipulateJson = {
				"databaseName": Variables.dataBaseName,
				"tableName"   : opts.formName,
				"conditions"  : [{"ID": opts.data.ID}],
				"data"        : [opts.data]
			};

			//插入数据到本地数据库
			updateORInsertTableDataByConditions(ManipulateJson,function(str){
				if(1 == str[0]){	
					//addCustomSuccess(opts.data, opts.jumpToDetail);
					fn && fn(SCOPE, opts.data, customListCache);
				}else{
					alert('新增客户失败');
				}
			},function(){
				alert("数据插入异常！");
			})
		};
	};

	//添加客户成功
	var addCustomSuccess = function (data, jump) {
		customListCache.unshift(data);
		SCOPE.CustomerLists.unshift(data);
		//SCOPE.$apply(SCOPE.CustomerLists);
		if($rootScope.commonModule.isPad){
			if(jump){
				//如果是pad，则添加完新客户后，跳转到此客户的详情展示页；
	      		$state.go('app.CustomerMain.usrDetailJump',{usrListId: data.ID});
			};
	    }else{
	      //如果是手机，则返回列表
	      $rootScope.commonModule.goBack();
	    };
	};

	//删除客户
	var deleteUsrFn = function (opts, fnScc) {
		//是否只从静态数据中删除
		if(opts.useStaticData){
			deleteUsrInStaticData(opts, fnScc);
		}else{
			//调用原生插件删除
			deleteTableData({
				"databaseName": Variables.dataBaseName,
				"tableName": "T_CUSTOMER",
				"conditions": [{
					"ID": opts.ID
				}]
			},function(arr){
				if(1 == arr[0]){	
					deleteUsrInStaticData(opts, fnScc);
				}else{
					alert('删除失败');
				}
		    },function(){
		        alert("数据删除异常！");
		    });
		};
	};

	//从scope上删除客户
	var deleteUsrInStaticData = function (opts, fnScc) {
		//从缓存列表中删除
		for(var j=0; j<customListCache.length; j++){
			if(customListCache[j].ID == opts.ID){
				customListCache.splice(j,1);
			};
		};

		//从model列表里删除
		for(var i=0; i<SCOPE.CustomerLists.length; i++){
			if(SCOPE.CustomerLists[i].ID == opts.ID){
				SCOPE.CustomerLists.splice(i,1);
				fnScc && fnScc();
			};
		};
	};

	//搜索客户
	var searchUsrFn = function (scope) {
		var keyWord = scope.MyCustomerListCtrlModule.data.keyWord;
		var sql = "select * from T_CUSTOMER";
	    if("" != keyWord){
	    	sql+=" where REAL_NAME like '%"+keyWord+"%' and AGENT_CODE = "+Variables.agentCode;
	    }else{
	    	getListFn({
		      getStaticData: false,
		      scope: scope
		    });
	    	return;
	    };

	    var json = {
	        "databaseName":Variables.dataBaseName,
	        "sql": sql
	    };

		queryTableDataUseSql(json,function(CallBackData){ //调用成功
			SCOPE.CustomerLists = CallBackData.reverse();
			SCOPE.$apply(SCOPE.CustomerLists);
		},function(){
			console.log('查询出错！');
		});
	};

	function checkCustomHas (name) {

		for(var i=0; i<customListCache.length; i++){
			if(customListCache[i].REAL_NAME == name){
				return true;
			};
		};

		return false;
	};

	//接口导出
	return {
		//获取客户列表
		getList: function (opts, fn) {
			getListFn(opts, fn);
		},

		//获取客户个人详情
		getUsrDetail: function (opts) {
			return getUsrDetailFn(opts);
		},

		//新增客户
		setUsr: function (opts, fn) {
			setUsrFn(opts, fn);
		},

		//编辑客户
		editUsrData: function (opts, fn) {
			editUsrDataFn(opts, fn);
		},

		//删除客户
		deleteUsrList: function (opts, fnScc) {
			deleteUsrFn(opts, fnScc);
		},

		//查找客户
		searchUsr: function (opts) {
			searchUsrFn(opts);
		},

		addCustomSuccessFn: function(data, jump){
			addCustomSuccess(data, jump);
		},

		editSeccessFn: function (data) {
			editSeccess(data);
		},

		checkCustomHasFn: function (name) {
			return checkCustomHas(name);
		}
	}
}]);

//获取客户关系信息
AppServices.factory('relationshipData', ['Variables', 'UsrData', 'CommonFn', 'dataInit', function (Variables, UsrData, CommonFn, dataInit) {
	var familyData = null;//RELATION
	var relationData = dataInit.allCode.relation.codeMap;//关系代码CODE
	var resultRelationMsg = [];
	
	var getFamilyDataFn = function (opts, fn) {
		//根据客户id查询此客户的所有家属信息(relation)
		queryTableDataByConditions({
			"databaseName": Variables.dataBaseName,
            "tableName": "T_CUSTOMER_FAMILY",
            "conditions": {
            	"FIRST_CUSTOMER_ID": opts.id
            }
		},function (CallBackData) {
			familyData = CallBackData;
			sortTheRelation(familyData, fn);
		},function(){
			alert('获取关系信息失败');
		});
	};

	//以关系code为字段分类客户的所有关系信息
	function sortTheRelation (arrFamily, fn) {
		resultRelationMsg.length = 0;
		
		for(var i=0; i<arrFamily.length; i++){
			var relationKey  = arrFamily[i].RELATION;
			var secondCode   = arrFamily[i].SECOND_CUSTOMER_ID;
			var relationName = getRelationNameFromCode(relationKey, relationData);
			var familyMsg    = UsrData.getUsrDetail({ID: secondCode});

			if('ID' in familyMsg){
				familyMsg.relationName = relationName;
				resultRelationMsg.push(familyMsg);
			};
		};

		fn && fn(resultRelationMsg);
	};

	//根据关系code查找关系名称
	function getRelationNameFromCode (code, codeArr) {
		for(var i=0; i<codeArr.length; i++){
			if(codeArr[i].CODE == code){
				return codeArr[i].CODE_NAME;
			};
		};
	};


	var count = 0;

	//插入客户的关系信息
	function addCustomRelationShipFn (arr, id, fn, countRelation) {
		if(!arr.length){
			return;
		};

		var newCustomData       = {};
	    var relationShipDataNow = arr.pop();

	    (function (relationShipData) {
	    	newCustomData.SEX       = relationShipData.SEX;
		    newCustomData.REAL_NAME = relationShipData.REAL_NAME;
		    newCustomData.BIRTHDAY  = relationShipData.BIRTHDAY;
		    newCustomData.AGE       = relationShipData.AGE;

		    UsrData.setUsr({
				data        : newCustomData,
				test        : false,
				add         : true,
				formName    : 'T_CUSTOMER'
			},function (SCOPE, data, customListCache){
				customListCache.unshift(data);
				SCOPE.CustomerLists.unshift(data);
				addFamily(data, relationShipData.relationShipType, id, function(){
					count++;
					if(count == countRelation){
						fn && fn();
					};
				});
			});

	    })(relationShipDataNow);
		
		//递归添加关系信息
		addCustomRelationShipFn(arr, id, fn, countRelation);
	};

	//向家庭表里插入客户
	function addFamily (data, relationType, id, fn) {

        //去除一些ionic框架添加的额外字段
        if('$$hashKey' in data){
        	delete data['$$hashKey'];
		};

		//不允许提交value为null的值
		angular.forEach(data, function (value, key) {
			if(value == null){
				value = '';
			};
		});

		var familyKey = CommonFn.createUUid();
		
		var relationJson = {
			"databaseName": Variables.dataBaseName,
			"tableName"   : 'T_CUSTOMER_FAMILY',
			"conditions"  : [{"ID": familyKey}],
			"data"        : [{
				"ID": familyKey, //家庭信息ID
				"FIRST_CUSTOMER_ID": id,//主客户id
				"SECOND_CUSTOMER_ID": data.ID,//从客户id
				"RELATION": relationType.CODE,//关系
				"CREATE_TIME":data.CREATE_TIME,//创建时间
				"UPDATE_TIME":data.UPDATE_TIME
			}]
		};
		
		//插入数据到本地数据库
		updateORInsertTableDataByConditions(relationJson,function(str){
			if(1 != str[0]){	
				alert('失败');
			}else{
				fn && fn();
			};
		},function(){
			alert("数据插入异常！");
		})
	};

	return {
		//根据ID获取客户关系信息
		getRelation: function (opts, fn) {
			getFamilyDataFn(opts, fn);
		},

		addCustomRelationShip: function (arr, id, fn, countRelation) {
			count = 0;
			addCustomRelationShipFn(arr, id, fn, countRelation);
		}
	};
}]);