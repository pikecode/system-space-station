import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  hkdfSync,
  randomBytes,
} from 'node:crypto';

interface ProtectedIdentityCard {
  encrypted: string;
  hash: string;
  masked: string;
}

@Injectable()
export class SensitiveDataService {
  private readonly encryptionKey: Buffer;
  private readonly fingerprintKey: Buffer;

  constructor(config: ConfigService) {
    const rootKey = Buffer.from(config.getOrThrow<string>('PII_ENCRYPTION_KEY'), 'hex');
    if (rootKey.length !== 32) {
      throw new Error('PII_ENCRYPTION_KEY 必须是32字节密钥');
    }
    this.encryptionKey = Buffer.from(hkdfSync(
      'sha256',
      rootKey,
      Buffer.alloc(0),
      'system-space-station:id-card:encryption',
      32,
    ));
    this.fingerprintKey = Buffer.from(hkdfSync(
      'sha256',
      rootKey,
      Buffer.alloc(0),
      'system-space-station:id-card:fingerprint',
      32,
    ));
  }

  protectIdentityCard(identityCard: string): ProtectedIdentityCard {
    const normalized = this.normalizeIdentityCard(identityCard);
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    const ciphertext = Buffer.concat([
      cipher.update(normalized, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return {
      encrypted: [
        'v1',
        iv.toString('base64url'),
        authTag.toString('base64url'),
        ciphertext.toString('base64url'),
      ].join('.'),
      hash: createHmac('sha256', this.fingerprintKey).update(normalized).digest('hex'),
      masked: `${normalized.slice(0, 4)}**********${normalized.slice(-4)}`,
    };
  }

  decryptIdentityCard(value: string): string {
    const [version, ivValue, tagValue, ciphertextValue] = value.split('.');
    if (version !== 'v1' || !ivValue || !tagValue || !ciphertextValue) {
      throw new Error('身份证密文格式无效');
    }
    const decipher = createDecipheriv(
      'aes-256-gcm',
      this.encryptionKey,
      Buffer.from(ivValue, 'base64url'),
    );
    decipher.setAuthTag(Buffer.from(tagValue, 'base64url'));
    return Buffer.concat([
      decipher.update(Buffer.from(ciphertextValue, 'base64url')),
      decipher.final(),
    ]).toString('utf8');
  }

  private normalizeIdentityCard(value: string) {
    return value.replace(/\s/g, '').toUpperCase();
  }
}
