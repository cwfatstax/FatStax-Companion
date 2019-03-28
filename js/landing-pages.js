var csvInput1 = document.getElementById('csvInput1');
var csvInput2 = document.getElementById('csvInput2');
var templates, htmlTemplate, cssTemplate;
var csvArray;

// when the user selects an input csv, this parses it and passes the json to the first lp generator
csvInput1.onchange = function () {
    templates = getTemplates();
    htmlTemplate = templates[0];
    cssTemplate = templates[1];
    Papa.parse(csvInput1.files[0], {
        delimiter: ',',
        header: true,
        complete: function (results, file) {
            //console.log('Parsing complete:', results, file);
            csvArray = firstLpGenerator(results.data);
            console.log(csvArray);
            document.getElementById('downloadCSV1').setAttribute('style', 'visibility: visible');
        }
    });
};

csvInput2.onchange = function () {
    templates = getTemplates();
    htmlTemplate = templates[0];
    cssTemplate = templates[1];
    Papa.parse(csvInput2.files[0], {
        delimiter: ',',
        header: true,
        complete: function (results, file) {
            //console.log('Parsing complete:', results, file);
            secondLpGenerator(results.data);
        }
    });
};

function firstLpGenerator(jsonData) {
    var categoryMax = findMaxCategories(jsonData); // max # of categories in the catalog
    var lpObjects = {}; // all landing page specific data


    // loop for each row to gather lpObjects
    for (let i = 0; i < jsonData.length; i++) {

        let breadcrumb = ''; // category breadcrumb for identifying unique lp's
        let breadcrumbList = [];
        let lpName;
        let lpNameList = [];
        let lpDescription = cssTemplate;
        let lpCategories = [];
        let lpTileImageUrl = 'https://sharedassets.fatstaxapp.com/m/145530';
        let lpTileJumpLink = '#';
        let tileName = jsonData[i]['Name'];
        let tileImageUrl = jsonData[i]['Image Url'] === '' ? 'https://sharedassets.fatstaxapp.com/m/145583' :
            jsonData[i]['Image Url'];
        let tileJumpLink = jsonData[i]['Product Jump Link'];
        let tileHtml;
        let stopLoop = false;
        let closingDiv = '</div>';

        // loop thru each category to create the breadcrumbList and find lpNameList
        for (let c = 1; c <= categoryMax; c++) {

            switch (true) {
                case jsonData[i]['Category ' + c] === '': // end of categories, but not categoryMax
                    breadcrumb = breadcrumb.slice(0, -1); // removes the final carrot
                    stopLoop = true;
                    break;

                case c > 1 && c < categoryMax: // any category not the 1st and not the last
                    breadcrumb += (jsonData[i]['Category ' + c]);
                    breadcrumbList.push(breadcrumb);
                    breadcrumb += '>';
                    lpName = (jsonData[i]['Category ' + c]) + ' Landing Page';
                    lpNameList.push(lpName);
                    lpCategories.push(jsonData[i]['Category ' + c]);
                    break;

                case c === 1: // 1st category
                    breadcrumb += (jsonData[i]['Category ' + c]) + '>';
                    lpCategories.push(jsonData[i]['Category ' + c]);
                    break;

                case c === categoryMax: // end of categories and categoryMax
                    breadcrumb += (jsonData[i]['Category ' + c]);
                    breadcrumbList.push(breadcrumb);
                    lpName = (jsonData[i]['Category ' + c]) + ' Landing Page';
                    lpNameList.push(lpName);
                    lpCategories.push(jsonData[i]['Category ' + c]);
            }
            if (stopLoop === true) {
                break;
            }
        }

        for (let b = 0; b < breadcrumbList.length; b++) {
            let tileExists = false; // resets the tile existence state to false until proven otherwise
            switch (true) {
                case breadcrumbList[b] in lpObjects && b < (breadcrumbList.length - 1): // mid level lp exists
                    for (let t = 0; t < lpObjects[breadcrumbList[b]].lpTiles.length; t++) {
                        if (lpNameList[b + 1] === lpObjects[breadcrumbList[b]].lpTiles[t].name) {
                            tileExists = true;
                            break;
                        }
                    }

                    if (tileExists === false) {
                        tileHtml = tileGen(lpNameList[b + 1], lpTileImageUrl, lpTileJumpLink);

                        lpObjects[breadcrumbList[b]].lpTiles.push({
                            name: lpNameList[b + 1],
                            html: tileHtml,
                            imageUrl: lpTileImageUrl,
                            jumpLink: lpTileJumpLink,
                            linksTo: 'lp'
                        });
                        lpObjects[breadcrumbList[b]].lpDescription = lpObjects[breadcrumbList[b]].lpDescription.replace(/<\/div>$/, '');
                        lpObjects[breadcrumbList[b]].lpDescription = lpObjects[breadcrumbList[b]].lpDescription + '\n' + tileHtml + closingDiv;
                    }
                    break;

                case !(breadcrumbList[b] in lpObjects) && b < (breadcrumbList.length - 1): //mid level lp doesn't exist
                    tileHtml = tileGen(lpNameList[b + 1], lpTileImageUrl, lpTileJumpLink);

                    lpObjects[breadcrumbList[b]] = {
                        lpName: lpNameList[b],
                        lpDescription: cssTemplate + '\n' + tileHtml + closingDiv,
                        lpCategories: {},
                        lpTiles: [
                            {
                                name: lpNameList[b + 1],
                                html: tileHtml,
                                imageUrl: lpTileImageUrl,
                                jumpLink: lpTileJumpLink,
                                linksTo: 'lp'
                            }
                        ]
                    };
                    for (let c = 1; c <= b + 2; c++) {
                        lpObjects[breadcrumbList[b]].lpCategories['Category ' + c] = lpCategories[c - 1];
                    }
                    break;

                case breadcrumbList[b] in lpObjects && b === (breadcrumbList.length - 1): // page level lp exists
                    for (let t = 0; t < lpObjects[breadcrumbList[b]].lpTiles.length; t++) {
                        if (tileJumpLink === lpObjects[breadcrumbList[b]].lpTiles[t].jumpLink) {
                            tileExists = true;
                            break;
                        }
                    }

                    if (tileExists === false) {
                        tileHtml = tileGen(tileName, tileImageUrl, tileJumpLink);

                        lpObjects[breadcrumbList[b]].lpTiles.push({
                            name: tileName,
                            html: tileHtml,
                            imageUrl: tileImageUrl,
                            jumpLink: tileJumpLink,
                            linksTo: 'page'
                        });
                        lpObjects[breadcrumbList[b]].lpDescription = lpObjects[breadcrumbList[b]].lpDescription.replace(/<\/div>$/, '');
                        lpObjects[breadcrumbList[b]].lpDescription = lpObjects[breadcrumbList[b]].lpDescription + '\n' + tileHtml + closingDiv;
                    }
                    break;

                case !(breadcrumbList[b] in lpObjects) && b === (breadcrumbList.length - 1): // page level lp doesn't exist
                    tileHtml = tileGen(tileName, tileImageUrl, tileJumpLink);

                    lpObjects[breadcrumbList[b]] = {
                        lpName: lpName,
                        lpDescription: cssTemplate + '\n' + tileHtml + closingDiv,
                        lpCategories: {},
                        lpTiles: [
                            {
                                name: tileName,
                                html: tileHtml,
                                imageUrl: tileImageUrl,
                                jumpLink: tileJumpLink,
                                linksTo: 'page'
                            }
                        ]
                    };
                    for (let c = 1; c <= lpCategories.length; c++) {
                        lpObjects[breadcrumbList[b]].lpCategories['Category ' + c] = lpCategories[c - 1];
                    }
            }
        }
    }
    //console.log(lpObjects);
    return compileFinalOutput(lpObjects, categoryMax);
}

// determines the max # of categories
function findMaxCategories(json) {
    let catMax = 2;
    for (let i = 3; i < 32; i++) {
        if (json[0]['Category ' + i] !== undefined) {
            catMax += 1;
        } else {
            break;
        }
    }
    return catMax;
}

// generates the tile html by swapping out the template variables
function tileGen(name, image, jumplink) {
    let tileHtml = htmlTemplate;
    tileHtml = tileHtml.replace('{{PRODUCT_JUMPLINK}}', jumplink);
    tileHtml = tileHtml.replace('{{IMAGE_URL}}', image);
    tileHtml = tileHtml.replace('{{NAME}}', name);
    return tileHtml;
}

// complile row data for each landing page and push to finalOutput
function compileFinalOutput(lpObjects, categoryMax) {
    let finalOutput = [] // final JSON containing all data for CSV export
    for (property in lpObjects) {
        let lpRow = {}
        let numOfCategories = 0;

        for (category in lpObjects[property].lpCategories) {
            lpRow[category] = lpObjects[property].lpCategories[category];
            numOfCategories += 1;
        }

        for (let i = numOfCategories; i < categoryMax; i++) {
            lpRow['Category ' + (i + 1)] = ''; // puts an empty string in unused category columns so all headers appear
        }

        lpRow['Name'] = lpObjects[property].lpName;
        lpRow['Description'] = lpObjects[property].lpDescription;
        lpRow['Image Url'] = 'https://sharedassets.fatstaxapp.com/m/145530';
        finalOutput.push(lpRow);
    }

    return finalOutput;
}

// unparses the finalOut and makes a downloadable CSV file
function downloadCSV() {
    var csv = Papa.unparse(csvArray);

    var csvData = new Blob([csv], {
        type: 'text/csv;charset=utf-8;'
    });
    var csvURL = null;
    if (navigator.msSaveBlob) {
        csvURL = navigator.msSaveBlob(csvData, 'download.csv');
    } else {
        csvURL = window.URL.createObjectURL(csvData);
    }

    var tempLink = document.createElement('a');
    tempLink.href = csvURL;
    tempLink.setAttribute('download', 'LandingPageImport-1.csv');
    tempLink.click();
}

function secondLpGenerator(jsonData) {

}
