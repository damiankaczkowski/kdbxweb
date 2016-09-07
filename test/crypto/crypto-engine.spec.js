'use strict';

var expect = require('expect.js'),
    SubtleMockNode = require('../test-support/subtle-mock-node'),
    ByteUtils = require('../../lib/utils/byte-utils'),
    CryptoEngine = require('../../lib/crypto/crypto-engine');

function fromHex(str) {
    return ByteUtils.arrayToBuffer(ByteUtils.hexToBytes(str));
}

function toHex(bytes) {
    if (!(bytes instanceof ArrayBuffer)) {
        throw 'Not ArrayBuffer';
    }
    return ByteUtils.bytesToHex(bytes);
}

var subtle = CryptoEngine.subtle;
var webCrypto = CryptoEngine.webCrypto;
var nodeCrypto = CryptoEngine.nodeCrypto;

function useDefaultImpl() {
    CryptoEngine.configure(subtle, webCrypto, nodeCrypto);
}

function useNoImpl() {
    CryptoEngine.configure(null, null, null);
}

function useSubtleMock() {
    CryptoEngine.configure(SubtleMockNode.subtle, SubtleMockNode, null);
}

describe('CryptoEngine', function() {
    afterEach(useDefaultImpl);

    describe('sha256', function() {
        var src = 'f03f102fa66d1847535a85ffc09c3911d1d56887c451832448df3cbac293be4b';
        var exp = 'affa378dae878f64d10f302df67c614ebb901601dd53a51713ffe664850c833b';

        it('calculates sha256', function() {
            useDefaultImpl();
            return CryptoEngine.sha256(fromHex(src)).then(function(hash) {
                expect(toHex(hash)).to.be(exp);
            });
        });

        if (SubtleMockNode) {
            it('calculates sha256 with subtle', function() {
                useSubtleMock();
                return CryptoEngine.sha256(fromHex(src)).then(function(hash) {
                    expect(toHex(hash)).to.be(exp);
                });
            });
        }

        it('throws error if sha256 is not implemented', function() {
            useNoImpl();
            return CryptoEngine.sha256(fromHex(src))
                .then(function() { throw 'No error generated' })
                .catch(function(e) { expect(e.message)
                    .to.be('Error NotImplemented: SHA256 not implemented'); });
        });
    });

    describe('hmacSha256', function() {
        var data = '14af83cb4ecb6e1773a0ff0fa607e2e96a43dbeeade61291c52ab3853b1dda9d';
        var key = 'c50d2f8d0d51ba443ec46f7f843bf17491b8c0a09b58437acd589b14b73aa35c';
        var exp = 'f25a33a0424440b91d98cb4d9c0e897ff0a1f48c78820e6374257cf7fa774fb2';

        it('calculates hmac-sha256', function() {
            useDefaultImpl();
            return CryptoEngine.hmacSha256(fromHex(key), fromHex(data)).then(function(hash) {
                expect(toHex(hash)).to.be(exp);
            });
        });

        if (SubtleMockNode) {
            it('calculates hmac-sha256 with subtle', function() {
                useSubtleMock();
                return CryptoEngine.hmacSha256(fromHex(key), fromHex(data)).then(function(hash) {
                    expect(toHex(hash)).to.be(exp);
                });
            });
        }

        it('throws error if hmac-sha256 is not implemented', function() {
            useNoImpl();
            return CryptoEngine.hmacSha256(fromHex(key), fromHex(data))
                .then(function() { throw 'No error generated' })
                .catch(function(e) { expect(e.message)
                    .to.be('Error NotImplemented: HMAC-SHA256 not implemented'); });
        });
    });

    describe('random', function() {
        it('fills random bytes', function() {
            useDefaultImpl();
            var rand1 = CryptoEngine.random(20);
            expect(rand1.length).to.be(20);
            var rand2 = CryptoEngine.random(20);
            expect(rand2.length).to.be(20);
            expect(ByteUtils.arrayBufferEquals(rand1, rand2)).to.be(false);
            var rand2 = CryptoEngine.random(10);
            expect(rand2.length).to.be(10);
        });

        if (SubtleMockNode) {
            it('generates random bytes with subtle', function() {
                useSubtleMock();
                var rand1 = CryptoEngine.random(20);
                expect(rand1.length).to.be(20);
            });
        }

        it('throws error if random is not implemented', function() {
            useNoImpl();
            expect(function() { CryptoEngine.random(20); })
                .to.throwException(function(e) { expect(e.message)
                    .to.be('Error NotImplemented: Random not implemented'); });
        });
    });

    describe('AesCbc', function() {
        var key = '6b2796fa863a6552986c428528d053b76de7ba8e12f8c0e74edb5ed44da3f601'
        var data = 'e567554429098a38d5f819115edffd39';
        var iv = '4db46dff4add42cb813b98de98e627c4';
        var exp = '46ab4c37d9ec594e5742971f76f7c1620bc29f2e0736b27832d6bcc5c1c39dc1';

        it('encrypts with aes-cbc', function() {
            useDefaultImpl();
            var aes = CryptoEngine.createAesCbc();
            return aes.importKey(fromHex(key)).then(function() {
                return aes.encrypt(fromHex(data), fromHex(iv)).then(function(result) {
                    expect(toHex(result)).to.be(exp);
                });
            });
        });

        if (SubtleMockNode) {
            it('encrypts with aes-cbc with subtle', function() {
                useSubtleMock();
                var aes = CryptoEngine.createAesCbc();
                return aes.importKey(fromHex(key)).then(function() {
                    return aes.encrypt(fromHex(data), fromHex(iv)).then(function(result) {
                        expect(toHex(result)).to.be(exp);
                    });
                });
            });
        }

        it('throws error if aes-cbc is not implemented', function() {
            useNoImpl();
            expect(function() { CryptoEngine.createAesCbc(); })
                .to.throwException(function(e) { expect(e.message)
                    .to.be('Error NotImplemented: AES-CBC not implemented'); });
        });
    });

    describe('argon2', function() {
        it('throws error if argon2 is not implemented', function() {
            useDefaultImpl();
            return CryptoEngine.argon2()
                .then(function() { throw 'No error generated' })
                .catch(function(e) { expect(e.message)
                    .to.be('Error NotImplemented: Argon2 not implemented'); });
        });
    });
});
