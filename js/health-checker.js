/*

figure out cors issue

once media export is available use the permalinks to check against urls formatted like fatstaxapp.com/m/xxxxxx
rather than check its http status

use Object.assign({a: 1}, obj); when adding new columns to dataset so they will be at the beginning rather than the end

NEW FEATURES

1. List all broken images(includes Image URL, description images, and property images)

2. List all broken links(includes Web URL, description links, and property links)

3. List resource pages without an associated resource

4. List pages missing a description or image URL

5. ** Generates CSV with all results **
*/

var dataController = (function() {
    
    var totalOverall, overallChecked, totalImages, imagesChecked, totalLinks, linksChecked, productJumpLinks, mediaIDs, issues, completeResults;
    
    totalOverall = 0;
    overallChecked = 0;
    totalImages = 0;
    imagesChecked = 0;
    totalLinks = 0;
    linksChecked = 0;
    productJumpLinks = [];
    mediaIDs = [];
    issues = {}; // each property is productJumpLink and within those are the Page object
    completeResults = []; // contains all original columns and report results
    
    var Issue = function(row, type) {
        this.type = type;
        this.row = row;
    };
    
    var addObjects = function(objType, urlArray, rowNum, urlObj, allExistingObjects) {
        var allObjectsNew = allExistingObjects;
    
        if (objType === 'image') {
            
            for (let i = 0;i < urlArray.length;i++) {
                let image = new Image();

                image.src = urlArray[i];

                allObjectsNew.push(new urlObj(image, image.src, rowNum));
            }
            
        }
        
        else if (objType === 'link') {
            
            for (let i = 0;i < urlArray.length;i++) {
                
                if (urlArray[i].startsWith('/product/')) {
                    
                    allObjectsNew.push(new urlObj('jump link', urlArray[i], rowNum));
                    
                }
                
                else if (urlArray[i].startsWith('/media/')) {
                         
                    allObjectsNew.push(new urlObj('media link', urlArray[i], rowNum));
                         
                }
                
                else {
                    
                    allObjectsNew.push(new urlObj('web link', urlArray[i], rowNum));
                    
                }
                
            }
            
        }

        return allObjectsNew;
        
    };
    
    var urlParser = function(regex, rowData) {
        var urlArray, desc;
        
        urlArray = [];
        desc = rowData['Description'];
        
        while ((url = regex.exec(desc)) !== null) { // loops through all urls

            urlArray.push(url[1]);
        
        }
        
        regex.lastIndex = 0; // reset match position to beginning for next string

        return urlArray;
        
    };
    
    var updateTotals = function(type, num) {
        
        if (type === 'image') {
            totalImages += num;
        } 
        
        else if (type === 'link') {
            totalLinks += num;
        }
        
        totalOverall += num;

    };
    
    var filterResults = function(results) {
        var filteredResults;
        
        filteredResults = [];
        
        results.forEach(function(curr, i) {

            if (curr['Broken Images'][0] || curr['Broken Links'][0]) {
                filteredResults.push(curr);
            }
        });
        
        return filteredResults;
        
    };
    
    return {
        addProductJumpLink: function(rowData) {
            let productJumpLink = rowData['Product Jump Link'];
            
            if (productJumpLinks.includes(productJumpLink)) {
                return;
            }
            
            else {
                productJumpLinks.push(productJumpLink);
            }
            
        },
        
        gatherMediaIDs: function(resourceData) {
            let mediaID, regex;
            
            regex = /.com\/m\/(\d+)/;
            
            for (let i = 0;i < resourceData.length;i++) {

                if (resourceData[i]['PermalinkURL'] !== '' && resourceData[i]['PermalinkURL'] !== undefined) {

                    mediaID = resourceData[i]['PermalinkURL'].match(regex)[1];
                    mediaIDs.push(mediaID);
                    
                }

            }
            
        },
        
        srcExtractor: function() {
            var rowData, regex, srcArray, numOfImages;
        
            rowData = completeResults[completeResults.length - 1];
            regex = /<img.*?src="(.*?)"/mg;
            srcArray = urlParser(regex, rowData);
            numOfImages = srcArray.length;
            
            updateTotals('image', numOfImages);
            
            return srcArray;
            
        },
        
        hrefExtractor: function() {
            var rowData, regex, hrefArray, numOfLinks;
            
            rowData = completeResults[completeResults.length - 1];
            regex = /<a.*?href="(.*?)"/mg;
            hrefArray = urlParser(regex, rowData);
            numOfLinks = hrefArray.length;

            updateTotals('link', numOfLinks);

            return hrefArray;
            
        },
            
        createImageObjects: function(srcArray, rowNum, allImageObjects) {
            
            var ImageObj = function(imageEl, imageSrc, rowNum) {
                this.imageEl = imageEl;
                this.imageSrc = imageSrc;
                this.rowNum = rowNum;
            };
            
            allImageObjectsNew = addObjects('image', srcArray, rowNum, ImageObj, allImageObjects);
            
            return allImageObjectsNew;
            
        },
            
        createLinkObjects: function(hrefArray, rowNum, allLinkObjects) {
            
            var LinkObj = function(linkType, href, rowNum) {
                this.linkType = linkType;
                this.href = href;
                this.rowNum = rowNum;
            };
            
            allLinkObjectsNew = addObjects('link', hrefArray, rowNum, LinkObj, allLinkObjects);
    
            return allLinkObjectsNew;
            
        },
        
        updateResults: function(rowData) {
            
            rowData['Broken Images'] = [];
            rowData['Broken Links'] = [];
        
            completeResults.push(rowData);
        },
        
        addIssue: function(row, type, detail) {
            
            // 1st issue of the row
            if (!issues[row]) {
                
                issues[row] = new Issue(row, type);
                issues[row][type] = detail;
                
            }
            
            // existing row issue and existing issue type
            else if (issues[row][type]) {
                
                issues[row][type] += ', ' + detail;
                
            }
            
            // existing row issue, but new issue type
            else {
                
                issues[row][type] = detail;
                
            }
            
        },
        
        updateIssue: function(productJumpLink, keyToUpdate, value) {

            issues[productJumpLink][keyToUpdate] = value;            
            
        },
        
        imageChecked: function() {
            
            imagesChecked++;
            overallChecked++;
            
        },
        
        linkChecked: function() {
            
            linksChecked++;  
            overallChecked++;  
            
        },
        
        getProgress: function() {
            return {
                totalOverall: totalOverall,
                overallChecked: overallChecked,
                totalImages: totalImages,
                imagesChecked: imagesChecked,
                totalLinks: totalLinks,
                linksChecked: linksChecked,
                percentComplete: Math.round((overallChecked / totalOverall) * 100)
            };
        },
            
        productJumpLinks: productJumpLinks,
        
        mediaIDs: mediaIDs,
        
        issues: issues,
        
        completeResults: completeResults,
        
        filteredResults: function(results) {
            return filterResults(results);
        },
        
        
        
    };
    
})();

var uiController = (function() {
    var DOMstrings, querySelector;
    
    // use only css media selectors for querySelector
    DOMstrings = {
        inputCSV: '#healthCSV',
        resourceCSV: '#resourceCSV',
        startBtn: '#startHealthCheck',
        loadingEl: '.loadingContainer'
    };
    
    return {
        getDOMstrings: function() {
            // returns object containing all dom elements' query strings
            return DOMstrings;
        },
        qSelect: function(el) {
            return document.querySelector(el);
        },

        enableStartButton: function(data, resourceData) {
            document.querySelector(DOMstrings.startBtn).style.display = 'inline';
            document.querySelector(DOMstrings.startBtn).onclick = function() {
                    appController.startHealthCheck(data, resourceData);
                };
        },
        showLoadingIndicator: function() {
            document.querySelector(DOMstrings.loadingEl).classList.remove('hide');
        },
        hideLoadingIndicator: function() {
            document.querySelector(DOMstrings.loadingEl).classList.add('hide');
        }
    };
    
})();

var appController = (function(dataCtrl, uiCtrl) {
    
    var DOM, pageData, resourceData, results, filteredResults, issues;
    
    // includes all rows
    results = [];
    // only includes the 'problem' rows
    filteredResults = [];
    
    var setupEventListeners = function() {
        
        DOM = uiCtrl.getDOMstrings();

        document.querySelector(DOM.inputCSV).onchange = function() {
            Papa.parse(uiCtrl.qSelect(DOM.inputCSV).files[0], {
            delimiter: ',',
            header: true,
            complete: function (results, file) {
                //console.log('Parsing complete:', results, file);
                pageData = results.data;             
                readyCheck();
                }
            });
        };
        
        document.querySelector(DOM.resourceCSV).onchange = function() {
            Papa.parse(uiCtrl.qSelect(DOM.resourceCSV).files[0], {
            delimiter: ',',
            header: true,
            complete: function (results, file) {
                //console.log('Parsing complete:', results, file);
                resourceData = results.data;  
                readyCheck();
                }
            });
        };
    };
    
    var readyCheck = function() {
        
        if (pageData && resourceData) {

            uiCtrl.enableStartButton(pageData, resourceData);
            
        }
        
    };
    
    var rowIterator = function(inputData) {
        var allImageObjects, allLinkObjects;
        
        allImageObjects = [];
        allLinkObjects = [];
        
        for (let i = 0;i < (inputData.length - 1);i++) {
            
            let productJumpLink = inputData[i]['Product Jump Link'];
            let rowNum = i + 2;
            
            dataCtrl.updateResults(inputData[i]);
            
            
            //only check page if hasn't already been checked (ex. multiple skus)
            if (!dataCtrl.productJumpLinks.includes(productJumpLink)) {
                
                dataCtrl.addProductJumpLink(inputData[i]);
        
                // FEATURE START: DESCRIPTION IMAGE SRC
            
                let srcArray = null;
                srcArray = dataCtrl.srcExtractor();

                if (srcArray) {
                    
                    allImageObjects = dataCtrl.createImageObjects(srcArray, rowNum, allImageObjects);
                    
                }

                // FEATURE END: DESCRIPTION IMAGE SRC

                // FEATURE START: HREF HEALTH
                
                let hrefArray = null;
                hrefArray = dataCtrl.hrefExtractor();

                if (hrefArray.length !== 0) {

                    allLinkObjects = dataCtrl.createLinkObjects(hrefArray, rowNum, allLinkObjects);

                }

                // FEATURE END: HREF HEALTH


                // missing fields(desc and image url)

                // blank pages (no desc or properties)

                // missing media urls for resource pages
                
            }
            
        }
        
        results = dataCtrl.completeResults;
        
        checkImages(allImageObjects);
        checkLinks(allLinkObjects);
        
        completionCheck();

    };
    
    var checkImages = function(allImages) {
        var interval, progress, logImageInfo, checkedImages;
        
        // keeps track of which images have already been checked via index
        checkedImages = [];
        
        interval = setInterval(function() {
            for (let i = 0;i<allImages.length;i++) {

                if (allImages[i].imageEl !== null && !checkedImages.includes(i) && allImages[i].imageEl.complete) {
                    
                    if (allImages[i].imageEl.height !== 0) { // image successfully loaded
                        
                        dataCtrl.imageChecked();
                        progress = dataCtrl.getProgress();
                        
                        if (progress.imagesChecked === progress.totalImages) {
                            
                            clearInterval(interval);
                            allImages[i].imageEl = null;
                            
                            break;
                            
                        }
                        
                        checkedImages.push(i);
                        allImages[i].imageEl = null;
                        
                    } 

                    else if (allImages[i].imageEl.height === 0) { // image is broken
                        
                        results[allImages[i].rowNum  - 2]['Broken Images'].push(allImages[i].imageSrc);
                        dataCtrl.addIssue(allImages[i].rowNum, 'Broken Images', allImages[i].imageSrc);
                        dataCtrl.imageChecked();
                        progress = dataCtrl.getProgress();
                        
                        if (progress.imagesChecked === progress.totalImages) {
                            
                            clearInterval(interval);
                            allImages[i].imageEl = null;
                            
                            break;
                            
                        }
                        
                        checkedImages.push(i);
                        allImages[i].imageEl = null;
                        
                    }
                }
            }
            
        }, 5);
    };
    
    var checkLinks = function(allLinks) {
        var interval, checkedLinks;
        
        // keeps track of which images have already been checked via index
        checkedLinks = [];

        for (let i = 0;i < allLinks.length;i++) {
            let link, mediaID;
            
            link = allLinks[i];
            
            if (!checkedLinks.includes(i)) {
            
                if (link['linkType'] === 'jump link') {

                    if (!dataCtrl.productJumpLinks.includes(link.href)) {

                        dataCtrl.addIssue(link.rowNum, 'Broken Links', link.href);
                        results[link.rowNum - 2]['Broken Links'].push(link.href);
                    }

                    dataCtrl.linkChecked();
                    checkedLinks.push(i);

                }
                
                else if (link['linkType'] === 'media link') {
                    
                    mediaID = link.href.match(/\/media\/(\d+)$/)[1]
                    
                    if (!dataCtrl.mediaIDs.includes(mediaID)) {
                        
                        dataCtrl.addIssue(link.rowNum, 'Broken Links', link.href);
                        results[link.rowNum - 2]['Broken Links'].push(link.href);
                        
                    }

                    dataCtrl.linkChecked();
                    checkedLinks.push(i);
                    
                }

                else if (link['linkType'] === 'web link') {
                    let xhttp, urlCors;

                    xhttp = new XMLHttpRequest();
                    urlCors = link.href; //'https://cors-anywhere.herokuapp.com/' + link.href;

                    xhttp.onreadystatechange = function() {

                        if (this.readyState == 4) {
                            
                            if (this.status === 404) {
                                
                                dataCtrl.addIssue(link.rowNum, 'Broken Links', link.href);
                                results[link.rowNum  - 2]['Broken Links'].push(link.href);
                                
                            }

                            dataCtrl.linkChecked();
                            checkedLinks.push(i); 

                       }

                    };

                    xhttp.open("GET", urlCors, true);
                    xhttp.send(); 

                }
                
            }
            
        }
        
    };
    
    var completionCheck = function() {
        
        interval = setInterval(function() {
            let progress;
            
            progress = dataCtrl.getProgress();
            console.log(progress.imagesChecked + ' of ' + progress.totalImages + ' images & ' + progress.linksChecked + ' of ' + progress.totalLinks + ' links');
            console.log(progress.overallChecked + ' of ' + progress.totalOverall);
            console.log(progress.percentComplete + '% complete');
            if (progress.overallChecked === progress.totalOverall) {
             
                clearInterval(interval);
                console.log(dataCtrl.issues);
                uiCtrl.hideLoadingIndicator();
                filteredResults = dataCtrl.filteredResults(results);
                downloadCSV();
            }
            
        }, 500);
        
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
        startHealthCheck: function(inputData, resourceData) {
            
            uiCtrl.showLoadingIndicator();
            dataCtrl.gatherMediaIDs(resourceData);
            rowIterator(inputData);
            
        }
    }
})(dataController, uiController);

appController.init();