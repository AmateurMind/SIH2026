
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** CampusBuddy_Finale
- **Date:** 2025-12-22
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001
- **Test Name:** User Registration with Valid Details
- **Test Code:** [TC001_User_Registration_with_Valid_Details.py](./TC001_User_Registration_with_Valid_Details.py)
- **Test Error:** 
Browser Console Logs:
[WARNING] [2025-12-22T14:01:33.626Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37Cfi9F67WPA5HdfbUJvwBvEI9u:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A02CD80014010000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0x11400d21380]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0x11400d21380]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0x11400d21380]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0x11400d21380]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (this message will no longer repeat) (at http://localhost:5173/:0:0)
[WARNING] [2025-12-22T14:02:36.765Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37Cfi9F67WPA5HdfbUJvwBvEI9u:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A02CD80014010000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
[WARNING] [2025-12-22T14:03:51.558Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37Cfi9F67WPA5HdfbUJvwBvEI9u:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0588B0214010000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
[WARNING] [2025-12-22T14:05:06.132Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37Cfi9F67WPA5HdfbUJvwBvEI9u:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0588B0214010000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/be6c8a15-d34a-4133-80eb-010c3d3ae5be/773fd768-7f05-4f9f-bc7a-98fd339de9d1
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002
- **Test Name:** User Registration with Missing Required Fields
- **Test Code:** [TC002_User_Registration_with_Missing_Required_Fields.py](./TC002_User_Registration_with_Missing_Required_Fields.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/be6c8a15-d34a-4133-80eb-010c3d3ae5be/3f17cabb-452c-4e17-a7fb-5bef377213fb
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003
- **Test Name:** User Login with Correct Credentials
- **Test Code:** [TC003_User_Login_with_Correct_Credentials.py](./TC003_User_Login_with_Correct_Credentials.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/be6c8a15-d34a-4133-80eb-010c3d3ae5be/5e0f4456-50f4-4509-a726-46771582f6cc
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004
- **Test Name:** User Login with Invalid Credentials
- **Test Code:** [TC004_User_Login_with_Invalid_Credentials.py](./TC004_User_Login_with_Invalid_Credentials.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/be6c8a15-d34a-4133-80eb-010c3d3ae5be/14e02d9d-c4f7-43f0-9c1b-295864fdbf40
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005
- **Test Name:** Fetch Authenticated User Profile
- **Test Code:** [TC005_Fetch_Authenticated_User_Profile.py](./TC005_Fetch_Authenticated_User_Profile.py)
- **Test Error:** Stopped testing due to missing login button on homepage, preventing user authentication and profile data fetch. Issue reported for resolution.
Browser Console Logs:
[WARNING] [2025-12-22T14:01:28.365Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37CfhSyr4YTZtzVC2bJNFzuS2qr:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0ACD800C4190000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0x19c403d9f400]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0x19c403d9f400]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0x19c403d9f400]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0x19c403d9f400]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (this message will no longer repeat) (at http://localhost:5173/:0:0)
[WARNING] [2025-12-22T14:02:29.738Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37CfhSyr4YTZtzVC2bJNFzuS2qr:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0ACD800C4190000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
[WARNING] [2025-12-22T14:03:41.634Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37CfhSyr4YTZtzVC2bJNFzuS2qr:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0ACD800C4190000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
[WARNING] [2025-12-22T14:04:50.818Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37CfhSyr4YTZtzVC2bJNFzuS2qr:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0ACBC06C4190000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/be6c8a15-d34a-4133-80eb-010c3d3ae5be/f0c7afe7-0e18-41a4-aea3-8010059bcff7
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006
- **Test Name:** Fetch Authenticated Profile with Invalid or Expired Token
- **Test Code:** [TC006_Fetch_Authenticated_Profile_with_Invalid_or_Expired_Token.py](./TC006_Fetch_Authenticated_Profile_with_Invalid_or_Expired_Token.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/be6c8a15-d34a-4133-80eb-010c3d3ae5be/d004e80f-6c2a-47e9-8a9e-6febdeb79ec0
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007
- **Test Name:** CRUD Operations on Student Profile
- **Test Code:** [TC007_CRUD_Operations_on_Student_Profile.py](./TC007_CRUD_Operations_on_Student_Profile.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/be6c8a15-d34a-4133-80eb-010c3d3ae5be/c5977ea1-a7be-4b49-ae00-9862fa3c3d75
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008
- **Test Name:** Resume Upload with Valid PDF
- **Test Code:** [TC008_Resume_Upload_with_Valid_PDF.py](./TC008_Resume_Upload_with_Valid_PDF.py)
- **Test Error:** 
Browser Console Logs:
[WARNING] [2025-12-22T14:01:29.408Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37CfhXzYYLyd9QwuMxY1RAdw5j2:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0ECD7004C1E0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0x1e4c04082d80]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0x1e4c04082d80]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0x1e4c04082d80]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0x1e4c04082d80]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (this message will no longer repeat) (at http://localhost:5173/:0:0)
[WARNING] [2025-12-22T14:02:32.194Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37CfhXzYYLyd9QwuMxY1RAdw5j2:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0ECD7004C1E0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
[WARNING] [2025-12-22T14:03:43.350Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37CfhXzYYLyd9QwuMxY1RAdw5j2:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0ECD7004C1E0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
[WARNING] [2025-12-22T14:04:55.987Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37CfhXzYYLyd9QwuMxY1RAdw5j2:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0ECD7004C1E0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/be6c8a15-d34a-4133-80eb-010c3d3ae5be/5e4b1bd4-7db4-4700-9226-327ba211e4cc
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009
- **Test Name:** Resume Upload Rejects Invalid File Types
- **Test Code:** [TC009_Resume_Upload_Rejects_Invalid_File_Types.py](./TC009_Resume_Upload_Rejects_Invalid_File_Types.py)
- **Test Error:** Test stopped due to inability to interact with the 'Login to Portal' button on the homepage, preventing further API testing for non-PDF file upload error handling.
Browser Console Logs:
[WARNING] [2025-12-22T14:01:29.457Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37Cfhn1vP5Y397rwwsGWxA1amq6:0:0)
[ERROR] Failed to load resource: the server responded with a status of 404 (Not Found) (at http://localhost:5173/api/resume:0:0)
[WARNING] [2025-12-22T14:02:05.401Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37Cfhn1vP5Y397rwwsGWxA1amq6:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A000D707AC390000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0x39ac07127600]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0x39ac07127600]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0x39ac07127600]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0x39ac07127600]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (this message will no longer repeat) (at http://localhost:5173/:0:0)
[ERROR] Failed to load resource: the server responded with a status of 404 (Not Found) (at http://localhost:5173/api/resume:0:0)
[WARNING] [2025-12-22T14:02:46.511Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37Cfhn1vP5Y397rwwsGWxA1amq6:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A02CDC00AC390000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
[WARNING] [2025-12-22T14:03:58.936Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37Cfhn1vP5Y397rwwsGWxA1amq6:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/be6c8a15-d34a-4133-80eb-010c3d3ae5be/64368181-8d0a-454d-a6e6-bd31beb6341a
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010
- **Test Name:** Secure Resume PDF Streaming Access
- **Test Code:** [TC010_Secure_Resume_PDF_Streaming_Access.py](./TC010_Secure_Resume_PDF_Streaming_Access.py)
- **Test Error:** 
Browser Console Logs:
[WARNING] [2025-12-22T14:01:29.872Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37CfhmwNkR9DlliZjRiyYAyWUSW:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0ACD700040B0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0xb0403f56700]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0xb0403f56700]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0xb0403f56700]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0xb0403f56700]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (this message will no longer repeat) (at http://localhost:5173/:0:0)
[WARNING] [2025-12-22T14:02:33.231Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37CfhmwNkR9DlliZjRiyYAyWUSW:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0980507040B0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
[ERROR] Failed to load resource: net::ERR_CONNECTION_CLOSED (at https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg:0:0)
[WARNING] [2025-12-22T14:03:45.123Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37CfhmwNkR9DlliZjRiyYAyWUSW:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A06C0507040B0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
[WARNING] [2025-12-22T14:03:59.633Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37CfhmwNkR9DlliZjRiyYAyWUSW:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/be6c8a15-d34a-4133-80eb-010c3d3ae5be/fa0eff0c-d6e8-43ff-8c63-8fb46f284479
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC011
- **Test Name:** Share Resume via Expiring Link
- **Test Code:** [TC011_Share_Resume_via_Expiring_Link.py](./TC011_Share_Resume_via_Expiring_Link.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/be6c8a15-d34a-4133-80eb-010c3d3ae5be/72319a4a-b5bf-4bde-8b88-455ac6eac263
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012
- **Test Name:** Internship Creation by Authorized Roles
- **Test Code:** [TC012_Internship_Creation_by_Authorized_Roles.py](./TC012_Internship_Creation_by_Authorized_Roles.py)
- **Test Error:** The task to verify that only admin and recruiter roles can create internship postings successfully could not be fully completed. Admin login failed due to no admin accounts available. Recruiter login page did not allow password input, preventing login. Therefore, POST request tests to create internship postings as admin and recruiter could not be performed. Student role POST request test was also not done. Further investigation or valid credentials are needed to complete this task.
Browser Console Logs:
[WARNING] [2025-12-22T14:01:30.775Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37Cfi2FxnAqJtDbFkgNVKBDIE1E:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0C4D500D4310000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0x31d404068100]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0x31d404068100]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0x31d404068100]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0x31d404068100]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (this message will no longer repeat) (at http://localhost:5173/:0:0)
[WARNING] [2025-12-22T14:02:35.344Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37Cfi2FxnAqJtDbFkgNVKBDIE1E:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A06CD500D4310000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
[WARNING] [2025-12-22T14:03:45.285Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37Cfi2FxnAqJtDbFkgNVKBDIE1E:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A098C602D4310000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
[WARNING] [2025-12-22T14:04:56.473Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37Cfi2FxnAqJtDbFkgNVKBDIE1E:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A098C602D4310000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/be6c8a15-d34a-4133-80eb-010c3d3ae5be/75e43ee0-ea60-49c7-916d-512776bd5cf5
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013
- **Test Name:** Internship Listing with Multi-Criteria Filters
- **Test Code:** [TC013_Internship_Listing_with_Multi_Criteria_Filters.py](./TC013_Internship_Listing_with_Multi_Criteria_Filters.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/be6c8a15-d34a-4133-80eb-010c3d3ae5be/bbcd0af8-232c-4de4-9dea-b5125b576b75
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC014
- **Test Name:** Student Application Submission Validations
- **Test Code:** [TC014_Student_Application_Submission_Validations.py](./TC014_Student_Application_Submission_Validations.py)
- **Test Error:** 
Browser Console Logs:
[WARNING] [2025-12-22T14:01:36.623Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37CfitGqk9txw3y5Ikci7SZ1A9V:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A004DC002C260000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0x262c04218d00]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0x262c04218d00]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0x262c04218d00]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0x262c04218d00]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (this message will no longer repeat) (at http://localhost:5173/:0:0)
[WARNING] [2025-12-22T14:02:41.221Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37CfitGqk9txw3y5Ikci7SZ1A9V:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A004DC002C260000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
[WARNING] [2025-12-22T14:03:53.719Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37CfitGqk9txw3y5Ikci7SZ1A9V:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A004DC002C260000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
[WARNING] [2025-12-22T14:05:06.704Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37CfitGqk9txw3y5Ikci7SZ1A9V:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A004DC002C260000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/be6c8a15-d34a-4133-80eb-010c3d3ae5be/25bef445-e931-42d1-beb2-ba289fc90956
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC015
- **Test Name:** Real-time Application Status Tracking
- **Test Code:** [TC015_Real_time_Application_Status_Tracking.py](./TC015_Real_time_Application_Status_Tracking.py)
- **Test Error:** 
Browser Console Logs:
[WARNING] [2025-12-22T14:01:32.476Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37Cfi0RSVjoGfTp1HzsOC7z4Vxh:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0C4DD003C2B0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0x2b3c0405b400]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0x2b3c0405b400]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0x2b3c0405b400]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0x2b3c0405b400]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (this message will no longer repeat) (at http://localhost:5173/:0:0)
[WARNING] [2025-12-22T14:02:32.786Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37Cfi0RSVjoGfTp1HzsOC7z4Vxh:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0C4DD003C2B0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
[WARNING] [2025-12-22T14:03:41.998Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37Cfi0RSVjoGfTp1HzsOC7z4Vxh:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0AC80023C2B0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
[WARNING] [2025-12-22T14:04:59.103Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37Cfi0RSVjoGfTp1HzsOC7z4Vxh:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0AC80023C2B0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/be6c8a15-d34a-4133-80eb-010c3d3ae5be/4503465e-d580-43df-98e4-b488ad94ac2a
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC016
- **Test Name:** Mentor Application Review and Feedback Workflow
- **Test Code:** [TC016_Mentor_Application_Review_and_Feedback_Workflow.py](./TC016_Mentor_Application_Review_and_Feedback_Workflow.py)
- **Test Error:** Reported the issue that the 'Login to Portal' button does not navigate to the role selection screen, blocking further testing of mentor bulk approval/rejection functionality. Stopping the task.
Browser Console Logs:
[WARNING] [2025-12-22T14:01:37.869Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37Cfix5x5n8PZ8SikAzPOslCreG:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A080DA00C40B0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0xbc403216080]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0xbc403216080]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0xbc403216080]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0xbc403216080]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (this message will no longer repeat) (at http://localhost:5173/:0:0)
[WARNING] [2025-12-22T14:02:36.600Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37Cfix5x5n8PZ8SikAzPOslCreG:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0589206C40B0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
[WARNING] [2025-12-22T14:03:47.997Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37Cfix5x5n8PZ8SikAzPOslCreG:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0589206C40B0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
[WARNING] [2025-12-22T14:05:02.489Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37Cfix5x5n8PZ8SikAzPOslCreG:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0589206C40B0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/be6c8a15-d34a-4133-80eb-010c3d3ae5be/3c5e8d4e-077e-4215-960a-d71b533cc306
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC017
- **Test Name:** Admin Internship Management Operations
- **Test Code:** [TC017_Admin_Internship_Management_Operations.py](./TC017_Admin_Internship_Management_Operations.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/be6c8a15-d34a-4133-80eb-010c3d3ae5be/604601f5-d702-4c31-855d-3d1e05b4fa32
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC018
- **Test Name:** Recruiter Posting and Candidate Filtering
- **Test Code:** [TC018_Recruiter_Posting_and_Candidate_Filtering.py](./TC018_Recruiter_Posting_and_Candidate_Filtering.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/be6c8a15-d34a-4133-80eb-010c3d3ae5be/1e1fb012-bff9-42ee-8acb-50e854d4e884
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC019
- **Test Name:** Analytics Data Access by Role
- **Test Code:** [TC019_Analytics_Data_Access_by_Role.py](./TC019_Analytics_Data_Access_by_Role.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/be6c8a15-d34a-4133-80eb-010c3d3ae5be/d57377e9-7b20-4045-b3fd-160c73b03023
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC020
- **Test Name:** Notification Scheduling and Dispatch
- **Test Code:** [TC020_Notification_Scheduling_and_Dispatch.py](./TC020_Notification_Scheduling_and_Dispatch.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/be6c8a15-d34a-4133-80eb-010c3d3ae5be/cb8b570f-38b5-4bcc-92c2-7d04099926d8
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC021
- **Test Name:** Frontend Role-Based Route Protection and Responsiveness
- **Test Code:** [TC021_Frontend_Role_Based_Route_Protection_and_Responsiveness.py](./TC021_Frontend_Role_Based_Route_Protection_and_Responsiveness.py)
- **Test Error:** Testing stopped due to frontend loading issue preventing any interaction or navigation. Unable to verify role-based dashboards or route protections.
Browser Console Logs:
[WARNING] [2025-12-22T14:01:34.738Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37CfiH2WQdnBC0vol0eiTDGw6wa:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0ACD8006C2A0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0x2a6c01de9a00]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0x2a6c01de9a00]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0x2a6c01de9a00]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0x2a6c01de9a00]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (this message will no longer repeat) (at http://localhost:5173/:0:0)
[WARNING] [2025-12-22T14:02:42.688Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37CfiH2WQdnBC0vol0eiTDGw6wa:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0ACD8006C2A0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
[WARNING] [2025-12-22T14:03:53.998Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37CfiH2WQdnBC0vol0eiTDGw6wa:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0ACD8006C2A0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
[WARNING] [2025-12-22T14:05:07.877Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37CfiH2WQdnBC0vol0eiTDGw6wa:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0D8BD066C2A0000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/be6c8a15-d34a-4133-80eb-010c3d3ae5be/1ee86816-9b5a-4cc2-9fa3-b68942ec3005
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC022
- **Test Name:** JWT Token Verification Middleware
- **Test Code:** [TC022_JWT_Token_Verification_Middleware.py](./TC022_JWT_Token_Verification_Middleware.py)
- **Test Error:** 
Browser Console Logs:
[WARNING] [2025-12-22T14:01:35.990Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37CfiRPCjoxokmr748r1eSN7Iwh:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0ACD90084230000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0x238403d57400]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0x238403d57400]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0x238403d57400]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (at http://localhost:5173/:0:0)
[WARNING] [.WebGL-0x238403d57400]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (this message will no longer repeat) (at http://localhost:5173/:0:0)
[WARNING] [2025-12-22T14:02:39.305Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37CfiRPCjoxokmr748r1eSN7Iwh:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0ACD90084230000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
[WARNING] [2025-12-22T14:03:50.181Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37CfiRPCjoxokmr748r1eSN7Iwh:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0ACD90084230000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
[WARNING] [2025-12-22T14:05:05.135Z]  @firebase/firestore: Firestore (12.6.0): enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead. (at http://localhost:5173/node_modules/.vite/deps/chunk-M4P3X7OT.js?v=975cb93b:986:19)
[WARNING] Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview (at https://secure-lynx-74.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js:18:7047)
[ERROR] Failed to load resource: the server responded with a status of 400 () (at https://secure-lynx-74.clerk.accounts.dev/v1/environment?__clerk_api_version=2025-11-10&_clerk_js_version=5.117.0&_method=PATCH&__clerk_db_jwt=dvb_37CfiRPCjoxokmr748r1eSN7Iwh:0:0)
[WARNING] [GroupMarkerNotSet(crbug.com/242999)!:A0ACD90084230000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader flag to opt in to lower security guarantees for trusted content. (at http://localhost:5173/:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/be6c8a15-d34a-4133-80eb-010c3d3ae5be/81254539-a38f-41dc-ad8c-bf38078f24ce
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC023
- **Test Name:** Concurrency Handling on Application Status Updates
- **Test Code:** [TC023_Concurrency_Handling_on_Application_Status_Updates.py](./TC023_Concurrency_Handling_on_Application_Status_Updates.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/be6c8a15-d34a-4133-80eb-010c3d3ae5be/094ce181-672e-4e37-84c3-2e282ca759aa
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC024
- **Test Name:** API Error Codes and Messages Compliance
- **Test Code:** [TC024_API_Error_Codes_and_Messages_Compliance.py](./TC024_API_Error_Codes_and_Messages_Compliance.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/be6c8a15-d34a-4133-80eb-010c3d3ae5be/71ef58b2-8452-4d5a-af1f-9e28000e7ae3
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **54.17** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---