var filterModule = angular.module('starter.filters', []);

//若无数据，返回暂无标示
filterModule.filter('showDefaultData', function(){
	var defaultDataFilter = function (data, argOne) {
		argOne = argOne || '';

		return data?data:'无' + argOne;
	};
	return defaultDataFilter;
});

//code转化为名称
filterModule.filter('codeToName', ['dataInit', 'CommonFn', function (dataInit, CommonFn) {

	var nationCodeFilter = function (data, argOne) {
		if(data != null){
			if(data){
				return CommonFn.codeToCodeName(dataInit.allCode[argOne].codeMap, data);
			}else{
				return '无';
			};
			
		}else{
			return '无';
		};
	};
	return nationCodeFilter;
}]);

//年龄
filterModule.filter('age', function(){
	var defaultDataFilter = function (data) {
		
		if(data){
			return data+'岁';
		}else{
			return '年龄';
		};
	};
	return defaultDataFilter;
});

//年龄数据过滤
filterModule.filter('ageFilter', function(){
	var defaultDataFilter = function (data) {
		
		if(data != ''){
			return data+'岁';
		}else{
			return '无';
		};
	};
	return defaultDataFilter;
});