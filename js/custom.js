CONFIG_APP_TITLE = 'Schul-Datenportal';
CONFIG_APP_HEADER_LOGO_TEXT = CONFIG_APP_TITLE;
CONFIG_APP_AUTH_SERVICE = 'zero';
CONFIG_APP_ROUTER_REDIRECT_ROOT_TO = 'Welcome';

CONFIG_APP_LOCALE = 'de';
CONFIG_APP_LOCALE_FALLBACK = 'en';
CONFIG_APP_LOAD_LANGUAGE_1 = 'de';
CONFIG_APP_LANGUAGES = {
    'en': {
        'message': {
            'datasetFacets': {
                'facets': {
                    'catalogues': 'Sources'
                }
            }
        }
    },
    'de': {
        'message': {
            'datasetFacets': {
                'facets': {
                    'catalogues': 'Quellen'
                }
            }
        }
    }
};
  
CONFIG_APP_ROUTER_BASE = '/schule-datenportal/';
CONFIG_APP_ROUTER_LIB_BASE = 'https://unpkg.com/peacock-user-ui@latest/dist/';

CONFIG_APP_HEADER_NAV_1_URL = '/list';
CONFIG_APP_HEADER_NAV_1_TITLE = 'Liste';

CONFIG_APP_ROUTER_ROUTE_1_NAME = 'Welcome';
CONFIG_APP_ROUTER_ROUTE_1_PATH = '/';
CONFIG_APP_ROUTER_ROUTE_1_FILE = '/pages/welcome.html';
CONFIG_APP_ROUTER_ROUTE_1_REQUIRES_AUTH = false;

CONFIG_APP_ROUTER_ROUTE_2_NAME = 'Portal';
CONFIG_APP_ROUTER_ROUTE_2_PATH = '/list';
CONFIG_APP_ROUTER_ROUTE_2_COMPONENT = 'Datasets';
CONFIG_APP_ROUTER_ROUTE_2_REQUIRES_AUTH = false;

function transformData(dataset) {
    var ds = {};

    ds.catalog = {
        id: dataset.source.trim(),
        title: { [CONFIG_APP_LOCALE]: dataset.source },
        description: dataset.source,
    };
    if (ds.catalog.id === 'PARDOK') {
        ds.catalog.title = { [CONFIG_APP_LOCALE]: 'Parlamentsdokumentation' };
        ds.catalog.description = 'In der Parlamentsdokumentation (PARDOK) stehen Ihnen alle öffentlich zugänglichen parlamentarischen Vorgänge - darunter Gesetzesentwürfe, Anträge, Aktuelle Stunden, Schriftliche Anfragen - bis zurück zur 11. Wahlperiode (seit 02.03.1989) digital zur Verfügung.';
    }
    ds.description = {};
    ds.description[CONFIG_APP_LOCALE] = dataset.description;
    ds.distributions = [];
    ds.distributionFormats = [];
    ds.country = {
        id: CONFIG_APP_LOCALE,
        title: 'Deutschland',
    };
    ds.id = dataset.id;
    ds.idName = dataset.id;
    ds.keywords = [];
    var tags = dataset.tags.trim();
    if (tags !== '') {
        tags = tags.split(',');
        for (const tag of tags) {
            ds.keywords.push({
                id: tag.trim().toLocaleLowerCase(),
                title: tag.trim(),
            });
        }
    }
    ds.modificationDate = dataset.modDate ? dataset.modDate : dataset.date;
    ds.publisher = {
        type: 'organization',
        name: undefined,
        email: undefined,
        resource: undefined,
      };
    ds.releaseDate = dataset.date;
    ds.title = {};
    ds.title[CONFIG_APP_LOCALE] = dataset.title;
    ds.translationMetaData = {
        fullAvailableLanguages: [],
        details: {
            [CONFIG_APP_LOCALE]: {
                machine_translated: false,
            }
        },
        status: undefined,
    };
    
    const distribution = {};
    distribution.accessUrl = '';
    if (dataset.docDescription) {
        distribution.description = {};
        distribution.description[CONFIG_APP_LOCALE] = dataset.docDescription;
    } else {
        distribution.description = {
            en: 'No description given',
        };
    }
    distribution.downloadUrls = [];
    distribution.downloadUrls.push(dataset.docURL);
    distribution.format = {
        id: dataset.docFormat,
        title: dataset.docFormat,
    };
    distribution.id = 'dist.id';
    if (dataset.docLicense) {
        distribution.licence = {
            id: dataset.docLicense,
            title: dataset.docLicense,
            resource: undefined,
            description: undefined,
            la_url: undefined,
        };
    } else if (dataset.license) {
        distribution.licence = {
            id: dataset.license,
            title: dataset.license,
            resource: 'resouce',
            description: undefined,
            la_url: undefined,
        };
    } else {
        distribution.licence = {
            id: undefined,
            title: undefined,
            resource: undefined,
            description: undefined,
            la_url: undefined,
        };
    }
    if (distribution.licence.id === 'officialWork') {
        distribution.licence.title = 'Amtliches Werk, lizenzfrei';
        distribution.licence.resource = 'http://www.gesetze-im-internet.de/urhg/__5.html';
    } else if (distribution.licence.id === 'other-closed') {
        distribution.licence.title = 'Andere geschlossene Lizenz';
        distribution.licence.resource = '';
    }
    distribution.modificationDate = dataset.docModDate ? dataset.docModDate : ds.modificationDate;
    distribution.releaseDate = dataset.docDate ? dataset.docDate : ds.releaseDate;
    distribution.title = {};
    distribution.title[CONFIG_APP_LOCALE] = dataset.docFile;
    ds.distributions.push(distribution);
    ds.distributionFormats.push(distribution.format);

    return ds;
}

// https://stackoverflow.com/questions/8493195/how-can-i-parse-a-csv-string-with-javascript-which-contains-comma-in-data
function getParsedCSVLine(text) {
    let p = '', row = [''], ret = [row], i = 0, r = 0, s = !0, l;
    for (l of text) {
        if ('"' === l) {
            if (s && l === p) row[i] += l;
            s = !s;
        } else if (',' === l && s) l = row[++i] = '';
        else if ('\n' === l && s) {
            if ('\r' === p) row[i] = row[i].slice(0, -1);
            row = ret[++r] = [l = '']; i = 0;
        } else row[i] += l;
        p = l;
    }
    return ret[0];
}

function getParsedCSV(csvData) {
    var csvLines = csvData.split(/\r\n|\n/);
    var header = csvLines[0].split(',');
    var lines = [];

    for (var c = 1; c < csvLines.length; ++c) {
        var line = getParsedCSVLine(csvLines[c]);

        if (line.length === header.length) {
            var obj = {};
            for (var id = 0; id < header.length; ++id) {
                obj[header[id]] = line[id];
            }
            lines.push(obj);
        }
    }
    return lines;
}

const createObjectFacet = (datasets, resData, options) => {
    const items = [];
    const countItems = {};
    for (const dataset of datasets) {
        if (!countItems[dataset[options.object].id]) {
            countItems[dataset[options.object].id] = {
                count: 0,
                title: dataset[options.object].title,
            };
        }
        countItems[dataset[options.object].id].count += 1;
    }
    Object.keys(countItems).forEach((key) => {
        items.push({
            count: countItems[key].count,
            id: key,
            title: countItems[key].title,
        });
    });
  
    resData.availableFacets.push({
        id: options.id,
        title: options.title,
        items,
    });
};

const createArrayFacet = (datasets, resData, options) => {
    const items = [];
    const countItems = {};
    for (const dataset of datasets) {
        for (const object of dataset[options.object]) {
            if (!countItems[object.id]) {
                countItems[object.id] = {
                    count: 0,
                    title: object.title,
                };
            }
            countItems[object.id].count += 1;
        }
    }
    Object.keys(countItems).forEach((key) => {
        items.push({
            count: countItems[key].count,
            id: key,
            title: countItems[key].title,
        });
    });
  
    resData.availableFacets.push({
        id: options.id,
        title: options.title,
        items,
    });
};

const createCatalogFacets = (datasets, resData) => {
    createObjectFacet(datasets, resData, {
        id: 'catalog',
        title: 'Catalogues',
        object: 'catalog',
    });
};

const createFormatFacet = (datasets, resData) => {
    createArrayFacet(datasets, resData, {
        id: 'format',
        title: 'Formats',
        object: 'distributionFormats',
    });
};

const createKeywordsFacet = (datasets, resData) => {
    createArrayFacet(datasets, resData, {
        id: 'keywords',
        title: 'Keywords',
        object: 'keywords',
    });
};

const createLicenseFacets = (datasets, resData) => {
    createArrayFacet(datasets, resData, {
        id: 'license',
        title: 'Licenses',
        object: 'licences',
    });
};
  
function createAvailableFacets(datasets, resData) {
    createCatalogFacets(datasets, resData);
//    createCategoriesFacets(datasets, resData);
//    createCountryFacets(datasets, resData);
//    createDataScopeFacet(datasets, resData);
    createFormatFacet(datasets, resData);
    createKeywordsFacet(datasets, resData);
//    createLicenseFacets(datasets, resData);
//    createScoringFacet(datasets, resData);
}

function filterFacets(datasets, facets) {
    let data = datasets;

    if (facets.catalog) {
        for (const catalog of facets.catalog) {
            data = data.filter(dataset => String(dataset.catalog.id).toLocaleLowerCase() === catalog.toLocaleLowerCase());
        }
    }

    if (facets.format) {
        for (const format of facets.format) {
            data = data.filter(dataset => dataset.distributionFormats.find(form => String(form.id).toLocaleLowerCase() === format.toLocaleLowerCase()));
        }
    }

    if (facets.keywords) {
        for (const keyword of facets.keywords) {
            data = data.filter(dataset => dataset.keywords.find(word => String(word.id).toLocaleLowerCase() === keyword.toLocaleLowerCase()));
        }
    }

    if (facets.licence) {
        for (const licence of facets.licence) {
            data = data.filter(dataset => dataset.licences.find(lic => String(lic.id).toLocaleLowerCase() === licence.toLocaleLowerCase()));
        }
    }

    return data;
}

class GoogleSpreadsheetDataService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.datasets = null;
    }

    loadFile() {
        return new Promise((resolve, reject) => {
            if (this.datasets) {
                resolve(this.datasets);
                return;
            }

            var request = new XMLHttpRequest();
            request.open('GET', this.baseUrl, true);
            request.onload = function (e) {
                if (request.readyState === 4) {
                    if (request.status === 200) {
                        if (request.responseText == '') {
                          throw new Error('no data found');
                        }

                        var result = {
                            count: 0,
                            results: getParsedCSV(request.responseText),
                        };
                        result.count = result.results.length;

                        resolve(result.results.map(dataset => transformData(dataset)).filter(dataset => dataset.id));
                    } else {
                        reject(request.statusText);
                    }
                }
            };
            request.onerror = function (e) {
                reject(request.statusText);
            };
            request.send();
        });
    }

    getSingle(id) {
        return new Promise((resolve, reject) => {
            this.loadFile()
            .then((loadedDatasets) => {
              this.datasets = loadedDatasets;
              const dataset = this.datasets.find(data => data.id === id);
              resolve(dataset);
            })
            .catch((error) => {
              reject(error);
            });
        });
    }

    sortRelevance(a, b) {
        return new Date(b.modificationDate) - new Date(a.modificationDate);
    }

    sortTitleAsc(a, b) {
        return String(a.title.de).localeCompare(b.title.de);
    }

    sortTitleDesc(a, b) {
        return String(b.title.de).localeCompare(a.title.de);
    }

    sortModificationDate(a, b) {
        return new Date(b.modificationDate) - new Date(a.modificationDate);
    }

    sortReleaseDate(a, b) {
        return new Date(b.releaseDate) - new Date(a.releaseDate);
    }

    get(q, facets, limit, page = 0, sort = 'relevance+asc, last_modified+asc, name+asc'/* , facetOperator = "AND", facetGroupOperator = "AND", geoBounds */) {
        return new Promise((resolve, reject) => {
            this.loadFile()
            .then((loadedDatasets) => {
                this.datasets = loadedDatasets;
                const query = q.trim().toLowerCase();
                let datasets = this.datasets;

                datasets = datasets.filter((dataset) => {
                    if (query === '') {
                        return true;
                    }
                    if (dataset.title && dataset.title.de && (dataset.title.de.toLowerCase().indexOf(query) !== -1)) {
                        return true;
                    }
                    if (dataset.description && dataset.description.de && (dataset.description.de.toLowerCase().indexOf(query) !== -1)) {
                        return true;
                    }
                    return false;
                });
    
                const sortOption = sort.split(',')[0].split('+');
                if (sortOption.length === 2) {
                    if (sortOption[0] === 'relevance') {
                        datasets.sort(this.sortRelevance);
                    } else if (sortOption[0] === 'modification_date') {
                        datasets.sort(this.sortModificationDate);
                    } else if (sortOption[0] === 'release_date') {
                        datasets.sort(this.sortReleaseDate);
                    } else if (sortOption[1] === 'asc') {
                        datasets.sort(this.sortTitleAsc);
                    } else {
                        datasets.sort(this.sortTitleDesc);
                    }
                }
    
                datasets = filterFacets(datasets, facets);

                const resData = {
                    availableFacets: [],
                    datasetsCount: datasets.length,
                    datasets: [],
                };

                createAvailableFacets(datasets, resData);

                const start = (page - 1) * limit;
                const end = Math.min(start + limit, resData.datasetsCount);
                for (let d = start; d < end; d += 1) {
                    resData.datasets.push(datasets[d]);
                }

                resolve(resData);
            })
            .catch((error) => {
              reject(error);
            });
        });
    }
};

CONFIG_APP_DATA_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSaLGv04zGBi7TnqZn6DJS9vb_6ynVPD0ShDqv57uyRTLgr7Nknbx7344_wtORc_i3ItZQRzDK9GXrV/pub?gid=0&single=true&output=csv';
CONFIG_APP_DATA_SERVICE = GoogleSpreadsheetDataService;
