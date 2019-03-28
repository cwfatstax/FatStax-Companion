/*
List all broken images(includes Image URL, description images, and property images)
List all broken links(includes Web URL, description links, and property links)
List resource pages without an associated resource
List pages missing a description or image URL
X Generates CSV with all results
*/

var dataController = (function() {
    
    var numOfImages, completeResults;
    
    totalImages = 0;
    imagesChecked = 0;
    completeResults = [];
    
    var srcExtractor = function(rowData) {
        var desc, regex, src, srcArray;
        
        desc = rowData['Description'];
        regex = /<img.*?src="(.*?)"/mg;
        srcArray = [];
        var stopper = 0;
        
        while ((src = regex.exec(desc)) !== null) { // loops through all image src's
            stopper++;
            srcArray.push(src[1]);
            
            //console.log(srcArray);
            
            if (stopper === 3) {
                break;
            }
            
            // return image src array to controller to give to the ui controller to add have it return a status back to the controller to pass back to the data controller to add it to the results
            // add images to dom, but hidden and see if they load to test status
        }
        //console.log('Returned array:');
        //console.log(srcArray);
        regex.lastIndex = 0; // reset match position to beginning for next string
        
        totalImages += srcArray.length;
        rowData['Broken Images'] = [];
        completeResults.push(rowData);
        return srcArray;
        
        // add result objects to results array
        
    };
    
    var filterResults = function(results) {
        var filteredResults;
        
        filteredResults = [];
        
        results.forEach(function(curr, i) {
            //console.log(curr['Broken Images']);
            if (curr['Broken Images'][0]) {
                filteredResults.push(curr);
            }
        });
        return filteredResults;
    };
    
    return {
        srcExtractor: function(rowData) {
            // returns array of image src's from the description field
            return srcExtractor(rowData);
        },
        
        imageChecked: function() {
            imagesChecked++;
            return {
                totalImages: totalImages,
                imagesChecked: imagesChecked
            };
        },
        
        completeResults: completeResults,
        
        filteredResults: function(results) {
            return filterResults(results);
        },
        
        
        
    };
    
})();

var uiController = (function() {
    var DOMstrings, querySelector;
    
    DOMstrings = {
        inputCSV: '#healthCSV',
        startBtn: '#startHealthCheck',
        loadingEl: '.loadingContainer'
    };
    
    qSelect = function(element) {
        return document.querySelector(element);
    };
    
    var createImageObjects = function(srcArray, rowNum, allImageObjects) {
        var allImageObjectsNew;
        
        allImageObjectsNew = allImageObjects;
        
        var ImageObj = function(imageEl, imageSrc, rowNum) {
            this.imageEl = imageEl;
            this.imageSrc = imageSrc;
            this.rowNum = rowNum;
        };
        
        for (let i = 0;i < srcArray.length;i++) {
            let image = new Image();
            
            image.src = srcArray[i];
            
            allImageObjectsNew.push(new ImageObj(image, image.src, rowNum));
        }
        return allImageObjectsNew;
    };
    
    return {
        getDOMstrings: function() {
            // returns object containing all dom elements' query strings
            return DOMstrings;
        },
        qSelect: function(el) {
            return qSelect(el);
        },
        createImageObjects: function(srcArray, rowNum, allImageObjects) {
            return createImageObjects(srcArray, rowNum, allImageObjects);
        },
        enableStartButton: function(data) {
            document.querySelector(DOMstrings.startBtn).style.display = 'inline';
            document.querySelector(DOMstrings.startBtn).onclick = function() {
                    appController.startHealthCheck(data);
                };
        },
        showLoadingIndicator: function() {
            document.querySelector(DOMstrings.loadingEl).style.display = 'inline-block';
        }
    };
    
})();

var appController = (function(dataCtrl, uiCtrl) {
    
    var DOM, data, results, filteredResults;
    
    results = [];
    filteredResults = [];
    
    var setupEventListeners = function() {
        DOM = uiCtrl.getDOMstrings();

        document.querySelector(DOM.inputCSV).onchange = function() {
            Papa.parse(uiCtrl.qSelect(DOM.inputCSV).files[0], {
            delimiter: ',',
            header: true,
            complete: function (results, file) {
                //console.log('Parsing complete:', results, file);
                data = results.data;
                
                uiCtrl.enableStartButton(data);                
                // THE BUTTON FUNCTION THEN PASSES THE FILE DATA AND THE SELECTED FEATURES
                
                }
            });
        };
    };
    
    var rowIterator = function(inputData) {
        var allImageObjects;
        
        allImageObjects = [];
        
        for (let i = 0;i < inputData.length;i++) {
            
            // FEATURE START: DESCRIPTION IMAGE SRC
            
            let srcArray = null;
            srcArray = dataCtrl.srcExtractor(inputData[i]);
            
            if (srcArray) { // if the description has a src
                allImageObjects = uiCtrl.createImageObjects(srcArray, i, allImageObjects);
                //console.log(allImageObjects);
            }
            
            // FEATURE END: DESCRIPTION IMAGE SRC
            
            // FEATURE START: HREF HEALTH
            
            
            // FEATURE END: HREF HEALTH
            
            
            // missing fields(desc and image url)
            
            // missing media urls for resource pages
        }
        results = dataCtrl.completeResults;
        
        checkImages(allImageObjects);
        
    };
    
    // MOVE TO DATACTRL
    var checkImages = function(allImages) {
        var interval, progress, logImageInfo, checkedImages;
        
        checkedImages = [];
        
        logImageInfo = function(i, status) {
            console.log('Image: ' + allImages[i].imageSrc);
            console.log('Status: ' + status);
            console.log('Row Number: ' + allImages[i].rowNum);
            console.log(progress.imagesChecked + ' of '  + progress.totalImages + ' checked.');
        };
        // CONVERT THIS TO SHOWING ON THE UI ^
        
        interval = setInterval(function() {
            for (let i = 0;i<allImages.length;i++) {

                if (allImages[i].imageEl !== null && !checkedImages.includes(i) && allImages[i].imageEl.complete) {
                    if (allImages[i].imageEl.height !== 0) { // image successfully loaded
                        progress = dataCtrl.imageChecked();
                        if (progress.imagesChecked === progress.totalImages) {
                            clearInterval(interval);
                            logImageInfo(i, 'GOOD');
                            filteredResults = dataCtrl.filteredResults(results);
                            document.querySelector(DOM.loadingEl).style.display = 'none'; // MOVE TO UICTRL AND CHANGE TO CLASS
                            downloadCSV();
                            allImages[i].imageEl = null;
                            break;
                        }
                        logImageInfo(i, 'GOOD');
                        checkedImages.push(i);
                        allImages[i].imageEl = null;
                    } 

                    else if (allImages[i].imageEl.height === 0) { // image is broken
                        results[allImages[i].rowNum]['Broken Images'].push(allImages[i].imageSrc);
                        progress = dataCtrl.imageChecked();
                        if (progress.imagesChecked === progress.totalImages) {
                            clearInterval(interval);
                            logImageInfo(i, 'BROKEN');
                            filteredResults = dataCtrl.filteredResults(results);
                            document.querySelector(DOM.loadingEl).style.display = 'none'; // MOVE TO UICTRL AND CHANGE TO CLASS
                            downloadCSV();
                            allImages[i].imageEl = null;
                            break;
                        }
                        logImageInfo(i, 'BROKEN');
                        checkedImages.push(i);
                        allImages[i].imageEl = null;
                    }
                }
            }
            
        }, 50);
    };
    
    // unparses the finalOutput and makes a downloadable CSV file
        var downloadCSV = function() {
            var csv = Papa.unparse(filteredResults);

            var csvData = new Blob([csv], {
                type: 'text/csv;charset=utf-8;'
            });
            var csvURL = null;
            if (navigator.msSaveBlob) {
                csvURL = navigator.msSaveBlob(csvData, 'Health-Check-Results.csv');
            } else {
                csvURL = window.URL.createObjectURL(csvData);
            }

            var tempLink = document.createElement('a');
            tempLink.href = csvURL;
            tempLink.setAttribute('download', 'Health-Check-Results.csv');
            tempLink.click();
        };
            
    
    return {
        init: function() {
            setupEventListeners();
        },
        startHealthCheck: function(inputData) {
            uiCtrl.showLoadingIndicator();
            rowIterator(inputData);
        }
    }
})(dataController, uiController);

appController.init();