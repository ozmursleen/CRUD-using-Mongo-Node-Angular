var app = angular.module('myApp', ['ngGrid']);
var isLoadedModel = false;
app.controller('MyCtrl', function($scope,$http) {

    $scope.isLoadedModel = isLoadedModel;
    $scope.datas = [];
    $scope.Model = [];
    
    $scope.base = '/api/todos/';

    $scope.filterOptions = {
        filterText: "",
        useExternalFilter: true
    }; 
    $scope.totalServerItems = 0;
    $scope.pagingOptions = {
        pageSizes: [2, 4, 10],
        pageSize: 4,
        currentPage: 1
    };

    $scope.buildUrl = function(){
    	$scope.url = $scope.base+$scope.pagingOptions.currentPage+'/'+$scope.pagingOptions.pageSize+'/';
    };

    $scope.getFieldTemplateUrl = function(field) {
        return '/templates/' + field.dataType + '.html';
    };
    

    $scope.setPagingData = function(data, page, pageSize){	
       
        $scope.datas = data.datas;
        $scope.totalServerItems = data.count;
       


        if(!isLoadedModel){
            angular.forEach(data.model, function(value, key) {
              $scope.Model.push({field: key, displayName: value.displayName,dataType:value.dataType,required:value.required});
            });
            $scope.initGrid();
            isLoadedModel = true;
            $scope.isLoadedModel = isLoadedModel;
        }
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };


    $scope.getPagedDataAsync = function (pageSize, page, searchText) {
        setTimeout(function () {
            var data;
             $scope.buildUrl();
            if (searchText) {
                var ft = searchText.toLowerCase();
                      
            } else {
               // when landing on the page, get all todos and show them
			    $http.get($scope.url)
			        .then(function (success){			        		
			        		 $scope.setPagingData(success.data,page,pageSize);
				   },function (error){

				   });
            }
        }, 100);
    };
	
    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
	
    $scope.$watch('pagingOptions', function (newVal, oldVal) {
        if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
          $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
        }
    }, true);

    $scope.$watch('pagingOptions.pageSize', function (newVal, oldVal) {
        if (newVal !== oldVal) {
        	$scope.pagingOptions.currentPage=1;
          $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
        }
    });
    $scope.$watch('filterOptions', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
        }
    }, true);

    $scope.Model = [];
    $scope.initGrid = function(){
        var tempModel = angular.copy($scope.Model);
        var actionCol = {};
        actionCol.dataType = "Button";
        actionCol.displayName = "Action";
        actionCol.field = "Button";
        actionCol.required = true;
        

        tempModel.push(actionCol);

         $scope.gridOptions = { 
            data: 'datas',
            enableCellSelection: true,
            enableRowSelection: true,
            enableCellEdit: true,
            enableSearch: true,
           /* columnDefs: 
                        [{field: 'name', displayName: 'Name'}, 
                        {field:'password', displayName:'Password'}],*/
            columnDefs: tempModel,          
            enablePaging: true,
            showSelectionCheckbox : true,
            showFooter:true,
            totalServerItems: 'totalServerItems',
            pagingOptions: $scope.pagingOptions,
            filterOptions: $scope.filterOptions,
            onRegisterApi: function( gridApi ) {
              $scope.gridApi = gridApi;
            }
        };
       
    };
    $scope.initGrid();

    $scope.formData = {};

    

    // when submitting the add form, send the text to the node API
    $scope.createTodo = function() {
        $scope.buildUrl();
        $http.post($scope.url, $scope.formData)
	         	.then(function (success){	         		
		         	$scope.formData = {}; // clear the form so our user is ready to enter another
		           $scope.setPagingData(success.data,$scope.pagingOptions.currentPage,$scope.pagingOptions.pageSize);     
			   	},function (error){

			   });
           
    };

    // delete a todo after checking it
    $scope.deleteTodo = function(id) {
         $scope.buildUrl();
        	$http.delete($scope.url + id)
        		.then(function (success){
		         	$scope.setPagingData(success.data,$scope.pagingOptions.currentPage,$scope.pagingOptions.pageSize);     
			   	},function (error){

			   });          
    };

    $scope.$on('ngGridEventEndCellEdit', function(event) {
        $scope.buildUrl();
	    var contact = event.targetScope.row.entity;
	   	$http.put($scope.url,contact)
          .then(function (success){	         				         	
           $scope.setPagingData(success.data,$scope.pagingOptions.currentPage,$scope.pagingOptions.pageSize);     
	   	},function (error){

	   });
	});
});