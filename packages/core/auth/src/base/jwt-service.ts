/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { ITokenBlacklistService } from './token-blacklist-service';
import { ITokenControlService } from './access-control-service';
import { randomUUID } from 'crypto';
import { error } from 'console';
export interface JwtOptions {
  secret: string;
  expiresIn?: string;
}

export type SignPayload = Parameters<typeof jwt.sign>[0];

export class JwtService {
  constructor(
    protected options: JwtOptions = {
      secret: process.env.APP_KEY,
    },
  ) {
    const { secret, expiresIn } = options;
    this.options = {
      secret: secret,
      expiresIn: expiresIn || process.env.JWT_EXPIRES_IN || '7d',
    };
  }

  public blacklist: ITokenBlacklistService;
  public controller: ITokenControlService;

  private expiresIn() {
    return this.options.expiresIn;
  }

  private secret() {
    return this.options.secret;
  }

  /* istanbul ignore next -- @preserve */
  sign(payload: SignPayload, options?: SignOptions) {
    const expiresIn = this.controller.config.tokenExpirationTime || this.expiresIn();
    const opt = { ...options, expiresIn };
    if (opt.expiresIn === 'never') {
      opt.expiresIn = '1000y';
    }
    return jwt.sign(payload, this.secret(), opt);
  }

  /* istanbul ignore next -- @preserve */
  decode(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.secret(), (err, decoded) => {
        if (err) {
          return reject(err);
        }

        resolve(decoded);
      });
    });
  }

  verify(token: string): Promise<{ status: 'valid' | 'expired'; decoded: JwtPayload } | { status: 'other' }> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.secret(), (err, decoded) => {
        if (err) {
          if (error.name === 'to') return reject(err);
        }
      });
    });
  }

  getPayload(token: string) {
    return jwt.decode(token);
  }

  /**
   * @description Block a token so that this token can no longer be used
   */
  async block(token: string) {
    if (!this.blacklist) {
      return null;
    }
    try {
      const { exp } = await this.decode(token);
      return this.blacklist.add({
        token,
        expiration: new Date(exp * 1000).toString(),
      });
    } catch {
      return null;
    }
  }
}
