import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Put,
} from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import CustomRequest from 'src/common/interfaces/request.interface';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(
    @Body('productId') ProductId: string,
    @Request() request: CustomRequest,
  ) {
    try {
      return this.productsService.create(request.database, ProductId);
    } catch (err) {
      console.log(err);
    }
  }

  @Get()
  findAll(
    @Request() request: CustomRequest,
    @Body('page') page: string
  ) {
    return this.productsService.findAll(request.database, page);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.productsService.findOne(+id);
  // }

  @Patch(':productId')
  update(
    @Param('productId') productId: string,
    @Request() request: CustomRequest,
  ) {
    return this.productsService.update(request.database, productId);
  }

  @Put('massive')
  massiveUpdate(
    @Body('tiendaNubeIds') tiendaNubeIds: string[],
    @Request() request: CustomRequest,
  ) {
    console.log(tiendaNubeIds)
    return this.productsService.massiveUpdate(request.database, tiendaNubeIds);
  }

  @Delete(':tiendaNubeId')
  remove(
    @Param('tiendaNubeId') tiendaNubeId: string,
    @Request() request: CustomRequest,
  ) {
    return this.productsService.remove(request.database, tiendaNubeId);
  }
}
