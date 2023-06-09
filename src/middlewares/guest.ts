import { NextFunction, Request, Response } from 'express'
import { findUserById } from '../repositories/userRepository'

export async function guestMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.signedCookies.ssid && (await findUserById(req.signedCookies.ssid))) {
    res.status(401).send({
      message: 'Unauthorized',
    })
    res.redirect('/')
    return
  }
  next()
}
