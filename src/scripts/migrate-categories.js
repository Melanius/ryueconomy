"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("../lib/notion/client");
var dotenv_1 = require("dotenv");
// 환경 변수 로드
(0, dotenv_1.config)();
var databaseId = process.env.NOTION_DATABASE_ID;
// 카테고리 매핑 정의
var categoryMapping = {
    // 투자/금융 관련
    'investment': 'invest-insight',
    'finance': 'invest-insight',
    'stock': 'invest-insight',
    'trading': 'invest-insight',
    // 크립토 관련
    'crypto': 'crypto-morning',
    'blockchain': 'crypto-morning',
    'bitcoin': 'crypto-morning',
    'cryptocurrency': 'crypto-morning',
    // 포트폴리오 관련
    'portfolio': 'real-portfolio',
    'project': 'real-portfolio',
    'work': 'real-portfolio',
    'showcase': 'real-portfolio',
    // 개발 관련
    'development': 'code-lab',
    'programming': 'code-lab',
    'coding': 'code-lab',
    'tech': 'code-lab',
    'tutorial': 'code-lab',
    // 일상 관련
    'daily': 'daily-log',
    'life': 'daily-log',
    'thoughts': 'daily-log',
    'journal': 'daily-log',
    'blog': 'daily-log'
};
function migrateCategories() {
    return __awaiter(this, void 0, void 0, function () {
        var response, updated, skipped, errors, _i, _a, page, pageId, currentCategory, newCategory, error_1, error_2;
        var _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 10, , 11]);
                    console.log('카테고리 마이그레이션 시작...');
                    if (!databaseId) {
                        throw new Error('NOTION_DATABASE_ID가 설정되지 않았습니다.');
                    }
                    return [4 /*yield*/, client_1.notion.databases.query({
                            database_id: databaseId,
                        })];
                case 1:
                    response = _e.sent();
                    console.log("\uCD1D ".concat(response.results.length, "\uAC1C\uC758 \uD398\uC774\uC9C0\uB97C \uCC98\uB9AC\uD569\uB2C8\uB2E4."));
                    updated = 0;
                    skipped = 0;
                    errors = [];
                    _i = 0, _a = response.results;
                    _e.label = 2;
                case 2:
                    if (!(_i < _a.length)) return [3 /*break*/, 9];
                    page = _a[_i];
                    _e.label = 3;
                case 3:
                    _e.trys.push([3, 7, , 8]);
                    pageId = page.id;
                    currentCategory = ((_d = (_c = (_b = page.properties) === null || _b === void 0 ? void 0 : _b.Category) === null || _c === void 0 ? void 0 : _c.select) === null || _d === void 0 ? void 0 : _d.name) || '';
                    console.log("\uD398\uC774\uC9C0 \uCC98\uB9AC \uC911: ".concat(pageId, " (\uD604\uC7AC \uCE74\uD14C\uACE0\uB9AC: ").concat(currentCategory, ")"));
                    newCategory = categoryMapping[currentCategory.toLowerCase()];
                    if (!(newCategory && currentCategory !== newCategory)) return [3 /*break*/, 5];
                    // 카테고리 업데이트
                    return [4 /*yield*/, client_1.notion.pages.update({
                            page_id: pageId,
                            properties: {
                                Category: {
                                    select: {
                                        name: newCategory
                                    }
                                }
                            }
                        })];
                case 4:
                    // 카테고리 업데이트
                    _e.sent();
                    console.log("\u2705 \uCE74\uD14C\uACE0\uB9AC \uC5C5\uB370\uC774\uD2B8 \uC644\uB8CC: ".concat(currentCategory, " \u2192 ").concat(newCategory));
                    updated++;
                    return [3 /*break*/, 6];
                case 5:
                    console.log("\u2139\uFE0F \uC5C5\uB370\uC774\uD2B8 \uBD88\uD544\uC694: ".concat(currentCategory));
                    skipped++;
                    _e.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_1 = _e.sent();
                    console.error("\u274C \uD398\uC774\uC9C0 \uCC98\uB9AC \uC911 \uC624\uB958 \uBC1C\uC0DD:", error_1);
                    errors.push({
                        id: page.id,
                        error: error_1 instanceof Error ? error_1.message : '알 수 없는 오류'
                    });
                    return [3 /*break*/, 8];
                case 8:
                    _i++;
                    return [3 /*break*/, 2];
                case 9:
                    // 결과 출력
                    console.log('\n마이그레이션 완료:');
                    console.log("- \uC5C5\uB370\uC774\uD2B8\uB41C \uD398\uC774\uC9C0: ".concat(updated));
                    console.log("- \uAC74\uB108\uB6F4 \uD398\uC774\uC9C0: ".concat(skipped));
                    console.log("- \uC624\uB958 \uBC1C\uC0DD: ".concat(errors.length));
                    if (errors.length > 0) {
                        console.log('\n오류 목록:');
                        errors.forEach(function (_a) {
                            var id = _a.id, error = _a.error;
                            console.log("- ".concat(id, ": ").concat(error));
                        });
                    }
                    return [3 /*break*/, 11];
                case 10:
                    error_2 = _e.sent();
                    console.error('마이그레이션 중 오류 발생:', error_2);
                    process.exit(1);
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    });
}
// 스크립트 실행
migrateCategories();
