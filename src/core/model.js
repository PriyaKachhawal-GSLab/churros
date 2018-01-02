'use strict';
/** @module core/model */

const tools = require('core/tools');
const logger = require('winston');
logger
    .remove(logger.transports.Console)
    .add(logger.transports.Console, {
        colorize: true,
        prettyPrint: true,
    });
const swaggerParser = require('swagger-parser');
const cloud = require('core/cloud');
const props = require('core/props');

const green = "\x1b[32m";
const red = "\x1b[31m";

const getElementDocs = (elementkeyOrId) => {
    let elementObj;
    return cloud.get('/elements/' + elementkeyOrId)
        .then(r => elementObj = r.body)
        .then(r => cloud.get(`elements/${elementObj.id}/docs`));
};

const getElement = (elementkeyOrId) => {
    let elementObj;
    return cloud.get('/elements/' + elementkeyOrId)
        .then(r => elementObj = r.body);
};

const get = (api) => {
    let getResponse;
    return cloud.get(api)
        .then(r => getResponse = r.body);
};


const dereference = (docs) => {
    return new Promise((res, rej) => {
        var parser = new swaggerParser();
        res(parser.dereference(docs));
    });
};

const methods = ['get', 'post', 'put', 'delete', 'patch'];

//const invalidType = ['{objectName}', 'bulk', 'ping', 'objects'];

const validateOperationID = (pattern, elementDocs) => {
    for (const path of Object.keys(elementDocs.paths)) {
        for (const method of methods) {
            if (elementDocs.paths[path].hasOwnProperty(method) && elementDocs.paths[path][method].operationId === pattern) {
                return { "schema": elementDocs.paths[path][method], "method": method };
            }
        }
    }
};



const validatedocsAgainestResponse = (pattern, elementDocs, apiResponseBody) => {

    //If found it will be equal to elementDocs.paths[path][method]
    let docsResponses = validateOperationID(pattern, elementDocs);

    if (typeof docsResponses === 'undefined') {
        throw new Error(`cannot find input pattern '${pattern}' `);
    }

    let docsResponsesSchema = docsResponses.schema;

    if (docsResponsesSchema.responses['200'] === undefined) {
        throw new Error(`cannot find get model definition in docs for '${pattern}' `);
    }
    if (typeof apiResponseBody === undefined) {
        throw new Error(`undefined api response body '${pattern}' `);
    }
    let isResponseBodyArray = Array.isArray(apiResponseBody);

    if (isResponseBodyArray && apiResponseBody.length === 0) {
        throw new Error(`apiResponseBody is empty array. create object first '${pattern}' `);
    }
    // todo: remove hardcode 'get' and write code for the same
    // todo: check if it is getall then we should have items and its type with in it. if res is having array then it is getall
    const schema = docsResponsesSchema.responses['200'].schema;

    // if (isResponseBodyArray && docsResponses['method'] === 'post' && schema['properties'] === undefined) {
    //     throw new Error(`may be models configured as array expected object '${pattern}' `)
    // }

    if (isResponseBodyArray && schema.items === undefined) {
        throw new Error(`may be models configured as object expected array '${pattern}' `);
    }

    if (!isResponseBodyArray && schema.properties === undefined) {
        throw new Error(`may bemodels configured as array expected object '${pattern}' `);
    }
    return schema;
};


const validatePrimaryKey = (primaryKey) => {
    primaryKey === undefined ?
        logger.info('Primary key is not found') : logger.info(`************ Primary key ************** : ${primaryKey}`);
};
const doubleLogSpaces = (logSpaces) => {
    return logSpaces + logSpaces;
};

const isEmpty = (obj) => {
    for (let key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
};

const checkType = (docsPropertiesKey, key, keyValue, logSpaces) => {

    const keyType = typeof keyValue;
    if (docsPropertiesKey.type === keyType) {
        logger.info(green, logSpaces, key);
        return;
    }
    if ((docsPropertiesKey.type === 'number' || docsPropertiesKey.type === 'integer') && ((keyType === 'number' || keyType === 'integer'))) {
        logger.info(green, logSpaces, key);
        return;
    }
    // TODO : validation for date datetype
    // const date = new Date(keyValue);
    // logger.info(date);
    //    const date = new Date(keyValue);
    //    console.log(keyType);
    //    if(keyType === 'string' && keyValue.indexOf('\'') !== -1 ||  keyValue.indexOf('-') !== -1) {
    //        logger.info(date);
    //    }
    // if(date !== 'Invalid Date' && docsPropertiesKey.type === 'date') {
    //     logger.info(green, logSpaces, key);
    //     return;
    // }

    logger.error(red, logSpaces, key, ' present but types are not matched found \"', keyType, '\"', ' required ', docsPropertiesKey.type);
};

const checkPresence = (docsProperties, key, keyValue, logSpaces) => {

    if (Object.keys(docsProperties).indexOf(key) === -1) {
        logger.error(red, logSpaces, key);
        return;
    }
    checkType(docsProperties[key], key, keyValue, logSpaces);
};

const compareGetModelWithResponse = (docsProperties, apiProperties, logSpaces) => {

    if (isEmpty(docsProperties)) {
        logger.error(green, logSpaces, 'Either model object has no fields or type mismatch ');
        return;
    }
    if (Array.isArray(apiProperties)) {
        if (apiProperties.length === 0) {
            logger.info(green, logSpaces, ' key is present however response array has no elements');
            return;
        }
        if (typeof (apiProperties[0]) !== "object") {
            checkType(docsProperties.type, apiProperties[0], apiProperties[0], logSpaces);
            return;
        }
        compareGetModelWithResponse(docsProperties.properties, apiProperties[0], doubleLogSpaces(logSpaces));
        return;
    }
    for (var i in apiProperties) {
        if (typeof (apiProperties[i]) !== "object") {
            checkPresence(docsProperties, i, apiProperties[i], logSpaces);
            continue;
        }
        if (docsProperties[i] === undefined) {
            logger.error(red, logSpaces, i);
            continue;
        }
        if (Array.isArray(apiProperties[i])) {
            logger.info(green, logSpaces, i, ': {[');
            compareGetModelWithResponse(docsProperties[i].items, apiProperties[i], doubleLogSpaces(logSpaces));
            logger.info(green, logSpaces, ']}');
            continue;
        }
        logger.info(green, logSpaces, i, ': {');
        compareGetModelWithResponse(docsProperties[i].properties, apiProperties[i], doubleLogSpaces(logSpaces));
        logger.info(green, logSpaces, '}');
    }
};


const compare = (pattern, elementDocs, apiResponse) => {
    return new Promise((res, rej) => {
        logger.info(`\n\n`);
        logger.info(`validating model for pattern ${pattern} \n\n`);
        let apiResponseBody = apiResponse.body;
        let schema;
        try {
            schema = validatedocsAgainestResponse(pattern, elementDocs, apiResponseBody);
        } catch (ex) {
            rej(ex);
        }
        let isResponseBodyArray = Array.isArray(apiResponseBody);
        let logSpaces = '   ';
        if (isResponseBodyArray) {
            validatePrimaryKey(schema.items['x-primary-key']);
            compareGetModelWithResponse(schema.items.properties, apiResponseBody[0], logSpaces);
        } else {
            validatePrimaryKey(schema['x-primary-key']);
            compareGetModelWithResponse(schema.properties, apiResponseBody, logSpaces);
        }
        res(apiResponse);
    });
};

/**
 * validate get model
 * @param  {Object} apiResponse        The API response
 * @param  {string} pattern            The api path to find referenced model
 */
const validateResponseModel = (apiResponse, pattern) => {

    let element = props.get('element');
    let elementDocs;

    return getElementDocs(element)
        .then(r => dereference(r.body))
        .then(r => elementDocs = r)
        .then(r =>
            //     {
            //    // todo : remove as below is for debug perspective
            //     var fs = require('fs');
            //     fs.writeFile('myjsonfile1.json', JSON.stringify(elementDocs) , 'utf8', function() {
            //      console.log('printed')
            //     });
            //     logger.debug(elementDocs)
            //     compare(pattern, elementDocs, apiResponse.body)
            //     }
            compare(pattern, elementDocs, apiResponse)
        ).catch(r => tools.logAndThrow('Failed to validate model :', r));
};

exports.validateResponseModel = (apiResponse, pattern) => validateResponseModel(apiResponse, pattern);

let output = {};
let models = {};
let matchingObjects = {};


function sortObject(objectToSort) {
    let obj = {};
    let keys = Object.keys(objectToSort);
    keys.sort();

    keys.forEach(function (key) {
        obj[key] = objectToSort[key];
    });
    return obj;
}

function sortAndValidate(originalObj, suspectObj) {
    let original = JSON.stringify(sortObject(originalObj));
    let suspect = JSON.stringify(sortObject(suspectObj));

    if (original === suspect) {
        original = JSON.stringify(sortObject(originalObj.properties));
        suspect = JSON.stringify(sortObject(suspectObj.properties));
        if (original !== suspect) {
            return true;
        }
        return false;
    }
    return true;
}


function addIssue(key, original, culprit) {

    let clonedOriginal = JSON.parse(JSON.stringify(original));
    let clonedCulprit = JSON.parse(JSON.stringify(culprit));

    // TODO : optimize code
    if (clonedOriginal) {
        if (typeof clonedOriginal.model !== 'undefined') {
            delete clonedOriginal.model;
        }
    }
    if (clonedCulprit) {
        if (typeof clonedCulprit.model !== 'undefined') {
            delete clonedCulprit.model;
        }
    }

    if (output.issues.hasOwnProperty(key)) {
        output.issues[key].conflicts.push(clonedCulprit);
        return;
    }

    let issue = {};
    issue.conflicts = [];


    issue.conflicts.push(clonedOriginal);
    issue.conflicts.push(clonedCulprit);

    output.issues[key] = issue;
}



function validateObjectLenghts(originalObj, suspectObj) {
    let l1 = Object.keys(originalObj).length;
    let l2 = Object.keys(suspectObj).length;

    if (l1 !== l2)
        return true;
    return false;
}


function validate(resource, swaggerType) {

    Object.keys(resource.model[swaggerType]).forEach(function (key) {

        let modelValue = {};
        modelValue.method = resource.method;
        modelValue.path = resource.path;
        modelValue.swaggerType = swaggerType === 'swagger' ? 'responseSwagger' : swaggerType;
        modelValue.model = resource.model[swaggerType][key];

        if (models.hasOwnProperty(key)) {
            if (JSON.stringify(models[key].model) !== JSON.stringify(modelValue.model)) {
                if (validateObjectLenghts(models[key].model, modelValue.model) || validateObjectLenghts(models[key].model.properties, modelValue.model.properties) || sortAndValidate(models[key].model, modelValue.model))
                    addIssue(key, models[key], modelValue);
            } else {
                matchingObjects[key].push(modelValue);
            }
        } else {
            matchingObjects[key] = [];
            models[key] = modelValue;
        }

    });
}

const dostuff = (response) => {
    return new Promise((res, rej) => {
        if (response.resources) {
            output.id = response.id;
            output.name = response.name;
            output.key = response.key;
            output.issues = {};
            response.resources.forEach(function (resource) {
                if (resource.model) {
                    if (Object.keys(resource.model.swagger).length) {
                        validate(resource, 'swagger');

                        if (resource.model.hasOwnProperty('requestSwagger'))
                            validate(resource, 'requestSwagger');
                    }
                }
            });

            if (Object.keys(output.issues).length) {
                Object.keys(output.issues).forEach(function (key) {
                    //logger.info(matchingObjects[key])
                    //logger.info(matchingObjects[key]);
                    matchingObjects[key].forEach(function (matchingObject) {
                        delete matchingObject.model;
                    });
                    output.issues[key].conflicts = output.issues[key].conflicts.concat(matchingObjects[key]);
                });

            }
            logger.info(JSON.stringify(output, undefined, 4));

            res(output);

        }
        rej({});
    });
};




/**
 * check Duplicate model for an element
 * @param  {Object} apiResponse        The API response
 * @param  {string} pattern            The api path to find referenced model
 */
const checkDuplicateModel = () => {

    let element = props.get('element');
    //let elementReponse;

    return getElement(element)
        // .then(r => elementReponse = r)
        .then(r => dostuff(r))
        .catch(r => tools.logAndThrow('Failed to validate model :', r));
};

exports.checkDuplicateModel = () => checkDuplicateModel();

const findMax = (response) => {
   // logger.info(response.length);
    let max = 0;
    let maxLengthObject = response[0];
    response.forEach((singleResponse, i, a) => {        
        let singleResponseLength = Object.keys(singleResponse).length;
        //logger.info("max : " + max + "length : " + singleResponseLength);
        if (singleResponseLength > max) {
            max = singleResponseLength;
            maxLengthObject = singleResponse;
            //logger.info(i);
        }
    });
    //logger.info(max);
    return maxLengthObject;
};

const validateAndFindMax = (response) => {
    return new Promise((res, rej) => {
        logger.debug(typeof response);
        if (Array.isArray(response) && response.length !== 0) {
            res(findMax(response));
        }
        rej('invalid get response');
    });
};


const validateSearchableFieldsWithReduce = (whereClauseArray, api, responseLength) => {
    return whereClauseArray.reduce((promise, r) => {
        return promise
            .then((result) => {
                //console.log(`item ${item}`);
                //return asyncFunc(item).then(result => final.push(result));
               // logger.info(r.value);
                return cloud.withOptions({ qs: { where: r.value } }).get(api)
                .then(result => r.status = result.body);
                //return asyncFunc(item).then(result => final.push(result));
            })
            .catch(console.error);
    }, Promise.resolve());
};

// const validateSearchableFields = (whereClauseArray, api, responseLength) => {

//     return Promise.all(whereClauseArray.map(r => 
//         //cloud.withOptions({ qs: { where: r.value } }).get(api)
//         cloud.withOptions({ qs: { where: 'companyName=\'Alamo Catering Group\'' } }).get(api)
        
//         //.then(delay(1000))
//         .then(r => { logger.info('here'); return r;})        
//        // .catch(delay(1000))
//         .catch(r => { logger.info('error'); return r;})
//          ))
//         .then(rs => {
//             // remove this logger.
//             logger.debug('in validateSearchableFields');            
//             //rs.forEach(r=>logger.info(Object.keys(r)))

//             let countError = 0;
//             let countSuccess = 0;
//             rs.forEach(r => {
//                 if(r.hasOwnProperty('body')) {
//                     countSuccess++;
//                 }
//                 else {
//                     countError++;
//                 }

//             });

//             logger.info('countError', countError);
//             logger.info('countSuccess', countSuccess);

//             whereClauseArray.forEach((r, i, a) => r.status = rs[i]);                     
//             let passedKeys = []; let failedKeys = []; let suspectedKeys = [];
//             whereClauseArray.forEach(r => {                
//                 if(r.status.hasOwnProperty('body')) {
//                     if(r.status.body.length !== responseLength) {
//                         passedKeys.push(r.key); 
//                     }else {
//                         suspectedKeys.push(r); 
//                     }
//                 } else {
//                     failedKeys.push(r.key);
//                 }
//             });
            
//             logger.info(' result : ', api);
//             logger.info({
//                 passedKeys : passedKeys                
//             });  
//             logger.info({                
//                 suspectedKeys : suspectedKeys.map(r => r.key),                
//             });
//             logger.info({
//                 failedKeys : failedKeys
//             });
            
//             // suspectedKeys.forEach((r, i, a) => {
//             //     let body =  r.status.body;
//             //     let result = body.every((single) => {
//             //        return Object.keys(single).indexOf('cscd') > -1;                   
//             //     }); 
//             //     result ? passedKeys.push(r.key) : failedKeys.push(r.key);
//             // });    
//             // logger.info('mature result : ', api);
//             // logger.info({
//             //     passedKeys : passedKeys,                
//             //     failedKeys : failedKeys
//             // });        
//             return whereClauseArray;
//         })
//         .catch(e => {
//             logger.info('failed with some region   ');
//         });
// };

// const reportSearchableFields = (whereClauseArray, responseLength) => {

//     let passedKeys = []; let failedKeys = []; let suspectedKeys = [];
//     whereClauseArray.forEach(r => {   
        
//         if(r.hasOwnProperty('status')) {
//             if(r.status.body.length !== responseLength) {
//                 passedKeys.push(r.key); 
//             } else {
//                 suspectedKeys.push(r); 
//             }
//         } else {
//             failedKeys.push(r.key);
//         }    
//     });

//     logger.info({
//         passedKeys : passedKeys                
//     });  
//     logger.info({                
//         suspectedKeys : suspectedKeys.map(r => r.key),                
//     });
//     logger.info({
//         failedKeys : failedKeys
//     });    
// };
    

const filterAndMapResponse = (response) => {
    return new Promise((res, rej) => {
        //logger.info(response);
        if (typeof response === 'object') {
            let filteredAndMappedKeys = Object.keys(response).filter((key) => {
                // to put (key.endsWith("_c"))
                if (typeof response[key] !== 'object') {
                    return key;
                }
            })
            .map((filteredKey) => {
                // put equalignore case
                // if (response[filteredKey] === true || response[filteredKey] === false) {
                //     return { key: filteredKey, value: filteredKey + "=" + response[filteredKey] };
                // }
                return { key: filteredKey, value: filteredKey + "=\'" + response[filteredKey] + "\'" };
            });
            logger.debug('filtered', filteredAndMappedKeys);
            logger.info('filtered', filteredAndMappedKeys);
            res(filteredAndMappedKeys);
        }
        rej('cannot filter fields');
    });
};



const searchableFields = (api) => {

    let whereClauseArray = {};
    logger.debug('working for : ', api);
    let responseLength;
    return get(api)        
        .then(r => { responseLength  = r.length;                     
                     return validateAndFindMax(r);})
        .then(r => filterAndMapResponse(r))
       // .then(r => validateSearchableFields(r, api, responseLength))        
       .then(r => {
            whereClauseArray = r;
            return validateSearchableFieldsWithReduce(r, api, responseLength);
        })   
       //.then(r => logger.info(whereClauseArray))
       .then(r => 
         {
         var count = 0;
         whereClauseArray.forEach(r => {
          if(r.hasOwnProperty('status')) {   
            count++;
            logger.info(r.key);       
          }
    });
    logger.info(count);

})    
    //)
       .catch(r => tools.logAndThrow('Failed to find searchable fields :', r));
};

exports.searchableFields = (api) => searchableFields(api);
