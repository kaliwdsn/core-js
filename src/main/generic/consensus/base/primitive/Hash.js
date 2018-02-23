class Hash extends Serializable {
    /**
     * @param {Hash} o
     * @returns {Hash}
     */
    static copy(o) {
        if (!o) return o;
        // FIXME Move this to Crypto class.
        const obj = new Uint8Array(o._obj);
        return new Hash(obj);
    }

    /**
     * @param {?Uint8Array} arg
     * @param {Hash.Algorithm} [algorithm]
     * @private
     */
    constructor(arg, algorithm = Hash.Algorithm.BLAKE2B) {
        if (arg === null) {
            arg = new Uint8Array(Hash.getSize(algorithm));
        } else {
            if (!(arg instanceof Uint8Array)) throw new Error('Primitive: Invalid type');
            if (arg.length !== Hash.getSize(algorithm)) throw new Error('Primitive: Invalid length');
        }
        super();
        this._obj = arg;
        /** @type {Hash.Algorithm} */
        this._algorithm = algorithm;
    }

    /**
     * @deprecated
     * @param {Uint8Array} arr
     * @returns {Hash}
     */
    static light(arr) {
        return Hash.blake2b(arr);
    }

    /**
     * @param {Uint8Array} arr
     * @returns {Hash}
     */
    static blake2b(arr) {
        return new Hash(Crypto.workerSync().computeBlake2b(arr), Hash.Algorithm.BLAKE2B);
    }

    /**
     * @deprecated
     * @param {Uint8Array} arr
     * @returns {Promise.<Hash>}
     */
    static lightAsync(arr) {
        return Hash.blake2bAsync(arr);
    }

    /**
     * @param {Uint8Array} arr
     * @returns {Promise.<Hash>}
     */
    static async blake2bAsync(arr) {
        return new Hash(await (await Crypto.workerAsync()).computeBlake2b(arr), Hash.Algorithm.BLAKE2B);
    }

    /**
     * @param {Uint8Array} arr
     * @deprecated
     * @returns {Promise.<Hash>}
     */
    static hard(arr) {
        return Hash.argon2d(arr);
    }

    /**
     * @param {Uint8Array} arr
     * @returns {Promise.<Hash>}
     */
    static async argon2d(arr) {
        return new Hash(await (await Crypto.workerAsync()).computeArgon2d(arr), Hash.Algorithm.ARGON2D);
    }

    /**
     * @param {Uint8Array} arr
     * @returns {Hash}
     */
    static sha256(arr) {
        return new Hash(Crypto.workerSync().computeSha256(arr), Hash.Algorithm.SHA256);
    }

    /**
     * @param {Uint8Array} arr
     * @param {Hash.Algorithm} algorithm
     * @returns {Hash}
     */
    static compute(arr, algorithm) {
        switch (algorithm) {
            case Hash.Algorithm.BLAKE2B: return Hash.blake2b(arr);
            case Hash.Algorithm.SHA256: return Hash.sha256(arr);
            // Hash.Algorithm.ARGON2 intentionally omitted
            default: throw new Error('Invalid hash algorithm');
        }
    }

    /**
     * @param {SerialBuffer} buf
     * @param {Hash.Algorithm} [algorithm]
     * @returns {Hash}
     */
    static unserialize(buf, algorithm = Hash.Algorithm.BLAKE2B) {
        return new Hash(buf.read(Hash.getSize(algorithm)), algorithm);
    }

    /**
     * @param {SerialBuffer} [buf]
     * @returns {SerialBuffer}
     */
    serialize(buf) {
        buf = buf || new SerialBuffer(this.serializedSize);
        buf.write(this._obj);
        return buf;
    }

    /**
     * @param {number} begin
     * @param {number} end
     * @returns {Uint8Array}
     */
    subarray(begin, end) {
        return this._obj.subarray(begin, end);
    }

    /** @type {number} */
    get serializedSize() {
        return Hash.SIZE.get(this._algorithm);
    }

    /** @type {Uint8Array} */
    get array() {
        return this._obj;
    }

    /** @type {Hash.Algorithm} */
    get algorithm() {
        return this._algorithm;
    }

    /**
     * @param {Serializable} o
     * @returns {boolean}
     */
    equals(o) {
        return o instanceof Hash && o._algorithm === this._algorithm && super.equals(o);
    }

    /**
     * @param {string} base64
     * @returns {Hash}
     */
    static fromBase64(base64) {
        return new Hash(BufferUtils.fromBase64(base64));
    }

    /**
     * @param {string} hex
     * @returns {Hash}
     */
    static fromHex(hex) {
        return new Hash(BufferUtils.fromHex(hex));
    }

    static fromString(str) {
        try {
            return Hash.fromHex(str);
        } catch (e) {
            // Ignore
        }

        try {
            return Hash.fromBase64(str);
        } catch (e) {
            // Ignore
        }

        throw new Error('Invalid hash format');
    }

    /**
     * @param {Hash} o
     * @returns {boolean}
     */
    static isHash(o) {
        return o instanceof Hash;
    }

    /**
     * @param {Hash.Algorithm} algorithm
     * @returns {number}
     */
    static getSize(algorithm) {
        const size = Hash.SIZE.get(algorithm);
        if (!size) throw new Error('Invalid hash algorithm');
        return size;
    }
}

/**
 * @enum {number}
 */
Hash.Algorithm = {
    BLAKE2B: 1,
    ARGON2D: 2,
    SHA256: 3
};
/**
 * @type {Map<Hash.Algorithm, number>}
 */
Hash.SIZE = new Map();
Hash.SIZE.set(Hash.Algorithm.BLAKE2B, 32);
Hash.SIZE.set(Hash.Algorithm.ARGON2D, 32);
Hash.SIZE.set(Hash.Algorithm.SHA256, 32);

Hash.NULL = new Hash(new Uint8Array(32));
Class.register(Hash);
