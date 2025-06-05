const log = systemGlobal.log;

const apis = {};

global.createApi = (apiName, api) => {
    if (apis[apiName]) return log(`Api ${apiName} already exists!`)
    if (typeof api !== 'function') return log(`Api ${apiName} argument must be a function!`)
    apis[apiName] = api
};

const createGetApi = (script) => {
    return (apiName) => {
        if (!apis[apiName]) {
            log(`${script.name} tried to access the api called ${apiName} but it does not exist.`)
            return null;
        }
        return apis[apiName](script)
    }
}
let getApi;
systemGlobal.evalUserScript = ({ name, script, file }) => {
    const userScript = { name, file };

    getApi = createGetApi(userScript);

    eval(`(function(global, getApi) { ${script} })`)(global, getApi);
};