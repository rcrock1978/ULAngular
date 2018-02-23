'use strict';

define([],function(){


	var viewModel = {
		Module : function(data){
		    return {
		        AppName: data.ApplicationName,
		        LinkText: data.ApplicationDisplayText,
		        AppIcon: data.ImageIcon,
		        Selected: false,
		        Controllers: data.Controllers,
		        Services: data.Services,
                Styles: data.Styles,
		        HasSideNav: data.HasSideNav,
		        BasePath: data.BasePath,
                IsEnable : data.IsEnable
		    }
		},
		
		Set : function(data){
			var response = [];
			var _self = this;
			angular.forEach(data,function(item){
			    this.push(_self.Module(item));
			},response);
			
			return response;
		}
		
	};
	
	return viewModel;
});
