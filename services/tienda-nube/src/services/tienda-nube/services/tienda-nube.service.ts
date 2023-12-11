import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTiendaNubeDto } from '../dto/create-tienda-nube.dto';
import { UpdateTiendaNubeDto } from '../dto/update-tienda-nube.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, map } from 'rxjs';
import { CreateCategoryTiendaNubeDto } from '../dto/create-category-tienda-nube.dto';
import { CreateProductTiendaNubeDTO } from '../dto/create-product-tienda-nube.dto';
import { UpdateVariantTiendaNubeDto } from '../dto/update-variant-tienda-nube.dto';
import { UpdateProductTiendaNubeDto } from '../dto/update-product-tienda-nube.dto';

@Injectable()
export class TiendaNubeService {
  private tiendaNubeUrI = process.env.TIENDA_NUBE_URI;
  constructor(private readonly httpService: HttpService) {}
  async createCategory(
    createTiendaNubeDto: CreateCategoryTiendaNubeDto,
    tiendaNubeAccesstoken: string,
    tiendaNubeUserId: string,
  ) {
    try {
      // const { data: userFacebook }: any = await firstValueFrom(
      //   this.httpService.get(apiUrl),
      // )
      const data = await firstValueFrom(
        this.httpService
          .post(
            `${this.tiendaNubeUrI}/${tiendaNubeUserId}/categories`,
            createTiendaNubeDto,
            {
              headers: {
                Authentication: `bearer ${tiendaNubeAccesstoken}`,
              },
            },
          )
          .pipe(map((resp) => resp.data)),
      ).catch(() => {
        throw new Error('Error al crear categoria en tiendaNube');
      });
      return data;
    } catch (err) {
      throw err;
    }
  }
  async getCategoryId(
    categoryId: string,
    tiendaNubeAccesstoken: string,
    tiendaNubeUserId: string,
  ) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          `${this.tiendaNubeUrI}/${tiendaNubeUserId}/categories/${categoryId}`,
          {
            headers: {
              Authentication: `bearer ${tiendaNubeAccesstoken}`,
            },
          },
        ),
      );
      return data;
    } catch (err) {}
  }

  async createProduct(
    createProductTiendaNube: CreateProductTiendaNubeDTO,
    tiendaNubeAccesstoken: string,
    tiendaNubeUserId: string,
  ) {
    const data = await firstValueFrom(
      this.httpService
        .post(
          `${this.tiendaNubeUrI}/${tiendaNubeUserId}/products`,
          createProductTiendaNube,
          {
            headers: {
              Authentication: `bearer ${tiendaNubeAccesstoken}`,
            },
          },
        )
        .pipe(map((resp) => resp.data)),
    );

    return data;
  }

  async updateProductFirstVariant(
    tiendaNubeAccesstoken: string,
    tiendaNubeUserId: string,
    productId: string,
    variantId: string,
    updateVariant: UpdateVariantTiendaNubeDto,
  ) {
    const data = await firstValueFrom(
      this.httpService
        .put(
          `${this.tiendaNubeUrI}/${tiendaNubeUserId}/products/${productId}/variants/${variantId}`,
          updateVariant,
          {
            headers: {
              Authentication: `bearer ${tiendaNubeAccesstoken}`,
            },
          },
        )
        .pipe(map((resp) => resp.data)),
    );
  
    return data;
  }

  async updateProduct(
    tiendaNubeAccesstoken: string,
    tiendaNubeUserId: string,
    productId: string,
    updateProductDto: UpdateProductTiendaNubeDto,
  ) {
    try {
      const data = await firstValueFrom(
        this.httpService
          .put(
            `${this.tiendaNubeUrI}/${tiendaNubeUserId}/products/${productId}`,
            updateProductDto,
            {
              headers: {
                Authentication: `bearer ${tiendaNubeAccesstoken}`,
              },
            },
          )
          .pipe(map((resp) => resp.data)),
      ).catch((e) => {
        throw new Error('Error al actualizar producto con tiendaNube');
      });

      return data;
    } catch (err) {
      throw err;
    }
  }

  async updatePrincipalImageOfProduct(
    url: string,
    productId: string,
    imageId: string,
    tiendaNubeAccesstoken: string,
    tiendaNubeUserId: string,
  ) {
    try {
      const data = await firstValueFrom(
        this.httpService
          .put(
            `${this.tiendaNubeUrI}/${tiendaNubeUserId}/products/${productId}/images/${imageId}`,
            { src: url },
            {
              headers: {
                Authentication: `bearer ${tiendaNubeAccesstoken}`,
              },
            },
          )
          .pipe(map((resp) => resp.data)),
      ).catch((err) => {
        throw new BadRequestException('Error al subir Imagen');
      });
      return data;
    } catch (err) {
      throw err;
    }
  }
  findAll() {
    return `This action returns all tiendaNube`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tiendaNube`;
  }

  async removeProduct(
    productId: string,
    tiendaNubeAccesstoken: string,
    tiendaNubeUserId: string,
  ) {
    try {
      const result = await firstValueFrom(
        this.httpService
          .delete(
            `${this.tiendaNubeUrI}/${tiendaNubeUserId}/products/${productId}`,
            {
              headers: {
                Authentication: `bearer ${tiendaNubeAccesstoken}`,
              },
            },
          )
          .pipe(map((resp) => resp.data)),
      ).catch(() => {
        throw new Error('Error al eliminar el producto en tiendaNube');
      });

      return result ? true : false;
    } catch (err) {
      throw err;
    }
  }


  async createOrder(){
    
  }
}
