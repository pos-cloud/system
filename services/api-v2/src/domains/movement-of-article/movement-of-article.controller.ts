import * as express from 'express'

import Controller from '../model/model.controller'

import HttpException from './../../exceptions/HttpException'
import RequestWithUser from './../../interfaces/requestWithUser.interface'
import Responseable from './../../interfaces/responsable.interface'
import authMiddleware from './../../middleware/auth.middleware'
import ensureLic from './../../middleware/license.middleware'
import validationMiddleware from './../../middleware/validation.middleware'
import Responser from './../../utils/responser'
import CreateMovementOfArticleDto from './create-mov-of-article.dto'
import ObjDto from './movement-of-article.dto'
import MovementOfArticle from './movement-of-article.interface'
import ObjSchema from './movement-of-article.model'
import MovementOfArticleUC from './movement-of-article.uc'

export default class MovementOfArticleController extends Controller {
  EJSON: any = require('bson').EJSON
  path = ObjSchema.getPath()
  router = express.Router()
  obj: any

  constructor(database: string) {
    super(ObjSchema, ObjDto, database)
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router
      .get(this.path, [authMiddleware, ensureLic], this.getAllObjs)
      .get(`${this.path}/:id`, [authMiddleware, ensureLic], this.getObjById)
      .post(`${this.path}/fullquery`, [authMiddleware, ensureLic], this.getFullQueryObjs)
      .post(
        `${this.path}/create`,
        [authMiddleware, ensureLic, validationMiddleware(CreateMovementOfArticleDto)],
        this.createObj,
      )
      .post(
        this.path,
        [authMiddleware, ensureLic, validationMiddleware(ObjDto)],
        this.saveObj,
      )
      .put(
        `${this.path}/:id`,
        [authMiddleware, ensureLic, validationMiddleware(ObjDto)],
        this.updateObj,
      )
	  .put(
        `${this.path}/update-by-transaction/:id`,
        [authMiddleware, ensureLic],
        this.updateByTransaction,
      )
      .delete(`${this.path}/:id`, [authMiddleware, ensureLic], this.deleteObj)
  }

  saveObj = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.initConnectionDB(request.database)
      this.userAudit = request.user
      let objData: MovementOfArticle = await this.saveMovementOfArticle(request.body)

      response.send(new Responser(200, objData))
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }

  createObj = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.initConnectionDB(request.database)
      this.userAudit = request.user
      const {
        transactionId,
        articleId,
        quantity,
        salePrice,
        recalculateParent,
        depositnull,
        movementParent,
      } = request.body

      let movementOfArticle: MovementOfArticle = await new MovementOfArticleUC(
        this.database,
      ).createMovementOfArticle(
        transactionId,
        articleId,
        quantity,
        salePrice,
        recalculateParent,
        depositnull,
        movementParent,
      )

      response.send(new Responser(200, movementOfArticle))
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }

  saveMovementOfArticle = async (
    movementOfArticle: MovementOfArticle,
  ): Promise<MovementOfArticle> => {
    return new Promise<MovementOfArticle>(async (resolve, reject) => {
      try {
        if (!movementOfArticle.article)
          throw new HttpException(
            new Responser(
              400,
              null,
              `Debe informar el artículo del movimiento del producto`,
              `Debe informar el artículo del movimiento del producto`,
            ),
          )
        movementOfArticle = Object.assign(
          ObjSchema.getInstance(this.database),
          movementOfArticle,
        )
        await this.save(movementOfArticle).then((result: Responseable) =>
          resolve(result.result),
        )
      } catch (error) {
        reject(error)
      }
    })
  }

  updateObj = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    this.initConnectionDB(request.database)
    this.userAudit = request.user
    const id = request.params.id
    let objData: MovementOfArticle = request.body

    this.update(id, objData)
      .then((result: Responseable) => response.send(result))
      .catch((error: Responseable) =>
        next(
          new HttpException(
            new Responser(error.status || 500, null, error.message, error),
          ),
        ),
      )
  }

  updateByTransaction = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
	try {
		this.initConnectionDB(request.database)
		this.userAudit = request.user
		const transactionId = request.params.id
	
		const res = await new MovementOfArticleUC(this.database).updateByTransactionUC(transactionId)
		response.send(new Responser(200, {res}))
	} catch (error) {
		next(
			new HttpException(new Responser(error.status || 500, null, error.message, error)),
		)
	}
  }

  deleteObj = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      this.initConnectionDB(request.database)
      this.userAudit = request.user
      const id = request.params.id

      await new MovementOfArticleUC(this.database).deleteMovementOfArticle(id)
      response.send(new Responser(200, {id}))
    } catch (error) {
      next(
        new HttpException(new Responser(error.status || 500, null, error.message, error)),
      )
    }
  }
}
