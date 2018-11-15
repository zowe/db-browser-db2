/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { Response, Request } from "express";
import { Router } from "express-serve-static-core";
const express = require('express');
const Promise = require('bluebird');
const ibmdb  = require('ibm_db');

class DB2Dataservice{
  private context: any;
  private router: Router;

  constructor(context: any){
    this.context = context;
    let router = express.Router();
    router.use(function noteRequest(req: Request,res: Response,next: any) {
      context.logger.info('Saw request, method='+req.method);
      next();
    });
    context.addBodyParseMiddleware(router);
    router.post('/',function(req: Request,res: Response) {

    try{
      let
      query     = req.body ? req.body.query : "-1",
      database  = req.body ? req.body.database : "-1",
      hostname  = req.body ? req.body.hostname : "-1",
      uid       = req.body ? req.body.uid : "-1",
      password  = req.body ? req.body.password : "-1",
      port      = req.body ? String(req.body.port) : "-1",
      protocol  = req.body ? req.body.protocol : "-1";
      let connStr = "DATABASE=" + database + ";HOSTNAME=" + hostname +
                  ";UID=" + uid + ";PWD=" + password + ";PORT=" + port +
                  ";PROTOCOL=" + protocol;

      ibmdb.open(connStr, function (err,conn) {

        if (err) {

          let responseBody = {
           "_docType": "org.zowe.dbbrowser.db2.query",
           "_metaDataVersion": "1.0.0",
           "requestBody": req.body,
           "requestURL": req.originalUrl,
           "error": JSON.stringify(err)
         }
         res.status(200).json(responseBody);
        }
        conn.queryResult(query, function (err, data) {

            if (err) {

              let responseBody = {
               "_docType": "org.zowe.dbbrowser.db2.query",
               "_metaDataVersion": "1.0.0",
               "requestBody": req.body,
               "requestURL": req.originalUrl,
               "error": JSON.stringify(err)
             }

             res.status(200).json(responseBody);
             conn.close(function () {});
            }
            else {

              //TODO:need the driver to kick over tableMetaData and/or further fields?
              let metaData = data.getColumnMetadataSync();
              metaData = JSON.parse(JSON.stringify(metaData).split('"SQL_DESC_CONCISE_TYPE":').join('"columnIdentifier":'));
              metaData = JSON.parse(JSON.stringify(metaData).split('"SQL_DESC_TYPE_NAME":').join('"rawDataType":'));
              for (let i = 0; i < metaData.length; i++){
                 metaData[i]['longColumnLabel'] = metaData[i]['columnIdentifier'];
                if (metaData[i]['rawDataType'].match(/int|real|numeric|float|double|decimal|enum|bit/i)){
                  metaData[i]['rawDataType'] = 'number';
                }
                else {
                  metaData[i]['rawDataType'] = 'string';
                }
                metaData[i]['rawDataTypeLength'] = metaData[i]['SQL_DESC_DISPLAY_SIZE'];
                delete(metaData[i]['SQL_DESC_DISPLAY_SIZE']);
                delete(metaData[i]['index']);
                delete(metaData[i]['SQL_DESC_PRECISION']);
                delete(metaData[i]['SQL_DESC_SCALE']);
                delete(metaData[i]['SQL_DESC_LENGTH']);
              }

              let temp;
              try {
                temp = data.fetchAllSync();
                }
                catch(e) {
                  context.logger.info(e);
                  throw e;
                }

              let responseBody = {
                "_docType": "org.zowe.dbbrowser.db2.query",
                "_metaDataVersion": "1.0.0",
                "requestBody": req.body,
                "requestURL": req.originalUrl,
                "metaData": {
                  "columnMetaData" : metaData
                },
                "metaData.tableMetaData": {},
                "rows": temp
              }
              res.status(200).json(responseBody);
            }
            if(data){
            data.closeSync();
            }
            conn.close(function () {});
        });
      });

    } catch (e){
      
    }
    });
    this.router = router;
  }

  getRouter():Router{
    return this.router;
  }
}


exports.DB2Router = function(context): Router {
  return new Promise(function(resolve, reject) {
    let dataservice = new DB2Dataservice(context);
    resolve(dataservice.getRouter());
  });
}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/