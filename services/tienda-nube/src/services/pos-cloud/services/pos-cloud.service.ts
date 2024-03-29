import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { HttpService } from '@nestjs/axios';
import { firstValueFrom, map } from 'rxjs';

@Injectable()
export class PosCloudService {
  private posCloudUrI = process.env.POSCLOUD_URI;
  constructor(private readonly httpService: HttpService) {
    if (!this.posCloudUrI) {
      throw new InternalServerErrorException(
        `url de api de poscloud es requerido`,
      );
    }
  }

  async getCredentialTiendaNube(storeId: number) {
    try {
      const credentiales = await firstValueFrom(
        this.httpService
          .get(`${this.posCloudUrI}/tienda-nube/credentials/${storeId}`)
          .pipe(
            map((resp) => {
              return resp.data;
            }),
          ),
      ).catch(() => {
        throw new Error(`Error al obtener credenciales de tiendaNube `);
      });

      if (!credentiales) {
        throw new BadRequestException(
          `Error al obtener credenciales de tiendaNube `,
        );
      }

      return credentiales;
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  async webhookOrder(data: any) {
    try {
      await firstValueFrom(
        this.httpService
          .post(`${this.posCloudUrI}/tienda-nube/add-transaction`, data)
          .pipe(map((resp) => resp.data)),
      ).catch((err) => {
        throw err;
      });
    } catch (err) {
      throw new InternalServerErrorException(
        `Error en el webhook de PosCloud`,
      );
    }
  }
}
