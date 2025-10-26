/*
 Navicat Premium Dump SQL

 Source Server         : 本地连接
 Source Server Type    : MySQL
 Source Server Version : 80406 (8.4.6)
 Source Host           : localhost:3306
 Source Schema         : gofly

 Target Server Type    : MySQL
 Target Server Version : 80406 (8.4.6)
 File Encoding         : 65001

 Date: 14/10/2025 15:55:38
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for about
-- ----------------------------
DROP TABLE IF EXISTS `about`;
CREATE TABLE `about`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `title_cn` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `title_en` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `keywords_cn` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `keywords_en` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `desc_cn` varchar(1024) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `desc_en` varchar(1024) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `css_js` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `html_cn` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `html_en` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `page` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `page`(`page` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of about
-- ----------------------------
INSERT INTO `about` VALUES (1, '在线客服系统', 'Welcome', '在线客服系统', 'Welcome', '在线客服系统', 'Welcome', '<style>body{color: #333;padding-left: 40px;}h1{font-size: 6em;}h2{font-size: 3em;font-weight: normal;}a{color: #333;}</style>', '<script src=\"/assets/js/gofly-front.js?v=1\"></script><script>\n    GOFLY.init({\n        GOFLY_URL:\"\",\n        GOFLY_KEFU_ID: \"kefu2\",\n        GOFLY_BTN_TEXT: \"GOFLY 在线客服!\",\n        GOFLY_LANG:\"cn\",\n    })\n</script>\n <h1>:)</h1><h2>你好 <a href=\"https://gofly.sopans.com\">GOFLY0.4.1</a> 在线客服系统 !</h2><h3><a href=\"/login\">Administrator</a>&nbsp;<a href=\"/index_en\">English</a>&nbsp;<a href=\"/index_cn\">中文</a></h3>', '<script src=\"/assets/js/gofly-front.js?v=1\"></script><script>\n    GOFLY.init({\n        GOFLY_URL:\"\",\n        GOFLY_KEFU_ID: \"kefu2\",\n        GOFLY_BTN_TEXT: \"GOFLY LIVE CHAT!\",\n        GOFLY_LANG:\"en\",\n    })\n</script>\n <h1>:)</h1><h2>HELLO <a href=\"https://gofly.sopans.com\">GOFLY0.4.1</a> LIVE CHAT !</h2><h3><a href=\"/login\">Administrator</a>&nbsp;<a href=\"/index_en\">English</a>&nbsp;<a href=\"/index_cn\">中文</a></h3>', 'index');

-- ----------------------------
-- Table structure for config
-- ----------------------------
DROP TABLE IF EXISTS `config`;
CREATE TABLE `config`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `conf_name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `conf_key` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `conf_value` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `conf_key`(`conf_key` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 14 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of config
-- ----------------------------
INSERT INTO `config` VALUES (1, '是否开启Server酱微信提醒', 'NoticeServerJiang', 'false');
INSERT INTO `config` VALUES (2, 'Server酱API', 'ServerJiangAPI', '');
INSERT INTO `config` VALUES (3, '微信小程序Token', 'WeixinToken', '');
INSERT INTO `config` VALUES (4, '当前小程序审核状态', 'MiniAppAudit', 'yes');
INSERT INTO `config` VALUES (5, '是否允许上传附件', 'SendAttachment', 'true');
INSERT INTO `config` VALUES (6, '发送通知邮件(SMTP地址)', 'NoticeEmailSmtp', '');
INSERT INTO `config` VALUES (7, '发送通知邮件(邮箱)', 'NoticeEmailAddress', '');
INSERT INTO `config` VALUES (8, '发送通知邮件(密码)', 'NoticeEmailPassword', '');
INSERT INTO `config` VALUES (9, 'App个推(Token)', 'GetuiToken', '');
INSERT INTO `config` VALUES (10, 'App个推(AppID)', 'GetuiAppID', '');
INSERT INTO `config` VALUES (11, 'App个推(AppKey)', 'GetuiAppKey', '');
INSERT INTO `config` VALUES (12, 'App个推(AppSecret)', 'GetuiAppSecret', '');
INSERT INTO `config` VALUES (13, 'App个推(AppMasterSecret)', 'GetuiMasterSecret', '');

-- ----------------------------
-- Table structure for ipblack
-- ----------------------------
DROP TABLE IF EXISTS `ipblack`;
CREATE TABLE `ipblack`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `ip` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `create_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `kefu_id` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `ip`(`ip` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ipblack
-- ----------------------------

-- ----------------------------
-- Table structure for land_page
-- ----------------------------
DROP TABLE IF EXISTS `land_page`;
CREATE TABLE `land_page`  (
  `id` int NOT NULL,
  `title` varchar(125) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `keyword` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `language` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `page_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of land_page
-- ----------------------------

-- ----------------------------
-- Table structure for language
-- ----------------------------
DROP TABLE IF EXISTS `language`;
CREATE TABLE `language`  (
  `id` int NOT NULL,
  `country` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `short_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT ''
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of language
-- ----------------------------
INSERT INTO `language` VALUES (1, '中文简体', 'zh-cn');
INSERT INTO `language` VALUES (2, '正體中文', 'zh-tw');
INSERT INTO `language` VALUES (3, 'English', 'en_us');
INSERT INTO `language` VALUES (4, '日本語', 'ja_jp');

-- ----------------------------
-- Table structure for message
-- ----------------------------
DROP TABLE IF EXISTS `message`;
CREATE TABLE `message`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `kefu_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '',
  `visitor_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '',
  `content` varchar(2048) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `mes_type` enum('kefu','visitor') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'visitor',
  `status` enum('read','unread') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'unread',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `kefu_id`(`kefu_id` ASC) USING BTREE,
  INDEX `visitor_id`(`visitor_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 18 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of message
-- ----------------------------
INSERT INTO `message` VALUES (1, 'kefu2', '85a3014b-334b-48cc-b0a7-a4bc5b3172a1', '111', '2025-10-14 15:21:10', '2025-10-14 15:21:10', NULL, 'visitor', 'unread');
INSERT INTO `message` VALUES (2, 'kefu2', '85a3014b-334b-48cc-b0a7-a4bc5b3172a1', '我暂时离线，留言已转发到我的邮箱，稍后回复~', '2025-10-14 15:21:11', '2025-10-14 15:21:11', NULL, 'kefu', 'unread');
INSERT INTO `message` VALUES (3, 'kefu2', '85a3014b-334b-48cc-b0a7-a4bc5b3172a1', '111', '2025-10-14 15:35:02', '2025-10-14 15:35:02', NULL, 'visitor', 'unread');
INSERT INTO `message` VALUES (4, 'kefu2', '85a3014b-334b-48cc-b0a7-a4bc5b3172a1', '我暂时离线，留言已转发到我的邮箱，稍后回复~', '2025-10-14 15:35:03', '2025-10-14 15:35:03', NULL, 'kefu', 'unread');
INSERT INTO `message` VALUES (5, 'admin', '6c8a5157-fb10-4ad6-ad0c-88930607b27c', '你好', '2025-10-14 15:47:16', '2025-10-14 15:50:56', NULL, 'visitor', 'read');
INSERT INTO `message` VALUES (6, 'admin', '6c8a5157-fb10-4ad6-ad0c-88930607b27c', '你是谁', '2025-10-14 15:47:43', '2025-10-14 15:50:56', NULL, 'kefu', 'read');
INSERT INTO `message` VALUES (7, 'admin', '6c8a5157-fb10-4ad6-ad0c-88930607b27c', 'img[/static/upload/2025October/55c5c7f0bb8f2d500a876975d56450a4.png]', '2025-10-14 15:47:48', '2025-10-14 15:50:56', NULL, 'kefu', 'read');
INSERT INTO `message` VALUES (8, 'admin', '6c8a5157-fb10-4ad6-ad0c-88930607b27c', '可以看到图片吗', '2025-10-14 15:47:54', '2025-10-14 15:50:56', NULL, 'kefu', 'read');
INSERT INTO `message` VALUES (9, 'admin', '6c8a5157-fb10-4ad6-ad0c-88930607b27c', '可以的', '2025-10-14 15:47:58', '2025-10-14 15:50:56', NULL, 'visitor', 'read');
INSERT INTO `message` VALUES (10, 'admin', '6c8a5157-fb10-4ad6-ad0c-88930607b27c', '我也可以发图片吗', '2025-10-14 15:48:02', '2025-10-14 15:50:56', NULL, 'visitor', 'read');
INSERT INTO `message` VALUES (11, 'admin', '6c8a5157-fb10-4ad6-ad0c-88930607b27c', 'img[/static/upload/2025October/2082cc71207e7c77dfc623913c33b973.jpg]', '2025-10-14 15:48:05', '2025-10-14 15:50:56', NULL, 'visitor', 'read');
INSERT INTO `message` VALUES (12, 'admin', '6c8a5157-fb10-4ad6-ad0c-88930607b27c', '你可以正常发送图片', '2025-10-14 15:48:15', '2025-10-14 15:50:56', NULL, 'kefu', 'read');
INSERT INTO `message` VALUES (13, 'admin', '1280b72d-9f06-43fc-935f-3fa636956567', '你好', '2025-10-14 15:48:58', '2025-10-14 15:49:01', NULL, 'visitor', 'read');
INSERT INTO `message` VALUES (14, 'admin', '1280b72d-9f06-43fc-935f-3fa636956567', '请告诉我您的问题。', '2025-10-14 15:50:34', '2025-10-14 15:50:34', NULL, 'kefu', 'unread');
INSERT INTO `message` VALUES (15, 'admin', '1280b72d-9f06-43fc-935f-3fa636956567', '请发一下您的订单号', '2025-10-14 15:50:39', '2025-10-14 15:50:39', NULL, 'kefu', 'unread');
INSERT INTO `message` VALUES (16, 'admin', '1280b72d-9f06-43fc-935f-3fa636956567', '稍等', '2025-10-14 15:50:51', '2025-10-14 15:50:51', NULL, 'visitor', 'unread');
INSERT INTO `message` VALUES (17, 'admin', '1280b72d-9f06-43fc-935f-3fa636956567', '在吗', '2025-10-14 15:51:01', '2025-10-14 15:51:01', NULL, 'visitor', 'unread');

-- ----------------------------
-- Table structure for reply_group
-- ----------------------------
DROP TABLE IF EXISTS `reply_group`;
CREATE TABLE `reply_group`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_name` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `user_id` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of reply_group
-- ----------------------------
INSERT INTO `reply_group` VALUES (1, '常见问题', 'kefu2');
INSERT INTO `reply_group` VALUES (2, '默认快捷回复', 'admin');

-- ----------------------------
-- Table structure for reply_item
-- ----------------------------
DROP TABLE IF EXISTS `reply_item`;
CREATE TABLE `reply_item`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` varchar(1024) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `group_id` int NOT NULL DEFAULT 0,
  `user_id` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `item_name` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  INDEX `group_id`(`group_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of reply_item
-- ----------------------------
INSERT INTO `reply_item` VALUES (1, '在这里[官网]link[https://gofly.sopans.com]!', 1, 'kefu2', '官方地址在哪?');
INSERT INTO `reply_item` VALUES (2, '请告诉我您的问题。', 2, 'admin', '问候语');
INSERT INTO `reply_item` VALUES (3, '请发一下您的订单号', 2, 'admin', '咨询订单号');

-- ----------------------------
-- Table structure for role
-- ----------------------------
DROP TABLE IF EXISTS `role`;
CREATE TABLE `role`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `method` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `path` varchar(2048) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of role
-- ----------------------------
INSERT INTO `role` VALUES (1, '普通客服', 'GET', 'GET:/kefuinfo,GET:/kefulist,GET:/roles,POST:/notice_save,POST:/notice');
INSERT INTO `role` VALUES (2, '管理员', '*', '*');

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `password` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `nickname` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `avator` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_name`(`name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES (1, 'kefu2', '202cb962ac59075b964b07152d234b70', '小白菜', '2020-06-27 19:32:41', '2020-07-04 09:32:20', NULL, '/static/images/4.jpg');
INSERT INTO `user` VALUES (2, 'kefu3', '202cb962ac59075b964b07152d234b70', '中白菜', '2020-07-02 14:36:46', '2020-07-05 08:46:57', NULL, '/static/images/11.jpg');
INSERT INTO `user` VALUES (3, 'admin', '21232f297a57a5a743894a0e4a801fc3', '微任务平台客服', '2025-10-14 15:15:29', '2025-10-14 15:16:05', NULL, '/static/upload/2025October/e05c7f8bcec12dc9f1a168d8593f2095.jpg');

-- ----------------------------
-- Table structure for user_client
-- ----------------------------
DROP TABLE IF EXISTS `user_client`;
CREATE TABLE `user_client`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `kefu` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `client_id` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_user`(`kefu` ASC, `client_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_client
-- ----------------------------

-- ----------------------------
-- Table structure for user_role
-- ----------------------------
DROP TABLE IF EXISTS `user_role`;
CREATE TABLE `user_role`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL DEFAULT 0,
  `role_id` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_role
-- ----------------------------
INSERT INTO `user_role` VALUES (1, 1, 2);
INSERT INTO `user_role` VALUES (2, 2, 2);
INSERT INTO `user_role` VALUES (3, 3, 2);

-- ----------------------------
-- Table structure for visitor
-- ----------------------------
DROP TABLE IF EXISTS `visitor`;
CREATE TABLE `visitor`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `avator` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `source_ip` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `to_id` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `visitor_id` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `status` tinyint NOT NULL DEFAULT 0,
  `refer` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `city` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `client_ip` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `extra` varchar(2048) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `visitor_id`(`visitor_id` ASC) USING BTREE,
  INDEX `to_id`(`to_id` ASC) USING BTREE,
  INDEX `idx_update`(`updated_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of visitor
-- ----------------------------
INSERT INTO `visitor` VALUES (1, '匿名网友', '/static/images/0.jpg', '::1', 'kefu2', '2025-10-14 15:12:44', '2025-10-14 15:12:47', NULL, 'e21cd062-e059-41e7-8d45-9f0b97190b89', 0, 'Free Customer Live Chat GOFLY0.4.1-demo', '未识别地区', '::1', 'eyJyZWZlciI6IuaXoCIsImhvc3QiOiJodHRwOi8vbG9jYWxob3N0OjgwODEvaW5kZXhfZW4ifQ');
INSERT INTO `visitor` VALUES (2, '匿名网友', '/static/images/8.jpg', '::1', 'kefu2', '2025-10-14 15:21:01', '2025-10-14 15:37:40', NULL, '85a3014b-334b-48cc-b0a7-a4bc5b3172a1', 0, 'Free Customer Live Chat GOFLY0.4.1-demo', '未识别地区', '::1', 'eyJyZWZlciI6IuaXoCIsImhvc3QiOiJodHRwOi8vbG9jYWxob3N0OjgwODEvaW5kZXhfZW4ifQ');
INSERT INTO `visitor` VALUES (3, '匿名网友', '/static/images/11.jpg', '::1', 'kefu2', '2025-10-14 15:37:52', '2025-10-14 15:52:46', NULL, '1280b72d-9f06-43fc-935f-3fa636956567', 0, '直接访问', '未识别地区', '::1', 'eyJyZWZlciI6IuaXoCIsImhvc3QiOiJodHRwOi8vbG9jYWxob3N0OjgwODEvaW5kZXhfZW4ifQ');
INSERT INTO `visitor` VALUES (4, '匿名网友', '/static/images/5.jpg', '::1', 'admin', '2025-10-14 15:47:09', '2025-10-14 15:48:43', NULL, '6c8a5157-fb10-4ad6-ad0c-88930607b27c', 0, '直接访问', '未识别地区', '::1', '');

-- ----------------------------
-- Table structure for welcome
-- ----------------------------
DROP TABLE IF EXISTS `welcome`;
CREATE TABLE `welcome`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `keyword` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `content` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `is_default` tinyint UNSIGNED NOT NULL DEFAULT 0,
  `ctime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  INDEX `keyword`(`keyword` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of welcome
-- ----------------------------
INSERT INTO `welcome` VALUES (1, 'kefu2', 'offline', '我暂时离线，留言已转发到我的邮箱，稍后回复~', 1, '2020-08-24 02:57:49');
INSERT INTO `welcome` VALUES (2, 'kefu2', 'welcome', '本客服代码开源,欢迎star,开源地址:https://github.com/taoshihan1991/go-fly', 0, '2020-08-24 02:57:49');
INSERT INTO `welcome` VALUES (3, 'admin', 'welcome', '欢迎！请输入您的问题。', 0, '2025-10-14 15:52:22');

SET FOREIGN_KEY_CHECKS = 1;
