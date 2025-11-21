/*
 Navicat Premium Data Transfer

 Source Server         : localhost_27017
 Source Server Type    : MongoDB
 Source Server Version : 80012
 Source Host           : localhost:27017
 Source Schema         : 2025-wedding

 Target Server Type    : MongoDB
 Target Server Version : 80012
 File Encoding         : 65001

 Date: 21/11/2025 15:35:42
*/


// ----------------------------
// Collection structure for adminMenus
// ----------------------------
db.getCollection("adminMenus").drop();
db.createCollection("adminMenus");

// ----------------------------
// Documents of adminMenus
// ----------------------------
db.getCollection("adminMenus").insert([ {
    _id: ObjectId("6920143c68854b7b22740b57"),
    name: "ACL",
    link: "#",
    "parent_id": "",
    weight: NumberInt("1"),
    "is_dashboard": false,
    icon: "fa-shield",
    status: true
} ]);
db.getCollection("adminMenus").insert([ {
    _id: ObjectId("6920143c68854b7b22740b58"),
    name: "Admin Users",
    link: "admin/users",
    "parent_id": "6920143c68854b7b22740b57",
    weight: NumberInt("0"),
    "is_dashboard": true,
    icon: "fa-users",
    status: true
} ]);
db.getCollection("adminMenus").insert([ {
    _id: ObjectId("6920143c68854b7b22740b59"),
    name: "Modules",
    link: "admin/modules",
    "parent_id": "6920143c68854b7b22740b57",
    weight: NumberInt("1"),
    "is_dashboard": true,
    icon: "fa-th-large",
    status: true
} ]);
db.getCollection("adminMenus").insert([ {
    _id: ObjectId("6920143c68854b7b22740b5a"),
    name: "Resources",
    link: "admin/resources",
    "parent_id": "6920143c68854b7b22740b57",
    weight: NumberInt("1"),
    "is_dashboard": true,
    icon: "fa-database",
    status: true
} ]);
db.getCollection("adminMenus").insert([ {
    _id: ObjectId("6920143c68854b7b22740b5b"),
    name: "Permissions",
    link: "admin/permissions",
    "parent_id": "6920143c68854b7b22740b57",
    weight: NumberInt("1"),
    "is_dashboard": true,
    icon: "fa-lock",
    status: true
} ]);
db.getCollection("adminMenus").insert([ {
    _id: ObjectId("6920143c68854b7b22740b5c"),
    name: "Roles",
    link: "admin/roles",
    "parent_id": "6920143c68854b7b22740b57",
    weight: NumberInt("1"),
    "is_dashboard": true,
    icon: "fa-check-square-o",
    status: true
} ]);
db.getCollection("adminMenus").insert([ {
    _id: ObjectId("6920143c68854b7b22740b5d"),
    name: "Custom fields",
    link: "admin/custom_fields",
    "parent_id": "6920143c68854b7b22740b57",
    weight: NumberInt("1"),
    "is_dashboard": true,
    icon: "fa-sliders",
    status: true
} ]);
db.getCollection("adminMenus").insert([ {
    _id: ObjectId("6920143c68854b7b22740b5e"),
    name: "Menus",
    link: "admin/menus",
    "parent_id": "",
    weight: NumberInt("1"),
    "is_dashboard": true,
    icon: "fa-list-ul",
    status: true
} ]);
db.getCollection("adminMenus").insert([ {
    _id: ObjectId("6920143c68854b7b22740b5f"),
    name: "Settings",
    link: "admin/settings",
    "parent_id": "",
    weight: NumberInt("1"),
    "is_dashboard": true,
    icon: "fa-cog",
    status: true
} ]);
db.getCollection("adminMenus").insert([ {
    _id: ObjectId("6920143c68854b7b22740b60"),
    name: "Tools",
    link: "admin/tools",
    "parent_id": "",
    weight: NumberInt("1"),
    "is_dashboard": true,
    icon: "fa-wrench",
    status: true
} ]);
db.getCollection("adminMenus").insert([ {
    _id: ObjectId("6920145f5bb0f795e2cffbac"),
    link: "logs/acd",
    name: "logs_acd",
    "parent_id": "692016b9ea9ea13b7224c6bc",
    weight: NumberInt("1"),
    icon: "fa-circle-o",
    "is_dashboard": false,
    status: true,
    createdAt: ISODate("2025-11-21T07:27:27.547Z"),
    updatedAt: ISODate("2025-11-21T07:38:41.524Z"),
    __v: NumberInt("0"),
    "update_by": "chinmie"
} ]);
db.getCollection("adminMenus").insert([ {
    _id: ObjectId("6920145f5bb0f795e2cffbb1"),
    link: "logs/cp_log",
    name: "logs_cp_log",
    "parent_id": "692016b9ea9ea13b7224c6bc",
    weight: NumberInt("1"),
    icon: "fa-circle-o",
    "is_dashboard": false,
    status: true,
    createdAt: ISODate("2025-11-21T07:27:27.55Z"),
    updatedAt: ISODate("2025-11-21T07:38:36.835Z"),
    __v: NumberInt("0"),
    "update_by": "chinmie"
} ]);
db.getCollection("adminMenus").insert([ {
    _id: ObjectId("692015ab7fa40ec1c6460734"),
    link: "weddings/invitee",
    name: "Invitee",
    "parent_id": "692016d1ea9ea13b7224c6c2",
    weight: NumberInt("1"),
    icon: "fa-circle-o",
    "is_dashboard": false,
    status: true,
    createdAt: ISODate("2025-11-21T07:32:59.926Z"),
    updatedAt: ISODate("2025-11-21T07:38:31.217Z"),
    __v: NumberInt("0"),
    "update_by": "chinmie"
} ]);
db.getCollection("adminMenus").insert([ {
    _id: ObjectId("692016247fa40ec1c646073a"),
    link: "weddings/album",
    name: "Album",
    "parent_id": "692016d1ea9ea13b7224c6c2",
    weight: NumberInt("1"),
    icon: "fa-circle-o",
    "is_dashboard": false,
    status: true,
    createdAt: ISODate("2025-11-21T07:35:00.611Z"),
    updatedAt: ISODate("2025-11-21T07:38:20.815Z"),
    __v: NumberInt("0"),
    "update_by": "chinmie"
} ]);
db.getCollection("adminMenus").insert([ {
    _id: ObjectId("6920166f7fa40ec1c6460740"),
    link: "weddings/photo",
    name: "Photo",
    "parent_id": "692016d1ea9ea13b7224c6c2",
    weight: NumberInt("1"),
    icon: "fa-circle-o",
    "is_dashboard": false,
    status: true,
    createdAt: ISODate("2025-11-21T07:36:15.742Z"),
    updatedAt: ISODate("2025-11-21T07:38:10.914Z"),
    __v: NumberInt("0"),
    "update_by": "chinmie"
} ]);
db.getCollection("adminMenus").insert([ {
    _id: ObjectId("692016b9ea9ea13b7224c6bc"),
    link: "#",
    name: "Log",
    "parent_id": "",
    weight: NumberInt("1"),
    icon: "fa-fire",
    "is_dashboard": false,
    status: false,
    "update_by": "chinmie",
    createdAt: ISODate("2025-11-21T07:37:29.241Z"),
    updatedAt: ISODate("2025-11-21T07:37:29.241Z"),
    __v: NumberInt("0")
} ]);
db.getCollection("adminMenus").insert([ {
    _id: ObjectId("692016d1ea9ea13b7224c6c2"),
    link: "#",
    name: "Chin & Mie",
    "parent_id": "",
    weight: NumberInt("2"),
    icon: "fa-fire",
    "is_dashboard": false,
    status: true,
    "update_by": "chinmie",
    createdAt: ISODate("2025-11-21T07:37:53.294Z"),
    updatedAt: ISODate("2025-11-21T07:37:53.294Z"),
    __v: NumberInt("0")
} ]);

// ----------------------------
// Collection structure for adminModules
// ----------------------------
db.getCollection("adminModules").drop();
db.createCollection("adminModules");

// ----------------------------
// Documents of adminModules
// ----------------------------
db.getCollection("adminModules").insert([ {
    _id: ObjectId("6920143b68854b7b22740b43"),
    name: "admin",
    route: "admin",
    status: true
} ]);
db.getCollection("adminModules").insert([ {
    _id: ObjectId("6920145f5bb0f795e2cffba9"),
    name: "logs",
    route: "logs",
    status: true,
    createdAt: ISODate("2025-11-21T07:27:27.532Z"),
    updatedAt: ISODate("2025-11-21T07:27:27.532Z"),
    __v: NumberInt("0")
} ]);
db.getCollection("adminModules").insert([ {
    _id: ObjectId("692015ab7fa40ec1c6460730"),
    name: "weddings",
    route: "weddings",
    status: true,
    createdAt: ISODate("2025-11-21T07:32:59.914Z"),
    updatedAt: ISODate("2025-11-21T07:32:59.914Z"),
    __v: NumberInt("0")
} ]);

// ----------------------------
// Collection structure for adminPermissions
// ----------------------------
db.getCollection("adminPermissions").drop();
db.createCollection("adminPermissions");

// ----------------------------
// Documents of adminPermissions
// ----------------------------
db.getCollection("adminPermissions").insert([ {
    _id: ObjectId("6920143c68854b7b22740b54"),
    role: "manager",
    module: "admin",
    resource: "dashboard",
    permissions: [
        "view",
        "update-profile"
    ]
} ]);
db.getCollection("adminPermissions").insert([ {
    _id: ObjectId("6920143c68854b7b22740b55"),
    role: "admin",
    module: "admin",
    resource: "dashboard",
    permissions: [
        "view",
        "update-profile"
    ]
} ]);
db.getCollection("adminPermissions").insert([ {
    _id: ObjectId("6920143c68854b7b22740b56"),
    role: "guest",
    module: "admin",
    resource: "dashboard",
    permissions: [
        "view",
        "update-profile"
    ]
} ]);

// ----------------------------
// Collection structure for adminResources
// ----------------------------
db.getCollection("adminResources").drop();
db.createCollection("adminResources");

// ----------------------------
// Documents of adminResources
// ----------------------------
db.getCollection("adminResources").insert([ {
    _id: ObjectId("6920143c68854b7b22740b4a"),
    name: "dashboard",
    module: "admin",
    "collection_name": "",
    permissions: [
        "view",
        "update-profile"
    ]
} ]);
db.getCollection("adminResources").insert([ {
    _id: ObjectId("6920143c68854b7b22740b4b"),
    name: "users",
    module: "admin",
    permissions: [
        "view",
        "detail",
        "add",
        "edit",
        "delete",
        "import",
        "export"
    ],
    "collection_name": "adminUsers",
    "default_fields": [ ]
} ]);
db.getCollection("adminResources").insert([ {
    _id: ObjectId("6920143c68854b7b22740b4c"),
    name: "modules",
    module: "admin",
    permissions: [
        "view",
        "detail",
        "add",
        "edit",
        "delete",
        "import",
        "export"
    ],
    "collection_name": "adminModules",
    "default_fields": [ ]
} ]);
db.getCollection("adminResources").insert([ {
    _id: ObjectId("6920143c68854b7b22740b4d"),
    name: "resources",
    module: "admin",
    permissions: [
        "view",
        "detail",
        "add",
        "edit",
        "delete",
        "import",
        "export"
    ],
    "collection_name": "adminResources",
    "default_fields": [ ]
} ]);
db.getCollection("adminResources").insert([ {
    _id: ObjectId("6920143c68854b7b22740b4e"),
    module: "admin",
    name: "permissions",
    permissions: [
        "view",
        "detail",
        "add",
        "edit",
        "delete",
        "import",
        "export"
    ],
    "collection_name": "adminPermissions",
    "default_fields": [ ]
} ]);
db.getCollection("adminResources").insert([ {
    _id: ObjectId("6920143c68854b7b22740b4f"),
    module: "admin",
    name: "roles",
    permissions: [
        "view",
        "detail",
        "add",
        "edit",
        "delete",
        "import",
        "export"
    ],
    "collection_name": "adminRoles",
    "default_fields": [ ]
} ]);
db.getCollection("adminResources").insert([ {
    _id: ObjectId("6920143c68854b7b22740b50"),
    module: "admin",
    name: "menus",
    permissions: [
        "view",
        "detail",
        "add",
        "edit",
        "delete",
        "import",
        "export"
    ],
    "collection_name": "adminMenus",
    "default_fields": [ ]
} ]);
db.getCollection("adminResources").insert([ {
    _id: ObjectId("6920143c68854b7b22740b51"),
    module: "admin",
    name: "settings",
    permissions: [
        "view",
        "detail",
        "add",
        "edit",
        "delete",
        "import",
        "export"
    ],
    "collection_name": "adminSettings",
    "default_fields": [ ]
} ]);
db.getCollection("adminResources").insert([ {
    _id: ObjectId("6920143c68854b7b22740b52"),
    module: "admin",
    name: "custom_fields",
    permissions: [
        "view",
        "detail",
        "add",
        "edit",
        "delete",
        "import",
        "export"
    ],
    "collection_name": "adminCustomFields",
    "default_fields": [ ]
} ]);
db.getCollection("adminResources").insert([ {
    _id: ObjectId("6920143c68854b7b22740b53"),
    module: "admin",
    name: "tools",
    permissions: [
        "view"
    ],
    "collection_name": "",
    "default_fields": [ ]
} ]);
db.getCollection("adminResources").insert([ {
    _id: ObjectId("6920145f5bb0f795e2cffbb6"),
    name: "acd",
    module: "logs",
    "collection_name": "",
    "default_fields": [ ],
    permissions: [
        "view",
        "detail",
        "add",
        "edit",
        "delete",
        "import",
        "export",
        "report"
    ],
    createdAt: ISODate("2025-11-21T07:27:27.554Z"),
    updatedAt: ISODate("2025-11-21T07:27:27.554Z"),
    __v: NumberInt("0")
} ]);
db.getCollection("adminResources").insert([ {
    _id: ObjectId("6920145f5bb0f795e2cffbbb"),
    name: "cp_log",
    module: "logs",
    "collection_name": "",
    "default_fields": [ ],
    permissions: [
        "view",
        "detail",
        "add",
        "edit",
        "delete",
        "import",
        "export",
        "report"
    ],
    createdAt: ISODate("2025-11-21T07:27:27.558Z"),
    updatedAt: ISODate("2025-11-21T07:27:27.558Z"),
    __v: NumberInt("0")
} ]);
db.getCollection("adminResources").insert([ {
    _id: ObjectId("692015ab7fa40ec1c6460732"),
    name: "invitee",
    module: "weddings",
    "collection_name": "wd_invitees",
    "default_fields": [ ],
    permissions: [
        "view",
        "detail",
        "add",
        "edit",
        "delete",
        "import",
        "export",
        "report"
    ],
    createdAt: ISODate("2025-11-21T07:32:59.922Z"),
    updatedAt: ISODate("2025-11-21T07:32:59.922Z"),
    __v: NumberInt("0")
} ]);
db.getCollection("adminResources").insert([ {
    _id: ObjectId("692016247fa40ec1c6460738"),
    name: "album",
    module: "weddings",
    "collection_name": "wd_albums",
    "default_fields": [ ],
    permissions: [
        "view",
        "detail",
        "add",
        "edit",
        "delete",
        "import",
        "export",
        "report"
    ],
    createdAt: ISODate("2025-11-21T07:35:00.609Z"),
    updatedAt: ISODate("2025-11-21T07:35:00.609Z"),
    __v: NumberInt("0")
} ]);
db.getCollection("adminResources").insert([ {
    _id: ObjectId("6920166f7fa40ec1c646073e"),
    name: "photo",
    module: "weddings",
    "collection_name": "wd_photos",
    "default_fields": [ ],
    permissions: [
        "view",
        "detail",
        "add",
        "edit",
        "delete",
        "import",
        "export",
        "report"
    ],
    createdAt: ISODate("2025-11-21T07:36:15.739Z"),
    updatedAt: ISODate("2025-11-21T07:36:15.739Z"),
    __v: NumberInt("0")
} ]);

// ----------------------------
// Collection structure for adminRoles
// ----------------------------
db.getCollection("adminRoles").drop();
db.createCollection("adminRoles");

// ----------------------------
// Documents of adminRoles
// ----------------------------
db.getCollection("adminRoles").insert([ {
    _id: ObjectId("6920143c68854b7b22740b44"),
    role: "root",
    name: "Root",
    status: NumberInt("1"),
    weight: NumberInt("100")
} ]);
db.getCollection("adminRoles").insert([ {
    _id: ObjectId("6920143c68854b7b22740b45"),
    role: "qc",
    name: "QC",
    status: NumberInt("1"),
    weight: NumberInt("99")
} ]);
db.getCollection("adminRoles").insert([ {
    _id: ObjectId("6920143c68854b7b22740b46"),
    role: "manager",
    name: "Manager",
    status: NumberInt("1"),
    weight: NumberInt("9")
} ]);
db.getCollection("adminRoles").insert([ {
    _id: ObjectId("6920143c68854b7b22740b47"),
    role: "admin",
    name: "Admin",
    status: NumberInt("1"),
    weight: NumberInt("8")
} ]);
db.getCollection("adminRoles").insert([ {
    _id: ObjectId("6920143c68854b7b22740b48"),
    role: "sale",
    name: "Sale",
    status: NumberInt("1"),
    weight: NumberInt("7")
} ]);
db.getCollection("adminRoles").insert([ {
    _id: ObjectId("6920143c68854b7b22740b49"),
    role: "guest",
    name: "Guest",
    status: NumberInt("1"),
    weight: NumberInt("0")
} ]);

// ----------------------------
// Collection structure for adminSettings
// ----------------------------
db.getCollection("adminSettings").drop();
db.createCollection("adminSettings");

// ----------------------------
// Documents of adminSettings
// ----------------------------
db.getCollection("adminSettings").insert([ {
    _id: ObjectId("6920143c68854b7b22740b61"),
    key: "language",
    value: "en",
    "is_system": NumberInt("1"),
    description: ""
} ]);
db.getCollection("adminSettings").insert([ {
    _id: ObjectId("6920143c68854b7b22740b62"),
    key: "menu_layout",
    value: "left",
    "is_system": NumberInt("1"),
    description: ""
} ]);
db.getCollection("adminSettings").insert([ {
    _id: ObjectId("6920143c68854b7b22740b63"),
    key: "grid_limit",
    value: NumberInt("20"),
    "is_system": NumberInt("1"),
    description: ""
} ]);

// ----------------------------
// Collection structure for adminUsers
// ----------------------------
db.getCollection("adminUsers").drop();
db.createCollection("adminUsers");

// ----------------------------
// Documents of adminUsers
// ----------------------------
db.getCollection("adminUsers").insert([ {
    _id: ObjectId("6920143b68854b7b22740b42"),
    username: "chinmie",
    password: "$2b$09$wYo9xutatGZcC2xvLF7SsONE/k9xM/.u9Cw17yxTIJwnJWeq.MqXy",
    fullname: "chinmie",
    avatar: "public/admin/images/avatar/default.jpg",
    role: "root",
    status: NumberInt("1"),
    is2FAEnabled: true,
    secret2FA: "KEHQQXIKBQSG2XRF",
    updatedAt: ISODate("2025-11-21T07:39:01.306Z"),
    "login_incorrect": NumberInt("0"),
    "login_time": 1763710741305
} ]);
