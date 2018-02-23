
define(['shell/model/refinerModel'],
    function (refinerModel) {
	
	var globalUtility = {
		//global variables
	    AppId: '17C2A926-C9AC-413B-B901-21F5B5856CBF',
	    CurrentPage: '',
	    CurrentUser: "",
	    CurrentUserFullName: "",
	    IsAuthorized: window.localStorage.wresult ? true : false,
	    IsDebug: window.localStorage.wresult ? false : true,
	    //IsDebug: window.localStorage.wresult ? false : true,
	    SelectedCategory: [],
	    SelectedFreqTech: [],
	    SelectedScope: '',
	    SelectedSector: [],
	    SelectedLanguage: "",
	    SelectedAcceptedTestReports: [],
	    SelectedAccepTestEMC: [],
	    SelectedAccepTestSafety: [],
	    SelectedAccepTestWireless: [],
	    SelectedApplicationType: [],
	    SelectedCertBusinessStatus: [],
	    SelectedCertificateValidityPeriod: [],
	    SelectedCertificationOrganization: [],
	    SelectedCertLimit: [],
	    SelectedCertOrg: [],
	    SelectedCertScheme: [],
	    SelectedCertStatus: [],
	    SelectedCertValidPeriod: [],
	    SelectedCompany: [],
	    SelectedComplianceModel: [],
	    SelectedComplianceProgram: [],
	    SelectedCountry: [],
	    SelectedCoveredSector: [],
	    SelectedDocumentType: [],
	    SelectedEffectiveEndDateTime: [],
	    SelectedEffectiveStartDateTime: [],
	    SelectedExpirationEndDateTime: [],
	    SelectedExpirationStartDateTime: [],
	    SelectedFrequencyAndTechnology: [],
	    SelectedFrequencyTech: [],
	    SelectedICTEMC: [],
	    SelectedICTSafety: [],
	    SelectedICTWireless: [],
	    SelectedInCountryTesting: [],
	    SelectedIsMandatory: [],
	    SelectedIssueEndDateTime: [],
	    SelectedIssueStartDateTime: [],
	    SelectedKeyword: [],
	    SelectedLocalRep: [],
	    SelectedLocalRepresentative: [],
	    SelectedLocalRepresentativeService: [],
	    SelectedLocalRepService: [],
	    SelectedMandatoryOrVoluntary: [],
	    SelectedMarkingReq: [],
	    SelectedModularApproval: [],
	    SelectedNewsSource: [],
	    SelectedOrganizationType: [],
	    SelectedPostedEndDateTime: [],
	    SelectedPostedStartDateTime: [],
	    SelectedPowerSource: [],
	    SelectedPreferredChannel: [],
	    SelectedProductSubType: [],
	    SelectedProductType: [],
	    SelectedRegion: [],
	    SelectedSameReqEMC: [],
	    SelectedSampleRequirement: [],
	    SelectedSampReqSafety: [],
	    SelectedSampReqWireless: [],
	    SelectedScopeWireless: [],
	    SelectedSectorRegulated: [],
	    SelectedStatusType: [],
	    ServiceUrl: '',
	    UploadExcludeExtension: ["exe", "bat", "zip", "rar", "mp4", "avi", "wmv", "mp3"],
	    UploadSize: 10485760,
	    UploadPromptInvalidFilename: 'Please provide valid document file name and type',
	    UploadPromptInvalidFilesize: 'Invalid filesize. Maximum filesize limit is 10MB',

        //modules
        Modules: [],
        CertificateLookups: null,
        NewsLookUps: [],
        R2CLookups: [],
        DeliveryLookups: [],

		//functions
        ArrayBufferToBase64String: ArrayBufferToBase64String,
        DownloadStream: DownloadStream,
        FindOne: FindOne,
        GetFileTypeIcon: GetFileTypeIcon,
        GetPreselectedRefiners: GetPreselectedRefiners,
        GetRefinerList: GetRefinerList,
        IsDefined: IsDefined,
        IsNullOrWhiteSpace: IsNullOrWhiteSpace,
        ToLower: ToLower,		
        ToUpper: ToUpper,
        DateFormatDisplay: DateFormatDisplay,
        SetNotAvailableRefiners: SetNotAvailableRefiners,
        HasGlobalRefiners : HasGlobalRefiners,
        GetPreselectedKeywordRefiner: GetPreselectedKeywordRefiner,
        GetPreselectedMultiKeywordRefiner: GetPreselectedMultiKeywordRefiner,

	    //UserRoles
        Contributor: false,
        Reader: false,
        Coordinator: false,
        ContentAdmin: false,
        TranslatorJapanese: false,
        TranslatorChinese: false,
        SalesReader: false,

	    //Lookups
	    CountryList: [],
        RegionalEconomicUnion: [],
        SectorList: [],
        ComplianceProgram: [],
        Scope: []
	};
		
	return globalUtility;
		
    //function implementations
        //////////////  

	function HasGlobalRefiners() {

	    return (this.SelectedApplicationType.length > 0 ||  this.SelectedComplianceProgram.length > 0  || this.SelectedCountry.length > 0 
            || this.SelectedCustomer.length > 0 || this.SelectedFreqTech.length > 0 || this.SelectedPowerSource.length > 0
            || this.SelectedProductType.length > 0 || this.SelectedProductSubType.length > 0 || this.SelectedRegion.length > 0
            || this.SelectedSector.length > 0);

	}
		
	function ArrayBufferToBase64String(arrayBuffer) {
		    var base64 = ''
		    var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

		    var bytes = new Uint8Array(arrayBuffer)
		    var byteLength = bytes.byteLength
		    var byteRemainder = byteLength % 3
		    var mainLength = byteLength - byteRemainder

		    var a, b, c, d
		    var chunk

		    // Main loop deals with bytes in chunks of 3
		    for (var i = 0; i < mainLength; i = i + 3) {
		        // Combine the three bytes into a single integer
		        chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

		        // Use bitmasks to extract 6-bit segments from the triplet
		        a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
		        b = (chunk & 258048) >> 12 // 258048   = (2^6 - 1) << 12
		        c = (chunk & 4032) >> 6 // 4032     = (2^6 - 1) << 6
		        d = chunk & 63               // 63       = 2^6 - 1

		        // Convert the raw binary segments to the appropriate ASCII encoding
		        base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
		    }

		    // Deal with the remaining bytes and padding
		    if (byteRemainder == 1) {
		        chunk = bytes[mainLength]

		        a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

		        // Set the 4 least significant bits to zero
		        b = (chunk & 3) << 4 // 3   = 2^2 - 1

		        base64 += encodings[a] + encodings[b] + '=='
		    } else if (byteRemainder == 2) {
		        chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

		        a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
		        b = (chunk & 1008) >> 4 // 1008  = (2^6 - 1) << 4

		        // Set the 2 least significant bits to zero
		        c = (chunk & 15) << 2 // 15    = 2^4 - 1

		        base64 += encodings[a] + encodings[b] + encodings[c] + '='
		    }

		    return base64
	}

	function DownloadStream(stream,fileName) {
	    var blob = new Blob([response], { type: "application/octet-stream" });
	    saveAs(blob, fileName);
	}

    /*
            * @description determine if an array contains one or more items from another array.
            * @param {array} haystack the array to search.
            * @param {array} arr the array providing items to check for in the haystack.
            * @return {boolean} true|false if haystack contains at least one item from arr.
            source: http://stackoverflow.com/questions/16312528/check-if-an-array-contains-any-element-of-another-array-in-javascript
            */
	function FindOne(haystack, arr) {
	    return arr.some(function (v) {
	        return haystack.indexOf(v) >= 0;
	    });
	}

	function GetFileTypeIcon(fileName) {

		    if (this.IsNullOrWhiteSpace(fileName)) return;
		    var extension = fileName.replace(/^.*\./, '');
	        var fileTypesIcon = {
	            File: 'fa fa-file-o',
	            Archive: 'fa fa-file-archive-o',
	            Word: 'fa fa-file-word-o',
	            Code: 'fa fa-file-code-o',
	            Image: 'fa fa-file-image-o',
	            PDF: 'fa fa-file-pdf-o',
	            Video: 'fa fa-file-video-o',
	            PPT: 'fa fa-file-powerpoint-o',
	            Text: 'fa fa-file-text-o',
	            Audio: 'fa fa-file-audio-o',
	            Excel: 'fa fa-file-excel-o'

	        }

	        var setFileTypeIcon = function (extension) {

	            var imageExtensions = ["ANI", "ANIM", "APNG", "ART", "BMP", "BPG", "BSAVE", "CAL", "CIN", "CPC", "CPT", "DDS", "DPX", "ECW", "EXR", "FITS", "FLIC", "FLIF", "FPX", "GIF", "HDRi", "HEVC", "ICER", "ICNS", "ICO", "/", "CUR", "ICS", "ILBM", "JBIG", "JBIG2", "JNG", "JPEG", "JPEG", "2000", "JPEG-LS", "JPEG", "XR", "KRA", "MNG", "MIFF", "NRRD", "ORA", "PAM", "PBM", "/", "PGM", "/", "PPM", "/", "PNM", "PCX", "PGF", "PICtor", "PNG", "PSD", "/", "PSB", "PSP", "QTVR", "RAS", "RBE", "JPEG-HDR", "Logluv", "TIFF", "SGI", "TGA", "TIFF", "TIFF/EP", "TIFF/IT", "UFO/", "UFP", "WBMP", "WEBP", "XBM", "XCF", "XPM", "XWD"];
	            var excelExtensions = ["XLS", "XLT", "XLM", "XLSX", "XLSM", "XLTX", "XLTM", "XLSB", "XLA", "XLAM", "XLL", "XLW", "CSV"];
	            var wordExtensions = ["DOC", "DOT", "WBK", "DOCX", "DOCM", "DOTX", "", "DOCB"];
	            var archiveExtensions = ["A", "AR", "CPIO", "SHAR", "LBR", "DOTX", "DOTM", "DOCB", "ISO", "ZIP", "RAR"];
	            var codeExtensions = ["C", "CS", "CLASS", "CPP", "HTML", "CSS", "LESS", "XAML", "JS", "JSON", "CSPROJ", "XML"];
	            var PDFExtensions = ["PDF", "XPS"];
	            var videoExtensions = ["WMV", "WEBM", "VOB", "GIFV", "SVI", "ROQ", "RMVB", "RM", "YUV", "MOV", "QT", "OGV", "OGG", "NSV", "MNG", "MP4", "M4V", "MPG", "MPEG", "M2V", "M4P", "MP2", "MPE", "MPV", "MXF", "FLV", "F4V", "F4P", "F4A", "F4B", "DRC", "AVI", "AMV", "ASF", "3G2", "3GP"];
	            var audioFileExtensions = ["AMR", "AA", "AAC", "AAX", "ACT", "AIFF", "AMR", "APE", "AU", "AWB", "DCT", "DSS", "DVF", "FLAC", "GSM", "IKLAX", "IVS", "M4A", "M4B", "MMF", "MP3", "MPC", "MSV", "OGG", "OGA", "MOGG", "OPUS", "RA", "RM", "RAW", "SLN", "TTA", "VOX", "WAV", "WMA", "WV"];
	            var pptExtensions = ["PPT", "POT", "PPS", "PPTX", "PPTM", "PPAM", "PPSX", "PPSM", "SLDX", "SLDM"];


	            if (imageExtensions.indexOf(extension.toUpperCase()) != -1) {
	                return fileTypesIcon.Image;
	            }
	            if (excelExtensions.indexOf(extension.toUpperCase()) != -1) {
	                return fileTypesIcon.Excel;
	            }
	            if (wordExtensions.indexOf(extension.toUpperCase()) != -1) {
	                return fileTypesIcon.Word;
	            }
	            if (archiveExtensions.indexOf(extension.toUpperCase()) != -1) {
	                return fileTypesIcon.Archive;
	            }
	            if (codeExtensions.indexOf(extension.toUpperCase()) != -1) {
	                return fileTypesIcon.Code;
	            }
	            if (PDFExtensions.indexOf(extension.toUpperCase()) != -1) {
	                return fileTypesIcon.PDF;
	            }
	            if (videoExtensions.indexOf(extension.toUpperCase()) != -1) {
	                return fileTypesIcon.Video;
	            }
	            if (audioFileExtensions.indexOf(extension.toUpperCase()) != -1) {
	                return fileTypesIcon.Audio;
	            }
	            if (pptExtensions.indexOf(extension.toUpperCase()) != -1) {
	                return fileTypesIcon.PPT;
	            }
	            return fileTypesIcon.File;
	        };

	        return setFileTypeIcon(extension);
	}

	function GetPreselectedKeywordRefiner() {
	    if (globalUtility.SelectedKeyword != "") {
	        var searchWord = globalUtility.SelectedKeyword[0].Id;

	        return keywordRefiner = {
	            Type: 'Keyword',
	            Id: searchWord.length > 50 ? searchWord.slice(0, 50) : searchWord,
	            Value: searchWord.length > 50 ? searchWord.slice(0, 50) : searchWord,
	            Parent: 'Keyword',
	            Checked: false,
	            IsDateRange: false
	        };

	    }
	}

	function GetPreselectedMultiKeywordRefiner() {

	    var list = [];
	    var searchWord = '';

	    for (var i = 0; i < globalUtility.SelectedKeyword.length; i++) {
	        searchWord = globalUtility.SelectedKeyword[i].Id;

	        list.push({
	            Type: 'Keyword',
	            Id: searchWord.length > 50 ? searchWord.slice(0, 50) : searchWord,
	            Value: searchWord.length > 50 ? searchWord.slice(0, 50) : searchWord,
	            Parent: 'Keyword',
	            Checked: false,
	            IsDateRange: false
	        });
	    }

	    return list;
	}

	function GetPreselectedRefiners() {
	    //var preslectedRefiners = [];
	    var preselectedRefiners = {
	            preselectedApplicationType: [],
	            preselectedComplianceProgram: [],
	            preselectedCountry: [],
	            preselectedFreqTech: [],
	            preselectedPowerSource: [],
	            preselectedProductType: [],
	            preselectedProductSubType: [],
	            preselectedSector: [],
	            preselectedRegion: [],
	            preselectedCertOrg: [],
	            preselectedIsMandatory: [],
	            preselectedTestReport: [],
	            preselectedModularApproval: [],
	            preselectedSampleReqt: [],
	            preselectedInCountryTesting: [],
	            preselectedLocalRep: [],
	            preselectedLocalRepService: [],
	            preselectedCertValidPeriod: [],
	            preselectedComplianceModel: [],
	            preselectedPowerSource: [],
	            preselectedAccepTestWireless: [],
	            preselectedAccepTestSafety: [],
	            preselectedAccepTestEMC: [],
	            preselectedCertLimit: [],
	            preselectedSampReqWireless: [],
	            preselectedSampReqSafety: [],
	            preselectedSameReqEMC: [],
	            preselectedICTWireless: [],
	            preselectedICTSafety: [],
	            preselectedICTEMC: [],
	            preselectedMarkingReq: [],
	            preselectedScopeWireless: [],
	            preselectedKeyword: [],

	    };

	    if (globalUtility.SelectedKeyword.length > 0) {
	        angular.forEach(globalUtility.SelectedKeyword, function (item) {
	            this.push(item.Id);
	        }, preselectedRefiners.preselectedKeyword);

	    }

	    if (globalUtility.SelectedScopeWireless.length > 0) {
	        angular.forEach(globalUtility.SelectedScopeWireless, function (item) {
	            this.push(item.Id);
	        }, preselectedRefiners.preselectedScopeWireless);

	    }

	    if (globalUtility.SelectedMarkingReq.length > 0) {
	        angular.forEach(globalUtility.SelectedMarkingReq, function (item) {
	            this.push(item.Id);
	        }, preselectedRefiners.preselectedMarkingReq);

	    }

	    if (globalUtility.SelectedICTEMC.length > 0) {
	        angular.forEach(globalUtility.SelectedICTEMC, function (item) {
	            this.push(item.Id);
	        }, preselectedRefiners.preselectedICTEMC);

	    }

	    if (globalUtility.SelectedICTSafety.length > 0) {
	        angular.forEach(globalUtility.SelectedICTSafety, function (item) {
	            this.push(item.Id);
	        }, preselectedRefiners.preselectedICTSafety);

	    }

	    if (globalUtility.SelectedICTWireless.length > 0) {
	        angular.forEach(globalUtility.SelectedICTWireless, function (item) {
	            this.push(item.Id);
	        }, preselectedRefiners.preselectedICTWireless);

	    }

	    if (globalUtility.SelectedSameReqEMC.length > 0) {
	        angular.forEach(globalUtility.SelectedSameReqEMC, function (item) {
	            this.push(item.Id);
	        }, preselectedRefiners.preselectedSameReqEMC);

	    }

	    if (globalUtility.SelectedSampReqSafety.length > 0) {
	        angular.forEach(globalUtility.SelectedSampReqSafety, function (item) {
	            this.push(item.Id);
	        }, preselectedRefiners.preselectedSampReqSafety);

	    }

	    if (globalUtility.SelectedSampReqWireless.length > 0) {
	        angular.forEach(globalUtility.SelectedSampReqWireless, function (item) {
	            this.push(item.Id);
	        }, preselectedRefiners.preselectedSampReqWireless);

	    }

	    if (globalUtility.SelectedCertLimit.length > 0) {
	        angular.forEach(globalUtility.SelectedCertLimit, function (item) {
	            this.push(item.Id);
	        }, preselectedRefiners.preselectedCertLimit);

	    }

	    if (globalUtility.SelectedAccepTestEMC.length > 0) {
	        angular.forEach(globalUtility.SelectedAccepTestEMC, function (item) {
	            this.push(item.Id);
	        }, preselectedRefiners.preselectedAccepTestEMC);

	    }
	    if (globalUtility.SelectedAccepTestSafety.length > 0) {
	        angular.forEach(globalUtility.SelectedAccepTestSafety, function (item) {
	            this.push(item.Id);
	        }, preselectedRefiners.preselectedAccepTestSafety);
	    }

	    if (globalUtility.SelectedAccepTestWireless.length > 0) {
	        angular.forEach(globalUtility.SelectedAccepTestWireless, function (item) {
	            this.push(item.Id);
	        }, preselectedRefiners.preselectedAccepTestWireless);
	    }

	    if (globalUtility.SelectedPowerSource.length > 0) {
	        angular.forEach(globalUtility.SelectedPowerSource, function (item) {
	            this.push(item.Id);
	        }, preselectedRefiners.preselectedPowerSource);
	    }

	    if (globalUtility.SelectedComplianceModel.length > 0) {
	        angular.forEach(globalUtility.SelectedComplianceModel, function (item) {
	            this.push(item.Id);
	        }, preselectedRefiners.preselectedComplianceModel);
	    }

	    if (globalUtility.SelectedCertValidPeriod.length > 0) {
	        angular.forEach(globalUtility.SelectedCertValidPeriod, function (item) {
	            this.push(item.Id);
	        }, preselectedRefiners.preselectedCertValidPeriod);
	    }

	    if (globalUtility.SelectedLocalRepService.length > 0) {
	        angular.forEach(globalUtility.SelectedLocalRepService, function (item) {
	            this.push(item.Id);
	        }, preselectedRefiners.preselectedLocalRepService);
	    }

	    if (globalUtility.SelectedLocalRep.length > 0) {
	        angular.forEach(globalUtility.SelectedLocalRep, function (item) {
	            this.push(item.Id);
	        }, preselectedRefiners.preselectedLocalRep);
	    }

	    if (globalUtility.SelectedInCountryTesting.length > 0) {
	        angular.forEach(globalUtility.SelectedInCountryTesting, function (item) {
	            this.push(item.Id);
	        }, preselectedRefiners.preselectedInCountryTesting);
	    }

	    if (globalUtility.SelectedSampleRequirement.length > 0) {
	        angular.forEach(globalUtility.SelectedSampleRequirement, function (item) {
	            this.push(item.Id);
	        }, preselectedRefiners.preselectedSampleReqt);
	    }

	    if (globalUtility.SelectedModularApproval.length > 0) {
	        angular.forEach(globalUtility.SelectedModularApproval, function (item) {
	            this.push(item.Id);
	        }, preselectedRefiners.preselectedModularApproval);
	    }

	    if (globalUtility.SelectedAcceptedTestReports.length > 0) {
	        angular.forEach(globalUtility.SelectedAcceptedTestReports, function (item) {
	            this.push(item.Id);
	        }, preselectedRefiners.preselectedTestReport);
	    }

	    if (globalUtility.SelectedIsMandatory.length > 0) {
	        angular.forEach(globalUtility.SelectedIsMandatory, function (item) {
	            this.push(item.Id);
	        }, preselectedRefiners.preselectedIsMandatory);
	    }

	    if (globalUtility.SelectedCertOrg.length > 0) {
	        angular.forEach(globalUtility.SelectedCertOrg, function (item) {
	            this.push(item.Id);
	        }, preselectedRefiners.preselectedCertOrg);
	    }

	    //add pre-selected application type if any
	    if (globalUtility.SelectedApplicationType.length > 0) {
	        angular.forEach(globalUtility.SelectedApplicationType, function (applicationType) {
	            //this.push({
	            //    Checked: true,
	            //    Id: applicationType.Id,
	            //    IsDateRange: false,
	            //    Parent: "APPLICATION TYPE",
	            //    Type: "Application Type",
	            //    Value: applicationType.Description
	            //})
	            this.push(applicationType.ApplicationTypeId);
	        }, preselectedRefiners.preselectedApplicationType);
	    }

	    //add pre-selected compliance program if any
	    if (globalUtility.SelectedComplianceProgram.length > 0) {
	        angular.forEach(globalUtility.SelectedComplianceProgram, function (complianceProgram) {
	            //this.push({
	            //    Checked: true,
	            //    Id: complianceProgram.SchemaId,
	            //    IsDateRange: false,
	            //    Parent: "COMPLIANCE PROGRAM",
	            //    Type: "Compliance Program",
	            //    Value: complianceProgram.SchemaName
	            //})
	            this.push(complianceProgram.Id == undefined ? complianceProgram.SchemaId : complianceProgram.Id);
	        }, preselectedRefiners.preselectedComplianceProgram);
	    }

	    //add pre-selected country if any
	    if (globalUtility.SelectedCountry.length > 0) {
	        angular.forEach(globalUtility.SelectedCountry, function (country) {
	            //this.push({
	            //    Checked: true,
	            //    Id: country.CountryItemId,
	            //    IsDateRange: false,
	            //    Parent: "COUNTRY",
	            //    Type: "Country",
	            //    Value: country.CountryName
	            //})
	            this.push(country.id);
	        }, preselectedRefiners.preselectedCountry);
	    }

	    //add pre-selected frequency technology if any
	    if (globalUtility.SelectedFreqTech.length > 0) {
	        angular.forEach(globalUtility.SelectedFreqTech, function (freqTech) {
	            //this.push({
	            //    Checked: true,
	            //    Id: freqTech.FrequencyTechId,
	            //    IsDateRange: false,
	            //    Parent: "FREQUENCY AND TECHNOLOGY",
	            //    Type: "Frequency and Technology",
	            //    Value: freqTech.FrequencyTechName
	            //})
	            this.push(freqTech.FrequencyTechId);
	        }, preselectedRefiners.preselectedFreqTech);
	    }

	    //add pre-selected power source if any
	    if (globalUtility.SelectedPowerSource.length > 0) {
	        angular.forEach(globalUtility.SelectedPowerSource, function (powerSource) {
	            //this.push({
	            //    Checked: true,
	            //    Id: powerSource.Id,
	            //    IsDateRange: false,
	            //    Parent: "POWER SOURCE",
	            //    Type: "Power Source",
	            //    Value: powerSource.Description
	            //})
	            this.push(powerSource.Id);
	        }, preselectedRefiners.preselectedPowerSource);
	    }

	    //add pre-selected product type if any
	    if (globalUtility.SelectedProductType.length > 0) {
	        angular.forEach(globalUtility.SelectedProductType, function (productType) {
	            //this.push({
	            //    Checked: true,
	            //    Id: productType.ProductTypeId,
	            //    IsDateRange: false,
	            //    Parent: "PRODUCT TYPE",
	            //    Type: "Product Type",
	            //    Value: productType.ProductName
	            //})
	            this.push(productType.ProductTypeId);
	        }, preselectedRefiners.preselectedProductType);
	    }

	    //add pre-selected product sub type if any
	    if (globalUtility.SelectedProductSubType.length > 0) {
	        angular.forEach(globalUtility.SelectedProductSubType, function (productSubType) {
	            //this.push({
	            //    Checked: true,
	            //    Id: productSubType.ProductSubTypeId,
	            //    IsDateRange: false,
	            //    Parent: "PRODUCT SUB TYPE",
	            //    Type: "Product Sub Type",
	            //    Value: productSubType.ProductSubTypeName
	            //})
	            this.push(productSubType.ProductSubTypeId);
	        }, preselectedRefiners.preselectedProductSubType);
	    }

	    //add pre-selected sector if any
	    if (globalUtility.SelectedSector.length > 0) {
	        angular.forEach(globalUtility.SelectedSector, function (sector) {
	            //this.push({
	            //    Checked: true,
	            //    Id: sector.CoveredSectorId,
	            //    IsDateRange: false,
	            //    Parent: "SECTOR REGULATED",
	            //    Type: "Sector",
	            //    Value: sector.CoveredSector
	            //})
	            this.push(sector.CoveredSectorId);
	        }, preselectedRefiners.preselectedSector);
	    }

	    //add pre-selected region if any
	    if (globalUtility.SelectedRegion.length > 0) {
	        angular.forEach(globalUtility.SelectedRegion, function (region) {
	            //this.push({
	            //    Checked: true,
	            //    Id: sector.CoveredSectorId,
	            //    IsDateRange: false,
	            //    Parent: "SECTOR REGULATED",
	            //    Type: "Sector",
	            //    Value: sector.CoveredSector
	            //})
	            this.push(region.RegionId);
	        }, preselectedRefiners.preselectedRegion);
	    }

	    return preselectedRefiners;
	}


	function SetNotAvailableRefiners(source,allowedRefiners, callBack) {

	    var DS = [], parent = "", selectedSource = [], refinerType = "";

	    if (source.length == 0) return;

	    var setSelectedSource = function (_parent) {
	        var _source = [];
	        angular.forEach(source, function (item) {
	            if (item.Category == _parent) {
	                if (item.Items.length > 0) {
	                    var self = this;
	                    angular.forEach(item.Items, function (catItem) {
	                        self.push(catItem)
	                    })
	                }
	            }
	        }, _source)

	        return _source;
	    };


	    if (this.SelectedSector.length > 0 && allowedRefiners.indexOf("sector") != -1) {
	     
	        parent = "REGULATORY CATEGORY";
	        selectedSource =  setSelectedSource(parent);
	        if (selectedSource.length > 0) {
           
	            angular.forEach(this.SelectedSector, function (item) {
	                var isExist = false;

	                angular.forEach(selectedSource, function (selItem) {
	                    refinerType = selItem.Type;
	                    if (item.CoveredSectorId == selItem.Id) { isExist = true;  }
	                });
	                if (!isExist) this.push(refinerModel.Item(refinerType, item.CoveredSectorId, item.CoveredSector, parent, true));
	            }, DS);
	        }

	    }

	    if (this.SelectedApplicationType.length > 0 && allowedRefiners.indexOf("application type") != -1) {
	        parent = "APPLICATION TYPE";
	        selectedSource = setSelectedSource(parent);
	        if (selectedSource.length > 0) {

	            angular.forEach(this.SelectedApplicationType, function (item) {
	                var isExist = false;

	                angular.forEach(selectedSource, function (selItem) {
	                    refinerType = selItem.Type;
	                    if (item.ApplicationTypeId == selItem.Id) { isExist = true; }
	                });
	                if (!isExist) this.push(refinerModel.Item(refinerType, item.ApplicationTypeId, item.ApplicationTypeName, parent, true));
	            }, DS);
	        }
	    }

	    if (this.SelectedRegion.length > 0 && allowedRefiners.indexOf("region") != -1) {
	        selectedSource = [];
	        parent = "REGION";
	        selectedSource = setSelectedSource(parent);

	        if (selectedSource.length > 0) {

	            angular.forEach(this.SelectedRegion, function (item) {
	                var isExist = false;

	                angular.forEach(selectedSource, function (selItem) {
	                    refinerType = selItem.Type;
	                    if (item.RegionId == selItem.Id) isExist = true; 
	                });
	                if (!isExist) this.push(refinerModel.Item(refinerType, item.RegionId, item.RegionName, parent, true));
	            }, DS);
	        }

	    }

	    if (this.SelectedCountry.length > 0 && allowedRefiners.indexOf("country") != -1) {
	        selectedSource = [];
	        parent = "COUNTRY";
	        selectedSource = setSelectedSource(parent);

	        if (selectedSource.length > 0) {
	            angular.forEach(this.SelectedCountry, function (item) {
	                var isExist = false;

	                angular.forEach(selectedSource, function (selItem) {
	                    refinerType = selItem.Type;
	                    if (item.id == selItem.Id) { isExist = true; }
	                });
	                if (!isExist) this.push(refinerModel.Item(refinerType, item.id, item.label, parent, true));
	            }, DS);
	        }

	    }

	    if (this.SelectedComplianceProgram.length > 0 && allowedRefiners.indexOf("compliance program") != -1) {
	        selectedSource = [];
	        parent = "COMPLIANCE PROGRAM";
	        selectedSource = setSelectedSource(parent);

	        if (selectedSource.length > 0) {
	            angular.forEach(this.SelectedComplianceProgram, function (item) {
	                var isExist = false;

	                angular.forEach(selectedSource, function (selItem) {
	                    refinerType = selItem.Type;
	                    if (item.Id == selItem.Id) { isExist = true; }
	                });
	                if (!isExist) this.push(refinerModel.Item(refinerType, item.Id == undefined ? item.SchemaId : item.Id, item.SchemaName, parent, true));
	            }, DS);
	        }

	    }

	    if (this.SelectedProductType.length > 0 && allowedRefiners.indexOf("prodtype") != -1) {
	        selectedSource = [];
	        parent = "PRODUCT TYPE";
	        selectedSource = setSelectedSource(parent);

	        if (selectedSource.length > 0) {
	            angular.forEach(this.SelectedProductType, function (item) {
	                var isExist = false;

	                angular.forEach(selectedSource, function (selItem) {
	                    refinerType = selItem.Type;
	                    if (item.ProductTypeId == selItem.Id) { isExist = true; }
	                });
	                if (!isExist) this.push(refinerModel.Item(refinerType, item.ProductTypeId, item.ProductName, parent, true));
	            }, DS);
	        }

	    }

	    if (this.SelectedProductSubType.length > 0 && allowedRefiners.indexOf("prodsubtype") != -1) {
	        selectedSource = [];
	        parent = "PRODUCT SUB TYPE";
	        selectedSource = setSelectedSource(parent);

	        if (selectedSource.length > 0) {
	            angular.forEach(this.SelectedProductSubType, function (item) {
	                var isExist = false;

	                angular.forEach(selectedSource, function (selItem) {
	                    refinerType = selItem.Type;
	                    if (item.ProductSubTypeId == selItem.Id) { isExist = true; }
	                });
	                if (!isExist) this.push(refinerModel.Item(refinerType, item.ProductSubTypeId, item.ProductSubTypeName, parent, true));
	            }, DS);
	        }

	    }

	    if (this.SelectedFreqTech.length > 0 && allowedRefiners.indexOf("freqtech") != -1) {
	        selectedSource = [];
	        parent = "FREQUENCY AND TECHNOLOGY";
	        selectedSource = setSelectedSource(parent);

	        if (selectedSource.length > 0) {
	            angular.forEach(this.SelectedFreqTech, function (item) {
	                var isExist = false;

	                angular.forEach(selectedSource, function (selItem) {
	                    refinerType = selItem.Type;
	                    if (item.FrequencyTechId == selItem.Id) { isExist = true; }
	                });
	                if (!isExist) this.push(refinerModel.Item(refinerType, item.ProductTypeId, item.FrequencyTechName, parent, true));
	            }, DS);
	        }

	    }
	    if (this.SelectedPowerSource.length > 0 && allowedRefiners.indexOf("powersource") != -1) {
	        selectedSource = [];
	        parent = "POWER SOURCE ";
	        selectedSource = setSelectedSource(parent);

	        if (selectedSource.length > 0) {
	            angular.forEach(this.SelectedPowerSource, function (item) {
	                var isExist = false;

	                angular.forEach(selectedSource, function (selItem) {
	                    refinerType = selItem.Type;
	                    if (item.Id == selItem.Id) { isExist = true; }
	                });
	                if (!isExist) this.push(refinerModel.Item(refinerType, item.Id, item.Description, parent, true));
	            }, DS);
	        }

	    }
        

	  

	    if (DS.length > 0) {
	        angular.forEach(DS, function (item) {
	            callBack(item);
	        })
	    }
	        
	}

	function GetRefinerList(scopeSelectedRefiners) {
	    var selectedRefiners = [];
	    if (scopeSelectedRefiners.length > 0) {
	        angular.forEach(scopeSelectedRefiners, function (refiner) {
	            if (refiner.IsDateRange) {

	                this.push({ RefinerType: refiner.Items[0].Type, RefinerValueId: refiner.Items[0].ValueString })
	                this.push({ RefinerType: refiner.Items[1].Type, RefinerValueId: refiner.Items[1].ValueString })

	            } else {
	                this.push({ RefinerType: refiner.Type, RefinerValueId: refiner.Id })
	            }

	        }, selectedRefiners);
	    }

	    return selectedRefiners;
	}

	function IsDefined(val){
	    return angular.isDefined(val);
	}

	function IsNullOrWhiteSpace(val){
	    return (val === undefined || val === "" || val === null);
	}

	function ToLower(val){
	    return angular.lowercase(val);
		}

	function ToUpper(val){
	    return angular.uppercase(val);
	}

	function DateFormatDisplay(date) {
	    var nDate = new Date(date);
	    return (nDate.getMonth() + 1) + "/" + nDate.getDate() + "/" + nDate.getFullYear();
	}

});
