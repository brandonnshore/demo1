"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFileSize = exports.validateFileType = exports.deleteAsset = exports.getAssetById = exports.saveFile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middleware/errorHandler");
const UPLOAD_DIR = process.env.LOCAL_STORAGE_PATH || './uploads';
// Ensure upload directory exists
if (!fs_1.default.existsSync(UPLOAD_DIR)) {
    fs_1.default.mkdirSync(UPLOAD_DIR, { recursive: true });
}
const saveFile = async (file, ownerType, ownerId) => {
    // Generate unique filename
    const hash = crypto_1.default.createHash('md5').update(file.buffer).digest('hex');
    const ext = path_1.default.extname(file.originalname);
    const filename = `${hash}${ext}`;
    const filepath = path_1.default.join(UPLOAD_DIR, filename);
    // Save file to disk
    fs_1.default.writeFileSync(filepath, file.buffer);
    // Create asset record
    const result = await database_1.default.query(`INSERT INTO assets (
      owner_type, owner_id, file_url, file_type, file_size, original_name, hash
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`, [
        ownerType,
        ownerId || null,
        `/uploads/${filename}`,
        file.mimetype,
        file.size,
        file.originalname,
        hash
    ]);
    return result.rows[0];
};
exports.saveFile = saveFile;
const getAssetById = async (id) => {
    const result = await database_1.default.query('SELECT * FROM assets WHERE id = $1', [id]);
    if (result.rows.length === 0) {
        return null;
    }
    return result.rows[0];
};
exports.getAssetById = getAssetById;
const deleteAsset = async (id) => {
    const asset = await (0, exports.getAssetById)(id);
    if (!asset) {
        throw new errorHandler_1.ApiError(404, 'Asset not found');
    }
    // Delete file from disk
    const filepath = path_1.default.join(UPLOAD_DIR, path_1.default.basename(asset.file_url));
    if (fs_1.default.existsSync(filepath)) {
        fs_1.default.unlinkSync(filepath);
    }
    // Delete database record
    await database_1.default.query('DELETE FROM assets WHERE id = $1', [id]);
};
exports.deleteAsset = deleteAsset;
const validateFileType = (mimetype) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || '').split(',');
    return allowedTypes.includes(mimetype) || [
        'image/png',
        'image/jpeg',
        'image/svg+xml',
        'application/pdf'
    ].includes(mimetype);
};
exports.validateFileType = validateFileType;
const validateFileSize = (size) => {
    const maxSize = parseInt(process.env.MAX_FILE_SIZE_MB || '10') * 1024 * 1024;
    return size <= maxSize;
};
exports.validateFileSize = validateFileSize;
//# sourceMappingURL=uploadService.js.map