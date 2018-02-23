
'use strict';

define([], function () {

    var GetSectors = function (sectors) {
        var items = [];
        angular.forEach(sectors, function (sector) {
            this.push({ id: sector.CoveredSectorId, label: sector.CoveredSector });
        }, items);
        return items;
    };

    var GetDateString = function (date) {
        var d = new Date(date);
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var m = months[d.getMonth()];
        return d.getDate().toString() + " " + m + " " + d.getFullYear();
    };

    var defMaxDate = new Date("12/31/2099");
    var defMinDate = new Date("1/1/0001");

    var model = {
        NewsItem: function (item, isEditMode, isReviewMode) {
            return {
                NewsId: item ? item.NewsItemId : null,
                CultureTypeId: item ? item.CultureTypeId : "",
                EffectiveDate: item ? item.EffectiveDate : null,
                EffectiveDateString: item ? GetDateString(item.EffectiveDate) : "",
                EffectiveDateMaxDate: item ? item.ExpirationDate : defMaxDate,
                ExpirationDate: item ? item.ExpirationDate : null,
                ExpirationDateString: item ? GetDateString(item.ExpirationDate) : "",
                ExpirationDateMinDate: item ? item.EffectiveDate : defMinDate,
                RegionalEU: item ? item.RegionalEUId : "",
                Region: item ? item.RegionId : "",
                SectorRegulated: item ? item.Sector : [],
                Country: item ? item.Country : [],
                ComplianceProgram: item ? item.ComplianceProgram : [],
                ProductType: item ? item.ProductType : [],
                FrequencyTechnology: item ? item.FrequencyTechnology : [],
                Title: item ? item.NewsTitle : "",
                Summary: item ? item.NewsSummary : "",
                Details: item ? item.NewsDetail : "",
                Note: item ? item.Note : "",
                ImageCaption: item ? item.ImageCaption : "",
                PostedDate: item ? item.PostedDate : "",
                PostedDateString: item ? GetDateString(item.PostedDate) : "",
                PostedBy: item ? item.PostedBy : "",
                Source: item ? item.NewsSourceId : "",
                Category: item ? item.CategoryName : "",
                ItemStatusId: item ? item.ItemStatusId : 1,
                Remarks: item ? item.Remarks : "",
                ParentNewsItemId: item ? item.ParentNewsItemId : "",
                AttachmentName: item ? item.AttachmentName : ""
                //ArticlePicture: item ? item.ArticlePicture : "",
                //EvidenceDocuments: item ? item.EvidenceDocuments : "",
                //SourceLink: item ? item.SourceLink : "",
                //LinkToNews: item ? item.LinkToNews : "",
                //Remarks: item ? item.Remarks : "",
                //DocumentType: item ? item.DocumentType : "",
                //SourceInfo: item ? item.SourceInfo : ""
            }
        },

        SetDefault: function () {
            var self = this;
            return self.NewsItem();
        },

        Set: function (item, isEditMode, isReviewMode) {
            var self = this;
            return self.NewsItem(item, isEditMode, isReviewMode)
        }
    };

    return model;
});
