CONFIG_APP_TITLE = 'Schul-Datenportal';
CONFIG_APP_HEADER_LOGO_TEXT = CONFIG_APP_TITLE;
CONFIG_APP_AUTH_SERVICE = 'zero';
//CONFIG_APP_ROUTER_REDIRECT_ROOT_TO = 'Welcome';
CONFIG_APP_ROUTER_REDIRECT_ROOT_TO = 'Portal';

CONFIG_APP_LOCALE = 'de';
CONFIG_APP_LOCALE_FALLBACK = 'en';
//CONFIG_APP_LOAD_LANGUAGE_1 = 'de';

CONFIG_APP_ROUTER_BASE = '/peacock-user-ui/';
CONFIG_APP_ROUTER_LIB_BASE = 'https://unpkg.com/peacock-user-ui@latest/dist/';

CONFIG_APP_HEADER_NAV_1_URL = '/list';
CONFIG_APP_HEADER_NAV_1_TITLE = 'Liste';

CONFIG_APP_ROUTER_ROUTE_1_NAME = 'Welcome';
CONFIG_APP_ROUTER_ROUTE_1_PATH = '/index.html';
CONFIG_APP_ROUTER_ROUTE_1_FILE = '/peacock-user-ui/page/welcome.html';
CONFIG_APP_ROUTER_ROUTE_1_REQUIRES_AUTH = false;

CONFIG_APP_ROUTER_ROUTE_2_NAME = 'Portal';
CONFIG_APP_ROUTER_ROUTE_2_PATH = '/list';
CONFIG_APP_ROUTER_ROUTE_2_COMPONENT = 'Datasets';
CONFIG_APP_ROUTER_ROUTE_2_REQUIRES_AUTH = false;

function getParsedCSV(csvData) {
    var csvLines = csvData.split(/\r\n|\n/);
    var header = csvLines[0].split(',');
    var lines = [];

    for (var c = 1; c < csvLines.length; ++c) {
        var line = csvLines[c].split(',');

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

function transformData(dataset) {
    var ds = dataset;
    return ds;
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

                        resolve(result.results.map(dataset => transformData(dataset)));
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
                  // do nothing on 'relevance'
                } else if (sortOption[0] === 'modification_date') {
                  datasets.sort(sortModificationDate);
                } else if (sortOption[0] === 'release_date') {
                  datasets.sort(sortReleaseDate);
                } else if (sortOption[1] === 'asc') {
                  datasets.sort(sortTitleAsc);
                } else {
                  datasets.sort(sortTitleDesc);
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

//CONFIG_APP_DATA_URL = 'https://docs.google.com/spreadsheets/d/1BEDAUycmxo2ekI3FeLinsUqbqQniKXpqKR067INtsos/edit#gid=0';
CONFIG_APP_DATA_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSaLGv04zGBi7TnqZn6DJS9vb_6ynVPD0ShDqv57uyRTLgr7Nknbx7344_wtORc_i3ItZQRzDK9GXrV/pub?gid=0&single=true&output=csv';
CONFIG_APP_DATA_SERVICE = GoogleSpreadsheetDataService;
