This program and the accompanying materials are
made available under the terms of the Eclipse Public License v2.0 which accompanies
this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

SPDX-License-Identifier: EPL-2.0

Copyright Contributors to the Zowe Project.

# DB2 Library for Zowe DB Browser

This plugin is a library for the [DB Browser App of Zowe](https://github.com/zowe/db-browser)
It depends on the [ibm_db node.js library](https://www.npmjs.com/package/ibm_db), which in turn uses z/OS DB2 Connect. 
Due to this, you must have a db2 connect license to use this library.

## Installation
The source can be built in the way standard to Zowe Apps, either by running `build.sh` from [zlux-build](https://github.com/zowe/zlux-build) or by executing `npm install && npm run build` within the `nodeServer` directory of this plugin.

After building, a db2 connect license file must be provided to the ibm_db library. Simply copy your license file into `lib/node_modules/ibm_db/installer/clidriver/license`







This program and the accompanying materials are
made available under the terms of the Eclipse Public License v2.0 which accompanies
this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

SPDX-License-Identifier: EPL-2.0

Copyright Contributors to the Zowe Project.
