import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, portal: user.portal, uniqueId: user.unique_id, role: user.role_id },
    env.jwtAccessSecret,
    { expiresIn: env.jwtAccessExpiresIn },
  )
}

export function signRefreshToken(user) {
  return jwt.sign({ sub: user.id, portal: user.portal }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
  })
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret)
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret)
}
