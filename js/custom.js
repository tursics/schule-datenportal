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

class GoogleSpreadsheetDataService {
    constructor(baseUrl) {
        // Clear newURL
//        $scope.newURL = '';

        // Empty array for all the original grid IDs
//        $scope.oldGrids = [];
        // Empty array for all the new grid IDs
//        $scope.newGrids = [];

        var preString = baseUrl.substring(baseUrl.indexOf('/d/') + 3);
        if (preString.indexOf('/') > -1) {
            this.spreadsheetId = preString.substring(0, preString.indexOf('/'));
        } else {
            this.spreadsheetId = preString;
        }

        this.grid = baseUrl.substring(baseUrl.indexOf('=') + 1);

        this.uriXMLV3 = 'https://spreadsheets.google.com/feeds/worksheets/' + this.spreadsheetId + '/public/full';
//        this.uriXML = 'https://www.googleapis.com/auth/spreadsheets.readonly/' + this.spreadsheetId;
        this.uriXML = 'https://sheets.googleapis.com/v4/spreadsheets/' + this.spreadsheetId;

        console.log('spreadsheet id ' + this.spreadsheetId);
        console.log('grid ' + this.grid);
        console.log('uriXML v3 ' + this.uriXMLV3);
        console.log('uriXML v4 ' + this.uriXML);
        this.baseUrl = baseUrl;
    }
};

CONFIG_APP_DATA_SERVICE = {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    },

    getSingle(id) {
        console.log('getSingle');
    },

    get(q, facets, limit, page = 0 /* , sort = 'relevance+asc, last_modified+asc, name+asc', facetOperator = "AND", facetGroupOperator = "AND", geoBounds */) {
        console.log('get');
    }
};

CONFIG_APP_DATA_URL = 'https://docs.google.com/spreadsheets/d/1BEDAUycmxo2ekI3FeLinsUqbqQniKXpqKR067INtsos/edit#gid=0';
//CONFIG_APP_DATA_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSaLGv04zGBi7TnqZn6DJS9vb_6ynVPD0ShDqv57uyRTLgr7Nknbx7344_wtORc_i3ItZQRzDK9GXrV/pub?gid=0&single=true&output=csv';
CONFIG_APP_DATA_SERVICE = GoogleSpreadsheetDataService;
